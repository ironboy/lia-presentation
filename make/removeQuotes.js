/***
 * - Remove three different types of quotes from a string
 */

_export = function removeQuotes(x) {
  return x
    .split('"').join('')
    .split("'").join('')
    .split('&quot;').join('')
}