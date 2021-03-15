require('./db');
const app = require('./api');
const logger = require('./logger')('server');

const DEFAULT_PORT = 5000;
const port = process.env.PORT || DEFAULT_PORT;

const gracefulExit = () => {
  process.exit(0);
};

process.on('SIGTERM', gracefulExit);
process.on('SIGINT', gracefulExit);

app.listen(port, () => {
  logger.info(`listening on ${port}`);
});
