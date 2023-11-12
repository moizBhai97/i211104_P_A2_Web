const express = require('express');
const router = require('./Routes/Router');
const mongoose = require('mongoose');

mongoose.connect('mongodb://127.0.0.1:27017/blog', {})
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB', err));

const app = express();

app.use(express.json());

app.use('/', router);

app.use((err, req, res, next) => {
    //console.error(err.stack);
    res.status(500).json({ error: "No such route" });
});

app.listen(3000, () => {
    console.log('Server is running on port 3000');
});