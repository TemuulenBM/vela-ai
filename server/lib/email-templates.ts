import { PLAN_LABELS, PLAN_PRICES_MNT } from "@/shared/lib/plan-config";

function formatDate(date: Date): string {
  return date.toLocaleDateString("mn-MN", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "Asia/Ulaanbaatar",
  });
}

function formatPrice(amount: number): string {
  return `${amount.toLocaleString("mn-MN")}₮`;
}

// ─── Renewal reminder (7 хоног үлдсэн) ──────────────────────────
export function renewalReminderEmail(params: {
  tenantName: string;
  plan: string;
  renewalUrl: string;
  periodEnd: Date;
}) {
  const { tenantName, plan, renewalUrl, periodEnd } = params;
  const planLabel = PLAN_LABELS[plan] ?? plan;
  const price = PLAN_PRICES_MNT[plan] ?? 0;

  return {
    subject: `Таны Vela AI захиалга ${formatDate(periodEnd)}-д дуусна`,
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; color: #1a1a1a;">
        <h2 style="margin-bottom: 8px;">Захиалга сунгах сануулга</h2>
        <p>Сайн байна уу, <strong>${tenantName}</strong>!</p>
        <p>
          Таны <strong>Vela AI ${planLabel}</strong> багц 7 хоногийн дотор
          (<strong>${formatDate(periodEnd)}</strong>) дуусна.
        </p>
        <p>
          Тасралтгүй ашиглахын тулд доорх товчийг дарж захиалгаа сунгана уу.
        </p>
        <a href="${renewalUrl}"
           style="display:inline-block;margin:16px 0;padding:12px 24px;
                  background:#111;color:#fff;border-radius:8px;
                  text-decoration:none;font-weight:600;">
          ${formatPrice(price)} — Захиалга сунгах
        </a>
        <p style="color:#666;font-size:13px;">
          Хэрэв та захиалга сунгахгүй бол ${formatDate(periodEnd)}-аас хойш 3 хоногийн дотор
          үнэгүй trial руу шилжинэ.
        </p>
        <p style="color:#666;font-size:13px;">— Vela AI баг</p>
      </div>
    `,
  };
}

// ─── Past due (grace period эхэлсэн) ────────────────────────────
export function pastDueEmail(params: {
  tenantName: string;
  plan: string;
  renewalUrl: string;
  graceEndsAt: Date;
}) {
  const { tenantName, plan, renewalUrl, graceEndsAt } = params;
  const planLabel = PLAN_LABELS[plan] ?? plan;
  const price = PLAN_PRICES_MNT[plan] ?? 0;

  return {
    subject: "Vela AI захиалга дуусаад байна — 3 хоногийн дотор сунгана уу",
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; color: #1a1a1a;">
        <h2 style="margin-bottom: 8px; color: #c0392b;">Захиалга хугацаа дуусаад байна</h2>
        <p>Сайн байна уу, <strong>${tenantName}</strong>!</p>
        <p>
          Таны <strong>Vela AI ${planLabel}</strong> багцын хугацаа дуусаад байна.
          <strong>${formatDate(graceEndsAt)}</strong> болтол сунгахгүй бол trial руу шилжинэ.
        </p>
        <a href="${renewalUrl}"
           style="display:inline-block;margin:16px 0;padding:12px 24px;
                  background:#c0392b;color:#fff;border-radius:8px;
                  text-decoration:none;font-weight:600;">
          ${formatPrice(price)} — Одоо сунгах
        </a>
        <p style="color:#666;font-size:13px;">— Vela AI баг</p>
      </div>
    `,
  };
}

// ─── Downgraded (trial руу буцсан) ───────────────────────────────
export function downgradedEmail(params: {
  tenantName: string;
  oldPlan: string;
  upgradeUrl: string;
}) {
  const { tenantName, oldPlan, upgradeUrl } = params;
  const planLabel = PLAN_LABELS[oldPlan] ?? oldPlan;

  return {
    subject: "Vela AI захиалга дууссан — trial горимд шилжлээ",
    html: `
      <div style="font-family: sans-serif; max-width: 520px; margin: 0 auto; color: #1a1a1a;">
        <h2 style="margin-bottom: 8px;">Захиалга дууссан</h2>
        <p>Сайн байна уу, <strong>${tenantName}</strong>!</p>
        <p>
          Таны <strong>Vela AI ${planLabel}</strong> багцын хугацаа дуусснаар
          дансаа trial горимд шилжүүллээ.
        </p>
        <p>Дата болон бүх тохиргоо хэвээрээ хадгалагдаж байна.</p>
        <a href="${upgradeUrl}"
           style="display:inline-block;margin:16px 0;padding:12px 24px;
                  background:#111;color:#fff;border-radius:8px;
                  text-decoration:none;font-weight:600;">
          Дахин идэвхжүүлэх
        </a>
        <p style="color:#666;font-size:13px;">— Vela AI баг</p>
      </div>
    `,
  };
}
