const User = require('../Models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const setNotification = require('../Services/Notification');
const feed = require('../Services/Feed');

const dotenv = require('dotenv');

dotenv.config();

const UserController = {

    register: async (req, res) => {
        try {
            const { username, email, password } = req.body;
            const oldUser = await User.findOne({ username });
            if (oldUser) {
                res.status(409).json({ error: 'Username already exists' });
                return;
            }
            const hashedPassword = await bcrypt.hash(password, 10);

            let role;

            if(req.body.role) {
                role = req.body.role;
            } else {
                role = 'user';
            }

            const user = new User({ username, email, role, password: hashedPassword });
            await user.save();
            res.status(201).json(user);
        } catch (error) {
            res.status(500).json({ error: error.toString() });
        }
    },

    login: async (req, res) => {
        try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (user && !user.disabled  && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ id: user.username }, process.env.JWT_SECRET);
            res.json({ token: token });
        } else {
            res.status(401).json({ error: 'Invalid username or password' });
        }
        } catch (error) {
            res.status(500).json({ error: error.toString() });
        }
    },

    getUserProfile: async (req, res) => {
        try {
                console.log(req.params.id);
                const user = await User.findOne({ username: req.params.id });
                if (user) {
                    return res.json(user);
                } else {
                    return res.status(404).json({ error: 'User not found' });
                }
            } catch (error) {
                res.status(500).json({ error: error.toString() });
            }
    },

    updateUserProfile: async (req, res) => {
        try {
            const { username, email} = req.body;

            console.log(req.user);
            
            if(req.params.id !== req.user.username){
                res.status(403).json({ error: 'Forbidden' });
                return;
            }

            const user = await User.findOne({ username: req.user.username });
            user.email = email;

            await user.save();

            res.json(user);
        } catch (error) {
            res.status(500).json({ error: error.toString() });
        }
    },

    followUser: async (req, res) => {
        try {

            const self = await User.findOne({ username: req.user.username });
            const user = await User.findOne({ username: req.body.username });

            if (self && user) {

                if(self.username !== req.params.id){
                    res.status(403).json({ error: 'Forbidden' });
                    return;
                }

                user.followers.push(req.user);
                await user.save();

                self.following.push(user);
                await self.save();

                await setNotification(user, 'follow', `${req.user.username} is now following you`);

                res.json(user);

            } else {
                res.status(404).json({ error: 'User not found' });
            }
        } catch (error) {
            res.status(500).json({ error: error.toString() });
        }
    },

    getNotifications: async (req, res) => {
        try {

            const user = await User.findOne({ username: req.user.username });
            if (user) {
                if(req.params.id !== req.user.username){
                    res.status(403).json({ error: 'Forbidden' });
                    return;
                }
                res.json(user);
            } else {
                res.status(404).json({ error: 'User not found' });
            }

        } catch (error) {
            res.status(500).json({ error: error.toString() });
        }
    },

    getFeed: async (req, res) => {
        try {
            const user = await User.findOne({ username: req.user.username });
            console.log(req.params.id);
            if (user) {
                if(req.user.username !== req.params.id){
                    res.status(403).json({ error: 'Forbidden' });
                    return;
                }
                const blogs = await feed(user.username);
                res.json(blogs);
            } else {
                res.status(404).json({ error: 'User not found' });
            }
        } catch (error) {
            res.status(500).json({ error: error.toString() });
        }
    },

    getAllUsers: async (req, res) => {
        try {
            const users = await User.find();
            res.json(users);
        } catch (error) {
            res.status(500).json({ error: error.toString() });
        }
    },

    blockUser: async (req, res) => {
        try {
            const user = await User.findOne({ username: req.params.username });
            if (user) {
                user.blocked.push(req.user.id);
                await user.save();
                res.json(user);
            } else {
                res.status(404).json({ error: 'User not found' });
            }
        } catch (error) {
            res.status(500).json({ error: error.toString() });
        }
    }
};

module.exports = UserController;