/***
 * - Includes the letter spacing logic in the HTML client side code
 */

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