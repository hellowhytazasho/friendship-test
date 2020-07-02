const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

const {
    signInRouter,
    quizRouter,
} = require('./routes');

const app = express();

app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/sign-in', signInRouter);
app.use('/quiz', quizRouter);
app.use(express.static("build"));

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname,  "build", "index.html"));
});

module.exports = app;
