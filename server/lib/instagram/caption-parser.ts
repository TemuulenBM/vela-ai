import { generateObject } from "ai";
import { z } from "zod";
import { cheapModel } from "@/server/ai/claude";
import type { ParsedIGProduct } from "./types";

const productSchema = z.object({
  isProduct: z.boolean().describe("Энэ пост бараа борлуулалтын пост мөн үү?"),
  name: z.string().nullable().describe("Барааны нэр (товч, цэвэр)"),
  price: z.string().nullable().describe("Үнэ MNT-ээр тоогоор (жнь: '45000'). Үнэ байхгүй бол null"),
  description: z
    .string()
    .nullable()
    .describe("Барааны тодорхойлолт (өнгө, хэмжээ, материал гэх мэт)"),
  category: z
    .string()
    .nullable()
    .describe("Барааны ангилал (Хувцас, Гутал, Цүнх, Гоо сайхан, Аксессуар гэх мэт)"),
});

const SYSTEM_PROMPT = `Чи Монгол Instagram дэлгүүрийн post caption-аас бүтээгдэхүүний мэдээлэл задалдаг AI.

Дүрэм:
1. Энэ бараа борлуулалтын пост мөн үү гэдгийг тодорхойл. Дараах зүйлс бараа БИШ:
   - Амьдралын хэв маяг, зурган пост (lifestyle)
   - Урамшуулал, giveaway, тэмцээн
   - Мэдэгдэл, зар (дэлгүүр нээх, хаях гэх мэт)
   - Сэтгэгдэл, сэдэвлэл (motivational quotes)
   - Repost, reshare

2. Хэрэв бараа бол мэдээллийг задал:
   - name: Барааны нэр. Caption-аас гаргаж ав, товч байх (emoji хасах)
   - price: Үнийг MNT тоогоор. "45,000₮" → "45000", "45к" → "45000", "1.5сая" → "1500000"
     "DM-ээр", "Чатаар", "Inbox", үнэ дурдаагүй бол → null
   - description: Өнгө, хэмжээ, материал, онцлог зэргийг товч нэгтгэ
   - category: Ангилал тааруул (Хувцас, Гутал, Цүнх, Гоо сайхан, Аксессуар, Электроник, Гэр ахуй, Хүнс, Бусад)

3. Олон бараатай пост бол ЭХНИЙ/ГООЛ барааг задал
4. Монгол, Англи хольсон caption хоёуланг нь ойлго`;

/**
 * Instagram post caption-аас бүтээгдэхүүний мэдээлэл задлах (Claude Haiku).
 * Зардал: ~100 token per call, ~$0.0001 per caption
 */
export async function parseInstagramCaption(caption: string): Promise<ParsedIGProduct> {
  try {
    const { object } = await generateObject({
      model: cheapModel,
      schema: productSchema,
      system: SYSTEM_PROMPT,
      prompt: caption,
    });

    return object;
  } catch (err) {
    console.error("[IG Caption Parser] Parse failed:", err);
    return {
      isProduct: false,
      name: null,
      price: null,
      description: null,
      category: null,
    };
  }
}
