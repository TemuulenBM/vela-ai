import "dotenv/config";
import bcrypt from "bcryptjs";
import { db } from "./db";
import {
  tenants,
  tenantMembers,
  users,
  apiKeys,
  products,
  productImages,
  shoppers,
  conversations,
  messages,
  events,
  subscriptions,
} from "./schema";

async function seed() {
  console.log("Seeding database...");

  // ─── Tenants ─────────────────────────────────────────────────
  const [tenant1, tenant2] = await db
    .insert(tenants)
    .values([
      { name: "Гоо Сайхан Дэлгүүр", slug: "goo-saikhan", plan: "starter" },
      { name: "Электроник Шоп", slug: "elektronik-shop", plan: "growth" },
    ])
    .returning();

  console.log(`Created ${2} tenants`);

  // ─── Users ─────────────────────────────────────────────────
  const passwordHash = await bcrypt.hash("password123", 10);

  const [user1, user2, user3, user4] = await db
    .insert(users)
    .values([
      { name: "Владелец Гоо Сайхан", email: "owner@goosaikhan.mn", passwordHash },
      { name: "Админ Гоо Сайхан", email: "admin@goosaikhan.mn", passwordHash },
      { name: "Владелец Электроник", email: "owner@elektronik.mn", passwordHash },
      { name: "Ажилтан Электроник", email: "staff@elektronik.mn", passwordHash },
    ])
    .returning();

  console.log("Created users");

  // ─── Tenant Members ──────────────────────────────────────────
  await db.insert(tenantMembers).values([
    { tenantId: tenant1.id, email: "owner@goosaikhan.mn", userId: user1.id, role: "owner" },
    { tenantId: tenant1.id, email: "admin@goosaikhan.mn", userId: user2.id, role: "admin" },
    { tenantId: tenant2.id, email: "owner@elektronik.mn", userId: user3.id, role: "owner" },
    { tenantId: tenant2.id, email: "staff@elektronik.mn", userId: user4.id, role: "member" },
  ]);

  console.log("Created tenant members");

  // ─── API Keys ────────────────────────────────────────────────
  await db.insert(apiKeys).values([
    {
      tenantId: tenant1.id,
      name: "Test key",
      keyHash: "test_hash_placeholder_1",
      keyPrefix: "sk_test_",
    },
    {
      tenantId: tenant2.id,
      name: "Test key",
      keyHash: "test_hash_placeholder_2",
      keyPrefix: "sk_test_",
    },
  ]);

  console.log("Created API keys");

  // ─── Products (Tenant 1 — Гоо сайхан) ───────────────────────
  const t1Products = await db
    .insert(products)
    .values([
      {
        tenantId: tenant1.id,
        name: "Увлажняющий крем",
        description: "Нүүрний арьсыг чийгшүүлж, зөөлөн болгоно. Бүх төрлийн арьсанд тохиромжтой.",
        price: "45000",
        category: "Арьс арчилгаа",
        brand: "The Ordinary",
        stockQty: 150,
      },
      {
        tenantId: tenant1.id,
        name: "Витамин C серум",
        description: "Арьсыг гэрэлтүүлж, үрчлээсийг бууруулна. 20% витамин C агуулсан.",
        price: "68000",
        category: "Арьс арчилгаа",
        brand: "The Ordinary",
        stockQty: 80,
      },
      {
        tenantId: tenant1.id,
        name: "Нүдний тойрогний крем",
        description: "Нүдний тойрогний хар цагааныг арилгаж, нимгэн арьсыг тэжээнэ.",
        price: "52000",
        category: "Арьс арчилгаа",
        brand: "CeraVe",
        stockQty: 60,
      },
      {
        tenantId: tenant1.id,
        name: "Нарны хамгаалалтын тос SPF50",
        description: "Өдөр бүр хэрэглэх хөнгөн бүтэцтэй нарны тос. SPF50+ PA++++.",
        price: "38000",
        category: "Нарны хамгаалалт",
        brand: "Biore",
        stockQty: 200,
      },
      {
        tenantId: tenant1.id,
        name: "Гиалуроны хүчлийн серум",
        description: "Арьсыг гүнээс нь чийгшүүлнэ. 2% гиалуроны хүчил агуулсан.",
        price: "42000",
        category: "Арьс арчилгаа",
        brand: "The Ordinary",
        stockQty: 120,
      },
      {
        tenantId: tenant1.id,
        name: "Нүүр цэвэрлэгч гель",
        description: "Нимгэн хөөстэй нүүр угаалгын гель. pH тэнцвэртэй.",
        price: "28000",
        category: "Цэвэрлэгч",
        brand: "CeraVe",
        stockQty: 180,
      },
      {
        tenantId: tenant1.id,
        name: "Ретинол шөнийн крем",
        description: "Шөнийн тэжээлийн крем. 0.5% ретинол агуулсан.",
        price: "75000",
        category: "Арьс арчилгаа",
        brand: "La Roche-Posay",
        stockQty: 45,
      },
      {
        tenantId: tenant1.id,
        name: "Уруулын тос Cherry",
        description: "Уруулыг чийгшүүлж, хамгаална. Интсэн үнэртэй.",
        price: "15000",
        category: "Уруулын арчилгаа",
        brand: "Nivea",
        stockQty: 300,
      },
      {
        tenantId: tenant1.id,
        name: "Миселлар ус 400мл",
        description: "Будаг арилгах миселлар ус. Нүүр, нүд, уруулын будаг зөөлнөөр арилгана.",
        price: "22000",
        category: "Цэвэрлэгч",
        brand: "Garnier",
        stockQty: 160,
      },
      {
        tenantId: tenant1.id,
        name: "Тоник 200мл",
        description: "Арьсны pH тэнцвэрийг сэргээх тоник. Алоэ вера агуулсан.",
        price: "32000",
        category: "Арьс арчилгаа",
        brand: "Innisfree",
        stockQty: 90,
      },
    ])
    .returning();

  console.log(`Created ${t1Products.length} products for tenant 1`);

  // ─── Products (Tenant 2 — Электроник) ────────────────────────
  const t2Products = await db
    .insert(products)
    .values([
      {
        tenantId: tenant2.id,
        name: "Утасны гэр iPhone 15",
        description: "MagSafe дэмжих прозрачный кейс. Шок хамгаалалттай.",
        price: "25000",
        category: "Утасны дагалдах",
        brand: "Spigen",
        stockQty: 200,
      },
      {
        tenantId: tenant2.id,
        name: "Bluetooth чихэвч TWS",
        description: "Утасгүй чихэвч. ANC дуу чимээ дарагч, 30 цагийн батарей.",
        price: "89000",
        category: "Аудио",
        brand: "Samsung",
        stockQty: 75,
      },
      {
        tenantId: tenant2.id,
        name: "USB-C хурдан цэнэглэгч 65W",
        description: "GaN технологитой хурдан цэнэглэгч. Лаптоп, утас хоёуланг цэнэглэнэ.",
        price: "45000",
        category: "Цэнэглэгч",
        brand: "Anker",
        stockQty: 130,
      },
      {
        tenantId: tenant2.id,
        name: "Дэлгэцний хамгаалалт iPhone 15",
        description: "Темперэд шил. 9H хатуулагтай, хурууны хээ үлдэхгүй.",
        price: "12000",
        category: "Утасны дагалдах",
        brand: "Nillkin",
        stockQty: 500,
      },
      {
        tenantId: tenant2.id,
        name: "Портатив батарей 20000mAh",
        description: "Том багтаамжтай power bank. 3 гаралттай, хурдан цэнэглэлт дэмжинэ.",
        price: "65000",
        category: "Цэнэглэгч",
        brand: "Xiaomi",
        stockQty: 90,
      },
      {
        tenantId: tenant2.id,
        name: "Утасны суурь MagSafe",
        description: "MagSafe утасгүй цэнэглэгч суурь. 15W хурдан цэнэглэлт.",
        price: "35000",
        category: "Цэнэглэгч",
        brand: "Apple",
        stockQty: 60,
      },
      {
        tenantId: tenant2.id,
        name: "Гар утасны штатив",
        description: "Уян налуу штатив Bluetooth удирдлагатай. Сэлфи, видео бичлэгт тохиромжтой.",
        price: "18000",
        category: "Утасны дагалдах",
        brand: "Ugreen",
        stockQty: 140,
      },
      {
        tenantId: tenant2.id,
        name: "HDMI кабель 2м",
        description: "4K 60Hz дэмжих HDMI 2.1 кабель. Алтан бүрээстэй холбогч.",
        price: "15000",
        category: "Кабель",
        brand: "Ugreen",
        stockQty: 250,
      },
      {
        tenantId: tenant2.id,
        name: "Вэб камер 1080p",
        description: "Full HD вэб камер. Автофокус, микрофонтой. Zoom, Teams-д тохиромжтой.",
        price: "55000",
        category: "Компьютерийн дагалдах",
        brand: "Logitech",
        stockQty: 40,
      },
      {
        tenantId: tenant2.id,
        name: "USB hub 7 порт",
        description: "USB 3.0 хурдтай 7 портын hub. Тусдаа тэжээлтэй.",
        price: "28000",
        category: "Компьютерийн дагалдах",
        brand: "Anker",
        stockQty: 110,
      },
    ])
    .returning();

  console.log(`Created ${t2Products.length} products for tenant 2`);

  // ─── Product Images ──────────────────────────────────────────
  const allProducts = [...t1Products, ...t2Products];
  await db.insert(productImages).values(
    allProducts.map((p) => ({
      productId: p.id,
      tenantId: p.tenantId,
      url: `https://picsum.photos/seed/${p.id}/400/400`,
      altText: p.name,
      position: 0,
    })),
  );

  console.log("Created product images");

  // ─── Shoppers ────────────────────────────────────────────────
  const [shopper1, shopper2, shopper3] = await db
    .insert(shoppers)
    .values([
      {
        tenantId: tenant1.id,
        anonymousId: "anon_abc123",
        name: "Болд",
        email: "bold@example.mn",
      },
      {
        tenantId: tenant1.id,
        anonymousId: "anon_def456",
      },
      {
        tenantId: tenant2.id,
        anonymousId: "anon_ghi789",
        name: "Сарнай",
        email: "sarnai@example.mn",
      },
    ])
    .returning();

  console.log("Created shoppers");

  // ─── Conversations ───────────────────────────────────────────
  const [conv1, conv2, conv3] = await db
    .insert(conversations)
    .values([
      {
        tenantId: tenant1.id,
        shopperId: shopper1.id,
        channel: "web",
        status: "resolved",
        summary: "Увлажняющий крем сонирхож, зөвлөгөө авсан.",
        rating: 5,
      },
      {
        tenantId: tenant1.id,
        shopperId: shopper2.id,
        channel: "web",
        status: "active",
      },
      {
        tenantId: tenant2.id,
        shopperId: shopper3.id,
        channel: "web",
        status: "resolved",
        summary: "iPhone 15 гэр болон дэлгэцний хамгаалалт авсан.",
        rating: 4,
      },
    ])
    .returning();

  console.log("Created conversations");

  // ─── Messages ────────────────────────────────────────────────
  await db.insert(messages).values([
    {
      tenantId: tenant1.id,
      conversationId: conv1.id,
      role: "user",
      content: "Сайн байна уу? Хуурай арьсанд ямар крем тохирох вэ?",
    },
    {
      tenantId: tenant1.id,
      conversationId: conv1.id,
      role: "assistant",
      content:
        "Сайн байна уу! Хуурай арьсанд бид Увлажняющий крем санал болгож байна. Энэ бүтээгдэхүүн бүх төрлийн арьсанд тохиромжтой бөгөөд 45,000₮ үнэтэй.",
      toolCalls: [
        {
          name: "searchProducts",
          args: { query: "хуурай арьс крем", category: "Арьс арчилгаа" },
        },
      ],
      tokensUsed: 245,
    },
    {
      tenantId: tenant1.id,
      conversationId: conv1.id,
      role: "user",
      content: "Баярлалаа, захиалъя!",
    },
    {
      tenantId: tenant1.id,
      conversationId: conv2.id,
      role: "user",
      content: "Нарны тос байна уу?",
    },
    {
      tenantId: tenant1.id,
      conversationId: conv2.id,
      role: "assistant",
      content:
        "Тийм ээ! Biore брэндийн SPF50+ нарны хамгаалалтын тос байна. Хөнгөн бүтэцтэй, өдөр тутмын хэрэглээнд тохиромжтой. Үнэ: 38,000₮.",
      tokensUsed: 180,
    },
    {
      tenantId: tenant2.id,
      conversationId: conv3.id,
      role: "user",
      content: "iPhone 15-д кейс болон дэлгэцний хамгаалалт хэрэгтэй байна.",
    },
    {
      tenantId: tenant2.id,
      conversationId: conv3.id,
      role: "assistant",
      content:
        "iPhone 15-д зориулсан Spigen прозрачный кейс (25,000₮) болон Nillkin темперэд шил (12,000₮) санал болгож байна. Хоёуланг нь авбал нийт 37,000₮.",
      toolCalls: [
        {
          name: "searchProducts",
          args: { query: "iPhone 15", category: "Утасны дагалдах" },
        },
      ],
      tokensUsed: 310,
    },
  ]);

  console.log("Created messages");

  // ─── Events ──────────────────────────────────────────────────
  const now = new Date();
  const eventValues = [];

  for (let i = 0; i < 50; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    const product = t1Products[Math.floor(Math.random() * t1Products.length)];

    eventValues.push({
      tenantId: tenant1.id,
      shopperId: Math.random() > 0.5 ? shopper1.id : shopper2.id,
      sessionId: `sess_${Math.random().toString(36).slice(2, 10)}`,
      eventType: (["product_view", "add_to_cart", "page_view", "search_query"] as const)[
        Math.floor(Math.random() * 4)
      ],
      metadata: { productId: product.id, productName: product.name },
      createdAt,
    });
  }

  for (let i = 0; i < 50; i++) {
    const daysAgo = Math.floor(Math.random() * 30);
    const createdAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    const product = t2Products[Math.floor(Math.random() * t2Products.length)];

    eventValues.push({
      tenantId: tenant2.id,
      shopperId: shopper3.id,
      sessionId: `sess_${Math.random().toString(36).slice(2, 10)}`,
      eventType: (["product_view", "add_to_cart", "checkout_completed", "page_view"] as const)[
        Math.floor(Math.random() * 4)
      ],
      metadata: { productId: product.id, productName: product.name },
      createdAt,
    });
  }

  await db.insert(events).values(eventValues);

  console.log(`Created ${eventValues.length} events`);

  // ─── Subscriptions ───────────────────────────────────────────
  await db.insert(subscriptions).values([
    {
      tenantId: tenant1.id,
      plan: "starter",
      status: "active",
      periodStart: new Date("2026-03-01"),
      periodEnd: new Date("2026-04-01"),
    },
    {
      tenantId: tenant2.id,
      plan: "growth",
      status: "active",
      periodStart: new Date("2026-03-01"),
      periodEnd: new Date("2026-04-01"),
    },
  ]);

  console.log("Created subscriptions");

  console.log("\nSeed completed successfully!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
