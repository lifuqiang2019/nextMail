"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
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

function sanitizeCartSnapshot(input: unknown): CartItem[] {
  if (!Array.isArray(input)) {
    return EMPTY_CART;
  }

  const items: CartItem[] = [];

  input.forEach((item) => {
    if (!item || typeof item !== "object") {
      return;
    }

    const rawItem = item as Partial<CartItem>;
    const quantity = Math.max(Math.round(Number(rawItem.quantity) || 0), 0);
    const inventory = Math.max(Math.round(Number(rawItem.inventory) || 0), 0);

    if (
      typeof rawItem.id !== "string" ||
      typeof rawItem.name !== "string" ||
      typeof rawItem.categoryId !== "string" ||
      !Number.isFinite(Number(rawItem.price)) ||
      quantity <= 0
    ) {
      return;
    }

    items.push({
      id: rawItem.id,
      name: rawItem.name,
      price: Math.max(Number(rawItem.price), 0),
      badge: typeof rawItem.badge === "string" ? rawItem.badge : undefined,
      categoryId: rawItem.categoryId,
      inventory: inventory > 0 ? inventory : Number.MAX_SAFE_INTEGER,
      quantity,
    });
  });

  return items;
}

function syncCartWithProducts(items: CartItem[], products: Product[]): CartItem[] {
  const productMap = new Map(products.map((product) => [product.id, product]));

  return items.flatMap((item) => {
    const product = productMap.get(item.id);

    if (!product || product.inventory <= 0) {
      return [];
    }

    return [
      {
        id: product.id,
        name: product.name,
        price: product.price,
        badge: product.badge,
        categoryId: product.categoryId,
        inventory: product.inventory,
        quantity: Math.min(item.quantity, product.inventory),
      } satisfies CartItem,
    ];
  });
}

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
    cartItemsCache = cached ? sanitizeCartSnapshot(JSON.parse(cached)) : EMPTY_CART;

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
  const items = useSyncExternalStore(
    subscribeCart,
    readCartSnapshot,
    () => EMPTY_CART,
  );
  const [isOpen, setIsOpen] = useState(false);

  const commitItems = useCallback(
    (updater: CartItem[] | ((current: CartItem[]) => CartItem[])) => {
      const nextItems =
        typeof updater === "function"
          ? updater(readCartSnapshot())
          : updater;

      writeCartSnapshot(nextItems);
    },
    [],
  );

  useEffect(() => {
    let cancelled = false;

    async function refreshCart() {
      try {
        const response = await fetch("/api/store", { cache: "no-store" });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { products?: Product[] };

        if (cancelled || !Array.isArray(data.products)) {
          return;
        }

        commitItems((current) => syncCartWithProducts(current, data.products ?? []));
      } catch {
        // Ignore refresh errors and keep the last local snapshot.
      }
    }

    void refreshCart();

    return () => {
      cancelled = true;
    };
  }, [commitItems]);

  const addItem = useCallback((product: Product) => {
    if (product.inventory <= 0) {
      return;
    }

    commitItems((current) => {
      const existingItem = current.find((item) => item.id === product.id);

      if (existingItem) {
        return current.map((item) =>
          item.id === product.id
            ? {
                ...item,
                name: product.name,
                price: product.price,
                badge: product.badge,
                categoryId: product.categoryId,
                inventory: product.inventory,
                quantity: Math.min(item.quantity + 1, product.inventory),
              }
            : item,
        );
      }

      return [
        ...current,
        {
          id: product.id,
          name: product.name,
          price: product.price,
          badge: product.badge,
          categoryId: product.categoryId,
          inventory: product.inventory,
          quantity: 1,
        },
      ];
    });

    setIsOpen(true);
  }, [commitItems]);

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    commitItems((current) => {
      const existingItem = current.find((item) => item.id === productId);

      if (!existingItem) {
        return current;
      }

      const nextQuantity = Math.min(
        Math.max(Math.round(quantity), 0),
        existingItem.inventory,
      );

      if (nextQuantity <= 0) {
        return current.filter((item) => item.id !== productId);
      }

      return current.map((item) =>
        item.id === productId ? { ...item, quantity: nextQuantity } : item,
      );
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
    const subtotal = items.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );

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
