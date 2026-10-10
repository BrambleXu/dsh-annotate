/** Browser element annotation plugin for DeepSeek Harness. */
import type { Context } from '@deepseek-ai/cordis';
import Schema from '@deepseek-ai/schemastery';
export declare const name = "dsh-annotate";
export declare const inject: string[];
/** Deployment configuration for the local browser bridge. */
export interface Config {
    host: string;
    port: number;
    allowedExtensionId: string;
    requestTimeoutMs: number;
    maxPayloadBytes: number;
    includeScreenshot: boolean;
}
export declare const Config: Schema<Config>;
/** Register the bridge and `/annotate` command. */
export declare function apply(ctx: Context, config: Config): void;
