const fs = require('fs');

class FileReporter {
  static generate(path, data) {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path);
    }
    fs.writeFileSync(`${path}/resources.${Date.now()}.json`, JSON.stringify(data, null, '\t'), 'utf-8');
  }
}

module.exports = FileReporter;
