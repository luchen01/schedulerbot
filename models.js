const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = new Schema({
  slackId: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: Boolean,
    required: true,
  }
});

module.exports = {
  User: mongoose.model('User', userSchema),
};
