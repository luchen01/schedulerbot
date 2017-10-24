var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

require('./routes/bot');

var index = require('./routes/index');
var users = require('./routes/users');
var request = require('request');
var urlencodedParser = bodyParser.urlencoded({ extended: false })
var app = express();

// function sendMessageToSlackResponseURL(responseURL, JSONmessage){
//     var postOptions = {
//         uri: responseURL,
//         method: 'POST',
//         headers: {
//             'Content-type': 'application/json'
//         },
//         json: JSONmessage
//     }
//     request(postOptions, (error, response, body) => {
//         if (error){
//             console.log('Failed to send messages', error);
//         }else{
//           console.log('Somethin happened at least.');
//         }
//     })
// }
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.post('/slack/slash_commands/send-me-buttons', urlencodedParser, (req, res) =>{
//   //  res.status(200).send("happened"); // best practice to respond with empty 200 status code
//     var reqBody = req.body
//     var responseURL = reqBody.response_url
//
//       var message = {
//       "text": "Would you like to add an event to your Google Calendar?",
//       "attachments": [
//           {
//               "text": "Game night on Thurday",
//               "fallback": "You are unable to create a new calendar event.",
//               "callback_id": "calendar",
//               "color": "#3AA3E3",
//               "attachment_type": "default",
//               "actions": [
//                   {
//                       "name": "answer",
//                       "text": "Yes",
//                       "type": "button",
//                       "value": "true"
//                   },
//                   {
//                       "name": "answer",
//                       "text": "No",
//                       "type": "button",
//                       "value": "false"
//                   }
//               ]
//           }
//       ]
//       };
//         sendMessageToSlackResponseURL(responseURL, message)
//     })
//
// app.post('/messages_actions', urlencodedParser, (req, res) =>{
//     res.status(200).end() // best practice to respond with 200 status
//     var actionJSONPayload = JSON.parse(req.body.payload) // parse URL-encoded payload JSON string
//     var message = {
//         "text": actionJSONPayload.user.name+" clicked: "+actionJSONPayload.actions[0].name,
//         "replace_original": false
//     }
//     sendMessageToSlackResponseURL(actionJSONPayload.response_url, message)
// })

app.use('/', index);
app.use('/users', users);

app.get('/setup', function(req, res, next){
  res.send('thank you for trying to setup')
})

app.get('/google/callback', function(req, res){
  google.getToken(req.query.code)
  .then(function(tokens){

  })
  .catch(function(error){
    
  })
})

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
