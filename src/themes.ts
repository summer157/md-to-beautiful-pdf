import { readFileSync, existsSync, readdirSync } from 'fs'
import { join, dirname } from 'path'
import { fileURLToPath } from 'url'
import type { Config } from './config.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const THEMES_DIR = join(__dirname, '..', 'themes')

export function getAvailableThemes(): string[] {
  try {
    return readdirSync(THEMES_DIR)
      .filter(f => f.endsWith('.typ'))
      .map(f => f.slice(0, -4))
      .sort()
  } catch {
    return ['minimal', 'purple']
  }
}

export function getThemePath(theme: string): string {
  const path = join(THEMES_DIR, `${theme}.typ`)
  if (!existsSync(path)) {
    throw new Error(
      `Theme "${theme}" not found. Available themes: ${getAvailableThemes().join(', ')}`,
    )
  }
  return path
}

/** Escape a string for use inside a Typst double-quoted string literal */
function escapeTypstString(s: string): string {
  return s.replace(/\\/g, '\\\\').replace(/"/g, '\\"')
}

/** Build the preamble block: visual title/author display + optional TOC */
function buildPreamble(config: Config): string {
  const parts: string[] = []

  const hasTitle = config.title && config.title.trim()
  const hasAuthor = config.author && config.author.trim()
  const hasDate = config.date && config.date.trim()

  if (hasTitle || hasAuthor) {
    const titleLine = hasTitle
      ? `  #text(size: 26pt, weight: "bold")[${escapeTypstContent(config.title!)}]`
      : ''
    const authorLine = hasAuthor
      ? `  #v(0.4em)\n  #text(size: 13pt, fill: rgb("#666666"))[${escapeTypstContent(config.author)}]`
      : ''
    const dateLine = hasDate
      ? `  #v(0.25em)\n  #text(size: 10pt, fill: rgb("#999999"))[${escapeTypstContent(config.date!)}]`
      : ''

    parts.push(
      `#align(center)[\n  #v(1.5cm)\n${titleLine}${authorLine}${dateLine}\n  #v(1.5cm)\n]`,
    )
    parts.push('#pagebreak()')
  }

  if (config.toc) {
    parts.push(
      '#outline(\n  title: [目录],\n  depth: 3,\n  indent: auto,\n)',
    )
    parts.push('#pagebreak()')
  }

  return parts.join('\n\n')
}

/** Escape for use as Typst content (inside [...]) */
function escapeTypstContent(s: string): string {
  return s
    .replace(/\\/g, '\\\\')
    .replace(/\[/g, '\\[')
    .replace(/\]/g, '\\]')
    .replace(/#/g, '\\#')
}

export function buildTypstDocument(
  body: string,
  config: Config,
): string {
  const themePath = getThemePath(config.theme)
  let template = readFileSync(themePath, 'utf-8')

  const title = config.title ?? ''
  const author = config.author ?? ''
  const date = config.date ?? ''

  template = template.replace(/%%DOC_TITLE%%/g, escapeTypstString(title))
  template = template.replace(/%%DOC_AUTHOR%%/g, escapeTypstString(author))
  template = template.replace(/%%DOC_DATE%%/g, escapeTypstString(date))
  template = template.replace(/%%HEADER_TITLE%%/g, escapeTypstContent(title))
  template = template.replace(/%%PREAMBLE%%/g, buildPreamble(config))
  template = template.replace(/%%BODY%%/g, body)

  return template
}
