var express = require('express');
var router = express.Router();
var WebClient = require('@slack/client').WebClient;
var web = new WebClient(token);
var token = process.env.SLACK_API_TOKEN || '';
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

module.exports = router;
