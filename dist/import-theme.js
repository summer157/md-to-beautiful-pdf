import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join, basename, dirname } from 'path';
import { fileURLToPath } from 'url';
const __dirname = dirname(fileURLToPath(import.meta.url));
const THEMES_DIR = join(__dirname, '..', 'themes');
function parseCSS(css) {
    css = css.replace(/\/\*[\s\S]*?\*\//g, '');
    const rules = [];
    // handle nested {} by matching balanced braces manually
    const ruleRe = /([^{]+?)\s*\{([^{}]*)\}/g;
    let m;
    while ((m = ruleRe.exec(css)) !== null) {
        const selector = m[1].trim();
        const decls = new Map();
        const declRe = /([\w-]+)\s*:\s*([^;]+)/g;
        let d;
        while ((d = declRe.exec(m[2])) !== null) {
            decls.set(d[1].trim(), d[2].trim().replace(/\s*!important$/, '').trim());
        }
        rules.push({ selector, decls });
    }
    return rules;
}
/** Resolve all var(--x) references given a variable map */
function resolveVars(value, vars, depth = 0) {
    if (depth > 8)
        return value;
    return value.replace(/var\((--[\w-]+)[^)]*\)/g, (_, name) => {
        const v = vars.get(name);
        return v ? resolveVars(v, vars, depth + 1) : _;
    });
}
/** Convert a CSS color string to a Typst rgb(...) expression */
function cssColorToTypst(raw) {
    const color = raw.trim();
    if (!color || color === 'transparent')
        return 'rgb("#00000000")';
    // #rrggbb / #rgb / #rrggbbaa
    if (/^#[0-9a-fA-F]{3,8}$/.test(color)) {
        const h = color.slice(1);
        if (h.length === 3) {
            const r = h[0] + h[0];
            const g = h[1] + h[1];
            const b = h[2] + h[2];
            return `rgb("#${r}${g}${b}")`;
        }
        return `rgb("${color}")`;
    }
    // rgba(r, g, b, a)
    const rgba = color.match(/rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*([\d.]+))?\s*\)/);
    if (rgba) {
        const rh = parseInt(rgba[1]).toString(16).padStart(2, '0');
        const gh = parseInt(rgba[2]).toString(16).padStart(2, '0');
        const bh = parseInt(rgba[3]).toString(16).padStart(2, '0');
        const ah = rgba[4] !== undefined
            ? Math.round(parseFloat(rgba[4]) * 255).toString(16).padStart(2, '0')
            : 'ff';
        return `rgb("#${rh}${gh}${bh}${ah}")`;
    }
    // named
    const named = {
        white: '#ffffff', black: '#000000', gray: '#808080', grey: '#808080',
    };
    if (named[color])
        return `rgb("${named[color]}")`;
    // fallback — wrap as-is
    return `rgb("${color}")`;
}
/** Parse a CSS font-family string into an array of font names */
function parseFontFamilies(raw) {
    return raw
        .split(',')
        .map(f => f.trim().replace(/^["']|["']$/g, '').replace(/\s*!important$/, '').trim())
        .filter(f => f && !f.startsWith('var(') && !['serif', 'sans-serif', 'monospace', 'cursive', 'fantasy', 'system-ui'].includes(f.toLowerCase()));
}
export function extractTokens(cssPath) {
    const name = basename(cssPath, '.css');
    const css = readFileSync(cssPath, 'utf-8');
    const rules = parseCSS(css);
    // ── Step 1: build CSS variable map from :root ───────────────────────────
    const vars = new Map();
    for (const rule of rules) {
        if (rule.selector === ':root') {
            for (const [k, v] of rule.decls) {
                if (k.startsWith('--'))
                    vars.set(k, v);
            }
        }
    }
    // resolve all var() references inside the map itself (multi-pass)
    for (let pass = 0; pass < 4; pass++) {
        for (const [k, v] of vars) {
            vars.set(k, resolveVars(v, vars));
        }
    }
    /** Try several variable names, return first match or fallback */
    const getVarAny = (names, fallback) => {
        for (const name of names) {
            const v = vars.get(name);
            if (v)
                return resolveVars(v, vars);
        }
        return fallback;
    };
    const decl = (selector, prop) => {
        for (const rule of rules) {
            const sels = rule.selector.split(',').map(s => s.trim());
            if (sels.some(s => s === selector)) {
                const v = rule.decls.get(prop);
                if (v)
                    return resolveVars(v, vars);
            }
        }
        return undefined;
    };
    // ── Step 2: extract palette ──────────────────────────────────────────────
    // Accent: try every common naming pattern across Typora themes
    const accent = getVarAny(['--title-color', '--accent-color', '--primary-color', '--theme-color',
        '--heading-color', '--brand-color'], 
    // last resort: derive from heading element rule
    (() => {
        const h1Color = decl('h1', 'color') ?? decl('h2', 'color');
        return h1Color ?? '#7B4BEB';
    })());
    const textColor = getVarAny(['--text-color', '--body-color', '--fg-color', '--foreground', '--content-color'], '#333333');
    const lightText = getVarAny(['--light-text-color', '--muted-text-color', '--meta-text-color',
        '--secondary-text', '--lighter-text-color', '--subtitle-color'], '#666666');
    const linkColor = getVarAny(['--link-color', '--a-color', '--hyperlink-color'], '#1a73e8');
    // inline code
    const inlineCodeColor = getVarAny(['--code-color', '--inline-code-color', '--code-fg', '--code-text-color'], accent);
    const inlineCodeBg = getVarAny(['--inline-code-bg', '--inline-code-bg-color', '--code-bg', '--code-background'], '#f4f2f9');
    // code block (.md-fences or pre)
    const rawCodeBg = decl('.md-fences', 'background') ??
        decl('.md-fences', 'background-color') ??
        decl('pre', 'background-color') ??
        decl('pre', 'background') ??
        getVarAny(['--code-block-bg', '--code-bg-color', '--code-background-color',
            '--fences-bg', '--pre-bg'], '#f6f6f6');
    const codeBlockBg = rawCodeBg.replace('!important', '').trim();
    const codeBlockBorder = decl('.md-fences', 'border') ??
        getVarAny(['--code-block-border', '--code-border', '--fences-border', '--border'], '#e0e0e0');
    const codeBlockTextColor = decl('.cm-s-inner.CodeMirror', 'color') ??
        decl('.cm-s-inner', 'color') ??
        getVarAny(['--code-text-color', '--code-fg-color'], '#2d2d2d');
    // borders
    const borderColor = getVarAny(['--border', '--border-color', '--line-color', '--divider-color', '--separator-color'], '#e7e7e7');
    const blockquoteBorder = getVarAny(['--border-quote', '--blockquote-border', '--quote-border',
        '--blockquote-accent', '--blockquote-color'], accent);
    // ── Step 3: fonts ─────────────────────────────────────────────────────────
    const bodyFonts = parseFontFamilies(getVarAny(['--base-font', '--body-font', '--font-family', '--text-font'], 'PingFang SC, Arial'));
    const headingFonts = parseFontFamilies(getVarAny(['--title-font', '--heading-font', '--h-font', '--base-font', '--font-family'], bodyFonts.join(', ')));
    const codeFontsRaw = parseFontFamilies(getVarAny(['--monospace', '--code-font', '--mono-font', '--font-monospace'], 'Menlo, Courier New'));
    // Prefer developer fonts if none in CSS
    const cjkBodyFallbacks = ['PingFang SC', 'Noto Sans CJK SC', 'Hiragino Sans GB'];
    const monoFallbacks = ['JetBrains Mono', 'Cascadia Code', 'Menlo', 'Courier New'];
    const bodyFontsAll = [...new Set([...bodyFonts, ...cjkBodyFallbacks])];
    const headingFontsAll = [...new Set([...headingFonts, ...cjkBodyFallbacks])];
    const codeFontsAll = [...new Set([...monoFallbacks, ...codeFontsRaw])];
    // ── Step 4: heading decoration ───────────────────────────────────────────
    // h1 centered?
    const h1TextAlign = decl('h1', 'text-align');
    const h1Centered = h1TextAlign === 'center';
    // h1:after border? (indicates decorative bottom rule under H1)
    const h1AfterBorder = decl('h1:after', 'border-bottom') ?? decl('h1::after', 'border-bottom');
    const h1BottomRule = !!h1AfterBorder;
    // heading weight from CSS variable
    const headerWeightRaw = getVarAny(['--header-weight', '--heading-weight', '--h-weight'], 'bold');
    const h1HeadingWeight = headerWeightRaw === 'normal' ? 'regular' : 'bold';
    // h2 border-left and border-bottom
    const h2LeftBorder = !!(decl('h2', 'border-left'));
    const h2BottomBorder = !!(decl('h2', 'border-bottom'));
    // ── Step 5: table ─────────────────────────────────────────────────────────
    // even rows
    const tableEvenBg = decl('table tr:nth-child(2n)', 'background-color') ??
        decl('thead', 'background-color') ??
        '#f5f5f5';
    const tableHeaderBg = decl('table thead th', 'background-color') ??
        decl('thead', 'background-color') ??
        tableEvenBg;
    const tableBorderColor = decl('table th', 'border')?.match(/#[0-9a-fA-F]{3,6}/)?.[0] ??
        decl('table td', 'border')?.match(/#[0-9a-fA-F]{3,6}/)?.[0] ??
        borderColor;
    return {
        name,
        accent,
        textColor,
        lightText,
        linkColor,
        inlineCodeColor,
        inlineCodeBg,
        codeBlockBg,
        codeBlockBorder,
        codeBlockTextColor,
        borderColor,
        blockquoteBorder,
        bodyFonts: bodyFontsAll,
        headingFonts: headingFontsAll,
        codeFonts: codeFontsAll,
        h1Centered,
        h1BottomRule,
        h1HeadingWeight,
        h2LeftBorder,
        h2BottomBorder,
        tableHeaderBg,
        tableEvenRowBg: tableEvenBg,
        tableBorderColor,
    };
}
// ─── Typst theme generation ───────────────────────────────────────────────────
function typstFontList(fonts) {
    return fonts.map(f => `"${f}"`).join(', ');
}
function generateH1(t) {
    const accent = cssColorToTypst(t.accent);
    const weight = `"${t.h1HeadingWeight}"`;
    if (t.h1Centered && t.h1BottomRule) {
        return `#show heading.where(level: 1): it => {
  block(above: 2em, below: 1.2em, sticky: true)[
    #set text(size: 22pt, weight: ${weight}, fill: ${accent})
    #align(center)[#it.body]
    #v(0.35em)
    #line(length: 100%, stroke: 0.7pt + ${accent})
  ]
}`;
    }
    if (t.h1BottomRule) {
        return `#show heading.where(level: 1): it => {
  block(above: 2em, below: 0.8em, sticky: true)[
    #set text(size: 22pt, weight: ${weight}, fill: ${accent})
    #it.body
    #v(0.25em)
    #line(length: 100%, stroke: 1.5pt + ${accent})
  ]
}`;
    }
    // plain large heading
    return `#show heading.where(level: 1): it => {
  block(above: 2em, below: 0.8em, sticky: true)[
    #set text(size: 22pt, weight: ${weight}, fill: ${accent})
    #it.body
  ]
}`;
}
function generateH2(t) {
    const accent = cssColorToTypst(t.accent);
    const weight = `"${t.h1HeadingWeight}"`;
    if (t.h2LeftBorder && t.h2BottomBorder) {
        return `#show heading.where(level: 2): it => {
  block(above: 1.6em, below: 0.6em, sticky: true)[
    #stack(dir: ltr, spacing: 8pt,
      rect(width: 4pt, height: 1.1em, fill: ${accent}, radius: 1pt),
      text(size: 16pt, weight: ${weight}, fill: ${accent})[#it.body],
    )
    #v(0.05em)
    #line(length: 100%, stroke: 0.8pt + ${accent})
  ]
}`;
    }
    if (t.h2LeftBorder) {
        return `#show heading.where(level: 2): it => {
  block(above: 1.6em, below: 0.55em, sticky: true)[
    #stack(dir: ltr, spacing: 8pt,
      rect(width: 4pt, height: 1.1em, fill: ${accent}, radius: 1pt),
      text(size: 16pt, weight: ${weight}, fill: ${accent})[#it.body],
    )
  ]
}`;
    }
    // plain
    return `#show heading.where(level: 2): it => {
  block(above: 1.6em, below: 0.55em, sticky: true)[
    #set text(size: 16pt, weight: ${weight}, fill: ${accent})
    #it.body
  ]
}`;
}
export function generateTypstTheme(tokens) {
    const c = (raw) => cssColorToTypst(raw);
    const fonts = (list) => typstFontList(list);
    // Determine code block light/dark
    const codeBlockBgParsed = tokens.codeBlockBg.replace('!important', '').trim();
    const isDarkCode = codeBlockBgParsed.startsWith('#') &&
        parseInt(codeBlockBgParsed.slice(1, 3), 16) < 80;
    const codeTextColor = isDarkCode
        ? (tokens.codeBlockTextColor.startsWith('#') ? c(tokens.codeBlockTextColor) : 'rgb("#cdd6f4")')
        : c(tokens.codeBlockTextColor);
    return `// Theme: ${tokens.name} — imported from Typora CSS
// Generated by md-to-beautiful-pdf

#let doc-title = "%%DOC_TITLE%%"
#let doc-author = "%%DOC_AUTHOR%%"
#let accent       = ${c(tokens.accent)}
#let text-clr     = ${c(tokens.textColor)}
#let light-text   = ${c(tokens.lightText)}
#let link-clr     = ${c(tokens.linkColor)}
#let code-clr     = ${c(tokens.inlineCodeColor)}
#let code-bg      = ${c(tokens.inlineCodeBg)}
#let block-bg     = ${c(codeBlockBgParsed)}
#let quote-border = ${c(tokens.blockquoteBorder)}
#let border-clr   = ${c(tokens.borderColor)}
#let table-hdr    = ${c(tokens.tableHeaderBg)}
#let table-even   = ${c(tokens.tableEvenRowBg)}

#set document(title: doc-title, author: doc-author)

#set page(
  paper: "%%PAPER%%",
  margin: (top: 2.5cm, bottom: 2.5cm, left: 3cm, right: 3cm),
  header: context {
    if counter(page).get().first() > 1 {
      box(width: 1fr)[
        #set text(size: 8pt, fill: light-text)
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
    set text(size: 8pt, fill: light-text)
    h(1fr)
    counter(page).display("1")
  },
)

#set text(
  font: (${fonts(tokens.bodyFonts)}),
  size: 11pt,
  fill: text-clr,
  lang: "zh",
)

#set par(leading: 0.9em, spacing: 1.4em)

// ── Headings ──────────────────────────────────────────────────────────────────

${generateH1(tokens)}

${generateH2(tokens)}

#show heading.where(level: 3): it => {
  block(above: 1.3em, below: 0.45em, sticky: true)[
    #set text(size: 13pt, weight: "bold", fill: accent)
    #it.body
  ]
}

#show heading.where(level: 4): it => {
  block(above: 1.1em, below: 0.4em, sticky: true)[
    #set text(size: 11pt, weight: "bold", fill: text-clr)
    #it.body
  ]
}

#show heading.where(level: 5): it => {
  block(above: 0.9em, below: 0.35em, sticky: true)[
    #set text(size: 11pt, weight: "bold", style: "italic", fill: light-text)
    #it.body
  ]
}

#show heading.where(level: 6): it => {
  block(above: 0.8em, below: 0.3em, sticky: true)[
    #set text(size: 10pt, style: "italic", fill: light-text)
    #it.body
  ]
}

// ── Code ─────────────────────────────────────────────────────────────────────

#show raw.where(block: true): it => {
  block(
    fill: block-bg,
    inset: (x: 14pt, y: 12pt),
    radius: 5pt,
    width: 100%,
    breakable: false,
    stroke: 0.5pt + border-clr,
  )[
    #set text(
      font: (${fonts(tokens.codeFonts)}),
      size: 9pt,
      fill: ${codeTextColor},
    )
    #it
  ]
}

#show raw.where(block: false): it => {
  box(
    fill: code-bg,
    inset: (x: 4pt, y: 2pt),
    radius: 3pt,
    baseline: 1.5pt,
    stroke: 0.3pt + quote-border,
  )[
    #set text(
      font: (${fonts(tokens.codeFonts)}),
      size: 9pt,
      fill: code-clr,
    )
    #it
  ]
}

// ── Blockquote ───────────────────────────────────────────────────────────────

#show quote.where(block: true): it => {
  block(
    inset: (left: 14pt, right: 8pt, top: 8pt, bottom: 8pt),
    stroke: (left: 3pt + quote-border),
    fill: code-bg,
    width: 100%,
    radius: (right: 3pt),
  )[
    #set text(fill: light-text, style: "italic")
    #it.body
  ]
}

// ── Table ────────────────────────────────────────────────────────────────────

#set table(
  stroke: border-clr,
  inset: (x: 9pt, y: 7pt),
  fill: (_, y) => if y == 0 { table-hdr } else if calc.odd(y) { white } else { table-even },
)
#show table.cell.where(y: 0): set text(weight: "bold")

// ── Links ────────────────────────────────────────────────────────────────────

#show link: it => {
  set text(fill: link-clr)
  underline(it)
}

// ── Figures / Images ─────────────────────────────────────────────────────────

#show figure.where(kind: table): it => {
  block(width: 100%, breakable: true)[#it.body]
}
#set figure(gap: 0.7em)
#show figure.caption: set text(size: 9pt, fill: light-text, style: "italic")
#show image: it => { set image(width: 100%); it }

// ── Lists ────────────────────────────────────────────────────────────────────

#set list(indent: 1.2em, spacing: 0.5em)
#set enum(indent: 1.2em, spacing: 0.5em)

// ── TOC ──────────────────────────────────────────────────────────────────────

#show outline.entry.where(level: 1): set text(weight: "bold", fill: accent)

%%PREAMBLE%%

%%BODY%%
`;
}
const BUILTIN_THEMES = new Set(['minimal', 'purple']);
export function importTheme(cssPath, overrideName) {
    if (!existsSync(cssPath)) {
        throw new Error(`CSS file not found: ${cssPath}`);
    }
    const tokens = extractTokens(cssPath);
    let themeName = (overrideName ?? tokens.name)
        .toLowerCase()
        .replace(/[^a-z0-9-_]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
    // Protect built-in themes from being silently overwritten.
    // If no explicit --name was given and the derived name matches a built-in,
    // append "-typora" so the imported version gets its own slot.
    if (!overrideName && BUILTIN_THEMES.has(themeName)) {
        themeName = `${themeName}-typora`;
    }
    const typstContent = generateTypstTheme({ ...tokens, name: themeName });
    const outputPath = join(THEMES_DIR, `${themeName}.typ`);
    writeFileSync(outputPath, typstContent, 'utf-8');
    return { themeName, outputPath, tokens };
}
//# sourceMappingURL=import-theme.js.map