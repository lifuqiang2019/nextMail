"use client";

import { CartSheet } from "@/components/cart/cart-sheet";
import { CartProvider } from "@/components/cart/cart-provider";
import { AuthProvider } from "@/components/providers/auth-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <CartProvider>
        {children}
        <CartSheet />
      </CartProvider>
    </AuthProvider>
  );
}
