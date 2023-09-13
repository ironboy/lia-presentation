## __settings.js

#### Description
* Global settings affecting conversion, image quality and typography

#### Exports
* settings

#### Used by
* *make* from [_make.js](#_make-js)
* *makePart2* from [_makePart2.js](#_makepart2-js)
* *addAndMassageSettings* from [addAndMassageSettings.js](#addandmassagesettings-js)
* *adjustLetterSpacing* from [adjustLetterSpacing.js](#adjustletterspacing-js)
* *compressPDF* from [compressPDF.js](#compresspdf-js)
* *fixSloppyPDFCropbox* from [fixSloppyPDFCropbox.js](#fixsloppypdfcropbox-js)
* *getSpaceWidths* from [getSpaceWidths.js](#getspacewidths-js)
* *hyphenate* from [hyphenate.js](#hyphenate-js)
* *includeLetterSpacer* from [includeLetterSpacer.js](#includeletterspacer-js)
* *makePdfFromHtml* from [makePdfFromHtml.js](#makepdffromhtml-js)
* *makePptx* from [makePptx.js](#makepptx-js)
* *pdfMetaData* from [pdfMetaData.js](#pdfmetadata-js)
* *scaleImage* from [scaleImage.js](#scaleimage-js)
* *setHTMLLanguage* from [setHtmlLanguage.js](#sethtmllanguage-js)
```js
_export = {
  settings: {
    /* which formats to create apart from html (which is always created) */
    makePDF: 1,
    makeJPGs: 0,
    makePPTX: 0,
    /* hyphenation */
    hyphenateTags: ['p', 'li', 'th', 'td'],
    hyphenateMinWordLength: 6,
    hyphenateMinCharsBefore: 3,
    hyphenateMinCharsAfter: 3,
    /* variable letter-spacing (counteracts big spaces on hyphenation) */
    letterSpacingMinRem: -0.02,
    letterSpacingMaxRem: 0.02,
    /* jpg settings compression before embedding in html */
    sharpScaleJpgsTo: 1500,
    sharpJpgQuality: 65,
    /* JPG quality and deviceScaleFactor, jpg screenshots from puppeteer */
    deviceScaleFactor: 2,
    jpgScreenshotQuality: 70,
    /* PDF, image quality, LO to HI: screen, ebook, printer, prepress */
    ghostScriptPdfQuality: 'prepress',
    /* crop PDF file and screenshots from Puppeteer
       slightly to avoid tiny white stripes along sides */
    pdfCropPercent: 0.15
  }
}
```

---
## _index.js

#### Description
* Provides an export function for all JS files: _export
* Load all JS code in the make folder
* Calls make() to start the conversion process

#### Uses
* *make* from **_make.js**

```js
/* 
   Thomas Frank 2023 
   * Make a self-contained html file from MARP Markdown
     (includes css, fonts and images - no external dependencies)
   * Make a PDF file from MARP Markdown (via the html file)
   * Also scales and jpg compresses images in the files
   * And uses GhostScript to compress the PDF
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
```

---
## _loadDependencies.js

#### Description
* Loads (imports/requires) all NPM module dependences
* Exports all the dependencies as globals

#### Exports
* readFileSync
* writeFileSync
* statSync
* renameSync
* mkdirSync
* rmSync
* existsSync
* execSync
* PDFDocument
* puppeteer
* pptxgen
* marpCli
* sharp

```js
// Load (import/require) dependecies 
import {
  readFileSync, writeFileSync, statSync,
  renameSync, mkdirSync, rmSync, existsSync
} from "fs";
import { execSync } from 'child_process';
import { PDFDocument } from 'pdf-lib';
import puppeteer from 'puppeteer';
import pptxgen from "pptxgenjs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const { marpCli } = require('@marp-team/marp-cli');
const sharp = require('sharp');

// Export dependencies
_export = {
  readFileSync, writeFileSync, statSync,
  renameSync, mkdirSync, rmSync, existsSync,
  execSync,
  PDFDocument,
  puppeteer,
  pptxgen,
  marpCli,
  sharp
};
```

---
## _make.js

#### Description
* Main/start function
* Makes HTML, PDF, JPG and PPTX files from index.md

#### Exports
* make

#### Uses
* *settings* from **__settings.js**
* *makePart2* from **_makePart2.js**
* *addAndMassageSettings* from **addAndMassageSettings.js**
* *embedFonts* from **embedFonts.js**
* *embedImages* from **embedImages.js**
* *hyphenate* from **hyphenate.js**
* *includeLetterSpacer* from **includeLetterSpacer.js**
* *makeHtml* from **makeHtml.js**
* *makeLinkTargetsBlankAdd* from **makeLinkTargetsBlankAdd.js**
* *preWarmMakePDFFromHtml* from **preWarmMakePdfFromHtml.js**
* *setHTMLLanguage* from **setHtmlLanguage.js**

```js
_export = async function make() {
  addAndMassageSettings();
  let { makeJPGs } = settings;
  console.warn = () => { }; // silence marp
  let r = (x) => {
    r2(x, (Date.now() - lastTime) + ' ms');
    lastTime = Date.now();
  }
  let r2 = (x, y = '') => {
    y += '';
    console.log(x.padEnd(58 - y.length, ' ') + y);
  }
  let startTime = Date.now(), lastTime = startTime;
  let preWarmedPromise = preWarmMakePDFFromHtml();
  existsSync('./dist') &&
    rmSync('./dist', { recursive: true, force: true });
  mkdirSync('./dist');
  makeJPGs && mkdirSync('./dist/jpgs');
  r2('');
  r2('MRS MARPER - by Ironboy')
  r2('-'.repeat(58));
  await makeHtml();
  r('HTML -> Created index.html.');
  let html = readFileSync('./index.html', 'utf-8');
  html = setHTMLLanguage(html);
  let { html: htm, language: lang } = await hyphenate(html);
  html = htm;
  html = includeLetterSpacer(html);
  r('HTML -> Hyphenation done (language: ' + lang + ')');
  html = makeLinkTargetsBlankAdd(html);
  r('HTML -> Made external links open in new tab.');
  html = await embedImages(html);
  r('HTML -> Embedded images.');
  html = embedFonts(html);
  r('HTML -> Embedded fonts.');
  writeFileSync('./index.html', html, 'utf-8');;
  renameSync('./index.html', './dist/index.html');
  await makePart2(preWarmedPromise, startTime, r, r2);
}
```

---
## _makePart2.js

#### Description
* Part 2 of main/start function
* Makes HTML, PDF, JPG and PPTX files from index.md

#### Exports
* makePart2

#### Uses
* *settings* from **__settings.js**
* *compressPDF* from **compressPDF.js**
* *fixSloppyPDFCropbox* from **fixSloppyPDFCropbox.js**
* *makePdfFromHtml* from **makePdfFromHtml.js**
* *makePptx* from **makePptx.js**

#### Used by
* *make* from [_make.js](#_make-js)
```js
_export = async function makePart2(preWarmedPromise, startTime, r, r2) {
  let { makePDF, makePPTX: mPPTX, keepJPGs } = settings;
  let { widthMm, heightMm, pagePaths, pages, allLinkPositions }
    = await makePdfFromHtml(r, preWarmedPromise);
  console.log('-'.repeat(58));
  if (makePDF) {
    r('PDF  -> Created index.pdf.');
    compressPDF();
    r('PDF  -> Compressed PDF.');
    rmSync('./index.pdf');
    await fixSloppyPDFCropbox(r);
    r('PDF  -> Fixed crop box.');
    r2('-'.repeat(58));
  }
  if (mPPTX) {
    await makePptx(widthMm, heightMm, pagePaths, allLinkPositions);
    r('PPTX -> Generated.');
    r2('-'.repeat(58));
  }
  r2('All done!');
  r2('-'.repeat(58));
  r2('Number of pages:', pages);
  r2('Total time taken:',
    ((Date.now() - startTime) / 1000).toFixed(2) + ' sec');
  !keepJPGs && rmSync('./dist/jpgs', { recursive: true, force: true });
  let s = x => (x / 1024 / 1024).toFixed(2) + '  MB';
  r2('MB/page in HTML:', s(statSync('./dist/index.html').size / pages))
  r2('HTML file size:', s(statSync('./dist/index.html').size));
  r2('PDF  file size:', s(statSync('./dist/index.pdf').size));
  let jpgSize = keepJPGs && pagePaths.map(x => statSync(x).size).reduce((a, c) => a + c);
  keepJPGs && r2('JPGs file size:', s(jpgSize));
  mPPTX && r2('PPTX file size:', s(statSync('./dist/index.pptx').size));
  r2('-'.repeat(58));
}
```

---
## addAndMassageSettings.js

#### Description
* Adjusts/unfolds some setting parameters
* Imports settings given in index.md

#### Exports
* addAndMassageSettings

#### Uses
* *settings* from **__settings.js**
* *make* from **_make.js**

#### Used by
* *make* from [_make.js](#_make-js)
```js
_export = function addAndMassageSettings() {
  // "unpack" settings for sharp
  settings.resizeSettings = [
    settings.sharpScaleJpgsTo,
    settings.sharpScaleJpgsTo,
    { fit: 'inside' }
  ];
  settings.jpegSettings = [{
    mozjpeg: true,
    quality: settings.sharpJpgQuality
  }];

  // can't make PPTX without JPGs - but we can decide if to keep them
  settings.keepJPGs = settings.makeJPGs;
  settings.makePPTX && (settings.makeJPGs = 1);

  // readMarpSettings
  let x = readFileSync('./index.md', 'utf-8').split('---')[1];
  x.split('\n')
    .map(x => x.split(':').map(x => x.trim()))
    .forEach(([key, val]) => {
      if (!key || !val || key === 'marp') { return; }
      settings[key] = val;
    });
}
```

---
## addPptxSlideLinks.js

#### Description
* Adds hyperlinks to PPTX/PowerPoint

#### Exports
* addPptxSlideLinks

#### Used by
* *makePptx* from [makePptx.js](#makepptx-js)
```js
_export = async function addPptxSlideLinks(slide, links) {
  for (let link of links) {
    await slide.addText(' ', {
      hyperlink: link.href[0] !== '#' ?
        { url: link.href } :
        { slide: link.href.slice(1) },
      tooltip: link.href[0] !== '#' ?
        link.href :
        'Slide ' + link.href.slice(1),
      x: link.x + '%',
      y: link.y + '%',
      w: (link.right - link.x) + '%',
      h: (link.bottom - link.y) + '%'
    });
  }
}
```

---
## adjustLetterSpacing.js

#### Description
* Adjust the letter*spacing for justified text to minimize gaps

#### Exports
* adjustLetterSpacing

#### Uses
* *settings* from **__settings.js**
* *getSpaceWidths* from **getSpaceWidths.js**
* *wrapWords* from **wrapWords.js**

#### Used by
* *includeLetterSpacer* from [includeLetterSpacer.js](#includeletterspacer-js)
```js
_export = async function adjustLetterSpacing(page = 1, loadPage) {
  loadPage = loadPage || +location.hash.slice(1);
  (!loadPage || isNaN(loadPage)) && (loadPage = 1);
  let {
    letterSpacingMinRem: minSpace,
    letterSpacingMaxRem: maxSpace
  } = settings;
  document.body.style.opacity = 0; // temp hide content
  await document.fonts.ready;
  let section = [...document.querySelectorAll('section')]
    .find(x => x.id.replace(/\D/g, '') === page + '');
  if (!section) {
    location.hash = '#' + loadPage;
    document.body.style.opacity = 1; // show content
    return;
  }
  location.hash = '#' + page;
  wrapWords(section);
  let spaces = getSpaceWidths();
  let step = (maxSpace - minSpace) / 50;
  for (let { el, baseW, words } of spaces) {
    let candidates = [];
    for (let i = minSpace; i <= maxSpace; i += step) {
      words.forEach(w => w.style.letterSpacing = i + 'rem');
      candidates.push({ space: i, val: el.offsetWidth / baseW });
    }
    // choose best candidate
    let best = candidates.sort((a, b) => {
      if (a.val === b.val) {
        return Math.abs(a.space) < Math.abs(b.space) ? -1 : 1;
      }
      return a.val < b.val ? -1 : 1;
    })[0];
    words.forEach(w => w.style.letterSpacing = best.space + 'rem');
  }
  adjustLetterSpacing(page + 1, loadPage);
}
```

---
## bgImagesToClasses.js

#### Description
* Converts bg images to classes (avoids double embedding)

#### Exports
* bgImagesToClasses

#### Used by
* *embedImages* from [embedImages.js](#embedimages-js)
```js
_export = function bgImagesToClasses(html) {
  let i = 0;
  let hash = {};
  html = html.replace(/<figure style="background-image[^>]*>/g, (x => {
    i++;
    hash[x] = hash[x] || [];
    hash[x].push(i);
    return `<figure class="bg-image-${i}">`;
  }));
  let style = "\n";
  for (let [key, val] of Object.entries(hash)) {
    let selector = val.map(x => 'figure.bg-image-' + x).join(', ');
    style += selector + ' {\n  ' + key.split('"')[1].split('&quot;').join("'").slice(0, -1) + '!important;\n}\n';
  }
  style += '\n';
  html = html.replace(/<\/style>/, style + '</style>');
  return html;
}
```

---
## cleanupAndGetPageLength.js

#### Description
* Returns the page length
* Removes navigation tool bar (so not printed to PDF and JPG:s)

#### Exports
* cleanupAndGetPageLength

#### Used by
* *makePdfFromHtml* from [makePdfFromHtml.js](#makepdffromhtml-js)
```js
_export = function cleanupAndGetPageLength() {
  // change id:s of sections to valid id:s (must start with character)
  [...document.querySelectorAll('section[id]')].forEach(x => x.id = 'x' + x.id);
  // remove navigator (otherwise it shows in screenshots)
  document.querySelector('.bespoke-marp-osc').remove();
  // number of pages in document
  return document.querySelectorAll('section[id]').length;
}
```

---
## compressPDF.js

#### Description
* Compress the PDF using Ghostscript

#### Exports
* compressPDF

#### Uses
* *settings* from **__settings.js**

#### Used by
* *makePart2* from [_makePart2.js](#_makepart2-js)
```js
_export = function compressPDF() {
  let { ghostScriptPdfQuality: q } = settings;
  execSync(
    `gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.7 ` +
    `-dPDFSETTINGS=/${q} -dNOPAUSE -dQUIET` +
    `-dBATCH -sOutputFile=dist/index.pdf index.pdf`
  );
}
```

---
## embedFonts.js

#### Description
* Embeds the fonts in the HTML file

#### Exports
* embedFonts

#### Used by
* *make* from [_make.js](#_make-js)
```js
_export = function embedFonts(html) {
  // replace import from google fonts with locally downloaded fonts
  // (see https://gwfh.mranftl.com/fonts)
  // ...the reason for not using these in theme.css is that they
  // don't work with marp preview in VSC...
  let fonts = '\n' + readFileSync('./fonts.css') + '\n';
  html = html.replace(/\@import url\('https:\/\/fonts.googleapis.com[^\)]*\);/, fonts);
  let fontUrls = JSON.parse(JSON.stringify([...html.matchAll(/url\('\.\.\/fonts\/[^;]*;/g)])).map(x => x[0]);
  let fontPaths = fontUrls.map(x => './fonts/' + x.split('fonts/')[1].split('\') format')[0]);
  let prefix = 'url(data:application/x-font-woff;charset=utf-8;base64,';
  let postfix = ") format('woff');"
  let fontsBin = fontPaths.map(x => prefix + readFileSync(x).toString('base64') + postfix);
  for (let i = 0; i < fontsBin.length; i++) {
    html = html.split(fontUrls[i]).join(fontsBin[i]);
  }
  return html;
}
```

---
## embedImages.js

#### Description
* Embeds the images in the HTML file

#### Exports
* embedImages

#### Uses
* *bgImagesToClasses* from **bgImagesToClasses.js**
* *removeQuotes* from **removeQuotes.js**
* *scaleImage* from **scaleImage.js**

#### Used by
* *make* from [_make.js](#_make-js)
```js
_export = async function embedImages(html) {
  html = bgImagesToClasses(html);
  let htmlImages = html.split('img src="').slice(1).map(x => x.split('"')[0]);
  let cssImages = html.split('background-image:url(').slice(1).map(x => removeQuotes(x.split(')')[0]));
  cssImages = cssImages.filter(x => x.indexOf('data') !== 0);
  let imagePaths = [...htmlImages, ...cssImages];
  let images = [];
  for (let path of imagePaths) {
    images.push(`data:image/${path.split('.').slice(-1)};base64,` + (await scaleImage(readFileSync('./' + path))).toString('base64'));
  }
  for (let i = 0; i < images.length; i++) {
    html = html.split(imagePaths[i]).join(images[i]);
  }
  return html;
}
```

---
## fixSloppyPDFCropbox.js

#### Description
* Crops the PDF very slightly to avoid thin white page borders

#### Exports
* fixSloppyPDFCropbox

#### Uses
* *settings* from **__settings.js**
* *pdfMetaData* from **pdfMetaData.js**

#### Used by
* *makePart2* from [_makePart2.js](#_makepart2-js)
```js
_export = async function fixSloppyPDFCropbox(r) {
  const existingPdfBytes = readFileSync('./dist/index.pdf');
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  pdfMetaData(pdfDoc, r);
  const pages = pdfDoc.getPages();
  let cropPercent = settings.pdfCropPercent;
  for (let page of pages) {
    const { width, height } = page.getCropBox();
    let cropPointsW = width * cropPercent / 100;
    let cropPointsH = height * cropPercent / 100;
    page.setCropBox(cropPointsW, cropPointsH,
      width - cropPointsW * 2, height - cropPointsH * 2);
  }
  const pdfBytes = await pdfDoc.save();
  writeFileSync('./dist/index.pdf', pdfBytes);
}
```

---
## getLinkPositions.js

#### Description
* Get link positiions so they can be included in the PPTX/PowerPint

#### Exports
* getLinkPositions

#### Uses
* *makePdfFromHtml* from **makePdfFromHtml.js**

#### Used by
* *makePdfFromHtml* from [makePdfFromHtml.js](#makepdffromhtml-js)
```js
// note: runs from makePdfFromHtml inside puppeteer browser page
_export = function getLinkPositions(el, i, mPPTX) {
  location.hash = '#' + i;
  if (!mPPTX) { return []; }
  return [...document.querySelectorAll(`#x${i} a[href]`)]
    .map(x => {
      let bRect = x.getBoundingClientRect();
      return {
        href: x.getAttribute('href'),
        x: bRect.x, y: bRect.y, right: bRect.right, bottom: bRect.bottom
      };
    })
    .filter(x => x.bottom !== 0);
}
```

---
## getPageDimensions.js

#### Description
* Helps Puppeteer get the page dimensions

#### Exports
* getPageDimensions

#### Uses
* *makePdfFromHtml* from **makePdfFromHtml.js**

#### Used by
* *makePdfFromHtml* from [makePdfFromHtml.js](#makepdffromhtml-js)
```js
// note: runs from makePdfFromHtml inside puppeteer browser page
_export = function getPageDimensions(el) {
  let tempDiv = document.createElement('div');
  tempDiv.style.width = '100mm';
  el.append(tempDiv);
  let pxPerMm = getComputedStyle(tempDiv).width.split('px')[0] / 100;
  let section = document.querySelector('section');
  let { width: widthPx, height: heightPx } = getComputedStyle(section);
  widthPx = +widthPx.split('px')[0];
  heightPx = +heightPx.split('px')[0];
  let widthMm = Math.round(widthPx / pxPerMm);
  let heightMm = Math.round(heightPx / pxPerMm);
  widthPx = Math.round(widthPx);
  heightPx = Math.round(heightPx);
  tempDiv.remove();
  return { pxPerMm, widthPx, heightPx, widthMm, heightMm };
}
```

---
## getSpaceWidths.js

#### Description
* Get widhts of spaces needed fo letter*spacing adjustments

#### Exports
* getSpaceWidths

#### Uses
* *settings* from **__settings.js**
* *nonJustify* from **nonJustify.js**
* *reJustify* from **reJustify.js**

#### Used by
* *adjustLetterSpacing* from [adjustLetterSpacing.js](#adjustletterspacing-js)
* *includeLetterSpacer* from [includeLetterSpacer.js](#includeletterspacer-js)
```js
_export = function getSpaceWidths() {
  let { hyphenateTags: parentSel } = settings;
  parentSel = parentSel.join(', ');
  let words = [...document.querySelectorAll('a-word')];
  let spaces = [...document.querySelectorAll('a-space')];
  // only keep one space per common parentNode and line
  let parentNodeMem = [];
  spaces = spaces.filter(el => {
    let pNode = el.closest(parentSel);
    let y = el.getBoundingClientRect().y;
    let keep = !parentNodeMem.find(([a, b]) => a === pNode && b === y);
    parentNodeMem.push([pNode, y]);
    return keep;
  });
  // check how stretched the spaces are
  nonJustify();
  spaces = spaces
    .map(el => ({ el, w: el.offsetWidth }))
    .filter(({ w }) => w);
  reJustify();
  spaces.forEach(x => x.w2 = x.el.offsetWidth);
  spaces = spaces
    .filter(({ w, w2 }) => w !== w2)
    .map(({ el, w, w2 }) => ({
      el,
      stretch: w2 / w,
      baseW: w,
      words: words.filter(x =>
        x.closest(parentSel) === el.closest(parentSel)
        && x.getBoundingClientRect().y === el.getBoundingClientRect().y
      )
    }));
  spaces.forEach(x => x.phrase = x.words.map(x => x.innerText).join(' '));
  return spaces;
}
```

---
## hyphenate.js

#### Description
* Hyphenates the text using the hyphen npm module

#### Exports
* hyphenate

#### Uses
* *settings* from **__settings.js**

#### Used by
* *make* from [_make.js](#_make-js)
```js
_export = async function hyphenate(html) {
  let {
    hyphenateTags: els,
    hyphenateMinWordLength: minWordLength,
    hyphenateMinCharsBefore: minCharsBefore,
    hyphenateMinCharsAfter: minCharsAfter,
  } = settings;
  let { language } = settings;
  // get correct hyphenator - fallback to 'en'
  let hyphenator;
  while (!hyphenator) {
    hyphenator = await import('hyphen/' + language + '/index.js')
      .catch(e => { });
    if (!hyphenator && language.includes('-')) {
      language = language.split('-')[0]
    }
    else if (!hyphenator) {
      language = 'en';
    }
  }
  hyphenator = hyphenator.default.hyphenateHTMLSync;
  // hyphenate
  for (let el of els) {
    let reg = new RegExp(`<${el}[^>]*>.*?<\\/${el}>`, 'g');
    html = html.replace(reg, x => {
      let a = hyphenator(x, { minWordLength });
      // adhere to minCharsBefore and minCharsAfter
      let b = a.split('\u00AD');
      let c = '';
      for (let i = 0; i < b.length - 1; i++) {
        let keep = !(b[i].slice(-minCharsBefore).replace(/[\p{L}-]/ug, ''))
          && !(b[i + 1].slice(0, minCharsAfter).replace(/[\p{L}-]/ug, ''));
        c += b[i] + (keep ? '\u00AD' : '');
      }
      c += b.slice(-1);
      return c;
    });
  }
  return { html, language };
}
```

---
## includeLetterSpacer.js

#### Description
* Includes the letter spacing logic in the HTML client side code

#### Exports
* includeLetterSpacer

#### Uses
* *settings* from **__settings.js**
* *adjustLetterSpacing* from **adjustLetterSpacing.js**
* *getSpaceWidths* from **getSpaceWidths.js**
* *nonJustify* from **nonJustify.js**
* *reJustify* from **reJustify.js**
* *textNodesUnder* from **textNodesUnder.js**
* *wrapWords* from **wrapWords.js**

#### Used by
* *make* from [_make.js](#_make-js)
```js
_export = function includeLetterSpacer(html) {
  let code = [
    'const settings = ' + JSON.stringify(settings),
    textNodesUnder,
    wrapWords,
    nonJustify,
    reJustify,
    getSpaceWidths,
    adjustLetterSpacing
  ].map(x => x + '').join('\n\n');
  code = `(()=>{\n${code};\n\nadjustLetterSpacing();})();`;
  html = html.split('</body>').join(`<script>${code}</script></body>`);
  return html;
}
```

---
## makeHtml.js

#### Description
* Creates the HTML file using MARP CLI

#### Exports
* makeHtml

#### Used by
* *make* from [_make.js](#_make-js)
```js
_export = async function makeHtml() {
  await marpCli([
    'index.md', '--html',
    '--allow-local-files',
    '--theme', 'theme.css'
  ]).catch(console.error);
}
```

---
## makeLinkTargetsBlank.js

#### Description
* Client side code assuring that external links opens in new tabs

#### Exports
* makeLinkTargetsBlank

#### Used by
* *makeLinkTargetsBlankAdd* from [makeLinkTargetsBlankAdd.js](#makelinktargetsblankadd-js)
```js
_export = function makeLinkTargetsBlank() {
  document.body.addEventListener('click', e => {
    let a = e.target.closest('a');
    if (!a) { return; }
    if (a.getAttribute('href').indexOf('http') === 0) {
      a.setAttribute('target', '_blank');
    }
  });
}
```

---
## makeLinkTargetsBlankAdd.js

#### Description
* Includes client side code for opening external links in new tabs

#### Exports
* makeLinkTargetsBlankAdd

#### Uses
* *makeLinkTargetsBlank* from **makeLinkTargetsBlank.js**

#### Used by
* *make* from [_make.js](#_make-js)
```js
_export = function makeLinkTargetsBlankAdd(html) {
  html = html.split('</body>').join('<script>' + makeLinkTargetsBlank + ';makeLinkTargetsBlank();</script></body>');
  return html;
}
```

---
## makePdfFromHtml.js

#### Description
* Uses Puppeteer to create a PDF and JPG:s
* Gathers link position info for PPTX/PowerPoint creation

#### Exports
* makePdfFromHtml

#### Uses
* *settings* from **__settings.js**
* *make* from **_make.js**
* *cleanupAndGetPageLength* from **cleanupAndGetPageLength.js**
* *getLinkPositions* from **getLinkPositions.js**
* *getPageDimensions* from **getPageDimensions.js**

#### Used by
* *makePart2* from [_makePart2.js](#_makepart2-js)
* *getLinkPositions* from [getLinkPositions.js](#getlinkpositions-js)
* *getPageDimensions* from [getPageDimensions.js](#getpagedimensions-js)
```js
_export = async function makePdfFromHtml(r, preWarmedPromise) {
  let { makePDF, makeJPGs, makePPTX: mPPTX, keepJPGs } = settings;
  let { browser, page } = await preWarmedPromise;
  let url = import.meta.url.split('/make/')[0] + '/dist/index.html';
  await page.goto(url);
  let { deviceScaleFactor, jpgScreenshotQuality: quality, pdfCropPercent } = settings;
  // get the dimensions of a section/page in mm
  let { widthPx, heightPx, widthMm, heightMm } =
    await page.$eval('body', getPageDimensions);
  // set view port to page size
  let cropF = (100 - pdfCropPercent * 2) / 100;
  await page.setViewport({
    width: Math.floor(widthPx * cropF),
    height: Math.floor(heightPx * cropF),
    deviceScaleFactor
  });
  // if we don't visit pages with code listings the code listing will
  // not show/print - so visit all pages :) 
  // + take screenshots
  let pages = await page.$eval('body', cleanupAndGetPageLength);
  let pagePaths = [], allLinkPositions = [];
  for (let i = 1; i <= pages; i++) {
    let path = `./dist/jpgs/${(i + '').padStart(5, '0')}.jpg`;
    pagePaths.push(path);
    let linkPositions = await page.$eval('body', getLinkPositions, i, mPPTX);
    allLinkPositions.push(linkPositions.map(x => {
      let b = { ...x };
      b.x = b.x * 100 / widthPx;
      b.y = b.y * 100 / heightPx;
      b.right = b.right * 100 / widthPx;
      b.bottom = b.bottom * 100 / heightPx;
      return b;
    }));
    makeJPGs && await page.screenshot({ path, type: "jpeg", quality });
  }
  makeJPGs && console.log('-'.repeat(58));
  makeJPGs && r('JPGs -> Generated.' + (keepJPGs ? '' : ' (For PPTX, removed later.)'));
  makeJPGs && allLinkPositions.filter(x => x.length).length
    && (console.log('-'.repeat(58)), r('Link -> Links for PPTX extracted.'));
  // now we can print to pdf
  if (makePDF) {
    let pdf = await page.pdf({ width: widthMm + 'mm', height: heightMm + 'mm' });
    writeFileSync('./index.pdf', pdf);
  }
  await browser.close();
  return { widthMm, heightMm, pagePaths, pages, allLinkPositions };
}
```

---
## makePptx.js

#### Description
* Creates a PPTX/PowerPoint using the npm module pptxgenjs

#### Exports
* makePptx

#### Uses
* *settings* from **__settings.js**
* *addPptxSlideLinks* from **addPptxSlideLinks.js**

#### Used by
* *makePart2* from [_makePart2.js](#_makepart2-js)
```js
_export = async function makePptx(widthMm, heightMm, pagePaths, allLinkPositions) {
  let { author, title, description } = settings;
  let cFactorInches = 0.0393700787;
  let width = widthMm * cFactorInches, height = heightMm * cFactorInches;
  let pptx = new pptxgen();
  pptx.author = author;
  pptx.company = author;
  pptx.subject = description;
  pptx.title = title;
  await pptx.defineLayout({ name: 'cSize', width, height });
  for (let path of pagePaths) {
    let slide = await pptx.addSlide();
    await slide.addImage({ path, x: 0, y: 0, w: '100%', h: '100%' });
    // add links (previously extracted in makePDFFromHtml)
    await addPptxSlideLinks(slide, allLinkPositions.shift());
  }
  await pptx.writeFile({ fileName: './dist/index.pptx', compression: true });
}
```

---
## nonJustify.js

#### Description
* Helper for space width calculation during letter spacing

#### Exports
* nonJustify

#### Used by
* *getSpaceWidths* from [getSpaceWidths.js](#getspacewidths-js)
* *includeLetterSpacer* from [includeLetterSpacer.js](#includeletterspacer-js)
```js
_export = function nonJustify() {
  let head = document.querySelector('head');
  let style = document.createElement('style');
  style.classList.add('non-justify')
  style.innerHTML = '* {text-align: left !important;}';
  head.append(style);
}
```

---
## pdfMetaData.js

#### Description
* Sets PDF meta data

#### Exports
* pdfMetaData

#### Uses
* *settings* from **__settings.js**

#### Used by
* *fixSloppyPDFCropbox* from [fixSloppyPDFCropbox.js](#fixsloppypdfcropbox-js)
```js
_export = function pdfMetaData(pdfDoc, r) {
  let { author, language, title, description } = settings;
  pdfDoc.setTitle(title);
  pdfDoc.setSubject(description);
  pdfDoc.setAuthor(author);
  pdfDoc.setLanguage(language);
  pdfDoc.setProducer(author + '\'s toolbox');
  pdfDoc.setCreator(author);
  r('PDF  -> Modified meta data.');
}
```

---
## preWarmMakePdfFromHtml.js

#### Description
* Starts Puppeteer early to have it ready when needed

#### Exports
* preWarmMakePDFFromHtml

#### Used by
* *make* from [_make.js](#_make-js)
```js
_export = async function preWarmMakePDFFromHtml() {
  let browser = await puppeteer.launch({ headless: 'new' });
  let page = await browser.newPage();
  return { browser, page };
}
```

---
## reJustify.js

#### Description
* Helper for space width calculation during letter spacing

#### Exports
* reJustify

#### Used by
* *getSpaceWidths* from [getSpaceWidths.js](#getspacewidths-js)
* *includeLetterSpacer* from [includeLetterSpacer.js](#includeletterspacer-js)
```js
_export = function reJustify() {
  document.querySelector('style.non-justify').remove();
}
```

---
## removeQuotes.js

#### Description
* Remove three different types of quotes from a string

#### Exports
* removeQuotes

#### Used by
* *embedImages* from [embedImages.js](#embedimages-js)
```js
_export = function removeQuotes(x) {
  return x
    .split('"').join('')
    .split("'").join('')
    .split('&quot;').join('')
}
```

---
## scaleImage.js

#### Description
* Scales imags using the npm module sharp

#### Exports
* scaleImage

#### Uses
* *settings* from **__settings.js**

#### Used by
* *embedImages* from [embedImages.js](#embedimages-js)
```js
_export = async function scaleImage(buffer) {
  let { resizeSettings, jpegSettings } = settings;
  return sharp(buffer)
    .resize(...resizeSettings)
    .jpeg(...jpegSettings)
    .toBuffer();
};
```

---
## setHtmlLanguage.js

#### Description
* Sets the html lang attribute according to settings

#### Exports
* setHTMLLanguage

#### Uses
* *settings* from **__settings.js**

#### Used by
* *make* from [_make.js](#_make-js)
```js
_export = function setHTMLLanguage(html) {
  let { language } = settings;
  html = html.replace(/<html[^>]*>/g, `<html lang="${language}">`);
  return html;
}
```

---
## textNodesUnder.js

#### Description
* Extract text nodes in a DOM element
* Used for letter spacing

#### Exports
* textNodesUnder

#### Used by
* *includeLetterSpacer* from [includeLetterSpacer.js](#includeletterspacer-js)
* *wrapWords* from [wrapWords.js](#wrapwords-js)
```js
_export = function textNodesUnder(el) {
  var n, a = [], walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
  while (n = walk.nextNode()) a.push(n);
  return a;
}
```

---
## wrapWords.js

#### Description
* Wraps words inside <a-word> tags
* Wraps spaces inside <a-space> tags
* Used for letter spacing

#### Exports
* wrapWords

#### Uses
* *textNodesUnder* from **textNodesUnder.js**

#### Used by
* *adjustLetterSpacing* from [adjustLetterSpacing.js](#adjustletterspacing-js)
* *includeLetterSpacer* from [includeLetterSpacer.js](#includeletterspacer-js)
```js
_export = function wrapWords(insideEl) {
  let nodes = textNodesUnder(insideEl)
    .filter(x => x.textContent.replace(/\n/g, '').length > 1);
  nodes.forEach(node => {
    let text = node.textContent, currentNode;
    for (let word of text.split(' ')) {
      if (currentNode) {
        let aSpace = document.createElement('a-space');
        aSpace.innerText = ' ';
        currentNode.after(aSpace);
        currentNode = aSpace;
      }
      let aWord = document.createElement('a-word');
      aWord.innerText = word;
      !currentNode ? node.replaceWith(aWord) : currentNode.after(aWord);
      currentNode = aWord;
    }
  });
}
```