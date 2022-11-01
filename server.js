const verifyToken = require('./middleware/auth');
const express = require('express');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const app = express();
var bodyParser = require('body-parser')

// create application/json parser
var jsonParser = bodyParser.json()

// create application/x-www-form-urlencoded parser
var urlencodedParser = bodyParser.urlencoded({ extended: false })

app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));

const posts = [
    {
        userId: 1,
        post: 'post henry',
    },
    {
        userId: 2,
        post: 'post jim',
    }
]

app.get('/posts', verifyToken, (req, res) => {
    res.json(posts.filter(post => post.userId === req.userId));
})

const PORT = process.env.PORT || 4000
app.listen(PORT, () => console.log(`Server started on port ${PORT}`))