/***
 * - Cleanup of HTML (mostly included style attributes)
 * - Makes the HTML valid in linters such as VSC:s built in linter
 */

export function cleanupHtmlForLinters(html) {
  // no empty style attribute
  html = html.replace(/style=""/g, '');
  html = html.split(' style="');
  let cleaned = [];
  // no escaped &lt; or &gt in style attributes
  // replace with < and >
  for (let part of html) {
    let [style, ...rest] = part.split('"');
    style = style
      .replace(/\&lt\;/g, '<')
      .replace(/\&gt\;/g, '>')
    cleaned.push([style, ...rest].join('"'));
  }
  html = cleaned.join(' style="');
  // remove non-standard rules in style tags
  [
    '-webkit-print-color-adjust:exact!important;',
    'color-adjust:exact!important;',
    '-webkit-appearance:button'

  ].forEach((x, i) =>
    html = html.split(x).join(i === 2 ? 'appearance:button' : ''));
  // add the rules back through a script
  let script = () => {
    let style = document.createElement('style');
    style.innerHTML = /*css*/`
      div#\:\$p>svg>foreignObject>section,div#\:\$p>svg>foreignObject>section * {
        -webkit-print-color-adjust:exact!important;
      }
      div#\:\$p>svg>foreignObject>section,
      div#\:\$p>svg>foreignObject>section * {
        color-adjust: exact !important;
      }
    `;
    document.querySelector('head').append(style);
  }
  script = `<script>\n(${script})()\n</script>`;
  html = html.split('</body>').join(script + '\n</body>');
  return html;
}