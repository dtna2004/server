const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String },
  age: { type: Number },
  gender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  avatar: { type: String },
  occupation: { type: String },
  interests: [String],
  lifestyle: [String],
  goals: [String],
  values: [String],
  location: {
    lat: Number,
    lng: Number
  },
  preferredGender: {
    type: String,
    enum: ['male', 'female', 'other']
  },
  blockedUsers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema); 