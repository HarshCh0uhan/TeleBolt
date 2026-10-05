import crypto from "node:crypto";

/**
 * CryptoJS-compatible AES, which is what BSNL's frontend uses.
 *
 * `CryptoJS.AES.encrypt(text, passphrase)` derives the key and IV with OpenSSL's
 * EVP_BytesToKey (MD5, one round per block) and writes "Salted__" + salt +
 * ciphertext, base64 encoded. Node's crypto has the cipher but not that key
 * derivation, so it is implemented here.
 */

const SALT_HEADER = "Salted__";

const evpBytesToKey = (passphrase, salt, keyLength = 32, ivLength = 16) => {
    const pass = Buffer.from(passphrase, "utf8");
    let derived = Buffer.alloc(0);
    let block = Buffer.alloc(0);

    while (derived.length < keyLength + ivLength) {
        block = crypto.createHash("md5").update(Buffer.concat([block, pass, salt])).digest();
        derived = Buffer.concat([derived, block]);
    }

    return {
        key: derived.subarray(0, keyLength),
        iv: derived.subarray(keyLength, keyLength + ivLength),
    };
};

export const encryptCryptoJs = (plaintext, passphrase) => {
    const salt = crypto.randomBytes(8);
    const { key, iv } = evpBytesToKey(passphrase, salt);
    const cipher = crypto.createCipheriv("aes-256-cbc", key, iv);
    const ciphertext = Buffer.concat([cipher.update(Buffer.from(plaintext, "utf8")), cipher.final()]);

    return Buffer.concat([Buffer.from(SALT_HEADER, "utf8"), salt, ciphertext]).toString("base64");
};

export const decryptCryptoJs = (base64, passphrase) => {
    const raw = Buffer.from(base64, "base64");
    if (raw.subarray(0, 8).toString("utf8") !== SALT_HEADER) {
        throw new Error("not an OpenSSL salted payload");
    }

    const salt = raw.subarray(8, 16);
    const { key, iv } = evpBytesToKey(passphrase, salt);
    const decipher = crypto.createDecipheriv("aes-256-cbc", key, iv);

    return Buffer.concat([decipher.update(raw.subarray(16)), decipher.final()]).toString("utf8");
};

/** Unwraps `{ enc }` / `{ encryptedData }` responses, leaving plain JSON alone. */
export const unwrapEncrypted = (text, passphrase) => {
    const parsed = JSON.parse(text);
    const payload = parsed?.encryptedData || parsed?.enc;
    if (typeof payload !== "string") return parsed;
    return JSON.parse(decryptCryptoJs(payload, passphrase));
};
