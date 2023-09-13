[
  textNodesUnder,
  wrapWords,
  nonJustify,
  reJustify,
  getSpaceWidths,
  adjustLetterSpacing
]

function textNodesUnder(el) {
  var n, a = [], walk = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, null, false);
  while (n = walk.nextNode()) a.push(n);
  return a;
}

function wrapWords(insideEl) {
  let nodes = textNodesUnder(insideEl)
    .filter(x => x.textContent.replace(/\n/g, '').length > 1);
  nodes.forEach(node => {
    let text = node.textContent, currentNode;
    for (let word of text.split(' ')) {
      if (currentNode) {
        let aSpace = document.createElement('a-space');
        aSpace.innerText = ' ';
        currentNode.after(aSpace);
        currentNode = aSpace;
      }
      let aWord = document.createElement('a-word');
      aWord.innerText = word;
      !currentNode ? node.replaceWith(aWord) : currentNode.after(aWord);
      currentNode = aWord;
    }
  });
}

function nonJustify() {
  let head = document.querySelector('head');
  let style = document.createElement('style');
  style.classList.add('non-justify')
  style.innerHTML = '* {text-align: left !important;}';
  head.append(style);
}

function reJustify() {
  document.querySelector('style.non-justify').remove();
}

function getSpaceWidths() {
  let parentSel = 'p, li, th, td';
  let words = [...document.querySelectorAll('a-word')];
  let spaces = [...document.querySelectorAll('a-space')];
  // only keep one space per common parentNode and line
  let parentNodeMem = [];
  spaces = spaces.filter(el => {
    let pNode = el.closest(parentSel);
    let y = el.getBoundingClientRect().y;
    let keep = !parentNodeMem.find(([a, b]) => a === pNode && b === y);
    parentNodeMem.push([pNode, y]);
    return keep;
  });
  // check how stretched the spaces are
  nonJustify();
  spaces = spaces
    .map(el => ({ el, w: el.offsetWidth }))
    .filter(({ w }) => w);
  reJustify();
  spaces.forEach(x => x.w2 = x.el.offsetWidth);
  spaces = spaces
    .filter(({ w, w2 }) => w !== w2)
    .map(({ el, w, w2 }) => ({
      el,
      stretch: w2 / w,
      baseW: w,
      words: words.filter(x =>
        x.closest(parentSel) === el.closest(parentSel)
        && x.getBoundingClientRect().y === el.getBoundingClientRect().y
      )
    }));
  spaces.forEach(x => x.phrase = x.words.map(x => x.innerText).join(' '));
  return spaces;
}

function adjustLetterSpacing(page = 1) {
  let section = [...document.querySelectorAll('section')]
    .find(x => x.id.replace(/\D/g, '') === page + '');
  if (!section) {
    location.hash = '#1';
    return;
  }
  location.hash = '#' + page;
  wrapWords(section);
  let spaces = getSpaceWidths();
  let minSpace = -0.02
  let maxSpace = 0.02;
  let step = 0.001;
  for (let { el, baseW, words } of spaces) {
    let candidates = [];
    for (let i = minSpace; i <= maxSpace; i += step) {
      words.forEach(w => w.style.letterSpacing = i + 'rem');
      candidates.push({ space: i, val: el.offsetWidth / baseW });
    }
    // choose best candidate
    let best = candidates.sort((a, b) => {
      if (a.val === b.val) {
        return Math.abs(a.space) < Math.abs(b.space) ? -1 : 1;
      }
      return a.val < b.val ? -1 : 1;
    })[0];
    words.forEach(w => w.style.letterSpacing = best.space + 'rem');
  }
  adjustLetterSpacing(page + 1);
}

adjustLetterSpacing();
