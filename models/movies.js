const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
	title: String,
	description: String,
	cast: [String],
	runtime: String,
	budget: String,
	revenue: String,
	status: Boolean,
});

module.exports = mongoose.model('Movie', movieSchema);
