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
  getFeaturedProducts: () => Product[];
  getBestProducts: () => Product[];
}

const ProductsContext = createContext<ProductsContextType>({
  products: fallbackProducts,
  isLoading: false,
  refreshProducts: async () => {},
  getProductBySlug: () => undefined,
  getProductsByCategory: () => [],
  getFeaturedProducts: () => [],
  getBestProducts: () => [],
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

      if (category === "Best Product") {
        const best = products.filter(
          (p) => p.isBestProduct || p.badge === "Best Product" || (p.categories && p.categories.includes("Best Product"))
        );
        return best.length > 0 ? best : products.slice(0, 8);
      }

      if (category === "Best Selling") {
        const bestSelling = products.filter(
          (p) => p.isBestSelling || p.badge === "Best Selling" || (p.categories && p.categories.includes("Best Selling"))
        );
        return bestSelling.length > 0 ? bestSelling : products.slice(0, 8);
      }

      return products.filter(
        (p) => p.category === category || (p.categories && p.categories.includes(category))
      );
    },
    [products]
  );

  const getFeaturedProducts = useCallback(() => {
    const featured = products.filter((p) => p.isFeatured);
    return featured.length > 0 ? featured : products.slice(0, 6);
  }, [products]);

  const getBestProducts = useCallback(() => {
    const best = products.filter(
      (p) => p.isBestProduct || p.isBestSelling || p.badge?.includes("Best")
    );
    return best.length > 0 ? best : products.slice(0, 8);
  }, [products]);

  return (
    <ProductsContext.Provider
      value={{
        products,
        isLoading,
        refreshProducts,
        getProductBySlug,
        getProductsByCategory,
        getFeaturedProducts,
        getBestProducts,
      }}
    >
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  return useContext(ProductsContext);
}
