_export = function makeLinkTargetsBlank() {
  document.body.addEventListener('click', e => {
    let a = e.target.closest('a');
    if (!a) { return; }
    if (a.getAttribute('href').indexOf('http') === 0) {
      a.setAttribute('target', '_blank');
    }
  });
}