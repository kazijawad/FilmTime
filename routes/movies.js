const express = require('express');
const Movie = require('../models/movie');
const Comment = require('../models/comment');
const { isLoggedIn, checkUserMovie } = require('../middleware/index');
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

// CREATE
router.post('/', isLoggedIn, function(req, res) {
	const title = req.body.title;
	const description = req.body.description;
	const releaseYear = req.body.releaseYear;
	const poster = req.file ? { data: req.file.buffer, mimeType: req.file.mimetype } : null;
	const author = {
		id: req.user._id,
		username: req.user.username,
	};

	const newMovie = { title: title, description: description, releaseYear: releaseYear, poster: poster, author: author };
	Movie.create(newMovie, function(error) {
		if (error) { return console.error(error); }
		res.redirect('/movies');
	});
});

// NEW
router.get('/new', isLoggedIn, function(req, res) {
	res.render('movies/new');
});

// SHOW
router.get('/:id', function(req, res) {
	Movie.findById(req.params.id).populate('comments').exec(function(error, foundMovie) {
		if (error || !foundMovie) {
			console.error(error);
			req.flash('error', 'That movie does not exist.');
			return res.redirect('/movies');
		}
		res.render('movies/show', { movie: foundMovie, moment: require('moment') });
	});
});

// EDIT
router.get('/:id/edit', isLoggedIn, checkUserMovie, function(req, res) {
	res.render('movies/edit', { movie: req.movie });
});

// UPDATE
router.put('/:id', function(req, res) {
	const title = req.body.title;
	const description = req.body.description;
	const releaseYear = req.body.releaseYear;
	const poster = req.file ? { data: req.file.buffer, mimeType: req.file.mimetype } : null;

	const newData = poster ? { title: title, description: description, releaseYear: releaseYear, poster: poster } : { title: title, description: description, releaseYear: releaseYear };
	Movie.findByIdAndUpdate(req.params.id, { $set: newData }, function(error, movie) {
		if (error) {
			req.flash('error', error.message);
			return res.redirect('back');
		}
		res.redirect(movie._id);
	});
});

// DELETE
router.delete('/:id', isLoggedIn, checkUserMovie, function(req, res) {
	Comment.remove({
		__id: {
			$in: req.movie.comments,
		},
	}, function(error) {
		if (error) {
			req.flash('error', error.message);
			return res.redirect('/');
		}

		req.movie.remove(function(error) {
			if (error) {
				req.flash('error', error.message);
				return res.redirect('/');
			}
			req.flash('error', 'Movie has been deleted.');
			res.redirect('/movies');
		});
	});
});

module.exports = router;
