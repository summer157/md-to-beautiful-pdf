import type { Config } from './config.js';
export interface ConvertOptions {
    input: string;
    output?: string;
    keepTyp?: boolean;
    config: Config;
}
export declare function convert(opts: ConvertOptions): Promise<string>;
//# sourceMappingURL=convert.d.ts.map