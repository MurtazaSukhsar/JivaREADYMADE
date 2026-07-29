"use client";

import { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";

export type CartItem = {
  slug: string;
  name: string;
  price: number; // display only — the server recalculates this at checkout
  image: string;
  size?: string;
  color?: string;
  quantity: number;
};

type CartContextValue = {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "quantity">, quantity?: number) => void;
  removeItem: (slug: string, size?: string, color?: string) => void;
  updateQuantity: (slug: string, size: string | undefined, color: string | undefined, quantity: number) => void;
  clear: () => void;
  totalCount: number;
  subtotal: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "field.cart.v1";

function lineKey(slug: string, size?: string, color?: string) {
  return `${slug}__${size ?? ""}__${color ?? ""}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);

  // Load from localStorage after mount only, so server-rendered HTML
  // (which has no access to localStorage) matches the client's first paint.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore malformed/blocked storage
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore quota/blocked storage
    }
  }, [items, hydrated]);

  const addItem = useCallback((item: Omit<CartItem, "quantity">, quantity = 1) => {
    setItems((prev) => {
      const key = lineKey(item.slug, item.size, item.color);
      const existing = prev.find((p) => lineKey(p.slug, p.size, p.color) === key);
      if (existing) {
        return prev.map((p) =>
          lineKey(p.slug, p.size, p.color) === key ? { ...p, quantity: p.quantity + quantity } : p
        );
      }
      return [...prev, { ...item, quantity }];
    });
  }, []);

  const removeItem = useCallback((slug: string, size?: string, color?: string) => {
    const key = lineKey(slug, size, color);
    setItems((prev) => prev.filter((p) => lineKey(p.slug, p.size, p.color) !== key));
  }, []);

  const updateQuantity = useCallback(
    (slug: string, size: string | undefined, color: string | undefined, quantity: number) => {
      const key = lineKey(slug, size, color);
      setItems((prev) =>
        quantity <= 0
          ? prev.filter((p) => lineKey(p.slug, p.size, p.color) !== key)
          : prev.map((p) => (lineKey(p.slug, p.size, p.color) === key ? { ...p, quantity } : p))
      );
    },
    []
  );

  const clear = useCallback(() => setItems([]), []);

  const totalCount = useMemo(() => items.reduce((sum, i) => sum + i.quantity, 0), [items]);
  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.price * i.quantity, 0), [items]);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clear, totalCount, subtotal }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
