import { execa } from 'execa';
export async function checkTypst() {
    try {
        await execa('typst', ['--version']);
        return true;
    }
    catch {
        return false;
    }
}
export async function checkPandoc() {
    try {
        await execa('pandoc', ['--version']);
        return true;
    }
    catch {
        return false;
    }
}
export async function runPandoc(inputPath) {
    const result = await execa('pandoc', [
        inputPath,
        '--from', 'markdown+smart-citations',
        '--to', 'typst',
    ]);
    return result.stdout;
}
export async function compileTypst(typPath, outputPath, rootDir) {
    await execa('typst', [
        'compile',
        '--root', rootDir,
        typPath,
        outputPath,
    ], {
        stderr: 'inherit',
    });
}
//# sourceMappingURL=typst.js.map