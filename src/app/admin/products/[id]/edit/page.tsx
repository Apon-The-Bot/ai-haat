"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

/**
 * AUDIT-010 Canonical Route Redirect:
 * Redirects legacy /admin/products/[id]/edit to the canonical /admin/products/edit/[id] route.
 */
export default function EditProductPageAlt() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id ? String(params.id) : "";

  useEffect(() => {
    if (id) {
      router.replace(`/admin/products/edit/${id}`);
    } else {
      router.replace("/admin/products");
    }
  }, [id, router]);

  return (
    <div className="p-6 flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#FC5C03]"></div>
    </div>
  );
}
