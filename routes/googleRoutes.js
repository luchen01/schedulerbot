var express = require('express');
var router = express();
var {Task, User, Meeting, InviteRequest} = require('../models/models');

router.get('/setup', function(req, res){
  if(req.query.slackId){
    res.redirect(google.generateAuthUrl());
  }
});

app.get('/google/callback', function(req, res){
  let user;
  User.findOne({slackId: req.query.state})
  .then(function(u){
    user = u;
    return google.getToken(req.query.code)
  })
  .then(function(t){
    user.googleCalAccount = t;
    return user.save();
  })
  .then(function(){
    res.redirect('https://horizonsfall2017.slack.com/messages/G7NHU1THS/files/F7P6MDE3C/');
  })
  .catch((err)=>{
    console.log("Error with google callback", err);
  });
});
module.exports = router;
