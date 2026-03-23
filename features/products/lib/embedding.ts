interface EmbeddingInput {
  name: string;
  description: string | null;
  category: string | null;
  brand: string | null;
  price: string;
}

/**
 * Build the text string used for generating product embeddings.
 * Pure function — no server imports, safe for any environment.
 */
export function buildEmbeddingText(product: EmbeddingInput): string {
  const parts = [product.name];

  if (product.description) {
    parts.push(product.description);
  }

  if (product.category) {
    parts.push(`Ангилал: ${product.category}`);
  }

  if (product.brand) {
    parts.push(`Брэнд: ${product.brand}`);
  }

  parts.push(`Үнэ: ${product.price}₮`);

  return parts.join(". ");
}
