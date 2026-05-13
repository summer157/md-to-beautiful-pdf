export interface ThemeTokens {
    name: string;
    accent: string;
    textColor: string;
    lightText: string;
    linkColor: string;
    inlineCodeColor: string;
    inlineCodeBg: string;
    codeBlockBg: string;
    codeBlockBorder: string;
    codeBlockTextColor: string;
    borderColor: string;
    blockquoteBorder: string;
    bodyFonts: string[];
    headingFonts: string[];
    codeFonts: string[];
    h1Centered: boolean;
    h1BottomRule: boolean;
    h1HeadingWeight: string;
    h2LeftBorder: boolean;
    h2BottomBorder: boolean;
    tableHeaderBg: string;
    tableEvenRowBg: string;
    tableBorderColor: string;
}
export declare function extractTokens(cssPath: string): ThemeTokens;
export declare function generateTypstTheme(tokens: ThemeTokens): string;
export interface ImportResult {
    themeName: string;
    outputPath: string;
    tokens: ThemeTokens;
}
export declare function importTheme(cssPath: string, overrideName?: string): ImportResult;
//# sourceMappingURL=import-theme.d.ts.map