# AGENTS.md — voltride-cart

Part of VoltRide, a multi-repo microservices demo (see the `voltride-platform` repo for the system map). Every repo hand-maintains local copies of its peers' contracts — there is **no shared types package anywhere in VoltRide**, and nothing must ever change that. `src/types.ts` holds both this service's response shapes and its local view of catalog/pricing responses.

## Contracts this repo PRODUCES

| Contract | Consumer repo | Consumer file | Failure mode if changed |
|---|---|---|---|
| Cart response (`cartId`, `items[].productId/name/quantity/basePriceCents`, `promoCode`, `totals.*Cents`) | voltride-orders | `clients.go` (`Cart` struct) | Go decodes missing keys **silently** as zero values → corrupted checkout |
| Cart response | voltride-frontend | `src/api/cart.ts` | cart page breaks |
| `404 {"error":"cart_not_found"}` body | voltride-frontend | `src/api/cart.ts` stale-cart retry | stale carts stop auto-recovering |
| `DELETE /api/carts/:id` | voltride-orders | `clients.go` (`clearCart`) | carts not cleared after checkout |

## Contracts this repo CONSUMES (local copies in `src/types.ts`)

| Producer repo | Contract | Used in |
|---|---|---|
| voltride-catalog | `/api/products/:id/summary` (`id`, `name`, `basePriceCents`, `category`) | `src/clients/catalogClient.ts` |
| voltride-pricing | quote response (all `*Cents` totals, `promoApplied`) | `src/clients/pricingClient.ts` |

**Changing any produced shape is a breaking change for the consumer repos above** — it cannot be fixed in this PR; open coordinated PRs and link them. When a producer repo changes, update the local copies here.

## Conventions

- Peer URLs via env vars (`CATALOG_URL`, `PRICING_URL`) with localhost defaults; money is integer cents (`*Cents`).
- Verify with: `npx tsc --noEmit`, then `npm run dev` and curl the endpoints.
