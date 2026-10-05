/** Raised when a source needs credentials that have not been supplied yet. */
export class SourceNotConfiguredError extends Error {
    constructor(message) {
        super(message);
        this.name = "SourceNotConfiguredError";
    }
}

/** Raised when a source is reachable but its payload is not usable. */
export class SourcePayloadError extends Error {
    constructor(message) {
        super(message);
        this.name = "SourcePayloadError";
    }
}
