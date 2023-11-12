const Blog = require('../Models/Blog');
const setNotification = require('../Services/Notification');

const BlogController = {

    createBlogPost: async (req, res) => {
        try {
            const { title, content, category } = req.body;
            const oldBlog = await Blog.findOne({ title });
            if (oldBlog) {
                res.status(409).json({ error: 'Blog post already exists' });
                return;
            }
            const blogPost = new Blog({ title, content, category, author: req.user });
            await blogPost.save();
            return res.status(201).json(blogPost);
        } catch (error) {
            res.status(500).json({ error: error.toString() });
        }
    },

    getBlogPost: async (req, res) => {
        try {
            const blogPost = await Blog.findOne({ title: req.params.id }).populate('author');

            if (blogPost) {
                let blog = {
                    title: blogPost.title,
                    content: blogPost.content,
                    author: blogPost.author.username
                }
                res.json(blog);
            } else {
                res.status(404).json({ error: 'Blog post not found' });
            }
        }
        catch (error) {
            res.status(500).json({ error: error.toString() });
        }
    },

    updateBlogPost: async (req, res) => {
        try {
            const { content } = req.body;

            const blogPost = await Blog.findOne({ title: req.params.id }).populate('author');
            if (blogPost) {

                if(req.user.username !== blogPost.author.username){
                    res.status(403).json({ error: 'Forbidden' });
                    return;
                }

                blogPost.content = content;
                await blogPost.save();
                return res.json(blogPost);
            } else {
                return res.status(404).json({ error: 'Blog post not found' });
            }
        } catch (error) {
            return res.status(500).json({ error: error.toString() });
        }
    },

    deleteBlogPost: async (req, res) => {

        try {
            const blogPost = await Blog.findOne({ title: req.params.id }).populate('author');

            if (blogPost) {

                if(req.user.username !== blogPost.author.username){
                    return res.status(403).json({ error: 'Forbidden' });
                }

                await Blog.deleteOne({ title: req.params.id });

                return res.json({ message: 'Blog post deleted' });
            } else {
                return res.status(404).json({ error: 'Blog post not found' });
            }
        } catch (error) {
            console.error('Error during blog post deletion:', error);
            return res.status(500).json({ error: error.toString() });
        }
    },

    getPosts: async (req, res) => {
        try {
            const page = parseInt(req.query.page) || 1;
            const pageSize = parseInt(req.query.pageSize) || 10;
            const skip = (page - 1) * pageSize;
            const filter = req.query.filter || {};
            const sortField = req.query.sortField ;
            const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
        
            //find all blogs with category of filter

            let query = Blog.find({ category: filter }).skip(skip).limit(pageSize).populate('author');
            
            if(sortField){
                query = query.sort({ [sortField]: sortOrder });
            }

            const q = await query;

            const blogs = q.map(blog => {
                return {
                    title: blog.title,
                    content: blog.content,
                    author: blog.author.username
                }
            });
        
            res.json(blogs);
        } catch (error) {
            res.status(500).json({ error: error.toString() });
        }
    },

    rateBlogPost: async (req, res) => {
        try {
            const blogPost = await Blog.findOne({ title: req.params.id });
            if (blogPost) {
                console.log(req.user);
                blogPost.ratings.push({ rating: req.body.rating, author: req.user });
                await blogPost.save();
                res.json(blogPost);
            } else {
                res.status(404).json({ error: 'Blog post not found' });
            }
        } catch (error) {
            res.status(500).json({ error: error.toString() });
        }
    },

    createComment: async (req, res) => {
        try {
            const blogPost = await Blog.findOne({ title: req.params.id });
            if (blogPost) {
                blogPost.comments.push({ content: req.body.content, author: req.user });
                await blogPost.save();
                await setNotification(blogPost.author, 'comment', `${req.user.username} commented on your post "${blogPost.title}"`);
                res.json(blogPost);
            } else {
                res.status(404).json({ error: 'Blog post not found' });
            }
        } catch (error) {
            res.status(500).json({ error: error.toString() });
        }
    },

    searchPosts: async (req, res) => {
        
        try{

            const { keywords, categories, authors, sortField, sortOrder, filter } = req.query;

            const query = {
            $or: [
                { title: new RegExp(keywords, 'i') },
                { content: new RegExp(keywords, 'i') },
                { categories: { $in: categories } },
                { author: { $in: authors } }
            ]
            };

            let posts = await (await Blog.find(query)).find(filter).sort({ [sortField]: sortOrder });
        
            if (sortField) {
            posts = posts.sort({ [sortField]: sortOrder === 'desc' ? -1 : 1 });
            }
        
            return res.json(posts);

        }
        catch(error){
            res.status(500).json({ error: error.toString() });
        }
    },

    disablePost: async (req, res) => {

        try{
            const blogPost = await Blog.findById(req.params.id);
            if (blogPost) {
                blogPost.disabled = true;
                await blogPost.save();
                res.json(blogPost);
            } else {
                res.status(404).json({ error: 'Blog post not found' });
            }
        }
        catch(error){
            res.status(500).json({ error: error.toString() });
        }
    }
};

module.exports = BlogController;