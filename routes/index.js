const express = require('express');
const passport = require('passport');
const User = require('../models/user');
const router = express.Router();

router.get('/', (req, res) => {
	res.redirect('/movies');
});

// REGISTER
router.get('/register', (req, res) => {
	res.render('register', { page: 'register' });
});

router.post('/register', (req, res) => {
	const newUser = new User({
		username: req.body.username,
		firstName: req.body.firstName,
		lastName: req.body.lastName,
		email: req.body.email,
	});

	if (req.body.adminCode === process.env.ADMIN_CODE) {
		newUser.isAdmin = true;
	}

	User.register(newUser, req.body.password, (error) => {
		if (error) {
			console.error(error);
			return res.render('register', { error: error.message });
		}

		passport.authenticate('local')(req, res, () => {
			req.flash('success', `Signup was successful! Welcome ${req.body.username}!`);
			res.redirect('/movies');
		});
	});
});

// LOGIN
router.get('/login', (req, res) => {
	res.render('login', { page: 'login' });
});

router.post('/login', passport.authenticate('local',
	{
		successRedirect: '/movies',
		failureRedirect: '/login',
		failureFlash: true,
		successFlash: 'Welcome to FilmTime!',
	}
));

// LOGOUT
router.get('/logout', (req, res) => {
	req.logout();
	req.flash('success', 'Goodbye!');
	res.redirect('/movies');
});

// USER PROFILE
router.get('/users/:id', (req, res) => {
	User.findById(req.params.id, (error, foundUser) => {
		if (error) {
			req.flash('error', 'Failed to find that user!');
			return res.redirect('/');
		}
		res.render('users/show', { user: foundUser });
	});
});

module.exports = router;
