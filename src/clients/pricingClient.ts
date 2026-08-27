import type { CartItem, Quote } from "../types.js";

const PRICING_URL = process.env.PRICING_URL ?? "http://localhost:4005";

const EMPTY_QUOTE: Quote = {
  lineItems: [],
  subtotalCents: 0,
  discountCents: 0,
  taxCents: 0,
  shippingCents: 0,
  grandTotalCents: 0,
  promoApplied: false,
};

export async function getQuote(items: CartItem[], promoCode: string | null): Promise<Quote> {
  if (items.length === 0) return EMPTY_QUOTE;
  const res = await fetch(`${PRICING_URL}/api/quotes`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      items: items.map((i) => ({
        productId: i.productId,
        basePriceCents: i.basePriceCents,
        quantity: i.quantity,
      })),
      promoCode,
    }),
  });
  if (!res.ok) {
    throw new Error(`pricing service returned ${res.status}`);
  }
  return (await res.json()) as Quote;
}
