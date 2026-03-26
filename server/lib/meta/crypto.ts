import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const key = process.env.META_TOKEN_ENCRYPTION_KEY;
  if (!key) throw new Error("META_TOKEN_ENCRYPTION_KEY тохируулаагүй байна");
  // Key нь 32 bytes (hex encoded = 64 chars)
  return Buffer.from(key, "hex");
}

/**
 * AES-256-GCM encrypt. Returns base64 string: iv + authTag + ciphertext.
 */
export function encryptToken(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const encrypted = Buffer.concat([cipher.update(plaintext, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  // iv (16) + authTag (16) + ciphertext
  return Buffer.concat([iv, authTag, encrypted]).toString("base64");
}

/**
 * AES-256-GCM decrypt. Expects base64 string from encryptToken().
 */
export function decryptToken(encoded: string): string {
  const key = getEncryptionKey();
  const data = Buffer.from(encoded, "base64");

  const iv = data.subarray(0, IV_LENGTH);
  const authTag = data.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = data.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([decipher.update(ciphertext), decipher.final()]);
  return decrypted.toString("utf8");
}
