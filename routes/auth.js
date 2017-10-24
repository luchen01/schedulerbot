var axios = require('axios');
var dialogueflow = require('./dialogueflow');
var (RtmClient, WebClient, RTM_EVENTS) = require('@slack/client');
var web = new WebClient(token);
var rtm = new RtmClient(token);
var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var token = process.env.SLACK_API_TOKEN || '';
var rtm = new RtmClient(token, { logLevel: 'debug' });

rtm.start();

rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message) {
  if(!message.user){console.log('message sent by bot, ignoring') return};
  console.log('Inside RTM_EVENTS Message:', message);
  // rtm.sendMessage('Thank you for your message', 'G7NHU1THS')
  dialogueflow.intepretUserMessage(message.text, message.user)
  .then(function(res){
    var {data} = res;
    if(data.result.actionIncomplete){
      web.chat.postMessage(message.channel, data,result,fulfillment.speech)
    }else{
      web.chat.postMessage(message.channel, `You asked me to remind you to ${data.result.parameters.description} on ${data.result.parameters.date}`);
    }
  })
  .catch(function(err){
    console.log('err sending message to dialogueflow', err)
  })
  // web.chat.postMessage(message, channel, `You said: ${message.text}`);
});

// rtm.on(RTM_EVENTS.MESSAGE, function handleRtmMessage(message){
//   var text = message.text;
//   var channel = message.channel;
//   var IM = {
//     "text": "Would you like to play a game?",
//     "attachments": [
//         {
//             "text": "Choose a game to play",
//             "fallback": "You are unable to choose a game",
//             "callback_id": "wopr_game",
//             "color": "#3AA3E3",
//             "attachment_type": "default",
//             "actions": [
//                 {
//                     "name": "game",
//                     "text": "Chess",
//                     "type": "button",
//                     "value": "chess"
//                 },
//                 {
//                     "name": "game",
//                     "text": "Falken's Maze",
//                     "type": "button",
//                     "value": "maze"
//                 },
//             ]
//         }
//     ]
// };
//
//   axios.post('https://slack.com/api/chat.postMessage?token=' + token + '&channel=' + channel + '&text=' + message)
//   .then(res.send(resp))
// });

// rtm.on(RTM_EVENTS.REACTION_ADDED, function handleRtmReactionAdded(reaction) {
//   console.log('Reaction added:', reaction);
// });
//
// rtm.on(RTM_EVENTS.REACTION_REMOVED, function handleRtmReactionRemoved(reaction) {
//   console.log('Reaction removed:', reaction);
// });
