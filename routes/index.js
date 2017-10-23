var express = require('express');
var router = express.Router();
var WebClient = require('@slack/client').WebClient;
var web = new WebClient(token);
var token = process.env.SLACK_BOT_TOKEN || '';
var rtm = require('./messages');

/* GET home page. */
router.get('/', function(req, res, next) {
  console.log(rtm);
  res.render('index', { title: 'Express' });
});

module.exports = router;
