const bunyan = require('bunyan');
const config = require('config');

const { level: LOG_LEVEL } = config.logger;

module.exports = (context) => bunyan
  .createLogger({ name: context, level: LOG_LEVEL });
