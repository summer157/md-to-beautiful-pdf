# md-to-beautiful-pdf

Turn Markdown into polished, well-paginated PDFs with Typst templates.

**中文**：把 Markdown 转换成分页自然、视觉漂亮、适合分享的精排 PDF。

---

## Why This Exists

Typora is great for writing and previewing. Typst is better for final PDF typesetting. This project connects the two workflows.

When you export a Markdown document directly from Typora, you often get:

- Headings stranded alone at the bottom of a page
- Tables and code blocks sliced awkwardly across page breaks
- Inconsistent spacing around images

This tool routes your Markdown through **Typst** — a modern typesetting engine built for paginated output — and applies clean, well-crafted themes that handle all of this automatically.

> This project is **not** a Typora CSS replicator. It borrows visual inspiration from Typora themes but reimplements them in Typst for proper print-quality pagination.

---

## Requirements

Before using this tool, install:

| Tool | Install |
|------|---------|
| **Node.js** ≥ 18 | https://nodejs.org |
| **pandoc** | `brew install pandoc` · https://pandoc.org/installing.html |
| **typst** | `brew install typst` · https://github.com/typst/typst/releases |

If either `pandoc` or `typst` is missing, the CLI will tell you clearly.

---

## Installation

```bash
npm install -g md-to-beautiful-pdf
```

Or use it without installing:

```bash
npx md-to-beautiful-pdf input.md
```

---

## Usage

```bash
# Basic usage — outputs input.pdf next to input.md
mdpdf input.md

# Choose a theme
mdpdf input.md --theme purple

# Full options
mdpdf input.md \
  --output report.pdf \
  --theme purple \
  --title "Project Design" \
  --author "Your Name" \
  --toc
```

### All Options

| Option | Default | Description |
|--------|---------|-------------|
| `input.md` | — | Input Markdown file |
| `--output <path>` | Same name as input | Output PDF path |
| `--theme <name>` | `minimal` | Theme: `minimal` or `purple` |
| `--paper <size>` | `a4` | Paper size: `a4` or `letter` |
| `--toc` / `--no-toc` | `--toc` | Show/hide table of contents |
| `--title <text>` | First H1 heading | Override document title |
| `--author <text>` | Empty | Document author |
| `--date <text>` | Empty | Document date |
| `--keep-typ` | Off | Keep the intermediate `.typ` file |

---

## Themes

### `minimal` (default)

Clean and print-friendly. White background, dark gray text, subtle ruled headings, gray code blocks.

```bash
mdpdf input.md --theme minimal
```

### `purple`

Inspired by Typora's purple theme. White background, purple accent color, left-bar headings, dark code blocks with light text, purple table headers.

```bash
mdpdf input.md --theme purple
```

---

## Configuration File

Create `mdpdf.config.json` in the same directory as your Markdown file:

```json
{
  "theme": "purple",
  "paper": "a4",
  "toc": true,
  "author": "Your Name",
  "font": {
    "body": "PingFang SC",
    "code": "JetBrains Mono"
  }
}
```

CLI options override config file values.

---

## Manual Page Control

Insert HTML comments in your Markdown to control pagination:

```markdown
<!-- pagebreak -->
```

Forces a page break at that position.

```markdown
<!-- keep-next -->
```

Hints that the next block should stay on the same page as the current block.

---

## Examples

Try the included examples:

```bash
# Basic features demo
mdpdf examples/basic.md --theme minimal

# Purple theme
mdpdf examples/basic.md --theme purple

# Technical report
mdpdf examples/technical-report.md --theme purple --title "架构设计方案"
```

---

## Development

```bash
git clone https://github.com/yourname/md-to-beautiful-pdf.git
cd md-to-beautiful-pdf
npm install
npm run build

# Run CLI locally
node dist/cli.js examples/basic.md --theme purple
```

---

## Project Philosophy

- **Markdown for writing.** Keep your existing workflow in Typora or any editor.
- **Typst for publishing.** Let the typesetting engine handle page breaks, headings, and spacing.
- **Themes for style.** Visual themes are implemented in Typst, not CSS — so they work properly with paginated output.

This tool will never claim 100% compatibility with any Typora CSS theme. Instead, it aims for PDFs that look *professionally typeset* regardless of what Markdown editor you use.

---

## License

MIT
