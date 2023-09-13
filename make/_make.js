/***
 * - Main/start function
 * - Makes HTML, PDF, JPG and PPTX files from index.md
 */

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