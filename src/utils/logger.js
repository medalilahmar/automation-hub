// src/utils/logger.js
class Logger {
  static info(message) {
    console.log(`${new Date().toISOString()} - INFO: ${message}`);
  }

  static error(message) {
    console.error(`${new Date().toISOString()} - ERROR: ${message}`);
  }

  static warn(message) {
    console.warn(`${new Date().toISOString()} - WARN: ${message}`);
  }
}

module.exports = Logger;