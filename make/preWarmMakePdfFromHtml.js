_export = async function preWarmMakePDFFromHtml() {
  let browser = await puppeteer.launch({ headless: 'new' });
  let page = await browser.newPage();
  return { browser, page };
}