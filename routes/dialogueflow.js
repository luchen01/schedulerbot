"use strict";
var axios = require('axios');

module.exports = {
  interpretUserMessage(message, sessionId){
    return axios.get('http://api.dialogflow.com/v1/query', {
      params: {
      v: '20170712',
      query: message,
      timezone: 'America/Los_angeles',
      lang: 'en'
    },
    header: {
      Authorization: `Bearer ${process.env.API_AI_TOKEN}`
    }
  });
  }
};
