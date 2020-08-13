require('./db');
const app = require('./api');
const logger = require('./logger')('server');

const DEFAULT_PORT = 5000;
const port = process.env.PORT || DEFAULT_PORT;

app.listen(port, () => {
  logger.info(`listening on ${port}`);
});
