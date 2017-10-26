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
    res.redirect(google.generateAuthUrl(req.query.slackId));
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
    user.googleCalAccount.accessToken = tokens.access_token;
    return user.save();
  })
  .then(function(){
<<<<<<< HEAD
    Task.findOne({requesterId: user.slackId}).populate('requesterId')
    .then(function(err, task){
      subject = task.
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
        google.createCalendarEvent(tokens, subject, date)
      })
>>>>>>> 93a0bfe358f63b1cf0d7b01b41f54f3df0b1f81f
  })
  .then(function(){
    res.redirect('https://calendar.google.com/calendar/');
  })
  .catch((err)=>{
    if(err){
      console.log(err);
    }
  })
})

app.post('/messagesAction', (req, res) =>{
  var data = JSON.parse(req.body.payload);
<<<<<<< HEAD
  console.log("inside original message fields",data);
  var newTask = new Task({
    subject: data.original_message.attachments[0].fields[0].value,
    day:data.original_message.attachments[0].fields[1].value,
    requesterId: data.user.id
  });

  newTask.save(function(err){
    if(err){
      console.log("err", err)
    }
    res.redirect('/setup');
  })
=======
  var subject = data.original_message.attachments[0].fields[0].value;
  var day = new Date(data.original_message.attachments[0].fields[1].value);
>>>>>>> 93a0bfe358f63b1cf0d7b01b41f54f3df0b1f81f

  if(data.actions[0].value === 'true'){
    User.findOne({slackId: data.user.id})
    .then(function(user){
      var newTask = new Task({
        subject:subject ,
        day: day,
        requesterId:user.id
      });
      newTask.save(function(err){
        if(err){
          console.log("err", err)
        }
        if(user.googleCalAccount.accessToken){
          google.createCalendarEvent(user.googleCalAccount.accessToken, subject, day);
          res.send('Meeting scheduled!')
        }else{
          res.send(`Hello, please give access to your Google Calender https://6c2c2e56.ngrok.io/setup?slackId=${data.user.id}`);
        }
      })
    })
    .catch(function(err){
      console.log('err in messagesAction', err)
    })
  }else{
    res.send('Canceled!')
  }
})

app.use('/', index);
app.use('/users', users);

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
