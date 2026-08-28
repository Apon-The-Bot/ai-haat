"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  FolderTree,
  Plus,
  Search,
  Edit2,
  Trash2,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  Package,
  AlertTriangle,
  X
} from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { SafeImage } from "@/components/SafeImage";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  displayOrder: number;
  isActive: boolean;
  productCount: number;
  createdAt: string;
  updatedAt: string;
}

export default function AdminCategoriesPage() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"ADD" | "EDIT">("ADD");
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
    image: "",
    displayOrder: 0,
    isActive: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deletingCategory, setDeletingCategory] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/admin/categories");
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.categories) {
          setCategories(data.categories);
        }
      }
    } catch (e) {
      console.error(e);
      showToast("Failed to fetch categories", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const filtered = categories.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpenAdd = () => {
    setModalMode("ADD");
    setEditingId(null);
    setFormData({
      name: "",
      slug: "",
      description: "",
      image: "",
      displayOrder: 0,
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (cat: Category) => {
    setModalMode("EDIT");
    setEditingId(cat.id);
    setFormData({
      name: cat.name,
      slug: cat.slug,
      description: cat.description || "",
      image: cat.image || "",
      displayOrder: cat.displayOrder,
      isActive: cat.isActive,
    });
    setIsModalOpen(true);
  };

  const handleOpenDelete = (cat: Category) => {
    setDeletingCategory(cat);
    setDeleteModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) {
      showToast("Category name is required", "error");
      return;
    }

    try {
      setIsSubmitting(true);
      const url = "/api/admin/categories";
      const method = modalMode === "ADD" ? "POST" : "PATCH";
      const body = modalMode === "ADD" ? formData : { id: editingId, ...formData };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        showToast(
          modalMode === "ADD" ? "Category created successfully!" : "Category updated successfully!",
          "success"
        );
        setIsModalOpen(false);
        fetchCategories();
      } else {
        showToast(data.error || "Failed to save category", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("An error occurred", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingCategory) return;
    if (deletingCategory.productCount > 0) {
      showToast("Cannot delete category with active products", "error");
      return;
    }
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/admin/categories?id=${deletingCategory.id}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (res.ok && data.success) {
        showToast("Category deleted successfully!", "success");
        setDeleteModalOpen(false);
        fetchCategories();
      } else {
        showToast(data.error || "Failed to delete category", "error");
      }
    } catch (err) {
      console.error(err);
      showToast("An error occurred", "error");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto animate-in fade-in duration-300">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <FolderTree className="w-6 h-6 text-[#FC5C03]" />
            Category Management (ক্যাটাগরি)
          </h1>
          <p className="text-sm text-slate-500 mt-1 font-medium">
            Manage your store&apos;s product categories and display orders.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            href="/admin/products"
            className="px-4 py-2 bg-white border border-slate-200 text-slate-700 hover:text-black hover:bg-slate-50 text-sm font-bold rounded-xl shadow-xs transition-all flex items-center gap-2"
          >
            <Package className="w-4 h-4" />
            <span className="hidden sm:inline">Back to Products</span>
          </Link>
          <button
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-sm font-bold rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Add Category
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs">
        <div className="relative mb-6">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search categories by name or slug..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-[#FC5C03]/20 focus:border-[#FC5C03] transition-all outline-none"
          />
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400 space-y-4">
            <div className="w-8 h-8 border-3 border-[#FC5C03] border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium">Loading categories...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed border-slate-200 rounded-2xl">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <FolderTree className="w-8 h-8 text-slate-300" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-1">No Categories Found</h3>
            <p className="text-sm text-slate-500 mb-4">
              {search ? "No categories match your search." : "You haven't created any categories yet."}
            </p>
            {!search && (
              <button
                onClick={handleOpenAdd}
                className="px-4 py-2 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-sm font-bold rounded-xl shadow-xs transition-all inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                Add Your First Category
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((cat) => (
              <div
                key={cat.id}
                className="bg-white border border-slate-200 rounded-2xl p-4 hover:shadow-md transition-all group flex flex-col h-full"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center overflow-hidden shrink-0">
                    {cat.image ? (
                      <SafeImage src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-5 h-5 text-slate-300" />
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(cat)}
                      className="p-1.5 text-slate-400 hover:text-blue-600 bg-slate-50 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                      title="Edit Category"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleOpenDelete(cat)}
                      className="p-1.5 text-slate-400 hover:text-red-600 bg-slate-50 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                      title="Delete Category"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="font-bold text-slate-900 leading-tight mb-1 truncate" title={cat.name}>
                    {cat.name}
                  </h3>
                  <div className="text-[11px] font-mono text-slate-500 mb-2 truncate" title={cat.slug}>
                    /{cat.slug}
                  </div>
                  {cat.description && (
                    <p className="text-xs text-slate-500 line-clamp-2 mb-3 leading-relaxed">
                      {cat.description}
                    </p>
                  )}
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                  <div className="flex flex-col gap-1">
                    <span className="text-slate-400 uppercase text-[9px] tracking-wider">Status</span>
                    {cat.isActive ? (
                      <span className="flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                        <XCircle className="w-3 h-3" /> Hidden
                      </span>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 items-end">
                    <span className="text-slate-400 uppercase text-[9px] tracking-wider">Products</span>
                    <span className="bg-[#FFF2E8] text-[#FC5C03] px-2 py-0.5 rounded-md">
                      {cat.productCount} Item{cat.productCount !== 1 && "s"}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ADD/EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <h2 className="text-lg font-black text-slate-900">
                {modalMode === "ADD" ? "Add New Category" : "Edit Category"}
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Category Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFormData({
                      ...formData,
                      name: val,
                      slug: modalMode === "ADD" ? val.toLowerCase().replace(/[^a-z0-9]+/g, "-") : formData.slug,
                    });
                  }}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:border-[#FC5C03] focus:ring-2 focus:ring-[#FC5C03]/20 transition-all outline-none"
                  placeholder="e.g. AI Tools"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Slug (URL Path)
                </label>
                <input
                  type="text"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:border-[#FC5C03] focus:ring-2 focus:ring-[#FC5C03]/20 transition-all outline-none font-mono"
                  placeholder="e.g. ai-tools"
                />
                <p className="text-[10px] text-slate-500 mt-1">Leave empty to auto-generate from name.</p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Image URL
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:border-[#FC5C03] focus:ring-2 focus:ring-[#FC5C03]/20 transition-all outline-none"
                  placeholder="https://..."
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                  Description
                </label>
                <textarea
                  rows={2}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:border-[#FC5C03] focus:ring-2 focus:ring-[#FC5C03]/20 transition-all outline-none resize-none"
                  placeholder="Brief description about the category..."
                />
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.displayOrder}
                    onChange={(e) => setFormData({ ...formData, displayOrder: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:border-[#FC5C03] focus:ring-2 focus:ring-[#FC5C03]/20 transition-all outline-none"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wider">
                    Status
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer pt-2">
                    <input
                      type="checkbox"
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="w-4 h-4 text-[#FC5C03] border-slate-300 rounded focus:ring-[#FC5C03]"
                    />
                    <span className="text-sm font-medium text-slate-700">Active (Visible)</span>
                  </label>
                </div>
              </div>

              <div className="pt-4 mt-2 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 text-sm font-bold rounded-xl transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-sm font-bold rounded-xl shadow-xs transition-all disabled:opacity-70 flex items-center gap-2 cursor-pointer"
                >
                  {isSubmitting && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  {modalMode === "ADD" ? "Create Category" : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM MODAL */}
      {deleteModalOpen && deletingCategory && (
        <div className="fixed inset-0 z-[100] bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <div className="w-12 h-12 rounded-full bg-red-50 flex items-center justify-center mb-4 mx-auto">
              <AlertTriangle className="w-6 h-6 text-red-500" />
            </div>
            <h3 className="text-lg font-black text-slate-900 text-center mb-2">Delete Category?</h3>
            <p className="text-sm text-slate-500 text-center mb-6">
              Are you sure you want to delete the category &quot;<strong>{deletingCategory.name}</strong>&quot;?
            </p>

            {deletingCategory.productCount > 0 && (
              <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex gap-3 text-red-800">
                <AlertTriangle className="w-5 h-5 shrink-0" />
                <div className="text-sm font-medium">
                  This category currently has <strong className="font-black">{deletingCategory.productCount}</strong> products. You must reassign or delete these products before deleting this category.
                </div>
              </div>
            )}

            <div className="flex gap-3 w-full">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-bold rounded-xl transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting || deletingCategory.productCount > 0}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white text-sm font-bold rounded-xl shadow-xs transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
              >
                {isDeleting ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
                Delete Category
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
