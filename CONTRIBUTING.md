# Contributing to md-to-beautiful-pdf

Thanks for your interest in contributing! This guide covers everything you need to get started.

## Requirements

Before you begin, make sure you have the following installed:

- **Node.js** 18+
- **Pandoc** — `brew install pandoc`
- **Typst** — `brew install typst`

## Getting started

```bash
git clone https://github.com/summer157/md-to-beautiful-pdf.git
cd md-to-beautiful-pdf
npm install
npm run build
```

Verify everything works:

```bash
node dist/cli.js themes
node dist/cli.js examples/basic.md --theme purple --output /tmp/test.pdf
```

## Development workflow

```bash
npm run build        # compile TypeScript once
npm run dev          # watch mode — recompiles on save
npm test             # run the smoke test suite
```

The smoke test builds the project and converts all example files with multiple themes. It requires Pandoc and Typst to be installed.

## Project structure

```
src/
  cli.ts           # Commander.js entry point, all commands defined here
  convert.ts       # Main conversion pipeline (Markdown → Typst → PDF)
  config.ts        # Config loading and merging (CLI flags + mdpdf.config.json)
  import-theme.ts  # Typora CSS → Typst theme converter
  markdown.ts      # Markdown pre-processing (pagebreak, keep-next, table unwrap)
  themes.ts        # Theme discovery (built-in + imported)
  typst.ts         # Typst template generation and compilation
themes/            # .typ theme files (built-in and imported)
examples/          # Sample Markdown files for testing
tests/
  smoke.js         # End-to-end smoke tests
```

## Adding a new theme

1. Create a new `.typ` file in the `themes/` directory (e.g. `themes/ocean.typ`).
2. Use an existing theme like `themes/purple.typ` as a starting point.
3. Test it: `node dist/cli.js examples/basic.md --theme ocean --output /tmp/ocean.pdf`
4. Add a screenshot of the output to your PR.

You can also import a Typora CSS theme as a starting point:

```bash
node dist/cli.js import-theme your-theme.css --name ocean
```

## Submitting a pull request

1. Fork the repository and create a branch from `main`.
2. Make your changes.
3. Run `npm run build` and `npm test` to confirm everything passes.
4. Open a pull request — the PR template will guide you through the rest.

## Reporting bugs

Use the [Bug Report](https://github.com/summer157/md-to-beautiful-pdf/issues/new?template=bug_report.yml) issue template. The more detail you provide (OS, versions, error output), the faster it can be resolved.

## Code style

- TypeScript with strict mode enabled.
- Async/await preferred over callbacks.
- Keep CLI output clean: use `chalk` for color, prefix success with `✓` and errors with `✗`.

## License

By contributing, you agree that your contributions will be licensed under the [MIT License](LICENSE).
