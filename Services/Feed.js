const User = require('../Models/User');
const Blog = require('../Models/Blog');

const feed = async (username) => {
    try {
        const user = await User.findOne({ username });
        const blogPosts = await Blog.find({ author: { $in: user.following } }).populate('author');
        const b = await blogPosts;

        const blogs = b.map(blog => {
            return {
                title: blog.title,
                content: blog.content,
                author: blog.author.username
            }
        });

        console.log(blogs);

        return blogs;
    } catch (error) {
        throw new Error(error);
    }
};

module.exports = feed;