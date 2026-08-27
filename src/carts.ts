import type { CartItem } from "./types.js";

export interface StoredCart {
  cartId: string;
  items: CartItem[];
  promoCode: string | null;
}

const carts = new Map<string, StoredCart>();
let nextId = 0;

export function createCart(): StoredCart {
  nextId += 1;
  const cart: StoredCart = {
    cartId: `cart-${nextId.toString(16).padStart(4, "0")}`,
    items: [],
    promoCode: null,
  };
  carts.set(cart.cartId, cart);
  return cart;
}

export function getCart(cartId: string): StoredCart | undefined {
  return carts.get(cartId);
}

export function deleteCart(cartId: string): boolean {
  return carts.delete(cartId);
}
