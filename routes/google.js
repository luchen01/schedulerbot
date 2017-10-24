"use strict";
var axios = require('axios');
var google = require('googleapis');
var OAuth2 = google.auth.OAuth2;

var oauth2Client = new OAuth2(
  YOUR_CLIENT_ID,
  YOUR_CLIENT_SECRET,
  YOUR_REDIRECT_URL
);

// generate a url that asks permissions for Google+ and Google Calendar scopes
var scopes = [
  'https://www.googleapis.com/auth/plus.me',
  'https://www.googleapis.com/auth/calendar'
];

var url = oauth2Client.generateAuthUrl({
  // 'online' (default) or 'offline' (gets refresh_token)
  access_type: 'offline',

  // If you only need one scope you can pass it as a string
  scope: scopes,

  // Optional property that passes state parameters to redirect URI
  // state: 'foo'
});

module.exports = {


  oauth2Client.getToken(code, function (err, tokens) {
    // Now tokens contains an access_token and an optional refresh_token. Save them.
    if (!err) {
      oauth2Client.setCredentials(tokens);
    }
  });

  getToken(code){
    var client = getAuthClient();
    return new Promise(function(resolve, reject){
      client.getToken(code, function(err, tokens){
        if(err){
          reject(err);
        }else{
          resolve(tokens);
        }
      });
    });
  }

}
