"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, Variation, CartItem } from "@/types";
import { useToast } from "@/context/ToastContext";
import { trackAddToCart, trackRemoveFromCart } from "@/lib/analytics/client";
import { sanitizeItem } from "@/lib/analytics/sanitize";

interface CartContextType {
  items: CartItem[];
  addToCart: (product: Product, variation: Variation, quantity?: number) => void;
  removeFromCart: (itemId: string) => void;
  updateQuantity: (itemId: string, quantity: number) => void;
  clearCart: () => void;
  restoreCart: (items: CartItem[]) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  toggleCart: () => void;
  totalItems: number;
  subtotalBDT: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    try {
      const saved = localStorage.getItem("aihaat_cart");
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load cart from localStorage", e);
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("aihaat_cart", JSON.stringify(items));
    } catch (e) {
      console.error("Failed to save cart to localStorage", e);
    }
  }, [items]);

  const addToCart = (product: Product, variation: Variation, quantity = 1) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id && item.selectedVariation.id === variation.id
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += quantity;
        return updated;
      } else {
        const newItem: CartItem = {
          id: `${product.id}-${variation.id}-${Date.now()}`,
          product,
          selectedVariation: variation,
          quantity,
        };
        return [...prev, newItem];
      }
    });

    showToast(`Added "${product.name} (${variation.name})" to cart!`, "success");

    try {
      const analyticsItem = sanitizeItem({
        id: product.id,
        name: product.name,
        category: product.category,
        variant: variation.name,
        price: variation.priceBDT,
        quantity: quantity,
      });
      trackAddToCart(analyticsItem, variation.priceBDT * quantity);
    } catch {}
  };

  const removeFromCart = (itemId: string) => {
    try {
      const removedItem = items.find(i => i.id === itemId);
      if (removedItem) {
        const analyticsItem = sanitizeItem({
          id: removedItem.product.id,
          name: removedItem.product.name,
          category: removedItem.product.category,
          variant: removedItem.selectedVariation.name,
          price: removedItem.selectedVariation.priceBDT,
          quantity: removedItem.quantity,
        });
        trackRemoveFromCart(analyticsItem, removedItem.selectedVariation.priceBDT * removedItem.quantity);
      }
    } catch {}

    setItems((prev) => prev.filter((item) => item.id !== itemId));
    showToast("Item removed from cart", "info");
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(itemId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, quantity } : item))
    );
  };

  const clearCart = () => {
    setItems([]);
  };

  const restoreCart = (newItems: CartItem[]) => {
    if (Array.isArray(newItems) && newItems.length > 0) {
      setItems(newItems);
    }
  };

  const toggleCart = () => setIsCartOpen((prev) => !prev);

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotalBDT = items.reduce(
    (acc, item) => acc + item.selectedVariation.priceBDT * item.quantity,
    0
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        restoreCart,
        isCartOpen,
        setIsCartOpen,
        toggleCart,
        totalItems,
        subtotalBDT,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
