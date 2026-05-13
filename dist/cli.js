#!/usr/bin/env node
import { program } from 'commander';
import chalk from 'chalk';
import { dirname, resolve } from 'path';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { loadConfig, mergeConfig } from './config.js';
import { convert } from './convert.js';
import { importTheme } from './import-theme.js';
import { getAvailableThemes } from './themes.js';
const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf-8'));
// ─── mdpdf <input.md> ─────────────────────────────────────────────────────────
program
    .name('mdpdf')
    .description('Turn Markdown into polished, well-paginated PDFs with Typst templates.')
    .version(pkg.version);
program
    .command('convert <input>', { isDefault: true })
    .description('Convert a Markdown file to PDF (default command)')
    .option('-o, --output <path>', 'output PDF path (default: same name as input)')
    .option('--theme <name>', 'theme name (default: minimal)')
    .option('--paper <size>', 'paper size: a4 | letter (default: a4)')
    .option('--toc', 'enable table of contents (default: on)')
    .option('--no-toc', 'disable table of contents')
    .option('--title <title>', 'override document title')
    .option('--author <author>', 'set document author')
    .option('--date <date>', 'set document date')
    .option('--keep-typ', 'keep intermediate .typ file for debugging')
    .action(async (input, options) => {
    console.log(chalk.bold('\n  mdpdf') + chalk.gray(' — Markdown → Beautiful PDF\n'));
    try {
        const inputDir = dirname(resolve(input));
        const fileConfig = loadConfig(inputDir);
        const config = mergeConfig(fileConfig, {
            theme: options.theme,
            paper: options.paper,
            toc: options.toc,
            title: options.title,
            author: options.author,
            date: options.date,
        });
        const outputPath = await convert({
            input,
            output: options.output,
            keepTyp: options.keepTyp,
            config,
        });
        console.log(chalk.green(`\n  ✓ PDF generated: ${outputPath}\n`));
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(chalk.red('\n  ✗ Error:'), message, '\n');
        process.exit(1);
    }
});
// ─── mdpdf import-theme <css> ─────────────────────────────────────────────────
program
    .command('import-theme <css>')
    .description('Import a Typora CSS theme and generate a Typst theme')
    .option('--name <name>', 'override the output theme name (default: CSS filename)')
    .action((cssPath, options) => {
    console.log(chalk.bold('\n  mdpdf import-theme') + chalk.gray(' — Typora CSS → Typst Theme\n'));
    try {
        const absPath = resolve(cssPath);
        console.log(chalk.gray(`  → Parsing: ${absPath}`));
        const result = importTheme(absPath, options.name);
        const t = result.tokens;
        // Pretty-print what was detected
        console.log(chalk.gray(`  → Accent color:    `) + chalk.hex(normalizeHex(t.accent))(t.accent));
        console.log(chalk.gray(`  → Text color:      `) + t.textColor);
        console.log(chalk.gray(`  → Body font:       `) + (t.bodyFonts[0] ?? '—'));
        console.log(chalk.gray(`  → Heading font:    `) + (t.headingFonts[0] ?? t.bodyFonts[0] ?? '—'));
        console.log(chalk.gray(`  → Code font:       `) + (t.codeFonts[0] ?? '—'));
        console.log(chalk.gray(`  → H1 style:        `) +
            [t.h1Centered && 'centered', t.h1BottomRule && 'bottom-rule'].filter(Boolean).join(' + ') || 'plain');
        console.log(chalk.gray(`  → H2 style:        `) +
            [t.h2LeftBorder && 'left-bar', t.h2BottomBorder && 'bottom-border'].filter(Boolean).join(' + ') || 'plain');
        console.log(chalk.gray(`  → Code block bg:   `) + t.codeBlockBg.replace('!important', '').trim());
        console.log(chalk.gray(`\n  → Written to:      ${result.outputPath}`));
        console.log(chalk.green(`\n  ✓ Theme "${result.themeName}" is ready.\n`));
        console.log(chalk.gray(`  Use it with:`));
        console.log(`    mdpdf input.md --theme ${result.themeName}\n`);
        console.log(chalk.gray(`  Available themes: `) + getAvailableThemes().join(', ') + '\n');
    }
    catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        console.error(chalk.red('\n  ✗ Error:'), message, '\n');
        process.exit(1);
    }
});
// ─── mdpdf themes ────────────────────────────────────────────────────────────
program
    .command('themes')
    .description('List available themes')
    .action(() => {
    const themes = getAvailableThemes();
    console.log(chalk.bold('\n  Available themes:\n'));
    for (const t of themes) {
        const tag = ['minimal', 'purple-typora'].includes(t) ? chalk.gray(' (built-in)') : chalk.gray(' (imported)');
        console.log(`    ${chalk.cyan(t)}${tag}`);
    }
    console.log();
});
program.parse();
// ─── Helpers ─────────────────────────────────────────────────────────────────
function normalizeHex(color) {
    // extract a 6-digit hex from any color string for chalk.hex()
    const m = color.match(/#([0-9a-fA-F]{6})/);
    return m ? `#${m[1]}` : '#888888';
}
//# sourceMappingURL=cli.js.map