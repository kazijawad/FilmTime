require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');
const methodOverride = require('method-override');
const flash = require('connect-flash');
const passport = require('passport');
const session = require('express-session');

const passportConfig = require('./config/passport.config'); // eslint-disable-line
const indexRoutes = require('./routes/index');
const movieRoutes = require('./routes/movies');
const commentRoutes = require('./routes/comments');

// APP CONFIG
const app = express();
const storage = multer.memoryStorage();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(multer({ storage: storage }).single('poster'));
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(methodOverride('_method'));
app.use(session({
	secret: process.env.SESSION_SECRET,
	resave: false,
	saveUninitialized: false,
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use(function(req, res, next) {
	res.locals.currentUser = req.user;
	res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');
	next();
});

// MONGO CONFIG
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true })
	.then(function() {
		console.info('Database is Online');
	})
	.catch(function(error) {
		console.error(`DATABASE ERROR: ${error}`);
	});

// ROUTE CONFIG
app.use('/', indexRoutes);
app.use('/movies', movieRoutes);
app.use('/movies/:id/comments', commentRoutes);

app.use(function(req, res) {
	res.status(404).render('error');
});

app.listen(process.env.PORT, process.env.IP, function() {
	console.info(`Server is Online: Port ${process.env.PORT}`);
});
