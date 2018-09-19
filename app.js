require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const passport = require('passport');
const session = require('express-session');

const passportConfig = require('./config/passport.config'); // eslint-disable-line
const indexRoutes = require('./routes/index');
const movieRoutes = require('./routes/movies');
const commentRoutes = require('./routes/comments');

// APP CONFIG
const app = express();

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(methodOverride('_method'));
app.use(cookieParser(process.env.SECRET));
app.use(session({
	secret: process.env.SECRET,
	resave: false,
	saveUninitialized: false,
}));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
app.use((req, res, next) => {
	res.locals.currentUser = req.user;
	res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');
	next();
});

// MONGO CONFIG
mongoose.connect(process.env.MONGODB_URI)
	.then(() => {
		console.info('Database is Online');
	})
	.catch(error => {
		console.error(`DATABASE ERROR: ${error}`);
	});

// ROUTE CONFIG
app.use('/', indexRoutes);
app.use('/movies', movieRoutes);
app.use('/movies/:id/comments', commentRoutes);

app.use((req, res) => {
	res.status(404).render('error');
});

app.listen(process.env.PORT, process.env.IP, () => {
	console.info(`Server is Online: ${process.env.PORT}`);
});
