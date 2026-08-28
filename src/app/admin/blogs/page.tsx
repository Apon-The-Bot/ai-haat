"use client";

import React, { useState, useEffect } from "react";
import { FileText, Plus, Trash2, Edit, Search, Check, Sparkles, X, RefreshCw } from "lucide-react";
import { useToast } from "@/context/ToastContext";
import { ConfirmModal } from "@/components/ConfirmModal";

export default function AdminBlogsPage() {
  const { showToast } = useToast();
  const [blogsList, setBlogsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingBlogId, setDeletingBlogId] = useState<string | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("AI & Tech");
  const [excerpt, setExcerpt] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/blogs");
      if (res.ok) {
        const data = await res.json();
        if (data.blogs) {
          setBlogsList(data.blogs);
        }
      }
    } catch (err) {
      console.error("Failed to load blogs:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const confirmDelete = async () => {
    if (!deletingBlogId) return;
    try {
      const res = await fetch(`/api/admin/blogs?id=${encodeURIComponent(deletingBlogId)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setBlogsList((prev) => prev.filter((b) => b.id !== deletingBlogId));
        showToast("ব্লগ পোস্টটি সফলভাবে মুছে ফেলা হয়েছে।", "success");
      }
    } catch {
      showToast("Failed to delete article", "error");
    } finally {
      setDeletingBlogId(null);
    }
  };

  const handleAddBlog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !excerpt.trim()) return;

    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/blogs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          category,
          excerpt: excerpt.trim(),
        }),
      });

      const data = await res.json();
      if (res.ok && data.blog) {
        showToast("New blog article published and saved to database!", "success");
        setIsAddModalOpen(false);
        setTitle("");
        setExcerpt("");
        fetchBlogs();
      } else {
        showToast(data.error || "Failed to create article", "error");
      }
    } catch {
      showToast("Server error creating article", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-16">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFF2E8] text-[#FC5C03] rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <FileText className="w-3.5 h-3.5" />
            <span>Content CMS</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Articles & Guides</h1>
          <p className="text-sm text-slate-500 mt-0.5">Publish user guides, prompt engineer tutorials, and marketplace announcements.</p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Write New Article</span>
          </button>

          <button
            onClick={fetchBlogs}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-all cursor-pointer"
            title="Refresh"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
          </button>
        </div>
      </div>

      {/* Grid of Blogs */}
      {blogsList.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {blogsList.map((b) => (
            <div
              key={b.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-2xs flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="px-2 py-0.5 bg-[#FFF2E8] border border-[#FC5C03]/20 rounded text-[10.5px] font-bold text-[#FC5C03]">
                    {b.category}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono">{b.readTime}</span>
                </div>

                <h4 className="text-sm font-bold text-slate-900 leading-snug">{b.title}</h4>
                <p className="text-xs text-slate-500 line-clamp-3 leading-relaxed">{b.excerpt}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">{new Date(b.createdAt).toLocaleDateString()}</span>
                <button
                  onClick={() => setDeletingBlogId(b.id)}
                  className="p-1 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                  title="Delete Article"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8">
          <FileText className="w-10 h-10 text-slate-300 mx-auto mb-2" />
          <p className="font-bold text-slate-700 text-sm">No articles published yet</p>
          <p className="text-xs text-slate-400 mt-0.5">Click &apos;+ Write New Article&apos; above to publish guides.</p>
        </div>
      )}

      {/* Add Blog Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Create New Article</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-black cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddBlog} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Article Title *
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. 10 Best ChatGPT Prompts for Programmers"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-[#FC5C03] focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Category
                </label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-[#FC5C03] focus:outline-hidden"
                >
                  <option value="AI & Tech">AI & Tech</option>
                  <option value="Tutorials">Tutorials</option>
                  <option value="Offers & News">Offers & News</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Content / Summary *
                </label>
                <textarea
                  rows={4}
                  required
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder="Write your article summary and content here..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-[#FC5C03] focus:outline-hidden"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-6 py-2 bg-[#FC5C03] hover:bg-[#EC4001] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-50"
                >
                  {isSaving ? "Publishing..." : "Publish Article"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={Boolean(deletingBlogId)}
        onClose={() => setDeletingBlogId(null)}
        onConfirm={confirmDelete}
        title="আর্টিকেল মুছে ফেলা নিশ্চিতকরণ"
        message="আপনি কি নিশ্চিতভাবে এই আর্টিকেলটি মুছে ফেলতে চান?"
        confirmText="মুছে ফেলুন"
        cancelText="বাতিল"
        variant="danger"
      />

    </div>
  );
}
