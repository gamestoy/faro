const fs = require('fs');

class Utils {
  static getTraces(path) {
    return new Promise(resolve => {
      fs.readFile(path, (err, data) => {
        resolve(JSON.parse(data));
      });
    });
  }
}

module.exports = Utils;
