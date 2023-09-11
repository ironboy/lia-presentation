_export = function makeLinkTargetsBlankAdd(html) {
  html = html.split('</html>').join('<script>' + makeLinkTargetsBlank + ';makeLinkTargetsBlank();</script></html>');
  return html;
}

