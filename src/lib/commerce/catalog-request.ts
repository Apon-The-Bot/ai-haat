import type { Product } from "@/types";

let pendingCatalog: Promise<Product[] | undefined> | undefined;

export function requestCatalog() {
  // Share simultaneous reads in this browser tab. Later reads fetch fresh data.
  pendingCatalog ??= fetch("/api/products")
    .then(async (response) => {
      if (!response.ok) return undefined;
      const data = await response.json();
      return data.success && Array.isArray(data.products)
        ? (data.products as Product[])
        : undefined;
    })
    .finally(() => {
      pendingCatalog = undefined;
    });
  return pendingCatalog;
}
