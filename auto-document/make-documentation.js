/* Quick and dirty auto-generation of README.md */

import { join as pathJoin } from 'path';
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

let latestExport;
Object.defineProperty(globalThis, '_export', {
  set(x) {
    typeof x === 'function' && (latestExport = [x.name]);
    typeof x === 'object' && (latestExport = Object.keys(x));
  }
});

(async () => {
  let allContent = [];
  let dir = pathJoin(__dirname, '../', 'make');
  for (let file of readdirSync(dir)) {
    latestExport = [];
    file !== '_index.js' && file.slice(-3) === '.js'
      && await import(pathJoin(dir, file));
    file.slice(-3) === '.js'
      && allContent.push({
        file,
        exports: latestExport,
        content: readFileSync(pathJoin(dir, file), 'utf-8'),
        usedBy: []
      });
  }
  for (let part of allContent) {
    part.description = part.content.split('/***')[1].split('*/')[0];
    part.code = part.content.split('/***' + part.description + '*/').join('').trim();
    part.description = part.description.trim();
    delete part.content;
  }
  for (let part of allContent) {
    part.uses = allContent.filter(x =>
      x !== part && x.exports.some(x => part.code.match(new RegExp(x + '\\W'))));
    part.file === '__settings.js' && (part.uses.length = 0);
    part.uses.forEach(x => x.usedBy.push(part));
    part.uses = part.uses.filter(x => x.file !== '_loadDependencies.js');
  }
  let lDep = allContent.find(x => x.file === '_loadDependencies.js');
  lDep.uses = [];
  lDep.usedBy = [];
  let _make = allContent.find(x => x.file === '_make.js');
  _make.usedBy = [];
  let md = [];
  for (let { file, exports, description, uses, usedBy } of allContent) {
    md.push([
      `## ${file}`,
      '',
      '### Description',
      `${description.split('\n').map(x => x.slice(1).trim()).join('\n').split('-').join('*')}`,
      '',
      exports.length ? `### Exports\n ${exports.map(x => '* ' + x).join('\n')}` : '',
      uses.length ? `\n\n### Uses\n ${uses.map(x => '*' + x.exports.join(', ') + `* from [${x.file}](#${x.file.toLowerCase().replace(/\./g, '')})`).map(x => '* ' + x).join('\n')}` : '',
      usedBy.length ? `\n\n### Used by\n ${usedBy.map(x => '*' + x.exports.join(', ') + `* from [${x.file}](#${x.file.toLowerCase().replace(/\./g, '')})`).map(x => '* ' + x).join('\n')}` : '',
      '\n### Code\n\n',
      `**File:** [make/${file}](make/${file})`,
      '',
      '```js',
      `[theCodeHere]`,
      '```'
    ].join('\n'))
  }
  md = md.join('\n\n');
  md = md.split('\n').map(x => x.trim()).join('\n');
  let code = allContent.map(x => x.code);
  md = md.replace(/\[theCodeHere\]/g, x => code.shift());
  md = md.replace(/\n{3,}/g, '\n\n');
  md = md.split('* * ').join('* ');
  md = md.split('** from **_index.js**').join('**index.js**');
  md = md.split('### ').join('#### ');
  md = md.split('\n## ').join('\n---\n## ');
  md = md.split('<a*').join('<a-');
  md = readFileSync(pathJoin(__dirname, 'base.md'), 'utf-8') + md;
  writeFileSync(pathJoin(__dirname, '../', 'documentation.md'), md, 'utf-8');
})();