// Cart's own contract definitions, plus its local copies of what it
// expects from catalog and pricing. No shared types package on purpose.

export interface CartItem {
  productId: string;
  name: string;
  quantity: number;
  basePriceCents: number;
}

export interface CartTotals {
  subtotalCents: number;
  discountCents: number;
  taxCents: number;
  shippingCents: number;
  grandTotalCents: number;
}

export interface CartResponse {
  cartId: string;
  items: CartItem[];
  promoCode: string | null;
  totals: CartTotals;
}

// What cart expects from catalog's GET /api/products/:id/summary.
export interface ProductSummary {
  id: string;
  name: string;
  basePriceCents: number;
  category: string;
}

// What cart expects back from pricing's POST /api/quotes.
export interface Quote {
  lineItems: {
    productId: string;
    unitPriceCents: number;
    quantity: number;
    discountPercent: number;
    lineTotalCents: number;
  }[];
  subtotalCents: number;
  discountCents: number;
  taxCents: number;
  shippingCents: number;
  grandTotalCents: number;
  promoApplied: boolean;
}
