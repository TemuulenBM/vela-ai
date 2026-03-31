import { sql } from "drizzle-orm";
import { db } from "./db";

type TenantTx = Parameters<Parameters<typeof db.transaction>[0]>[0];

/**
 * Mutation-уудыг Neon HTTP transaction дотор ажиллуулж,
 * SET LOCAL app.current_tenant_id-ийг тохируулна.
 *
 * RLS policy-ууд app_current_tenant_id() функцийг ашигладаг тул
 * энэ wrapper нь DB-level tenant isolation-ийг хангана.
 *
 * Зөвхөн mutation (write) procedure-уудад ашиглана — read query-ууд
 * app layer дахь WHERE tenant_id = ctx.tenantId-аар хамгаалагдсан байна.
 */
export async function withTenantCtx<T>(
  tenantId: string,
  fn: (tx: TenantTx) => Promise<T>,
): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.execute(sql`SELECT set_config('app.current_tenant_id', ${tenantId}, true)`);
    return fn(tx);
  });
}
