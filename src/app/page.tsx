"use client";

import React from "react";
import { Hero } from "@/components/home/Hero";
import { ProductSection } from "@/components/home/ProductSection";
import { HowToOrder } from "@/components/home/HowToOrder";
import { Partners } from "@/components/home/Partners";
import { HOMEPAGE_SECTIONS } from "@/data/products";
import { useProducts } from "@/context/ProductsContext";

export default function HomePage() {
  const { getProductsByCategory } = useProducts();

  return (
    <div className="w-full bg-white">
      {/* 1. HOMEPAGE HERO */}
      <Hero />

      {/* 2. HOMEPAGE PRODUCT SECTIONS */}
      <div className="max-w-[1500px] w-[calc(100%-24px)] md:w-[calc(100%-40px)] lg:w-[calc(100%-48px)] mx-auto py-8 sm:py-10 space-y-6 sm:space-y-8">
        {HOMEPAGE_SECTIONS.map((section) => {
          const sectionProducts = getProductsByCategory(section.categoryKey);
          if (!sectionProducts || sectionProducts.length === 0) return null;
          return (
            <ProductSection
              key={section.id}
              id={section.id}
              title={section.title}
              categoryKey={section.categoryKey}
              products={sectionProducts}
            />
          );
        })}
      </div>

      {/* 3. HOMEPAGE HOW TO ORDER SECTION */}
      <HowToOrder />

      {/* 4. PARTNERS SECTION */}
      <Partners />
    </div>
  );
}
