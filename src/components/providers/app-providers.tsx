"use client";

import { CartSheet } from "@/components/cart/cart-sheet";
import { CartProvider } from "@/components/cart/cart-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      {children}
      <CartSheet />
    </CartProvider>
  );
}
