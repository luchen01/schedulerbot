var { SlackClient, WebClient, RtmClient, CLIENT_EVENTS, RTM_EVENTS } = require('@slack/client');
var bot_token = process.env.SLACK_BOT_TOKEN || '';
var dialogflow = require('./dialog');
var google = require('./googleCal');
var rtm = new RtmClient(bot_token);
var web = new WebClient(bot_token);
var {Task, User, Meeting, InviteRequest} = require('../models/models');

rtm.start();
//The client will emit an RTM.AUTHENTICATED event on successful connection, with the `rtm.start` payload if you want to cache it
rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function (rtmStartData) {
  console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to a channel`);
});

function scheduleConfirm(message, data) {
  let invitees = data.result.parameters.invitees.join(', ');
  web.chat.postMessage(message.channel,
    `Would you like me to schedule you a meeting with ${invitees} on ${data.result.parameters.date} at ${data.result.parameters.time}?`,
    {
      "attachments": [
        {
          "fields": [
            {
              "title": "Invite",
              "value": invitees
            },
            {
              "title": "date",
              "value": data.result.parameters.date
            },
            {
              "title": "time",
              "value": data.result.parameters.time
            }
          ],
          "text": "Please, confirm.",
          "fallback": "You are unable to add a new Calendar event.",
          "callback_id": "schedule",
          "color": "#3AA3E3",
          "attachment_type": "default",
          "actions": [
            {
              "name": "confirmation",
              "text": "Yes",
              "type": "button",
              "value": "true",
              "style": "primary"
            },
            {
              "name": "confirmation",
              "text": "No",
              "type": "button",
              "value": "false",
              "style": "danger"
            }
          ]
        }
      ]
    }
  )
};

function reminderConfirm(message, data) {
  web.chat.postMessage(message.channel,
    `Would you like me to remind you ${data.result.parameters.description} ${data.result.parameters.date}?`,
    {
      "attachments": [
        {
          "fields": [
            {
              "title": "subject",
              "value": data.result.parameters.description
            },
            {
              "title": "date",
              "value": data.result.parameters.date
            }
          ],
          "text": "Please, confirm.",
          "fallback": "You are unable to add a new Calendar event.",
          "callback_id": "reminder",
          "color": "#3AA3E3",
          "attachment_type": "default",
          "actions": [
            {
              "name": "confirmation",
              "text": "Yes",
              "type": "button",
              "value": "true",
              "style": "primary"
            },
            {
              "name": "confirmation",
              "text": "No",
              "type": "button",
              "value": "false",
              "style": "danger"
            }
          ]
        }
      ]
    }
  )
};

function getMentions(message){
  return new Promise(function(resolve, reject){
    let newText;
    let inviteeIds = {};
    let regExp = /<@(\w+)>/g;
    let currId = regExp.exec(message.text);
    console.log('currId', currId);
    while(currId !== null) {
      console.log('inside while loop')
      if (!inviteeIds.hasOwnProperty(currId[1])){
        inviteeIds[currId[1]] = '';
      }
      currId = regExp.exec(message.text);
    }
    console.log('before promise all inviteeIds', inviteeIds);
    Promise.all(Object.keys(inviteeIds).map((user)=>{
      console.log('inside For Each user', user);
      return User.findOne({slackId: user}, (err, slackUser)=>{
        if(err){
          console.log("Unable to find user",err);
        }
        inviteeIds[user] = slackUser.slackUsername;
      });
    }))
    .then(function(){
      newText = message.text.slice().split(' ').map((word) => {
        if(word[0] === '<'){
          word = word.slice(2, word.length -1);
        }
        return (inviteeIds.hasOwnProperty(word)) ?  inviteeIds[word] : word;
      }).join(' ');
      resolve(newText);
    })
    .catch(function(err){
      console.log('err in getMentions', err)
      reject(err);
    })
  })
}

function handleDialogflowConvo(message) {
  getMentions(message)
  .then((newText) => {
    dialogflow.interpretUserMessage(newText, message.user)
    .then(function(res) {
      var userInfo = (ui) => web.users.info(ui);
      const { data } = res;
      const i = data.result.metadata.intentName;
      if (i === 'Remind' || i === 'Meeting.add') {
        userInfo(message.user)
        .then((res) => {
          User.findOrCreate(message.user, res.user.name, res.user.profile.email)
          .then((u) => {
            if (u.googleCalAccount.access_token) {
              return u;
            } else {
              return web.chat.postMessage(message.channel, `Hello, please give access to your Google Calender ${process.env.DOMAIN}/setup?slackId=${message.user}`);
            }
          })
          .then((resp) => {
            if (resp.slackId) {
              if (data.result.actionIncomplete) {
                web.chat.postMessage(message.channel, data.result.fulfillment.speech);
              } else {
                if (i === 'Remind') reminderConfirm(message, data);
                if (i === 'Meeting.add') scheduleConfirm(message, data);
              }
            }
          })
          .catch(err => {
            console.log('Error finding or creating user', err);
          })
        })
        .catch((err)=>{
          console.log("Users Info failed: ",err);
        })

      }
    })
    .catch(function(err) {
      console.log('Error sending message to Dialogflow', err);
      web.chat.postMessage(message.channel,
        `Failed to understand your request.`
      );
    });
  })
  .catch((err) => {
    console.log("Get Mentions failed: ",err);
  })

};

rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
  if (! message.user) {
    console.log('Message send by a bot, ignoring');
    return;
  } else {
    handleDialogflowConvo(message);
  }
});
