_export = function setHTMLLanguage(html) {
  let { language } = settings;
  html = html.replace(/<html[^>]*>/g, `<html lang="${language}">`);
  return html;
}