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

function handleDialogflowConvo(message) {
  dialogflow.interpretUserMessage(message.text, message.user)
  .then(function(res) {
    const { data } = res;
    const i = data.result.metadata.intentName;
    if (i === 'Remind' || i === 'Meeting.add') {
      User.findOrCreate(message.user)
      .then((u) => {
        if (u.googleCalAccount) {
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
      });
    }
  })
  .catch(function(err) {
    console.log('Error sending message to Dialogflow', err);
    web.chat.postMessage(message.channel,
      `Failed to understand your request.`
    );
  });
};

rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
  if (! message.user) {
    console.log('Message send by a bot, ignoring');
    return;
  } else {
    handleDialogflowConvo(message);
  }
});

function scheduleConfirm(message, data) {
  web.chat.postMessage(message.channel,
    `Would you like me to schedule you ${data.result.parameters.description} ${data.result.parameters.date}?`,
    {
      "attachments": [
        {
          "fields": [
            {
              "title": "Subject",
              "value": data.result.parameters.description || 'Meeting'
            },
            {
              "title": "Date",
              "value": data.result.parameters.date
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
              "title": "Subject",
              "value": data.result.parameters.description
            },
            {
              "title": "Date",
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
