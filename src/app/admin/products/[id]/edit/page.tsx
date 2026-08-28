"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProductEditorForm from "@/components/admin/ProductEditorForm";
import { AlertTriangle } from "lucide-react";

export default function EditProductPageAlt() {
  const params = useParams();
  const id = params?.id ? String(params.id) : "";
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    
    setLoading(true);
    fetch(`/api/admin/products/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load product");
        return res.json();
      })
      .then((json) => {
        setData(json.product || json);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message);
        setLoading(false);
      });
  }, [id]);

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-6">
        <div className="p-4 bg-red-50 text-red-700 rounded-md flex items-center gap-2">
          <AlertTriangle className="w-5 h-5" />
          {error || "Product not found"}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <ProductEditorForm isEdit={true} initialData={data} />
    </div>
  );
}
