// Purple theme — md-to-beautiful-pdf
// Inspired by Typora's purple theme, reimplemented for Typst pagination

#let doc-title = "%%DOC_TITLE%%"
#let doc-author = "%%DOC_AUTHOR%%"
#let accent = rgb("#7B4BEB")
#let accent-light = rgb("#f3eeff")
#let accent-border = rgb("#c4a8f5")

#set document(title: doc-title, author: doc-author)

#set page(
  paper: "%%PAPER%%",
  margin: (top: 2.5cm, bottom: 2.5cm, left: 3cm, right: 3cm),
  header: context {
    if counter(page).get().first() > 1 {
      box(width: 1fr)[
        #set text(size: 8pt, fill: rgb("#888888"))
        #h(1fr)
        #doc-title
      ]
      v(-0.5em)
      line(length: 100%, stroke: 0.5pt + accent)
    }
  },
  footer: context {
    line(length: 100%, stroke: 0.5pt + accent)
    v(-0.5em)
    set text(size: 8pt, fill: rgb("#888888"))
    h(1fr)
    counter(page).display("1")
  },
)

#set text(
  font: ("PingFang SC", "Noto Sans CJK SC", "Source Han Sans SC", "Hiragino Sans GB", "Arial", "Helvetica"),
  size: 11pt,
  fill: rgb("#2c2c2c"),
  lang: "zh",
)

#set par(
  leading: 0.9em,
  spacing: 1.4em,
)

// H1 — accent left bar + bottom rule
#show heading.where(level: 1): it => {
  block(above: 2em, below: 0.8em, sticky: true)[
    #stack(dir: ltr, spacing: 10pt,
      rect(width: 5pt, height: 1.4em, fill: accent, radius: 2pt),
      text(size: 22pt, weight: "bold", fill: rgb("#1a1a1a"))[#it.body],
    )
    #v(0.2em)
    #line(length: 100%, stroke: 0.8pt + accent-border)
  ]
}

// H2 — accent-colored text, subtle left rule
#show heading.where(level: 2): it => {
  block(above: 1.6em, below: 0.55em, sticky: true)[
    #stack(dir: ltr, spacing: 8pt,
      rect(width: 3pt, height: 1.15em, fill: accent-border, radius: 1pt),
      text(size: 16pt, weight: "bold", fill: rgb("#1a1a1a"))[#it.body],
    )
  ]
}

// H3
#show heading.where(level: 3): it => {
  block(above: 1.3em, below: 0.45em, sticky: true)[
    #set text(size: 13pt, weight: "bold", fill: accent)
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
    #set text(size: 11pt, weight: "bold", style: "italic", fill: rgb("#666666"))
    #it.body
  ]
}
#show heading.where(level: 6): it => {
  block(above: 0.8em, below: 0.3em, sticky: true)[
    #set text(size: 10pt, style: "italic", fill: rgb("#777777"))
    #it.body
  ]
}

// Code block
#show raw.where(block: true): it => {
  block(
    fill: rgb("#1e1e2e"),
    inset: (x: 14pt, y: 12pt),
    radius: 6pt,
    width: 100%,
    breakable: false,
    stroke: 0.5pt + rgb("#3d3a5e"),
  )[
    #set text(
      font: ("JetBrains Mono", "Cascadia Code", "Fira Code", "Menlo", "Consolas", "Courier New"),
      size: 9pt,
      fill: rgb("#cdd6f4"),
    )
    #it
  ]
}

// Inline code — light purple background
#show raw.where(block: false): it => {
  box(
    fill: accent-light,
    inset: (x: 4pt, y: 2pt),
    radius: 3pt,
    baseline: 1.5pt,
    stroke: 0.3pt + accent-border,
  )[
    #set text(
      font: ("JetBrains Mono", "Cascadia Code", "Fira Code", "Menlo", "Consolas", "Courier New"),
      size: 9pt,
      fill: accent,
    )
    #it
  ]
}

// Blockquote — purple left border
#show quote.where(block: true): it => {
  block(
    inset: (left: 14pt, right: 8pt, top: 8pt, bottom: 8pt),
    stroke: (left: 3pt + accent),
    fill: accent-light,
    width: 100%,
    radius: (right: 4pt),
  )[
    #set text(fill: rgb("#555555"), style: "italic")
    #it.body
  ]
}

// Table — purple header background
#set table(
  stroke: rgb("#d8d0f0"),
  inset: (x: 9pt, y: 7pt),
  fill: (_, y) => if y == 0 { accent-light } else { white },
)
#show table.cell.where(y: 0): set text(weight: "bold", fill: accent)

// Links
#show link: it => {
  set text(fill: accent)
  underline(it)
}

// Figures — don't break across pages
#show figure: set block(breakable: false)
#set figure(gap: 0.7em)
#show figure.caption: set text(size: 9pt, fill: rgb("#888888"), style: "italic")

// Images
#show image: it => {
  set image(width: 100%)
  it
}

// Lists
#set list(indent: 1.2em, spacing: 0.5em, marker: ([•], [◦], [▪]))
#set enum(indent: 1.2em, spacing: 0.5em)

// Outline (TOC) style
#show outline.entry.where(level: 1): set text(weight: "bold", fill: accent)

%%PREAMBLE%%

%%BODY%%
