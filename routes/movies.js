const express = require('express');
const Movie = require('../models/movie');
const Comment = require('../models/comment');
const { isLoggedIn, checkUserMovie } = require('../middleware/index');
const router = express.Router();

// INDEX
router.get('/', (req, res) => {
	let noMatch = null;
	if (req.query.search) {
		const regex = new RegExp(escapeRegex(req.query.search), 'gi');
		Movie.find({ title: regex }, (error, allMovies) => {
			if (error) { return console.error(error); }
			if (allMovies.length < 1) {
				noMatch = 'No movies match that query, please try again.';
			}

			res.render('movies/index', { movies: allMovies, noMatch: noMatch, page: 'movies' });
		});
	} else {
		Movie.find({}, (error, allMovies) => {
			if (error) { return console.error(error); }
			res.render('movies/index', { movies: allMovies, noMatch: noMatch, page: 'movies' });
		});
	}
});

// CREATE
router.post('/', isLoggedIn, (req, res) => {
	const title = req.body.title;
	const description = req.body.description;
	const author = {
		id: req.user._id,
		username: req.user.username,
	};

	const newMovie = { title: title, description: description, author: author };
	Movie.create(newMovie, (error) => {
		if (error) { return console.error(error); }
		res.redirect('/movies');
	});
});

// NEW
router.get('/new', isLoggedIn, (req, res) => {
	res.render('movies/new');
});

// SHOW
router.get('/:id', (req, res) => {
	Movie.findById(req.params.id).populate('comments').exec((error, foundMovie) => {
		if (error || !foundMovie) {
			console.error(error);
			req.flash('error', 'Sorry, that movie does not exist!');
			return res.redirect('/movies');
		}
		res.render('movies/show', { movie: foundMovie });
	});
});

// EDIT
router.get('/:id/edit', isLoggedIn, checkUserMovie, (req, res) => {
	res.render('movies/edit', { movie: req.movie });
});

// UPDATE
router.put('/:id', (req, res) => {
	const newData = { title: req.body.title, description: req.body.description };

	Movie.findByIdAndUpdate(req.params.id, { $set: newData }, (error, movie) => {
		if (error) {
			req.flash('error', error.message);
			return res.redirect('back');
		}
		req.flash('success', 'Successfully Updated!');
		res.redirect(movie._id);
	});
});

// DELETE
router.delete('/:id', isLoggedIn, checkUserMovie, (req, res) => {
	Comment.remove({
		__id: {
			$in: req.movie.comments,
		},
	}, error => {
		if (error) {
			req.flash('error', error.message);
			return res.redirect('/');
		}

		req.movie.remove(err => {
			if (err) {
				req.flash('error', err.message);
				return res.redirect('/');
			}
			req.flash('error', 'Movie deleted!');
			res.redirect('/movies');
		});
	});
});

const escapeRegex = text => {
	return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
};

module.exports = router;
