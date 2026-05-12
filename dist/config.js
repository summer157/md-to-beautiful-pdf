import { z } from 'zod';
import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';
export const ConfigSchema = z.object({
    theme: z.string().default('minimal'),
    paper: z.string().default('a4'),
    toc: z.boolean().default(true),
    title: z.string().optional(),
    author: z.string().default(''),
    date: z.string().optional(),
    font: z.object({
        body: z.string().default('PingFang SC'),
        code: z.string().default('JetBrains Mono'),
    }).default({}),
});
export function loadConfig(searchDir) {
    const configPath = resolve(searchDir, 'mdpdf.config.json');
    if (!existsSync(configPath))
        return {};
    try {
        const raw = JSON.parse(readFileSync(configPath, 'utf-8'));
        return ConfigSchema.partial().parse(raw);
    }
    catch {
        return {};
    }
}
export function mergeConfig(fileConfig, cliOptions) {
    return ConfigSchema.parse({ ...fileConfig, ...cliOptions });
}
//# sourceMappingURL=config.js.map