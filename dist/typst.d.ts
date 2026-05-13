export declare function checkTypst(): Promise<boolean>;
export declare function checkPandoc(): Promise<boolean>;
export declare function runPandoc(inputPath: string): Promise<string>;
export declare function unwrapTableFigures(typst: string): string;
export declare function compileTypst(typPath: string, outputPath: string, rootDir: string): Promise<void>;
//# sourceMappingURL=typst.d.ts.map