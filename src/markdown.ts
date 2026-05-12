/**
 * Preprocess Markdown before passing to pandoc.
 * Converts special HTML comments into pandoc raw typst blocks.
 */
export function preprocessMarkdown(content: string): string {
  // <!-- pagebreak --> → force page break in typst
  content = content.replace(
    /<!--\s*pagebreak\s*-->/g,
    '```{=typst}\n#pagebreak()\n```',
  )

  // <!-- keep-next --> → keep next block with current (weak page break hint)
  content = content.replace(
    /<!--\s*keep-next\s*-->/g,
    '```{=typst}\n#v(0pt, weak: true)\n```',
  )

  return content
}

/** Extract title from first H1 heading if present */
export function extractTitle(content: string): string | undefined {
  const match = content.match(/^#\s+(.+)$/m)
  return match ? match[1].trim() : undefined
}
