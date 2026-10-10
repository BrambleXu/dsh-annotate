/** Local WebSocket bridge between Harness and the browser extension. */
import type { AnnotationResult } from './protocol.js';
/** Configuration needed by the local browser bridge. */
export interface BridgeConfig {
    host: string;
    port: number;
    allowedExtensionId: string;
    requestTimeoutMs: number;
    maxPayloadBytes: number;
}
/** One connected browser extension and its pending annotation requests. */
export declare class AnnotationBridge {
    private readonly config;
    private readonly server;
    private readonly ready;
    private client;
    private pending;
    constructor(config: BridgeConfig);
    /** Whether an authenticated extension is currently connected. */
    get connected(): boolean;
    /** Request annotation in the connected browser. */
    annotate(url: string | undefined, signal: AbortSignal): Promise<AnnotationResult>;
    /** Close the bridge and reject every pending request. */
    close(): Promise<void>;
    private accept;
    private handle;
    private settle;
}
