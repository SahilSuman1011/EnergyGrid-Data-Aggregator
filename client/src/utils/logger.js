// Simple logging utility with timestamps and color coding

class Logger {
  static log(message, type = 'INFO') {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${type}]`;
    
    switch (type) {
      case 'ERROR':
        console.error(`\x1b[31m${prefix}\x1b[0m`, message);
        break;
      case 'SUCCESS':
        console.log(`\x1b[32m${prefix}\x1b[0m`, message);
        break;
      case 'WARNING':
        console.warn(`\x1b[33m${prefix}\x1b[0m`, message);
        break;
      case 'INFO':
      default:
        console.log(`\x1b[36m${prefix}\x1b[0m`, message);
    }
  }

  static info(message) {
    this.log(message, 'INFO');
  }

  static success(message) {
    this.log(message, 'SUCCESS');
  }

  static warning(message) {
    this.log(message, 'WARNING');
  }

  static error(message) {
    this.log(message, 'ERROR');
  }

  static progress(current, total, message = '') {
    const percentage = ((current / total) * 100).toFixed(1);
    const bar = '█'.repeat(Math.floor(percentage / 2)) + '░'.repeat(50 - Math.floor(percentage / 2));
    process.stdout.write(`\r[${bar}] ${percentage}% (${current}/${total}) ${message}`);
    if (current === total) {
      process.stdout.write('\n');
    }
  }
}

module.exports = Logger;