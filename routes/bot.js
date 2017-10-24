var WebClient = require('@slack/client').WebClient;
var RtmClient = require('@slack/client').RtmClient;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var bot_token = process.env.SLACK_BOT_TOKEN || '';
var dialogflow = require('./dialog');
var rtm = new RtmClient(bot_token);
var web = new WebClient(bot_token);
rtm.start();
//The client will emit an RTM.AUTHENTICATED event on successful connection, with the `rtm.start` payload if you want to cache it
rtm.on(CLIENT_EVENTS.RTM.AUTHENTICATED, function (rtmStartData) {
  console.log(`Logged in as ${rtmStartData.self.name} of team ${rtmStartData.team.name}, but not yet connected to a channel`);
});

function handleDialogflowConvo(message) {
  console.log("inside hangleDialog");
  console.log("message.text", message.text);
  console.log('message.user', message);
  dialogflow.interpretUserMessage(message.text, message.user)
  .then(function(res) {
    var { data } = res;
    console.log('DIALOGFLOW RESPONSE', res.data);
    if (data.result.actionIncomplete) {
      web.chat.postMessage(message.channel, data.result.fulfillment.speech);
    } else {
      web.chat.postMessage(message.channel,
        `You asked me to remind you to ${data.result.parameters.description} on ${data.result.parameters.date}`);

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
    // web.chat.postMessage(message.channel, `Hello,
    // I'm Scheduler Bot. Please give me access to your Google Calendar http://localhost:3000/setup?slackId=${message.user}`);
    handleDialogflowConvo(message);
  }
});
