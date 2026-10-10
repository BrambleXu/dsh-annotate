/** Local WebSocket bridge between Harness and the browser extension. */
import { randomUUID } from 'node:crypto';
import { WebSocket, WebSocketServer } from 'ws';
import { parseClientMessage } from './protocol.js';
/** One connected browser extension and its pending annotation requests. */
export class AnnotationBridge {
    config;
    server;
    ready;
    client;
    pending = new Map();
    constructor(config) {
        this.config = config;
        this.server = new WebSocketServer({
            host: config.host,
            port: config.port,
            verifyClient: ({ origin }) => origin.startsWith('chrome-extension://'),
        });
        this.ready = new Promise((resolve, reject) => {
            this.server.once('listening', resolve);
            this.server.once('error', reject);
        });
        this.server.on('connection', socket => this.accept(socket));
    }
    /** Whether an authenticated extension is currently connected. */
    get connected() {
        return this.client?.readyState === WebSocket.OPEN;
    }
    /** Request annotation in the connected browser. */
    async annotate(url, signal) {
        await this.ready;
        signal.throwIfAborted();
        const client = this.client;
        if (client?.readyState !== WebSocket.OPEN)
            throw new Error('The dsh-annotate browser extension is not connected.');
        const requestId = randomUUID();
        return new Promise((resolve, reject) => {
            const onAbort = () => this.settle(requestId, new Error('annotation request was cancelled'));
            const timer = setTimeout(() => this.settle(requestId, new Error('annotation request timed out')), this.config.requestTimeoutMs);
            this.pending.set(requestId, { resolve, reject, timer, signal, onAbort });
            signal.addEventListener('abort', onAbort, { once: true });
            client.send(JSON.stringify({ type: 'start', requestId, ...(url === undefined ? {} : { url }) }));
        });
    }
    /** Close the bridge and reject every pending request. */
    async close() {
        for (const requestId of this.pending.keys())
            this.settle(requestId, new Error('annotation bridge stopped'));
        for (const client of this.server.clients)
            client.terminate();
        await new Promise(resolve => this.server.close(() => resolve()));
    }
    accept(socket) {
        let greeted = false;
        socket.on('message', raw => {
            try {
                const data = toBuffer(raw);
                const message = parseClientMessage(data, this.config.maxPayloadBytes);
                if (!greeted) {
                    if (message.type !== 'hello')
                        throw new Error('browser extension must introduce itself first');
                    if (this.config.allowedExtensionId !== '' && message.extensionId !== this.config.allowedExtensionId) {
                        throw new Error('browser extension id is not allowed');
                    }
                    greeted = true;
                    this.client?.terminate();
                    this.client = socket;
                    return;
                }
                this.handle(message);
            }
            catch (error) {
                socket.close(1008, error instanceof Error ? error.message.slice(0, 120) : 'invalid message');
            }
        });
        socket.on('close', () => {
            if (this.client !== socket)
                return;
            this.client = undefined;
            for (const requestId of this.pending.keys())
                this.settle(requestId, new Error('browser extension disconnected'));
        });
    }
    handle(message) {
        if (message.type === 'hello')
            return;
        if (message.type === 'result')
            this.settle(message.requestId, undefined, message.result);
        else if (message.type === 'cancel')
            this.settle(message.requestId, new Error('annotation was cancelled in the browser'));
        else
            this.settle(message.requestId, new Error(message.message));
    }
    settle(requestId, error, result) {
        const request = this.pending.get(requestId);
        if (request === undefined)
            return;
        this.pending.delete(requestId);
        clearTimeout(request.timer);
        request.signal.removeEventListener('abort', request.onAbort);
        if (error !== undefined)
            request.reject(error);
        else if (result !== undefined)
            request.resolve(result);
    }
}
function toBuffer(raw) {
    if (Buffer.isBuffer(raw))
        return raw;
    if (Array.isArray(raw))
        return Buffer.concat(raw);
    return Buffer.from(raw);
}
//# sourceMappingURL=bridge.js.map