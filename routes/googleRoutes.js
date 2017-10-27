var express = require('express');
var router = express();
var {Task, User, Meeting, InviteRequest} = require('../models/models');

router.get('/setup', function(req, res){
  if(req.query.slackId){
    res.redirect(google.generateAuthUrl(req.query.slackId));
  }
});
router.get('/google/callback', function(req, res){
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
  })
  .then(function(){
    res.redirect('https://horizonsfall2017.slack.com/messages/G7NHU1THS/files/F7P6MDE3C/');
  })
  .catch((err)=>{
    console.log("Error with google callback", err);
  });
});
module.exports = router;
