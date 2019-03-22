const express = require('express');
const passport = require('passport');
const async = require('async');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const User = require('../models/user');
const Movie = require('../models/movie');
const router = express.Router();

// HELPER FUNCTIONS
function escapeRegex(text) {
	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

function compareMovies(a, b) {
	if (a.title < b.title) {
		return -1;
	} else if (a.title > b.title) {
		return 1;
	}
	return 0;
}

// INDEX
router.get('/', function(req, res) {
	let noMatch = null;

	if (req.query.search) {
		const regex = new RegExp(escapeRegex(req.query.search), 'gi');

		Movie.find({ title: regex }, function(error, allMovies) {
			if (error) { return console.error(error); }
			if (allMovies.length < 1) {
				noMatch = 'No movies match that search, please try again.';
			}
			allMovies.sort(compareMovies);

			res.render('movies/index', { movies: allMovies, noMatch: noMatch, page: 'movies' });
		});
	} else {
		Movie.find({}, function(error, allMovies) {
			if (error) { return console.error(error); }
			allMovies.sort(compareMovies);
			res.render('movies/index', { movies: allMovies, noMatch: noMatch, page: 'movies' });
		});
	}
});

// REGISTER
router.get('/register', function(req, res) {
	if (req.user) { return res.redirect('/'); }
	res.render('auth/register', { page: 'register' });
});

router.post('/register', function(req, res) {
	const newUser = new User({
		username: req.body.username,
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		email: req.body.email,
	});

	if (req.body.adminCode === process.env.ADMIN_CODE) {
		newUser.isAdmin = true;
	}

	User.register(newUser, req.body.password, function(error) {
		if (error) {
			console.error(error);
			return res.render('auth/register', { error: error.message });
		}

		passport.authenticate('local')(req, res, function() {
			req.flash('success', 'Welcome to FilmTime!');
			res.redirect('/');
		});
	});
});

// LOGIN
router.get('/login', function(req, res) {
	if (req.user) { return res.redirect('/'); }
	res.render('auth/login', { page: 'login' });
});

router.post('/login', passport.authenticate('local',
	{
		successRedirect: '/',
		failureRedirect: '/login',
		failureFlash: true,
	}
));

// LOGOUT
router.get('/logout', function(req, res) {
	req.logout();
	res.redirect('/');
});

// PASSWORD RESET
router.get('/reset', function(req, res) {
	res.render('auth/reset');
});

router.post('/reset', function(req, res, next) {
	async.waterfall([
		function(done) {
			crypto.randomBytes(20, function(error, buf) {
				const token = buf.toString('hex');
				done(error, token);
			});
		},
		function(token, done) {
			User.findOne({ email: req.body.email }, function(error, user) {
				if (!user) {
					req.flash('error', 'No account with that email address exists.');
					return res.redirect('/reset');
				}

				user.resetPasswordToken = token;
				user.resetPasswordExpires = Date.now() + 3600000;

				user.save(function(error) {
					done(error, token, user);
				});
			});
		},
		function(token, user, done) {
			const smtpTransport = nodemailer.createTransport({
				service: 'Gmail',
				auth: {
					user: process.env.GMAIL,
					pass: process.env.GMAIL_PW,
				},
			});

			const mailOptions = {
				to: user.email,
				from: process.env.GMAIL,
				subject: 'FilmTime Password Reset',
				text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
					'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
					`http://${req.headers.host}/reset/${token}\n\n` +
					'If you did not request this, please ignore this email and your password will remain unchanged.\n',
			};

			smtpTransport.sendMail(mailOptions, function(error) {
				req.flash('success', `An email has been sent to ${user.email} with further instructions.`);
				done(error, 'done');
			});
		},
	], function(error) {
		if (error) { return next(error); }
		res.redirect('/reset');
	});
});

// PASSWORD TOKEN
router.get('/reset/:token', function(req, res) {
	User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(error, user) {
		if (!user) {
			req.flash('error', 'Password token is invalid or has expired.');
			return res.redirect('/reset');
		}
		res.render('auth/new', { token: req.params.token });
	});
});

router.post('/reset/:token', function(req, res) {
	async.waterfall([
		function(done) {
			User.findOne({ resetPasswordToken: req.params.token, resetPasswordExpires: { $gt: Date.now() } }, function(error, user) {
				if (!user) {
					req.flash('error', 'Password reset token is invalid or has expired.');
					return res.redirect('back');
				} else if (req.body.password === req.body.confirm) {
					user.setPassword(req.body.password, function() {
						user.resetPasswordToken = undefined;
						user.resetPasswordExpires = undefined;
						user.save(function(error) { done(error, user); });
					});
				} else {
					req.flash('error', 'Password does not match.');
					return res.redirect('back');
				}
			});
		},
		function(user, done) {
			const smtpTransport = nodemailer.createTransport({
				service: 'Gmail',
				auth: {
					user: process.env.GMAIL,
					pass: process.env.GMAIL_PW,
				},
			});
			const mailOptions = {
				to: user.email,
				from: process.env.GMAIL,
				subject: 'Your FilmTime password has been changed.',
				text: `Hello,\n\nThis is a confirmation that the password for your account, ${user.email}, has just been changed.\n`,
			};
			smtpTransport.sendMail(mailOptions, function(error) {
				req.flash('success', 'Your password has been changed.');
				done(error);
			});
		},
	], function() {
		res.redirect('/');
	});
});

// USER PROFILE
router.get('/users/:id', function(req, res) {
	User.findById(req.params.id, function(error, foundUser) {
		if (error) {
			req.flash('error', 'Failed to find User.');
			return res.redirect('/');
		}
		Movie.find().where('author.id').equals(foundUser._id).exec(function(error, movies) {
			if (error) {
				req.flash('error', 'Failed to locate movies associated with User.');
				return res.redirect('/');
			}
			movies.sort(compareMovies);
			res.render('users/show', { user: foundUser, movies: movies });
		});
	});
});

module.exports = router;
