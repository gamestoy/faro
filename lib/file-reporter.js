const fs = require('fs');

class FileReporter {
  static generate(path, data) {
    if (!fs.existsSync(path)) {
      fs.mkdirSync(path);
    }
    const filename = `${path}/audit.${Date.now()}.json`;
    fs.writeFileSync(filename, JSON.stringify(data, null, '\t'), 'utf-8');
    return filename;
  }
}

module.exports = FileReporter;
