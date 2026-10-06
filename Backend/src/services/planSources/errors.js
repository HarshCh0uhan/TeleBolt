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

/**
 * Raised when the host cannot reach a source at all - DNS, TLS or connection
 * level. Kept separate from a payload error because it usually says something
 * about where the process runs rather than about the source itself; BSNL, for
 * example, drops connections from the datacenter IPs Render uses while a home
 * connection in India gets through.
 */
export class SourceUnavailableError extends Error {
    constructor(message) {
        super(message);
        this.name = "SourceUnavailableError";
    }
}
