/** Browser bridge protocol and model-facing annotation rendering. */
/** Captured facts for one selected DOM element. */
export interface ElementAnnotation {
    selector: string;
    tagName: string;
    id?: string;
    classes: string[];
    text: string;
    comment: string;
    rect: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
    attributes: Record<string, string>;
    styles: Record<string, string>;
    accessibility: {
        role?: string;
        name?: string;
        focusable: boolean;
        disabled: boolean;
    };
}
/** Complete annotation submission from the browser extension. */
export interface AnnotationResult {
    url: string;
    viewport: {
        width: number;
        height: number;
    };
    elements: ElementAnnotation[];
    screenshotDataUrl?: string;
}
export type ClientMessage = {
    type: 'hello';
    version: 1;
    extensionId: string;
} | {
    type: 'result';
    requestId: string;
    result: AnnotationResult;
} | {
    type: 'cancel';
    requestId: string;
} | {
    type: 'error';
    requestId: string;
    message: string;
};
/** Decode and minimally validate one browser message. */
export declare function parseClientMessage(data: Buffer, maxPayloadBytes: number): ClientMessage;
/** Decode a PNG data URL without accepting arbitrary media. */
export declare function decodePngDataUrl(value: string): Uint8Array;
/** Render annotations as precise model-facing text. */
export declare function renderAnnotation(result: AnnotationResult): string;
