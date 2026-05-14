import { execa } from 'execa'
import { relative } from 'path'

export async function checkTypst(): Promise<boolean> {
  try {
    await execa('typst', ['--version'])
    return true
  } catch {
    return false
  }
}

export async function checkPandoc(): Promise<boolean> {
  try {
    await execa('pandoc', ['--version'])
    return true
  } catch {
    return false
  }
}

export async function runPandoc(
  inputPath: string,
): Promise<string> {
  const result = await execa('pandoc', [
    inputPath,
    '--from', 'markdown+smart-citations',
    '--to', 'typst',
  ])
  return normalizeLegacyPandocTypst(result.stdout)
}

/**
 * Older Pandoc Typst writers emitted legacy helpers such as `#blockquote[...]`.
 * Newer writers emit `#quote(block: true)[...]`, which is what our themes target.
 */
function normalizeLegacyPandocTypst(typst: string): string {
  return typst.replace(/#blockquote\s*\[/g, '#quote(block: true)[')
}

/**
 * Replace Pandoc-generated fixed fractional column widths with smarter defaults.
 *
 * Pandoc calculates column widths from the ASCII `---` separator lengths in the
 * Markdown source. This works poorly for CJK-heavy tables or columns that contain
 * long identifier strings without spaces (e.g. STATE_PRECONNECT), because Typst
 * cannot break a word mid-character and the cell overflows.
 *
 * Replacement rules:
 *   - 2-column table  → (auto, 1fr)  : first col fits its widest cell, second wraps freely
 *   - N-column table  → columns: N   : equal distribution, each cell wraps independently
 */
export function fixTableColumnWidths(typst: string): string {
  return typst.replace(
    /columns:\s*\(([^)]+)\)/g,
    (_match, inner: string) => {
      const count = inner.split(',').filter(s => s.trim() !== '').length
      if (count === 2) return 'columns: (auto, 1fr)'
      return `columns: ${count}`
    },
  )
}

export function unwrapTableFigures(typst: string): string {
  let out = ''
  let i = 0

  while (i < typst.length) {
    if (!typst.startsWith('#figure(', i)) {
      out += typst[i]
      i += 1
      continue
    }

    const open = i + '#figure'.length
    const close = findMatchingParen(typst, open)
    if (close === -1) {
      out += typst[i]
      i += 1
      continue
    }

    const inner = typst.slice(open + 1, close)
    if (!/\bkind:\s*table\b/.test(inner)) {
      out += typst.slice(i, close + 1)
      i = close + 1
      continue
    }

    const tableBody = inner
      .replace(/,?\s*kind:\s*table\s*,?\s*$/s, '')
      .trim()

    out += tableBody.startsWith('#') ? tableBody : `#${tableBody}`
    i = close + 1
  }

  return out
}

function findMatchingParen(input: string, openIndex: number): number {
  const stack: string[] = []
  let quote: '"' | null = null
  let escaped = false

  for (let i = openIndex; i < input.length; i += 1) {
    const ch = input[i]

    if (quote) {
      if (escaped) {
        escaped = false
      } else if (ch === '\\') {
        escaped = true
      } else if (ch === quote) {
        quote = null
      }
      continue
    }

    if (ch === '"') {
      quote = ch
      continue
    }

    if (ch === '(' || ch === '[' || ch === '{') {
      stack.push(ch)
      continue
    }

    const top = stack[stack.length - 1]
    if (
      (ch === ')' && top === '(') ||
      (ch === ']' && top === '[') ||
      (ch === '}' && top === '{')
    ) {
      stack.pop()
      if (stack.length === 0 && ch === ')') return i
    }
  }

  return -1
}

export async function compileTypst(
  typPath: string,
  outputPath: string,
  rootDir: string,
): Promise<void> {
  const rootRelativeTypPath = relative(rootDir, typPath)
  const rootRelativeOutputPath = relative(rootDir, outputPath)

  await execa('typst', [
    'compile',
    '--root', rootDir,
    rootRelativeTypPath,
    rootRelativeOutputPath,
  ], {
    cwd: rootDir,
    stderr: 'inherit',
  })
}
