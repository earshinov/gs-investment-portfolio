const fs = require('fs');

const input = fs.createReadStream('bindings.js', { encoding: 'utf-8' });
const output = fs.createWriteStream('dist/index.js', { encoding: 'utf-8', flags: 'a' });
output.write('\n\n');
input.pipe(output);
