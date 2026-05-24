"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
} from "react";

import type { CartItem, Product } from "@/types/store";

type CartContextValue = {
  items: CartItem[];
  itemCount: number;
  subtotal: number;
  isOpen: boolean;
  addItem: (product: Product) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
};

const STORAGE_KEY = "nextmail-cart";
const STORAGE_EVENT = "nextmail-cart-updated";
const EMPTY_CART: CartItem[] = [];

let cartSnapshotCache = "";
let cartItemsCache: CartItem[] = EMPTY_CART;

const CartContext = createContext<CartContextValue | null>(null);

function readCartSnapshot(): CartItem[] {
  if (typeof window === "undefined") {
    return EMPTY_CART;
  }

  try {
    const cached = window.localStorage.getItem(STORAGE_KEY) ?? "";
    if (cached === cartSnapshotCache) {
      return cartItemsCache;
    }
    cartSnapshotCache = cached;
    cartItemsCache = cached ? (JSON.parse(cached) as CartItem[]) : EMPTY_CART;
    return cartItemsCache;
  } catch {
    cartSnapshotCache = "";
    cartItemsCache = EMPTY_CART;
    return EMPTY_CART;
  }
}

function subscribeCart(callback: () => void) {
  if (typeof window === "undefined") {
    return () => {};
  }
  const handler = () => callback();
  window.addEventListener("storage", handler);
  window.addEventListener(STORAGE_EVENT, handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(STORAGE_EVENT, handler);
  };
}

function writeCartSnapshot(items: CartItem[]) {
  if (typeof window === "undefined") {
    return;
  }

  const nextSnapshot = JSON.stringify(items);
  cartSnapshotCache = nextSnapshot;
  cartItemsCache = items;
  window.localStorage.setItem(STORAGE_KEY, nextSnapshot);
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const items = useSyncExternalStore(subscribeCart, readCartSnapshot, () => EMPTY_CART);
  const [isOpen, setIsOpen] = useState(false);

  const commitItems = useCallback((updater: CartItem[] | ((current: CartItem[]) => CartItem[])) => {
    const nextItems = typeof updater === "function" ? updater(readCartSnapshot()) : updater;
    writeCartSnapshot(nextItems);
  }, []);

  const addItem = useCallback((product: Product) => {
    commitItems((current) => {
      const existingItem = current.find((item) => item.id === product.id);
      if (existingItem) {
        return current.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
      }

      return [
        ...current,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          badge: product.badge,
          categoryId: product.categoryId,
          imageUrl: product.imageUrl,
          inventory: product.inventory,
          quantity: 1,
        },
      ];
    });
    setIsOpen(true);
  }, [commitItems]);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    commitItems((current) => {
      if (quantity <= 0) {
        return current.filter((item) => item.id !== productId);
      }
      return current.map((item) => (item.id === productId ? { ...item, quantity } : item));
    });
  }, [commitItems]);

  const removeItem = useCallback((productId: string) => {
    commitItems((current) => current.filter((item) => item.id !== productId));
  }, [commitItems]);

  const clearCart = useCallback(() => {
    commitItems([]);
  }, [commitItems]);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((total, item) => total + item.quantity, 0);
    const subtotal = items.reduce((total, item) => total + item.price * item.quantity, 0);

    return {
      items,
      itemCount,
      subtotal,
      isOpen,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      toggleCart: () => setIsOpen((current) => !current),
    };
  }, [addItem, clearCart, isOpen, items, removeItem, updateQuantity]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }
  return context;
}
