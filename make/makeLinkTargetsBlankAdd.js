_export = function makeLinkTargetsBlankAdd(html) {
  html = html.split('</body>').join('<script>' + makeLinkTargetsBlank + ';makeLinkTargetsBlank();</script></body>');
  return html;
}

