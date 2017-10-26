"use strict";
var google = require('googleapis');
var calendar = google.calendar('v3');
var OAuth2 = google.auth.OAuth2;
var scope = [
  'https://www.googleapis.com/auth/plus.me',
  'https://www.googleapis.com/auth/calendar'
];

function getAuthClient() {
  return new OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
<<<<<<< HEAD
    process.env.DOMAIN + '/google/callback'
=======
    `${process.env.DOMAIN}/google/callback`
>>>>>>> 8b0b5c651d08df81349d75baca164a59435960b9
  );
}

module.exports = {
  generateAuthUrl(slackId) {
    return getAuthClient().generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope,
      state: slackId
    });
  },

  getToken(code) {
    var client = getAuthClient();
    return new Promise(function(resolve, reject) {
      client.getToken(code, function (err, tokens) {
        if (err)  {
          reject(err);
        } else {
          console.log('authorized');
          resolve(tokens);
        }
      });
    });
  },

  createCalendarEvent(tokens, title, date) {
    console.log('create calendar event', tokens);

    var client = getAuthClient();
    client.setCredentials(tokens);
    return new Promise(function(resolve, reject) {
      calendar.events.insert({
        auth: client,
        calendarId: 'primary',
        resource: {
          summary: title,
          start: {
            dateTime: date,
            'timeZone': 'America/Los_Angeles',
          },
          end: {
            dateTime: date,
            'timeZone': 'America/Los_Angeles'
          }
        }
      }, function(err, res) {
        if (err)  {
          reject(err);
        } else {
          resolve(tokens);
        }
      });
    });
  }
};
