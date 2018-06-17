require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const app = express();

const indexRoutes = require('./routes/index');
const movieRoutes = require('./routes/movies');

mongoose.connect(process.env.DATABASE_URI);

app.set('view engine', 'ejs');
app.use(express.static('public'));

app.use('/', indexRoutes);
app.use('/movies', movieRoutes);

app.use((req, res) => {
	res.status(404).render('error');
});

app.listen(process.env.PORT, process.env.IP, () => {
	console.info(`Server is Online: ${process.env.PORT}`);
});
