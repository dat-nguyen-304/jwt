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

let users = [{
    id: 1,
    username: 'henry',
    refreshToken: null,
},
{
    id: 2,
    username: 'jim',
    refreshToken: null,
}]

const updateRefreshToken = (username, refreshToken) => {
    users = users.map(user => {
        if (user.username === username) return {
            ...user,
            refreshToken
        }
        return user;
    })
}

const generateTokens = payload => {
    let { id, username } = payload;
    const accessToken = jwt.sign({ id, username }, process.env.ACCESS_TOKEN_KEY, {
        expiresIn: '30s',
    });

    const refreshToken = jwt.sign({ id, username }, process.env.REFRESH_TOKEN_KEY, {
        expiresIn: '30m',
    })

    return { accessToken, refreshToken }
}

app.post('/login', (req, res) => {
    console.log(req.body)
    const username = req.body.username;
    const user = users.find(user => user.username === username);
    if (!user) res.sendStatus(401);
    const tokens = generateTokens(user);
    updateRefreshToken(username, tokens.refreshToken);
    res.send({ tokens });
})

app.post('/token', (req, res) => {
    const refreshToken = req.body.refreshToken;
    if (!refreshToken) return res.sendStatus(401);
    const user = users.find(user => user.refreshToken === refreshToken)
    if (!user) return res.sendStatus(400);
    try {
        jwt.verify(refreshToken, process.env.REFRESH_TOKEN_KEY);
        const tokens = generateTokens(user);
        updateRefreshToken(user, tokens.refreshToken);
        res.json(tokens);
    } catch (e) {
        console.log(e);
        res.sendStatus(403);
    }
})

app.delete('/logout', verifyToken, (req, res) => {
    const user = users.find(user => user.id === req.userId);
    updateRefreshToken(user.username, null);
    console.log(users);
    res.sendStatus(204);
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => console.log(`Server started on port ${PORT}`))