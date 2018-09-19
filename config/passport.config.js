const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('../models/user');

passport.serializeUser((user, done) => {
	done(null, user.id);
});

passport.deserializeUser((id, done) => {
	User.findById(id).then(user => {
		done(null, user);
	});
});

passport.use(new LocalStrategy(
	(username, password, done) => {
		User.findOne({ username: username }, (error, user) => {
			if (error) return done(error);
			if (!user) {
				return done(null, false, { message: 'Incorrect Username.' });
			}
			user.validPassword(password);

			return done(null, user);
		});
	}
));
