var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var {Task, User, Meeting, InviteRequest} = require('./models/models');

require('./routes/Luchen');
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
<<<<<<< HEAD
    Task.findOne({requesterId: user.slackId}).populate('requesterId')
    .then(function(err, task){
      subject = task.subject;
    })
    return google.createCalendarEvent(code, 'NEW event', "2017-10-25");
=======
      return Task.findOne({requesterId: user._id})
      .exec(function(err, task){
        if(err){
          console.log(err)
        }
        subject = task.subject;
        date = task.day;
        console.log('day', date);
        google.createCalendarEvent(tokens, subject, date)
      })
>>>>>>> 8b0b5c651d08df81349d75baca164a59435960b9
  })
  .then(function(){
    res.redirect('https://horizonsfall2017.slack.com/messages/G7NHU1THS/files/F7P6MDE3C/');
  })
  .catch((err)=>{
    if(err){
      console.log(err);
    }
  })
})

app.post('/messagesAction', (req, res) =>{
var data = JSON.parse(req.body.payload);
console.log("MESSAGES ACTION DATA", data);
if(data.original_message.attachments[0].callback_id === 'schedule'){
var inviteeName = data.original_message.attachments[0].fields[0].value;
var date = new Date(data.original_message.attachments[0].fields[1].value);
var time = data.original_message.attachments[0].fields[2].value;

var newMeeting = new Meeting({
  day: date,
  subject: "Meeting",
  meetingLength: "30",
  confirmed: false,
  createdAt: new Date(),
  requesterId: data.user.id
});

  newMeeting.save()
    .then((meeting)=>{
      return inviteeName.forEach((invitee)=>{
        User.findOne({slackUsername: invitee})
        .then(user=>{
          var newRequest = new InviteRequest({
            eventId: meeting._id,
            inviteeId: user._id,
            requesterId: meeting.requesterId,
            confirmed: false,
          });
          newRequest.save()
        })
        .catch(function(err){
          console.log('err saving requests', err)
        })
      })
    })
    .then(()=>{
      res.send('Meeting created!')
    })
    .catch(function(err){
      console.log('err creating meetings', err)
    })
}

if(data.original_message.attachments[0].callback_id ==="reminder"){
  var subject = data.original_message.attachments[0].fields[0].value;
  var day = new Date(data.original_message.attachments[0].fields[1].value);
    User.findOne({slackId: data.user.id})
    .then(function(user){
      var newTask = new Task({
        subject: subject,
        day: day,
        requesterId:user.id
      });
      newTask.save(function(err){
        if(err){
          console.log("err", err)
        }
          res.send(`Hello, please give access to your Google Calender ${process.env.DOMAIN}/setup?slackId=${data.user.id}`);
      })
    })
    .catch(function(err){
      console.log('err in messagesAction', err)
    })
  }
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
