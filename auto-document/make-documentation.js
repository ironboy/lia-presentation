/* Quick and dirty auto-generation of README.md */

import { join as pathJoin } from 'path';
import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { markdownGenerator } from './markdownGenerator.js';
import { parseAndextractInfo } from './parseAndextractInfo.js';
import { performFinalCleaningOfMarkdown } from './performFinalCleaningOfMarkdown.js';
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
  parseAndextractInfo(allContent);
  let md = [];
  for (let { file, exports, description, uses, usedBy } of allContent) {
    markdownGenerator(md, file, exports, description, uses, usedBy);
  }
  md = performFinalCleaningOfMarkdown(md, allContent, readFileSync, pathJoin, __dirname);
  writeFileSync(pathJoin(__dirname, '../', 'README.md'), md, 'utf-8');
  console.log("\nDocumentation written to README.md\n");
})();