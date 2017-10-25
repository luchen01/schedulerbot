var { SlackClient, WebClient, RtmClient, CLIENT_EVENTS, RTM_EVENTS } = require('@slack/client');
var bot_token = process.env.SLACK_BOT_TOKEN || '';
var dialogflow = require('./dialog');
var google = require('./googleCal');
var rtm = new RtmClient(bot_token);
var web = new WebClient(bot_token);
rtm.start();
//The client will emit an RTM.AUTHENTICATED event on successful connection, with the `rtm.start` payload if you want to cache it
rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function (rtmStartData) {
  console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to a channel`);
});

function handleDialogflowConvo(message) {
  // console.log('MESSAGE', message);
  dialogflow.interpretUserMessage(message.text, message.user)
  .then(function(res) {
    var { data } = res;
    console.log('DIALOGFLOW RESPONSE', data);
    if (data.result.actionIncomplete) {
      web.chat.postMessage(message.channel, data.result.fulfillment.speech);
    } else {
      web.chat.postMessage(message.channel,
        "Would you like me to add a new Google Calendar event?",{
        "attachments": [
          {
            "text": "Please, confirm.",
            "fallback": "You are unable to add a new Calendar event.",
            "callback_id": "gcal_event",
            "color": "#3AA3E3",
            "attachment_type": "default",
            "actions": [
              {
                "name": "game",
                "text": "Yes",
                "type": "button",
                "value": "yes"
              },
              {
                "name": "game",
                "text": "No",
                "type": "button",
                "value": "no"
              }
            ]
          }
        ]
      })

      // web.chat.postMessage(message.channel,
      //   `You asked me to remind you to ${data.result.parameters.description} on ${data.result.parameters.date}`);
      //  google.createCalendarEvent(token, data.result.parameters.description, data.result.parameters.date);
    }
  })
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
    handleDialogflowConvo(message);
  }
});
