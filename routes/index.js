var express = require('express');
var router = express.Router();
var { generateAuthUrl, getToken, createCalendarEvent } = require('./googleCal');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('https://slack.com/oauth/authorize');
});

module.exports = router;
