const fs = require('fs');

function generateFile(path, data) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
  fs.writeFile(`${path}/resources.${Date.now()}.json`, JSON.stringify(data, null, '\t'), 'utf-8', function() {
    console.info('File generated.');
  });
}

module.exports = {
  generateFile
};
