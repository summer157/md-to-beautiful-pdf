# md-to-beautiful-pdf

Turn Markdown into polished, well-paginated PDFs with Typst templates.

**中文**：把 Markdown 转换成分页自然、视觉漂亮、适合分享的精排 PDF。

`md-to-beautiful-pdf` is a small CLI for people who like writing in Markdown
but want better final PDFs than a browser-style export usually provides. It
uses Pandoc to translate Markdown into Typst, then applies a print-oriented
Typst theme and compiles the result to PDF.

```text
Markdown (.md) -> Pandoc -> Typst template -> PDF
```

## Why

Markdown editors such as Typora are excellent for writing and previewing, but
CSS themes are designed for scrolling documents. PDF is paginated, so direct
exports often produce awkward page breaks, stranded headings, and tables that
leave large blank areas.

This project treats Typst as the final typesetting engine. The goal is not to
copy every Typora CSS rule exactly, but to create PDF themes inspired by those
styles while keeping pagination readable.

## Features

- Convert one Markdown file into one PDF.
- Built-in `minimal` and `purple` themes.
- Import Typora CSS themes into Typst themes with `mdpdf import-theme`.
- List available themes with `mdpdf themes`.
- Automatic title detection from the first H1.
- Optional table of contents.
- Page headers, footers, and page numbers.
- Better table pagination by unwrapping Pandoc table figures into native Typst
  tables.
- Manual page break comments for long documents.
- Local images supported through Typst's root handling.

## Requirements

Install these tools first:

| Tool | Version | macOS install |
| --- | --- | --- |
| Node.js | 18+ | <https://nodejs.org> |
| Pandoc | recent | `brew install pandoc` |
| Typst | recent | `brew install typst` |

If `pandoc` or `typst` is missing, the CLI prints a clear error message.

## Installation

From npm, once published:

```bash
npm install -g md-to-beautiful-pdf
```

From this repository:

```bash
git clone git@github.com:summer157/md-to-beautiful-pdf.git
cd md-to-beautiful-pdf
npm install
npm run build
```

Run locally from the repository:

```bash
node dist/cli.js examples/basic.md --theme purple
```

## Usage

Basic conversion:

```bash
mdpdf input.md
```

This writes `input.pdf` next to `input.md`.

Choose a theme and output path:

```bash
mdpdf input.md --theme purple --output report.pdf
```

Full example:

```bash
mdpdf input.md \
  --output report.pdf \
  --theme purple-typora \
  --paper a4 \
  --title "Project Design" \
  --author "Summer" \
  --toc
```

### Options

| Option | Default | Description |
| --- | --- | --- |
| `input.md` | required | Input Markdown file |
| `-o, --output <path>` | same name as input | Output PDF path |
| `--theme <name>` | `minimal` | Theme name |
| `--paper <size>` | `a4` | Typst paper size. `letter` is accepted as an alias for `us-letter` |
| `--toc` / `--no-toc` | `--toc` | Show or hide the table of contents |
| `--title <text>` | first H1 | Override document title |
| `--author <text>` | empty | Document author |
| `--date <text>` | empty | Document date |
| `--keep-typ` | off | Keep the intermediate `.typ` file for debugging |

## Themes

List all available themes:

```bash
mdpdf themes
```

Built-in themes:

- `minimal`: clean, restrained, print-friendly.
- `purple`: purple accent, readable headings, styled code and tables.

This repository also includes several imported Typora-inspired themes, including
`purple-typora`. Imported themes are normal `.typ` files under `themes/`, so you
can edit them by hand after generation.

## Import Typora CSS Themes

You can convert a Typora CSS theme into a Typst theme:

```bash
mdpdf import-theme "/Users/summer/Library/Application Support/abnerworks.Typora/themes/purple.css"
```

If the CSS file is named `purple.css`, the generated theme is named
`purple-typora` to avoid overwriting the built-in `purple` theme.

Use a custom name:

```bash
mdpdf import-theme purple.css --name typora-purple
```

Then convert with it:

```bash
mdpdf input.md --theme typora-purple
```

The importer extracts CSS variables, common color aliases, fonts, inline code
colors, code block colors, blockquote styling, table colors, and simple heading
decorations such as centered H1 rules or H2 left borders. It is intentionally a
best-effort converter: CSS is for browser layout, while Typst is for paginated
typesetting.

## Configuration

Create `mdpdf.config.json` next to your Markdown file:

```json
{
  "theme": "purple-typora",
  "paper": "a4",
  "toc": true,
  "author": "Summer",
  "date": "2026-05-13"
}
```

CLI options override the config file.

## Manual Page Control

Force a page break:

```markdown
<!-- pagebreak -->
```

Add a weak keep-next hint:

```markdown
<!-- keep-next -->
```

## Examples

```bash
mdpdf examples/basic.md --theme minimal
mdpdf examples/basic.md --theme purple
mdpdf examples/technical-report.md --theme purple --title "架构设计方案"
```

## Development

```bash
npm install
npm run build
npm test
```

Useful commands:

```bash
node dist/cli.js themes
node dist/cli.js import-theme ./purple.css --name purple-typora
node dist/cli.js examples/basic.md --theme purple-typora --keep-typ
```

Before publishing an npm package, build first:

```bash
npm run build
npm pack
```

## Notes

- Some systems may warn about missing fonts such as `Open Sans`,
  `JetBrains Mono`, or `Noto Sans CJK SC`. Typst falls back to available fonts,
  and the PDF can still be generated.
- For the best Chinese output, install a good CJK font such as PingFang SC,
  Noto Sans CJK SC, or Source Han Sans SC.
- Very complex HTML embedded in Markdown is outside the current scope.

## License

MIT
