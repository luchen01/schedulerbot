var express = require('express');
var router = express.Router();
var WebClient = require('@slack/client').WebClient;
var web = new WebClient(token);
var token = process.env.SLACK_API_TOKEN || '';
var rtm = require('./bot');
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.post('/messages_action', (req, res) =>{
  console.log('MESSAGE ACTION');
  res.send('MESSAGE ACTION');
})

module.exports = router;
