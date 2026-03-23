import "dotenv/config";
import { db } from "./db";
import { products } from "./schema";
import { isNull, eq } from "drizzle-orm";
import { buildEmbeddingText } from "@/features/products/lib/embedding";
import { generateEmbeddings } from "@/server/ai/voyage";

async function seedEmbeddings() {
  console.log("Generating product embeddings...\n");

  // Fetch products without embeddings
  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      description: products.description,
      category: products.category,
      brand: products.brand,
      price: products.price,
    })
    .from(products)
    .where(isNull(products.embedding));

  if (rows.length === 0) {
    console.log("All products already have embeddings. Nothing to do.");
    return;
  }

  console.log(`Found ${rows.length} products without embeddings.\n`);

  // Build embedding texts
  const texts = rows.map((row) => buildEmbeddingText(row));

  // Generate embeddings in batch
  console.log("Calling Voyage AI API...");
  const embeddings = await generateEmbeddings(texts);
  console.log(`Generated ${embeddings.length} embeddings.\n`);

  // Update products
  let updated = 0;
  for (let i = 0; i < rows.length; i++) {
    await db
      .update(products)
      .set({
        embedding: embeddings[i],
        embeddingText: texts[i],
        updatedAt: new Date(),
      })
      .where(eq(products.id, rows[i].id));

    updated++;
    console.log(`  [${updated}/${rows.length}] ${rows[i].name}`);
  }

  console.log(`\nDone! Updated ${updated} products with embeddings.`);
}

seedEmbeddings().catch((err) => {
  console.error("Failed to generate embeddings:", err);
  process.exit(1);
});
