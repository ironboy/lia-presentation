/* 
   Thomas Frank 2023 
   * Make a self-contained html file from MARP Markdown
     (includes css, fonts and images - no external dependencies)
   * Make a PDF file from MARP Markdown (via the html file)
   * Also scales and jpg compresses images in the files
   * And uses GhostScript to compress the PDF
*/

/***
 * - Provides an export function for all JS files: _export
 * - Load all JS code in the make folder
 * - Calls make() to start the conversion process
 */

import { readdirSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));

// export function that exports a named function,
// or object properties from an object as global vars
Object.defineProperty(globalThis, '_export', {
  set(x) {
    typeof x === 'function' && (globalThis[x.name] = x);
    typeof x === 'object' && Object.assign(globalThis, x);
  }
});

// import all scripts in this folder and start make
(async () => {
  process.chdir(__dirname);
  for (let file of readdirSync('./')) {
    file !== '_index.js' && file.slice(-3) === '.js'
      && await import('./' + file);
  }
  process.chdir('../');
  make();
})();