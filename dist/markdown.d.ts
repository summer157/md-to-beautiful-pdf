/**
 * Preprocess Markdown before passing to pandoc.
 * Converts special HTML comments into pandoc raw typst blocks.
 */
export declare function preprocessMarkdown(content: string): string;
/** Extract title from first H1 heading if present */
export declare function extractTitle(content: string): string | undefined;
//# sourceMappingURL=markdown.d.ts.map