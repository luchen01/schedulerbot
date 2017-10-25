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
  console.log("inside setup");
  if(req.query.slackId){
    res.redirect(google.generateAuthUrl(req.query.slackId));
  }
})

app.get('/google/callback', function(req, res){
  console.log("slackId", req.query.state);
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
    user.googleCalAccount.accessToken = t.accessToken;
    return user.save();
  })
  .then(function(){
      return Task.findOne({requesterId: user._id})
      .exec(function(err, task){
        if(err){
          console.log(err)
        }
        console.log('task', task);
        subject = task.subject;
        date = task.day;
        google.createCalendarEvent(tokens, subject, date)
      })
  })
  .then(function(){
    res.redirect('https://calendar.google.com/calendar/render?tab=mc#main_7');
  })
  .catch((err)=>{
    if(err){
      console.log(err);
    }
  })
})

app.post('/messagesAction', (req, res) =>{
  var data = JSON.parse(req.body.payload);
  console.log("inside original message fields",data);
  User.findOne({slackId: data.user.id})
  .then(function(user){
    console.log('find slack user', user)
    var newTask = new Task({
      subject: data.original_message.attachments[0].fields[0].value,
      day: new Date(data.original_message.attachments[0].fields[1].value),
      requesterId:user.id
    });
    newTask.save(function(err){
      if(err){
        console.log("err", err)
      }
      res.send(`Hello, please give access to your Google Calender https://6c2c2e56.ngrok.io/setup?slackId=${data.user.id}`);
    })
  })
  .catch(function(err){
    console.log('err in messagesAction', err)
  })
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
