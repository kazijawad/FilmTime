const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
	username: String,
	password: String,
	firstName: String,
	lastName: String,
	email: String,
	resetPasswordToken: String,
	resetPasswordExpires: Date,
	isAdmin: {
		type: Boolean,
		default: false,
	},
});

userSchema.methods.validPassword = password => {
	return password;
};

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);
