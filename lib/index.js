/** Browser element annotation plugin for DeepSeek Harness. */
import { createUserMessage } from '@deepseek-ai/dsh-llm';
import Schema from '@deepseek-ai/schemastery';
import { AnnotationBridge } from './bridge.js';
import { decodePngDataUrl, renderAnnotation } from './protocol.js';
export const name = 'dsh-annotate';
export const inject = ['commands', 'attachments'];
export const Config = Schema.object({
    host: Schema.string().default('127.0.0.1'),
    port: Schema.number().step(1).min(1).max(65_535).default(43_119),
    allowedExtensionId: Schema.string().default(''),
    requestTimeoutMs: Schema.number().min(1).default(300_000),
    maxPayloadBytes: Schema.number().step(1).min(1).default(16 * 1024 * 1024),
    includeScreenshot: Schema.boolean().default(true),
});
/** Register the bridge and `/annotate` command. */
export function apply(ctx, config) {
    if (config.host !== '127.0.0.1' && config.host !== '::1' && config.host !== 'localhost') {
        throw new Error('dsh-annotate host must be a loopback address');
    }
    const bridge = new AnnotationBridge(config);
    ctx.effect(() => () => bridge.close(), 'dsh-annotate.bridge');
    ctx.commands.register({
        name: 'annotate',
        description: 'Select browser elements and send visual feedback to the agent.',
        input: { hint: '[URL]' },
        async handler({ agent, rawInput, signal }) {
            try {
                const url = rawInput.trim() || undefined;
                if (url !== undefined)
                    new URL(url);
                const result = await bridge.annotate(url, signal);
                if (result.elements.length === 0)
                    return { kind: 'success', text: 'Annotation completed with no selected elements.' };
                const content = [
                    { type: 'text', text: renderAnnotation(result) },
                ];
                if (config.includeScreenshot && result.screenshotDataUrl !== undefined) {
                    const attachment = await ctx.attachments.saveImage({
                        data: decodePngDataUrl(result.screenshotDataUrl),
                        mediaType: 'image/png',
                        name: 'dsh-annotate.png',
                    });
                    content.push({ type: 'image', attachment });
                }
                agent.followup(createUserMessage({
                    content,
                    source: {
                        kind: 'plugin',
                        plugin: name,
                        form: 'notice',
                        summary: `Captured ${result.elements.length} browser annotation${result.elements.length === 1 ? '' : 's'}.`,
                    },
                }));
                return {
                    kind: 'success',
                    text: `Sent ${result.elements.length} browser annotation${result.elements.length === 1 ? '' : 's'} to the agent.`,
                };
            }
            catch (error) {
                return { kind: 'error', text: error instanceof Error ? error.message : String(error) };
            }
        },
    });
}
//# sourceMappingURL=index.js.map