# ⚡ voltride-cart

Shopping carts for the [VoltRide](https://github.com/coderabbit-demo/voltride-platform) e-bike store. Node/TypeScript (Express), in-memory data. Runs on **port 4002**.

Validates products against [voltride-catalog](https://github.com/coderabbit-demo/voltride-catalog) and prices carts via [voltride-pricing](https://github.com/coderabbit-demo/voltride-pricing). Its cart response is consumed by [voltride-orders](https://github.com/coderabbit-demo/voltride-orders) during checkout and by [voltride-frontend](https://github.com/coderabbit-demo/voltride-frontend). See `AGENTS.md` before changing any shape.

## Endpoints

- `GET /health`
- `POST /api/carts` → 201 `{ cartId }`
- `GET /api/carts/:id` → `{ cartId, items[], promoCode, totals }`
- `POST /api/carts/:id/items` `{ productId, quantity }` (404 `unknown_product` if catalog rejects)
- `PATCH /api/carts/:id/items/:productId` `{ quantity }` · `DELETE /api/carts/:id/items/:productId`
- `POST /api/carts/:id/promo` `{ promoCode }`
- `DELETE /api/carts/:id` → clears the cart (called by orders after checkout)

## Run

```sh
npm install
npm run dev       # tsx watch, port 4002; PORT/CATALOG_URL/PRICING_URL env vars supported
```

To run the whole VoltRide system, use the scripts in [voltride-platform](https://github.com/coderabbit-demo/voltride-platform).
