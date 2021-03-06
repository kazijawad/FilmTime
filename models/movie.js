const mongoose = require('mongoose');

const movieSchema = new mongoose.Schema({
	title: String,
	description: String,
	releaseYear: Number,
	poster: {
		data: Buffer,
		mimeType: String,
	},
	comments: [
		{
			type: mongoose.Schema.Types.ObjectId,
			ref: 'Comment',
		},
	],
	author: {
		id: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'User',
		},
		username: String,
	},
	createdAt: {
		type: Date,
		default: Date.now,
	},
});

module.exports = mongoose.model('Movie', movieSchema);
