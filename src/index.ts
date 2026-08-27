import express from "express";
import type { Request, Response } from "express";
import { createCart, getCart, deleteCart, type StoredCart } from "./carts.js";
import { getProductSummary } from "./clients/catalogClient.js";
import { getQuote } from "./clients/pricingClient.js";
import type { CartResponse } from "./types.js";

const app = express();
app.use(express.json());

async function toCartResponse(cart: StoredCart): Promise<CartResponse> {
  const quote = await getQuote(cart.items, cart.promoCode);
  return {
    cartId: cart.cartId,
    items: cart.items,
    promoCode: cart.promoCode,
    totals: {
      subtotalCents: quote.subtotalCents,
      discountCents: quote.discountCents,
      taxCents: quote.taxCents,
      shippingCents: quote.shippingCents,
      grandTotalCents: quote.grandTotalCents,
    },
  };
}

async function respondWithCart(cart: StoredCart, res: Response): Promise<void> {
  try {
    res.json(await toCartResponse(cart));
  } catch (err) {
    console.error("failed to price cart:", err);
    res.status(502).json({ error: "pricing_unavailable" });
  }
}

function requireCart(req: Request, res: Response): StoredCart | undefined {
  const cart = getCart(req.params.cartId);
  if (!cart) {
    res.status(404).json({ error: "cart_not_found" });
  }
  return cart;
}

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "cart" });
});

app.post("/api/carts", (_req, res) => {
  const cart = createCart();
  res.status(201).json({ cartId: cart.cartId });
});

app.get("/api/carts/:cartId", async (req, res) => {
  const cart = requireCart(req, res);
  if (!cart) return;
  await respondWithCart(cart, res);
});

app.post("/api/carts/:cartId/items", async (req, res) => {
  const cart = requireCart(req, res);
  if (!cart) return;

  const { productId, quantity } = req.body as { productId?: string; quantity?: number };
  if (!productId || !quantity || quantity < 1) {
    res.status(400).json({ error: "invalid_body" });
    return;
  }

  const summary = await getProductSummary(productId);
  if (!summary) {
    res.status(404).json({ error: "unknown_product" });
    return;
  }

  const existing = cart.items.find((i) => i.productId === productId);
  if (existing) {
    existing.quantity += quantity;
  } else {
    cart.items.push({
      productId: summary.id,
      name: summary.name,
      quantity,
      basePriceCents: summary.basePriceCents,
    });
  }
  await respondWithCart(cart, res);
});

app.patch("/api/carts/:cartId/items/:productId", async (req, res) => {
  const cart = requireCart(req, res);
  if (!cart) return;

  const { quantity } = req.body as { quantity?: number };
  const item = cart.items.find((i) => i.productId === req.params.productId);
  if (!item) {
    res.status(404).json({ error: "item_not_in_cart" });
    return;
  }
  if (!quantity || quantity < 1) {
    res.status(400).json({ error: "invalid_quantity" });
    return;
  }
  item.quantity = quantity;
  await respondWithCart(cart, res);
});

app.delete("/api/carts/:cartId/items/:productId", async (req, res) => {
  const cart = requireCart(req, res);
  if (!cart) return;
  cart.items = cart.items.filter((i) => i.productId !== req.params.productId);
  await respondWithCart(cart, res);
});

app.post("/api/carts/:cartId/promo", async (req, res) => {
  const cart = requireCart(req, res);
  if (!cart) return;
  const { promoCode } = req.body as { promoCode?: string | null };
  cart.promoCode = promoCode || null;
  await respondWithCart(cart, res);
});

// Called by orders after a successful checkout.
app.delete("/api/carts/:cartId", (req, res) => {
  if (!deleteCart(req.params.cartId)) {
    res.status(404).json({ error: "cart_not_found" });
    return;
  }
  res.json({ cartId: req.params.cartId, status: "cleared" });
});

const port = Number(process.env.PORT ?? 4002);
app.listen(port, () => {
  console.log(`cart service listening on http://localhost:${port}`);
});
