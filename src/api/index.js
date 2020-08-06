const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const {
    signInRouter,
    quizRouter,
} = require('./routes');

const app = express();

app.use(cors())
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use('/user', signInRouter);

module.exports = app;
