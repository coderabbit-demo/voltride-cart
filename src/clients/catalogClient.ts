import type { ProductSummary } from "../types.js";

const CATALOG_URL = process.env.CATALOG_URL ?? "http://localhost:4001";

export async function getProductSummary(productId: string): Promise<ProductSummary | null> {
  const res = await fetch(`${CATALOG_URL}/api/products/${productId}/summary`);
  if (!res.ok) return null;
  return (await res.json()) as ProductSummary;
}
