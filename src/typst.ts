import { execa } from 'execa'

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
  return result.stdout
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
  await execa('typst', [
    'compile',
    '--root', rootDir,
    typPath,
    outputPath,
  ], {
    stderr: 'inherit',
  })
}
