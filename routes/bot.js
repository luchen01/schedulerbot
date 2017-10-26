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
<<<<<<< HEAD
=======
  console.log('MESSAGE', message);
>>>>>>> 93a0bfe358f63b1cf0d7b01b41f54f3df0b1f81f
  dialogflow.interpretUserMessage(message.text, message.user)
  .then(function(res) {
    var { data } = res;
    if (data.result.actionIncomplete) {
      web.chat.postMessage(message.channel, data.result.fulfillment.speech);
    } else {
        web.chat.postMessage(message.channel,
          `Would you like me to remind you ${data.result.parameters.description} ${data.result.parameters.date}?`,{
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
          ]})
        }

      })

      // web.chat.postMessage(message.channel,
      //   `You asked me to remind you to ${data.result.parameters.description} on ${data.result.parameters.date}`);
      //  google.createCalendarEvent(token, data.result.parameters.description, data.result.parameters.date);
  .catch(function(err) {
    console.log('Error sending message to Dialogflow');
    web.chat.postMessage(message.channel,
      `Failed to understand your request.`);
  });
}

rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
  if (! message.user) {
    console.log('Message send by a bot, ignoring');
    return;
  } else {
    User.findOrCreate(message.user)
    .then(function(user){
      if(user.googleCalAccount.accessToken.length > 0){
        web.chat.postMessage(message.channel, `Hello, I'm Scheduler Bot. Please give me acceses to your Google Calendar https://localhost:3000/setup?slackId=${message.user}`);
      }
    })
    .catch(function(err){
      console.log('Error', err)
    })
  }
});
