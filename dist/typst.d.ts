export declare function checkTypst(): Promise<boolean>;
export declare function checkPandoc(): Promise<boolean>;
export declare function runPandoc(inputPath: string): Promise<string>;
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
export declare function fixTableColumnWidths(typst: string): string;
export declare function unwrapTableFigures(typst: string): string;
export declare function compileTypst(typPath: string, outputPath: string, rootDir: string): Promise<void>;
//# sourceMappingURL=typst.d.ts.map