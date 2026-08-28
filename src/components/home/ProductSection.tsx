"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import { Product } from "@/types";
import { ProductCard } from "@/components/ProductCard";
import { ChevronRight } from "lucide-react";
import { trackViewItemList } from "@/lib/analytics/client";
import { sanitizeItem } from "@/lib/analytics/sanitize";

interface ProductSectionProps {
  id?: string;
  title: string;
  categoryKey: string;
  products: Product[];
  viewAllLink?: string;
}

export function ProductSection({
  id,
  title,
  categoryKey,
  products,
  viewAllLink,
}: ProductSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const trackedRef = useRef(false);

  useEffect(() => {
    if (!products || products.length === 0) return;
    if (trackedRef.current || !sectionRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !trackedRef.current) {
          trackedRef.current = true;
          try {
            const analyticsItems = products.slice(0, 12).map((p, i) => sanitizeItem({
              id: p.id, name: p.name, category: p.category,
              price: p.minPriceBDT, quantity: 1, index: i,
              listId: `home_${categoryKey}`, listName: title,
            }));
            trackViewItemList(`home_${categoryKey}`, title, analyticsItems);
          } catch {}
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [products, categoryKey, title]);

  if (!products || products.length === 0) return null;

  return (
    <section ref={sectionRef} id={id} className="py-3.5 sm:py-5">
      {/* SECTION HEADING STYLE */}
      <div className="flex items-center gap-2.5 mb-3.5 sm:mb-4">
        {/* Thin vertical orange accent line */}
        <span className="w-1 h-4 sm:h-5 bg-[#FC5C03] rounded-full shrink-0" />

        {/* Dark heading text (~17px - 19px) */}
        <h2 className="text-[16px] sm:text-[18px] font-bold text-[#1A1D26] tracking-tight shrink-0">
          {title}
        </h2>

        {/* Thin horizontal divider extending after title */}
        <div className="flex-1 h-[1px] bg-[#E8E8EE]" />

        {/* See All Link */}
        <Link
          href={viewAllLink || `/shop?category=${encodeURIComponent(categoryKey)}`}
          className="text-xs font-semibold text-[#7A8190] hover:text-[#FC5C03] flex items-center gap-0.5 shrink-0 transition-colors"
        >
          <span>সবগুলো</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* RESPONSIVE CSS GRID: 6 col (>=1440px), 5 col (~1280px), 4 col (~1024px), 3 col (~768px), 2 col (360-767px) */}
      <div className="grid grid-cols-2 min-[330px]:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-2.5 sm:gap-3.5 lg:gap-4 justify-start">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
