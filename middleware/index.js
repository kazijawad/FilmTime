const Movie = require('../models/movie');
const Comment = require('../models/comment');

module.exports = {
	isLoggedIn: (req, res, next) => {
		if (req.isAuthenticated()) { return next(); }

		req.flash('error', 'You must be signed in to do that!');
		res.redirect('/login');
	},
	isAdmin: (req, res, next) => {
		if (req.user.isAdmin) { return next(); }

		req.flash('error', 'You do not have permission to do that!');
		res.redirect('back');
	},
	checkUserMovie: (req, res, next) => {
		Movie.findById(req.params.id, (error, foundMovie) => {
			if (error || !foundMovie) {
				console.error(error);
				req.flash('error', 'Sorry, that movie does not exist!');
				res.redirect('/movies');
			} else if (foundMovie.author.id.equals(req.user._id) || req.user.isAdmin) {
				req.movie = foundMovie;
				next();
			} else {
				req.flash('error', 'You do not have permission to do that!');
				res.redirect('/movies/' + req.params.id);
			}
		});
	},
	checkUserComment: (req, res, next) => {
		Comment.findById(req.params.commentId, (error, foundComment) => {
			if (error || !foundComment) {
				console.error(error);
				req.flash('error', 'Sorry, that comment does not exist!');
				res.redirect('/movies');
			} else if (foundComment.author.id.equals(req.user._id) || req.user.isAdmin) {
				req.comment = foundComment;
				next();
			} else {
				req.flash('error', 'You do not have permission to do that!');
				res.redirect('/movies/' + req.params.id);
			}
		});
	},
};
