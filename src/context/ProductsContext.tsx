"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Product } from "@/types";
import { PRODUCTS as fallbackProducts } from "@/data/products";

interface ProductsContextType {
  products: Product[];
  isLoading: boolean;
  refreshProducts: () => Promise<void>;
  getProductBySlug: (slug: string) => Product | undefined;
  getProductsByCategory: (category: string) => Product[];
}

const ProductsContext = createContext<ProductsContextType>({
  products: fallbackProducts,
  isLoading: false,
  refreshProducts: async () => {},
  getProductBySlug: () => undefined,
  getProductsByCategory: () => [],
});

export function ProductsProvider({ children }: { children: React.ReactNode }) {
  const [products, setProducts] = useState<Product[]>(fallbackProducts);
  const [isLoading, setIsLoading] = useState(true);

  const refreshProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/products");
      if (res.ok) {
        const data = await res.json();
        if (data.products && Array.isArray(data.products) && data.products.length > 0) {
          setProducts(data.products);
        }
      }
    } catch (err) {
      console.error("[ProductsContext Error]:", err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refreshProducts();
  }, [refreshProducts]);

  const getProductBySlug = useCallback(
    (slug: string) => {
      const clean = slug.toLowerCase().trim();
      return products.find((p) => p.slug.toLowerCase() === clean || p.id.toLowerCase() === clean);
    },
    [products]
  );

  const getProductsByCategory = useCallback(
    (category: string) => {
      if (category === "All") return products;
      return products.filter(
        (p) => p.category === category || (p.categories && p.categories.includes(category))
      );
    },
    [products]
  );

  return (
    <ProductsContext.Provider
      value={{
        products,
        isLoading,
        refreshProducts,
        getProductBySlug,
        getProductsByCategory,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  return useContext(ProductsContext);
}
