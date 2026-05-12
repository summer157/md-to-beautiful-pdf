#!/usr/bin/env node
import { program } from 'commander';
import chalk from 'chalk';
import { dirname } from 'path';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { loadConfig, mergeConfig } from './config.js';
import { convert } from './convert.js';
const __dirname = dirname(fileURLToPath(import.meta.url));
const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf-8'));
program
    .name('mdpdf')
    .description('Turn Markdown into polished, well-paginated PDFs with Typst templates.')
    .version(pkg.version)
    .argument('<input>', 'input Markdown file (.md)')
    .option('-o, --output <path>', 'output PDF path (default: same name as input)')
    .option('--theme <name>', 'theme: minimal | purple (default: minimal)')
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
        const inputDir = dirname(input);
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
program.parse();
//# sourceMappingURL=cli.js.map