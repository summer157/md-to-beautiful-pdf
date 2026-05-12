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
