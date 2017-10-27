var express = require('express');
var router = express();
var {Task, User, Meeting, InviteRequest} = require('../models/models');

router.get('/', function(req, res, next) {
  res.redirect('https://slack.com/oauth/authorize');
});

router.post('/messagesAction', (req, res) =>{
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
});

module.exports = router;
