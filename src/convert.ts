import { resolve, dirname, basename, extname, join } from 'path'
import { readFileSync, writeFileSync, unlinkSync, existsSync, mkdirSync } from 'fs'
import { tmpdir } from 'os'
import { randomBytes } from 'crypto'
import chalk from 'chalk'

import type { Config } from './config.js'
import { preprocessMarkdown, extractTitle } from './markdown.js'
import { buildTypstDocument } from './themes.js'
import { checkPandoc, checkTypst, runPandoc, compileTypst, unwrapTableFigures, fixTableColumnWidths } from './typst.js'

export interface ConvertOptions {
  input: string
  output?: string
  keepTyp?: boolean
  config: Config
}

export async function convert(opts: ConvertOptions): Promise<string> {
  const inputPath = resolve(opts.input)

  if (!existsSync(inputPath)) {
    throw new Error(`Input file not found: ${inputPath}`)
  }

  // Check dependencies
  const [hasPandoc, hasTypst] = await Promise.all([checkPandoc(), checkTypst()])

  if (!hasPandoc) {
    throw new Error(
      'pandoc is not installed or not in PATH.\n' +
        '  Install: https://pandoc.org/installing.html\n' +
        '  macOS:   brew install pandoc',
    )
  }

  if (!hasTypst) {
    throw new Error(
      'typst is not installed or not in PATH.\n' +
        '  Install: https://github.com/typst/typst/releases\n' +
        '  macOS:   brew install typst',
    )
  }

  const inputDir = dirname(inputPath)
  const inputBase = basename(inputPath, extname(inputPath))
  const outputPath = opts.output
    ? resolve(opts.output)
    : join(inputDir, `${inputBase}.pdf`)
  const outputDir = dirname(outputPath)

  // Read and preprocess markdown
  const rawMd = readFileSync(inputPath, 'utf-8')
  const processedMd = preprocessMarkdown(rawMd)

  // Auto-detect title from first H1 if not set
  const config = { ...opts.config }
  if (!config.title) {
    const detected = extractTitle(rawMd)
    if (detected) config.title = detected
  }

  // Write preprocessed markdown to a temp file (same dir as input for image paths)
  const tempId = randomBytes(6).toString('hex')
  const tempMdPath = join(inputDir, `.mdpdf_input_${tempId}.md`)
  const tempTypPath = join(inputDir, `.mdpdf_output_${tempId}.typ`)

  try {
    mkdirSync(outputDir, { recursive: true })
    writeFileSync(tempMdPath, processedMd, 'utf-8')

    // Convert markdown → typst body via pandoc
    process.stdout.write(chalk.gray('  → Running pandoc...\n'))
    const typstBody = fixTableColumnWidths(unwrapTableFigures(await runPandoc(tempMdPath)))

    // Build full typst document with theme
    process.stdout.write(chalk.gray(`  → Applying theme: ${config.theme}\n`))
    const typstDoc = buildTypstDocument(typstBody, config)

    // Write .typ file
    writeFileSync(tempTypPath, typstDoc, 'utf-8')

    if (opts.keepTyp) {
      const keepPath = join(inputDir, `${inputBase}.typ`)
      writeFileSync(keepPath, typstDoc, 'utf-8')
      process.stdout.write(chalk.gray(`  → Saved .typ file: ${keepPath}\n`))
    }

    // Compile typst → PDF
    process.stdout.write(chalk.gray('  → Compiling with typst...\n'))
    await compileTypst(tempTypPath, outputPath, inputDir)

    return outputPath
  } finally {
    // Clean up temp files
    if (existsSync(tempMdPath)) unlinkSync(tempMdPath)
    if (existsSync(tempTypPath)) unlinkSync(tempTypPath)
  }
}
