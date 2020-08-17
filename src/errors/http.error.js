class HttpError extends Error {
  constructor({ message, code }) {
    const formattedMessage = typeof message === 'object' ? JSON.stringify(message) : message;
    super(formattedMessage);

    this.name = this.constructor.name;
    this.code = code;

    Error.captureStackTrace(this, HttpError);
  }
}

module.exports = HttpError;
