var express = require('express');
var router = express.Router();
var { generateAuthUrl, getToken, createCalendarEvent } = require('./googleCal');

/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('https://slack.com/oauth/authorize');
});

router.get('/setup', (req, res) => {
  res.redirect(generateAuthUrl());
});

router.get('/google/callback', (req, res) => {
  res.send('Success')
})

module.exports = router;
