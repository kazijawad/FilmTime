require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const methodOverride = require('method-override');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const app = express();

// ROUTE CONFIG
const indexRoutes = require('./routes/index');
const movieRoutes = require('./routes/movies');

// DB CONFIG
mongoose.connect(process.env.DATABASE_URI);

// APP CONFIG
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(methodOverride('_method'));
app.use(cookieParser('secret'));

app.locals.moment = require('moment');

// PASSPORT CONFIG
app.use(require('express-session')({
	secret: process.env.SECRET,
	resave: false,
	saveUninitialized: false,
}));

app.use(flash());
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// CONNECT-FLASH
app.use((req, res, next) => {
	res.locals.currentUser = req.user;
	res.locals.success = req.flash('success');
	res.locals.error = req.flash('error');
	next();
});

// ROUTE CONFIG
app.use('/', indexRoutes);
app.use('/movies', movieRoutes);

app.use((req, res) => {
	res.status(404).render('error');
});

app.listen(process.env.PORT, process.env.IP, () => {
	console.info(`Server is Online: ${process.env.PORT}`);
});
