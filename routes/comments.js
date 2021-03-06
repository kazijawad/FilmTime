const express = require('express');
const Movie = require('../models/movie');
const Comment = require('../models/comment');
const { isLoggedIn, isAdmin, checkUserComment } = require('../middleware/index');
const router = express.Router({ mergeParams: true });

// NEW
router.get('/new', isLoggedIn, function(req, res) {
	Movie.findById(req.params.id, function(error, movie) {
		if (error) { return console.error(error); }
		res.render('comments/new', { movie: movie });
	});
});

// CREATE
router.post('/', isLoggedIn, function(req, res) {
	Movie.findById(req.params.id, function(error, movie) {
		if (error) {
			console.error(error);
			return res.redirect('/movies');
		}

		Comment.create(req.body.comment, function(error, comment) {
			if (error) { return console.erroror(error); }

			comment.author.id = req.user._id;
			comment.author.username = req.user.username;
			comment.save();
			movie.comments.push(comment);
			movie.save();
			req.flash('success', `Comment added to ${movie.title}.`);
			res.redirect(`/movies/${movie._id}`);
		});
	});
});

// EDIT
router.get('/:commentId/edit', isLoggedIn, checkUserComment, function(req, res) {
	res.render('comments/edit', { movie_id: req.params.id, comment: req.comment });
});

// UPDATE
router.put('/:commentId', isAdmin, function(req, res) {
	Comment.findByIdAndUpdate(req.params.commentId, req.body.comment, function(error) {
		if (error) {
			console.error(error);
			return res.render('edit');
		}
		res.redirect(`/movies/${req.params.id}`);
	});
});

// DELETE
router.delete('/:commentId', isLoggedIn, checkUserComment, function(req, res) {
	Movie.findByIdAndUpdate(req.params.id, {
		$pull: {
			comments: req.comment.id,
		},
	}, function(error) {
		if (error) {
			console.error(error);
			req.flash('error', error.message);
			return res.redirect('/');
		}

		req.comment.remove(function(error) {
			if (error) {
				req.flash('error', error.message);
				return res.redirect('/');
			}
			req.flash('error', 'Comment deleted.');
			res.redirect(`/movies/${req.params.id}`);
		});
	});
});

module.exports = router;
