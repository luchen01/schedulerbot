var express = require('express');
var router = express.Router();
var axios = require('axios');

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
//   webhook.send('Hello there', function(err, header, statusCode, body) {
//     if (err) {
//       console.log('Error:', err);
//     } else {
//       console.log('Received', statusCode, 'from Slack');
//     }
//   });
// });



// router.get('/auth', function(req,res, next){
//   axios.get("https://slack.com/oauth/authorize", {
//     params:{
//     client_id: process.env.SLACK_CLIENT_ID,
//     scope: "chat write user"
//   }
//   })
//   .then(function(resp){
//     res.send(resp)
//   })
// })


module.exports = router;
