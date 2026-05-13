// Minimal theme — md-to-beautiful-pdf
// Clean, readable, print-friendly

#let doc-title = "%%DOC_TITLE%%"
#let doc-author = "%%DOC_AUTHOR%%"

#set document(title: doc-title, author: doc-author)

#set page(
  paper: "%%PAPER%%",
  margin: (top: 2.5cm, bottom: 2.5cm, left: 3cm, right: 3cm),
  header: context {
    if counter(page).get().first() > 1 {
      box(width: 1fr)[
        #set text(size: 8pt, fill: rgb("#999999"))
        #h(1fr)
        #doc-title
      ]
      v(-0.5em)
      line(length: 100%, stroke: 0.4pt + rgb("#dddddd"))
    }
  },
  footer: context {
    line(length: 100%, stroke: 0.4pt + rgb("#dddddd"))
    v(-0.5em)
    set text(size: 8pt, fill: rgb("#999999"))
    h(1fr)
    counter(page).display("1")
  },
)

#set text(
  font: ("PingFang SC", "Noto Sans CJK SC", "Source Han Sans SC", "Hiragino Sans GB", "Arial", "Helvetica"),
  size: 11pt,
  fill: rgb("#333333"),
  lang: "zh",
)

#set par(
  leading: 0.9em,
  spacing: 1.4em,
)

// H1 — large, with bottom rule
#show heading.where(level: 1): it => {
  block(above: 2em, below: 0.8em, sticky: true)[
    #set text(size: 22pt, weight: "bold", fill: rgb("#1a1a1a"))
    #it.body
    #v(0.25em)
    #line(length: 100%, stroke: 1.5pt + rgb("#333333"))
  ]
}

// H2
#show heading.where(level: 2): it => {
  block(above: 1.6em, below: 0.55em, sticky: true)[
    #set text(size: 16pt, weight: "bold", fill: rgb("#1a1a1a"))
    #it.body
  ]
}

// H3
#show heading.where(level: 3): it => {
  block(above: 1.3em, below: 0.45em, sticky: true)[
    #set text(size: 13pt, weight: "bold", fill: rgb("#333333"))
    #it.body
  ]
}

// H4
#show heading.where(level: 4): it => {
  block(above: 1.1em, below: 0.4em, sticky: true)[
    #set text(size: 11pt, weight: "bold", fill: rgb("#444444"))
    #it.body
  ]
}

// H5 / H6
#show heading.where(level: 5): it => {
  block(above: 0.9em, below: 0.35em, sticky: true)[
    #set text(size: 11pt, weight: "bold", style: "italic", fill: rgb("#555555"))
    #it.body
  ]
}
#show heading.where(level: 6): it => {
  block(above: 0.8em, below: 0.3em, sticky: true)[
    #set text(size: 10pt, style: "italic", fill: rgb("#666666"))
    #it.body
  ]
}

// Code block
#show raw.where(block: true): it => {
  block(
    fill: rgb("#f6f6f6"),
    inset: (x: 14pt, y: 12pt),
    radius: 5pt,
    width: 100%,
    breakable: true,
    stroke: 0.5pt + rgb("#e0e0e0"),
  )[
    #set text(
      font: ("JetBrains Mono", "Cascadia Code", "Fira Code", "Menlo", "Consolas", "Courier New"),
      size: 9pt,
      fill: rgb("#2d2d2d"),
    )
    #it
  ]
}

// Inline code
#show raw.where(block: false): it => {
  box(
    fill: rgb("#f0f0f0"),
    inset: (x: 4pt, y: 2pt),
    radius: 3pt,
    baseline: 1.5pt,
  )[
    #set text(
      font: ("JetBrains Mono", "Cascadia Code", "Fira Code", "Menlo", "Consolas", "Courier New"),
      size: 9pt,
      fill: rgb("#c62828"),
    )
    #it
  ]
}

// Blockquote
#show quote.where(block: true): it => {
  block(
    inset: (left: 14pt, right: 8pt, top: 8pt, bottom: 8pt),
    stroke: (left: 3pt + rgb("#aaaaaa")),
    fill: rgb("#fafafa"),
    width: 100%,
    radius: (right: 3pt),
  )[
    #set text(fill: rgb("#666666"), style: "italic")
    #it.body
  ]
}

// Table
#set table(
  stroke: rgb("#dddddd"),
  inset: (x: 9pt, y: 7pt),
  fill: (_, y) => if y == 0 { rgb("#f5f5f5") } else { white },
)
#show table.cell.where(y: 0): set text(weight: "bold")
#show table.cell: it => {
  if it.y == 0 {
    set align(center + horizon)
    it
  } else if it.x == 0 {
    set align(center + horizon)
    it
  } else {
    set align(left + horizon)
    it
  }
}

// Links
#show link: it => {
  set text(fill: rgb("#1a73e8"))
  underline(it)
}

// Figures — don't break across pages
#show figure: set block(breakable: false)
#set figure(gap: 0.7em)
#show figure.caption: set text(size: 9pt, fill: rgb("#666666"), style: "italic")

// Images — max width = text width
#show image: it => {
  set image(width: 100%)
  it
}

// Lists
#set list(indent: 1.2em, spacing: 0.5em)
#set enum(indent: 1.2em, spacing: 0.5em)

// Outline (TOC) style
#show outline.entry.where(level: 1): set text(weight: "bold")

%%PREAMBLE%%

%%BODY%%
