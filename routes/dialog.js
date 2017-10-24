"use strict";
var axios = require('axios');
module.exports = {
  interpretUserMessage(message, sessionId){
    return axios.get('http://api.dialogflow.com/v1/query', {
      params: {
        v: '20170712',
        query: message,
        sessionId,
        timeZone: 'America/Los_Angeles',
        lang: 'en'
      },
      headers:  {
        Authorizatioin: `Bearer ${process.env.API_AI_TOKEN}`
      }
    })
  }
}
