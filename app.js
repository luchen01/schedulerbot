var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

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
  if(req.query.code){
    google.getToken(req.query.code)
    .then(function(code){
      return google.createCalendarEvent(code, 'NEW event', "2017-10-25")
    })
    .then(function(){
      res.redirect('https://horizonsfall2017.slack.com/messages/G7NHU1THS/files/F7P6MDE3C/');
    })
    .catch((err)=>{
      if(err){
        console.log(err);
      }
    })
  }
})
// app.get('/messages', function)


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
