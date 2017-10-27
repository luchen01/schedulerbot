const mongoose = require('mongoose');
var connect = process.env.MONGODB_URI;
mongoose.connect(connect);
const Schema = mongoose.Schema;
mongoose.Promise = global.Promise;
mongoose.connect(process.env.MONGODB_URI);

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
  requesterId: {
    type: Schema.ObjectId,
    ref: 'User',
  },
});

const meetingSchema = new Schema({
  day: {
    type: Date,
    required: true,
  },
  subject: {
    type: String,
    default: 'Meeting',
  },
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
      // unique: true,
      // required: true,
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

userSchema.statics.findOrCreate = function(slackId, slackUsername, slackEmail){
  return User.findOne({slackId})
    .then(function(user){
      if(user){
        return user;
      } else {
        return new User({slackId, slackUsername, slackEmail}).save();
      }
    })
};

var User = mongoose.model('User', userSchema);

module.exports = {
  User: User,
  Task: mongoose.model('Task', taskSchema),
  Meeting: mongoose.model('Meeting', meetingSchema),
  InviteRequest: mongoose.model('InviteRequest', inviteRequestSchema),
};
