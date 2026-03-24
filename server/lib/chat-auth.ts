import bcrypt from "bcryptjs";
import { and, eq, isNull } from "drizzle-orm";
import { db } from "@/server/db/db";
import { apiKeys } from "@/server/db/schema";

/**
 * Authenticate a chat API request using the x-api-key header.
 * Returns the tenantId if the key is valid, null otherwise.
 */
export async function authenticateChatRequest(
  request: Request,
): Promise<{ tenantId: string } | null> {
  const apiKey = request.headers.get("x-api-key");
  if (!apiKey) return null;

  // Extract prefix (first 8 characters)
  const prefix = apiKey.slice(0, 8);

  // Look up key by prefix
  const [keyRecord] = await db
    .select({
      id: apiKeys.id,
      tenantId: apiKeys.tenantId,
      keyHash: apiKeys.keyHash,
    })
    .from(apiKeys)
    .where(and(eq(apiKeys.keyPrefix, prefix), isNull(apiKeys.revokedAt)))
    .limit(1);

  if (!keyRecord) return null;

  // Verify hash
  const isValid = await bcrypt.compare(apiKey, keyRecord.keyHash);
  if (!isValid) return null;

  // Update lastUsedAt (fire-and-forget)
  db.update(apiKeys)
    .set({ lastUsedAt: new Date() })
    .where(eq(apiKeys.id, keyRecord.id))
    .then(() => {})
    .catch(() => {});

  return { tenantId: keyRecord.tenantId };
}
