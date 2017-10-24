var { RtmClient, RTM_EVENTS, WebClient } = require('@slack/client').RtmClient;
var dialogflow = require('./dialogflow');

var token = process.env.SLACK_API_TOKEN || '';

var rtm =  new RtmClient(token);
var web = new WebClient(token);

rtm.start();

function handleDialogflowConvo(message) {
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
    console.log('Error sending message to Dialogflow', err);
  });
}

rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
  if (message.user) {
    web.chat.postMessage(message.channel, `Hello, I'm Scheduler Bot.
    Please give me access to your Google Calendar
    http://localhost:3000/setup?slackId=${message.user}`);
  }
});
