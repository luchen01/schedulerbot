var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var {Task, User, Meeting, InviteRequest} = require('./models/models');

require('./routes/bot');
var google = require('./routes/googleCal');
var index = require('./routes/index');
var users = require('./routes/users');
var request = require('request');
var urlencodedParser = bodyParser.urlencoded({ extended: false })
var app = express();

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

// app.get('/reminder', function(req, res){
//   res.send(res);
// })
app.get('/setup', function(req, res){
  if(req.query.slackId){
    res.redirect(google.generateAuthUrl());
  }
})
app.get('/google/callback', function(req, res){
  var user;
  var tokens;
  var subject;
  var date;
  User.findOne({slackId: req.query.state})
  .then(function(u){
    user = u;
    return google.getToken(req.query.code)
  })
  .then(function(t){

    tokens = t;
    user.googleCalAccount.accessToken = t;
    return user.save();
  })
  .then(function(){
    Task.findOne({requesterId: user.slackId}).populate('requesterId')
    .then(function(err, task){
      subject = task.
    })
    return google.createCalendarEvent(code, 'NEW event', "2017-10-25");
  })
  .then(function(){
    res.redirect('https://horizonsfall2017.slack.com/messages/G7NHU1THS/files/F7P6MDE3C/');
  })
  .catch((err)=>{
    console.log("Error with google callback", err);
  });
  // var subject;
  // var date;
  // .then(function(){
  //     return Task.findOne({requesterId: user._id})
  //     .exec(function(err, task){
  //       if(err){
  //         console.log(err)
  //       }
  //       console.log('task', task);
  //       subject = task.subject;
  //       date = task.day;
  //       google.createCalendarEvent(tokens, subject, date)
  // })
  //     })
});

app.post('/messagesAction', (req, res) =>{
  const data = JSON.parse(req.body.payload);
  const fieldsArr = data.original_message.attachments[0].fields;
  let user;
  // let event;
  // console.log(data);
  User.findOne({slackId: data.user.id})
  .then(u => {
    user = u;
    console.log(user.googleCalAccount.accessToken);
    return google.createCalendarEvent(user.googleCalAccount,
      fieldsArr[0].value, fieldsArr[1].value
    )
  })
  .then(event => {
    console.log(event);
    let temp;
    switch(data.callback_id) {
      case 'reminder':
      temp = new Task({
        subject: data.original_message.attachments[0].fields[0].value,
        day: new Date(data.original_message.attachments[0].fields[1].value),
        requesterId: user.id,
        // googleCalEventId: ,
      });
      break;
      case 'schedule':
      temp = new Meeting({
        subject: data.original_message.attachments[0].fields[0].value,
        day: new Date(data.original_message.attachments[0].fields[1].value),
        requesterId: user.id,
        createdAt: new Date(),
        // googleCalFields: ,
      });
      break;
      default:
      console.log('WTF YOU SHOULDNT BE HERE');
    }
    return temp.save()
  })
  .catch(err => console.log(err));
})

app.use('/', index);
app.use('/users', users);

app.get('/setup', function(req, res, next){
  res.send('thank you for trying to setup')
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
