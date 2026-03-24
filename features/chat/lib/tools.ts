import { tool } from "ai";
import { z } from "zod/v4";
import { searchProducts } from "@/server/lib/product-search";

/**
 * Create chat tools scoped to a specific tenant.
 * Uses Vercel AI SDK tool() helper with Zod schemas.
 */
export function createChatTools(tenantId: string) {
  return {
    searchProducts: tool({
      description:
        "Дэлгүүрийн бараанаас хайлт хийнэ. Хэрэглэгч бараа асуух, зөвлөгөө хүсэх үед ашиглана.",
      inputSchema: z.object({
        query: z.string().describe("Хайлтын текст — Монгол хэлээр"),
        category: z
          .string()
          .optional()
          .describe("Бараа ангилал (жишээ: Арьс арчилгаа, Нүүр будалт)"),
        brand: z.string().optional().describe("Брэнд нэр"),
        minPrice: z.number().optional().describe("Хамгийн бага үнэ (₮)"),
        maxPrice: z.number().optional().describe("Хамгийн их үнэ (₮)"),
      }),
      execute: async (input) => {
        const results = await searchProducts({
          tenantId,
          query: input.query,
          category: input.category,
          brand: input.brand,
          minPrice: input.minPrice,
          maxPrice: input.maxPrice,
          limit: 5,
        });

        return results.map((p) => ({
          id: p.id,
          name: p.name,
          description: p.description,
          price: p.price,
          category: p.category,
          brand: p.brand,
          stockQty: p.stockQty,
          isAvailable: p.isAvailable,
          imageUrl: p.imageUrl,
        }));
      },
    }),

    getOrderStatus: tool({
      description: "Захиалгын статус шалгана. Хэрэглэгч захиалгын дугаар өгөх үед ашиглана.",
      inputSchema: z.object({
        orderId: z.string().describe("Захиалгын дугаар"),
      }),
      execute: async (input) => {
        // MVP: Orders table одоогоор байхгүй — mock response
        return {
          orderId: input.orderId,
          status: "processing" as const,
          statusText: "Боловсруулж байна",
          estimatedDelivery: "2-3 ажлын өдөр",
          message: "Таны захиалга амжилттай хүлээн авагдсан. Бэлтгэл явагдаж байна.",
        };
      },
    }),
  };
}
