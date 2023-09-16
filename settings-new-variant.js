// Not used yet

let x = {
  convertTo: {
    comment: 'Which formats to convert to in addition to html',
    pdf: true,
    jpgs: false,
    pptx: false
  },
  hyphenate: {
    comment: 'Hyphenation settings',
    useInTags: ['p', 'li', 'th', 'td'],
    minWordLength: 6,
    minCharsBefore: 3,
    minCharsAfter: 3
  },
  wordSpacing: {
    comment: 'Extra width of spaces in rem:s',
    defaultExtraRem: 0.02
  },
  letterSpacing: {
    comment: 'Min and max letterspacing in rem:s',
    minRem: -0.02,
    maxRem: 0.02
  },
  imageScaling: {
    comment: 'Image scaling applied before html conversion',
    scaleToPxs: 1500,
    jpgQuality: 65,
  },
  standaloneJpgs: {
    comment: 'Settings when generating standalone jpg:s (also used in pptx:s)',
    deviceScaleFactor: 2,
    jpgQuality: 70,
  },
  ghostScript: {
    comment: 'Compression applied to pdf (by GhostScript)',
    pdfCompression: 'prepress',
    _options: ['screen', 'ebook', 'printer', 'prepress']
  },
  cropPdf: {
    comment: 'Slight crop of edges in pdf, avoding white borders on bleed',
    cropPercent: 0.15
  }
}