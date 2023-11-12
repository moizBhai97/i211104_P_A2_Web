const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Notification Model
const NotificationSchema = new Schema({
    type: String,
    message: String,
});

// User Model
const UserSchema = new Schema({
    username: String,
    email: String,
    password: String,
    role: { type: String, default: 'user' },
    following: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    notifications: [NotificationSchema],
    disabled: { type: Boolean, default: false }
});
const User = mongoose.model('User', UserSchema);

module.exports = User;