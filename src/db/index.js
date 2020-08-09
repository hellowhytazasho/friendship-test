const mongoose = require('mongoose');
const config = require('config');
const logger = require('../logger')('db');

const { mongodb: { connection: MONGODB_CONFIG } } = config;

const {
  username,
  password,
  host,
  port,
  db,
  uri,
} = MONGODB_CONFIG;

const getConnectionString = () => {
  if (uri) {
    return uri;
  }

  return (
    (username && password)
      ? `mongodb://${username}:${password}@${host}:${port}/${db}?authSource=admin`
      : `mongodb://${host}:${port}/${db}`
  );
};

const connectionString = getConnectionString();

mongoose.connect(
  connectionString,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
  },
).catch((error) => logger.error(error));

const { connection } = mongoose;

connection.once('open', () => {
  logger.info('connected');
});

connection.on('error', (err) => {
  logger.error(err);
});
