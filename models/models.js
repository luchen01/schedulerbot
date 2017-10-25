const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const taskSchema = new Schema({
  subject: {
    type: String,
    required: true,
  },
  day: {
    type: Date,
    required: true,
  },
  googleCalEventId: String,
  requesertId: {
    type: Schema.ObjectId,
    ref: 'User',
  },
});

const meetingSchema = new Schema({
  day: {
    type: Date,
    required: true,
  },
  subject: String,
  location: {
    latitude: Number,
    longitude: Number,
  },
  meetingLength: String, //WTF
  googleCalFields: {
    //some other bullshit
  },
  confirmed: Boolean,
  createdAt: Date,
  requesterId: { //WTF
    type: Schema.ObjectId,
    ref: 'User',
  },
});

const userSchema = new Schema({
  googleCalAccount: {
    accessToken: {
      type: String,
      unique: true,
      required: true,
    },
  },
  slackId: {
    type: String,
    required: true,
    unique: true,
  },
  slackUsername: String,
  slackEmail: String,
  SlackDMIds: Array,
});


UserSchema.statics.findOrCreate = function(slackId){
    return User.findOne({slackId})
    .then(function(user){
      if(user){
        return user;
      }else{
        return new User()
      }
    })
}

const inviteRequestSchema = new Schema({
  eventId: {
    type: Schema.ObjectId,
    ref: 'Meeting',
  },
  inviteeId: {
    type: Schema.ObjectId,
    ref: 'User',
  },
  requesterId: {
    type: Schema.ObjectId,
    ref: 'User'
  },
  confirmed: Boolean,
});

module.exports = {
  User: mongoose.model('User', userSchema),
  Task: mongoose.model('Task', taskSchema),
  Meeting: mongoose.model('Meeting', meetingSchema),
  InviteRequest: mongoose.model('InviteRequest', inviteRequestSchema),
};
