'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

export interface CartItem {
  id: string; // unique item id: `${productId}-${color || 'std'}-${size || 'default'}`
  productId: string;
  name: string;
  slug: string;
  price: number;
  compare_at_price?: number | null;
  image_url?: string | null;
  color?: string | null;
  size?: string | null;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (
    item: {
      productId: string;
      name: string;
      slug: string;
      price: number;
      compare_at_price?: number | null;
      image_url?: string | null;
      color?: string | null;
      size?: string | null;
      quantity?: number;
    },
    openImmediately?: boolean
  ) => void;
  updateQuantity: (cartItemId: string, quantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  count: number;
  subtotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const STORAGE_KEY = 'zarish_cart';

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);

  // Hydrate cart from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setItems(parsed);
        }
      }
    } catch {
      // ignore JSON parse error
    }
    setIsHydrated(true);
  }, []);

  // Persist to localStorage on change
  useEffect(() => {
    if (!isHydrated) return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore storage quota error
    }
  }, [items, isHydrated]);

  const addToCart = useCallback(
    (
      newItem: {
        productId: string;
        name: string;
        slug: string;
        price: number;
        compare_at_price?: number | null;
        image_url?: string | null;
        color?: string | null;
        size?: string | null;
        quantity?: number;
      },
      openImmediately = true
    ) => {
      const q = Math.max(1, newItem.quantity || 1);
      const cartItemId = `${newItem.productId}-${newItem.color || 'std'}-${newItem.size || 'standard'}`;

      setItems((prev) => {
        const existingIdx = prev.findIndex((i) => i.id === cartItemId);
        if (existingIdx > -1) {
          const updated = [...prev];
          updated[existingIdx] = {
            ...updated[existingIdx],
            quantity: updated[existingIdx].quantity + q,
          };
          return updated;
        } else {
          return [
            ...prev,
            {
              id: cartItemId,
              productId: newItem.productId,
              name: newItem.name,
              slug: newItem.slug,
              price: newItem.price,
              compare_at_price: newItem.compare_at_price,
              image_url: newItem.image_url,
              color: newItem.color || null,
              size: newItem.size || null,
              quantity: q,
            },
          ];
        }
      });

      if (openImmediately) {
        setIsCartOpen(true);
      }
    },
    []
  );

  const updateQuantity = useCallback((cartItemId: string, newQty: number) => {
    setItems((prev) => {
      if (newQty <= 0) {
        return prev.filter((i) => i.id !== cartItemId);
      }
      return prev.map((i) => (i.id === cartItemId ? { ...i, quantity: newQty } : i));
    });
  }, []);

  const removeFromCart = useCallback((cartItemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== cartItemId));
  }, []);

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const openCart = useCallback(() => {
    setIsCartOpen(true);
  }, []);

  const closeCart = useCallback(() => {
    setIsCartOpen(false);
  }, []);

  const count = items.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        isCartOpen,
        openCart,
        closeCart,
        count,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
