const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  slackId: {
    type: String,
    required: true,
    unique: true,
  },
  gAuth: {
    type: String
  }
});

module.exports = {
  User: mongoose.model('User', userSchema),
};
