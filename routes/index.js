var express = require('express');
var router = express.Router();
var IncomingWebhook = require('@slack/client').IncomingWebhook;
var url = process.env.SLACK_WEBHOOK_URL || '';
var webhook = new IncomingWebhook(url);
var WebClient = require('@slack/client').WebClient;
var web = new WebClient(token);

var token = process.env.SLACK_API_TOKEN || '';
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
  web.chat.postMessage('C1232456', 'Hello there', function(err, res) {
    if (err) {
      console.log('Error:', err);
    } else {
      console.log('Message sent: ', res);
    }
  });
});

module.exports = router;
