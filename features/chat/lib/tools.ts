import { tool } from "ai";
import { z } from "zod/v4";
import { searchProducts } from "@/server/lib/product-search";
import { getRecommendations } from "@/server/lib/recommendations";

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

    getRecommendation: tool({
      description:
        "Тухайн бараатай хамт авах зөвлөмж өгнө. Хэрэглэгч бараа сонгосны дараа нэмэлт бараа санал болгоход ашиглана.",
      inputSchema: z
        .object({
          productId: z.string().uuid().optional().describe("Барааны ID (мэдэгдэж байвал)"),
          productName: z.string().optional().describe("Барааны нэр (хайлтаар олох)"),
        })
        .refine((d) => d.productId || d.productName, {
          message: "productId эсвэл productName-ийн аль нэгийг заавал дамжуулна",
        }),
      execute: async (input) => {
        let targetProductId = input.productId;

        // productId байхгүй бол нэрээр хайж олно
        if (!targetProductId && input.productName) {
          const results = await searchProducts({
            tenantId,
            query: input.productName,
            limit: 1,
          });
          if (results.length > 0) {
            targetProductId = results[0].id;
          }
        }

        if (!targetProductId) {
          return { recommendations: [], message: "Бараа олдсонгүй." };
        }

        const result = await getRecommendations({
          tenantId,
          productId: targetProductId,
          limit: 5,
        });

        return {
          recommendations: result.recommendations,
          source: result.source,
        };
      },
    }),

    initiateReturn: tool({
      description: "Бараа буцаалт эхлүүлнэ. Хэрэглэгч бараа буцаах хүсэлт гаргах үед ашиглана.",
      inputSchema: z.object({
        orderId: z.string().describe("Захиалгын дугаар"),
        reason: z.string().describe("Буцаалтын шалтгаан"),
      }),
      execute: async (input) => {
        // MVP: Returns table одоогоор байхгүй — mock response
        const returnId = `RET-${Date.now().toString(36).toUpperCase()}`;

        return {
          returnId,
          orderId: input.orderId,
          reason: input.reason,
          status: "pending" as const,
          statusText: "Хүлээн авсан",
          instructions: [
            "Буцаалтын хүсэлтийг хүлээн авлаа.",
            "1-2 ажлын өдрийн дотор баталгаажуулна.",
            "Барааг анхны сав баглаатай нь хамт илгээнэ үү.",
            "Буцаалт баталгаажсаны дараа 3-5 ажлын өдрийн дотор мөнгө буцаана.",
          ],
          message: `Захиалга #${input.orderId}-ийн буцаалтын хүсэлт амжилттай бүртгэгдлээ. Буцаалтын дугаар: ${returnId}`,
        };
      },
    }),
  };
}
