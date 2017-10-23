var express = require('express');
var router = express.Router();
var IncomingWebhook = require('@slack/client').IncomingWebhook;

var url = process.env.SLACK_WEBHOOK_URL || '';

var webhook = new IncomingWebhook(url);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
  webhook.send('Hello there', function(err, header, statusCode, body) {
    if (err) {
      console.log('Error:', err);
    } else {
      console.log('Received', statusCode, 'from Slack');
    }
  });
});

module.exports = router;
