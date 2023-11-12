const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Comment Model
const CommentSchema = new Schema({
    content: String,
    author: { type: Schema.Types.ObjectId, ref: 'User' }
});

const RatingSchema = new Schema({
    rating: Number,
    author: { type: Schema.Types.ObjectId, ref: 'User' }
});

// Blog Post Model
const BlogPostSchema = new Schema({
    title: String,
    content: String,
    author: { type: Schema.Types.ObjectId, ref: 'User' },
    creationDate: Date,
    category: String,
    ratings: [RatingSchema],
    comments: [CommentSchema],
    disabled: { type: Boolean, default: false }
});
const BlogPost = mongoose.model('BlogPost', BlogPostSchema);

module.exports = BlogPost;