var express = require('express');
var router = express.Router();
/* GET home page. */
router.get('/', function(req, res, next) {
  res.redirect('https://slack.com/oauth/authorize');
});
// router.get('/messages_action', function(req, res, next){
//
// })

router.post('/messages_action', function(req,res, next){
  console.log('POST MOTHAFUCKA');
  rtm.sendMessage()
})

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
