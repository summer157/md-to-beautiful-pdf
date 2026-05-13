import { z } from 'zod';
export declare const ConfigSchema: z.ZodObject<{
    theme: z.ZodDefault<z.ZodString>;
    paper: z.ZodDefault<z.ZodString>;
    toc: z.ZodDefault<z.ZodBoolean>;
    title: z.ZodOptional<z.ZodString>;
    author: z.ZodDefault<z.ZodString>;
    date: z.ZodOptional<z.ZodString>;
    font: z.ZodDefault<z.ZodObject<{
        body: z.ZodDefault<z.ZodString>;
        code: z.ZodDefault<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        body: string;
        code: string;
    }, {
        body?: string | undefined;
        code?: string | undefined;
    }>>;
}, "strip", z.ZodTypeAny, {
    theme: string;
    paper: string;
    toc: boolean;
    author: string;
    font: {
        body: string;
        code: string;
    };
    title?: string | undefined;
    date?: string | undefined;
}, {
    theme?: string | undefined;
    paper?: string | undefined;
    toc?: boolean | undefined;
    title?: string | undefined;
    author?: string | undefined;
    date?: string | undefined;
    font?: {
        body?: string | undefined;
        code?: string | undefined;
    } | undefined;
}>;
export type Config = z.infer<typeof ConfigSchema>;
export declare function loadConfig(searchDir: string): Partial<Config>;
export declare function mergeConfig(fileConfig: Partial<Config>, cliOptions: Partial<Config>): Config;
//# sourceMappingURL=config.d.ts.map