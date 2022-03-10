class Logger {
  constructor(_logger) {
    // expand when we need more options
    this.logger = _logger;
  }

  log(msg) {
    this.logger.log(msg);
  }

  error(msg) {
    this.logger.error(msg);
  }

  warn(msg) {
    this.logger.warn(msg);
  }
}

module.exports = Logger;
