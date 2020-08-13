const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const morgan = require('morgan');

const { isAccess } = require('../services/user-meanness');

const {
  packagesRouter,
} = require('./routes');
const logger = require('../logger')('app');

const app = express();

const stream = {
  write(message) {
    logger.info(message.trim());
  },
};

app.use(morgan('short', { stream }));
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

app.use((req, res, next) => {
  if (
    process.env.NODE_ENV === 'development'
    || isAccess(req.query)
  ) next();
  else next(new Error('Not access user'));
});

app.use((req, res, next) => {
  // eslint-disable-next-line camelcase
  const { packageNumber, vk_user_id } = req.query;
  req.context = {
    userId: vk_user_id,
    packageNumber,
  };
  next();
});

app.use('/', packagesRouter);

// eslint-disable-next-line no-unused-vars
app.use((error, req, res, next) => {
  if (error.status) {
    res.status(error.status);
  }

  res.send({
    error: error.message,
  });
});

module.exports = app;
