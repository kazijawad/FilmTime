const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
	title: String,
	description: String,
	cast: [String],
	runtime: String,
	budget: String,
	revenue: String,
	status: Boolean,
	createdAt: {
		type: Date,
		default: Date.now,
	},
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
		username: String,
	},
	comments: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Comment',
		},
	],
});

module.exports = mongoose.model('Movie', movieSchema);
