_export = function cleanupAndGetPageLength() {
  // change id:s of sections to valid id:s (must start with character)
  [...document.querySelectorAll('section[id]')].forEach(x => x.id = 'x' + x.id);
  // remove navigator (otherwise it shows in screenshots)
  document.querySelector('.bespoke-marp-osc').remove();
  // number of pages in document
  return document.querySelectorAll('section[id]').length;
}