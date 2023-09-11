_export = function removeQuotes(x) {
  return x
    .split('"').join('')
    .split("'").join('')
    .split('&quot;').join('')
}