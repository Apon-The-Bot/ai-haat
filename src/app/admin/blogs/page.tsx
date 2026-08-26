"use client";

import React, { useState } from "react";
import { FileText, Plus, Trash2, Edit, Search, Check, Sparkles, X } from "lucide-react";
import { BLOGS as initialBlogs } from "@/data/blogs";
import { useToast } from "@/context/ToastContext";

export default function AdminBlogsPage() {
  const { showToast } = useToast();
  const [blogsList, setBlogsList] = useState(initialBlogs);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("AI & Tech");
  const [excerpt, setExcerpt] = useState("");

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this blog post?")) {
      setBlogsList((prev) => prev.filter((b) => b.id !== id));
      showToast("Blog post deleted successfully.", "success");
    }
  };

  const handleAddBlog = (e: React.FormEvent) => {
    e.preventDefault();
    const newBlog = {
      id: `b-${Date.now()}`,
      slug: title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      title,
      category,
      image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600",
      excerpt,
      content: excerpt,
      date: "Today",
      readTime: "4 mins read",
    };

    setBlogsList([newBlog as any, ...blogsList]);
    setIsAddModalOpen(false);
    showToast("New blog article published!", "success");
    setTitle("");
    setExcerpt("");
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900">Articles & Resource Guides</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">Publish guides, AI prompt tips, and marketplace announcements.</p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Write New Article</span>
        </button>
      </div>

      {/* Grid of Blogs (White Theme) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {blogsList.map((b) => (
          <div
            key={b.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 shadow-xs flex flex-col justify-between"
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="px-2 py-0.5 bg-[#FFF2E8] border border-[#FC5C03]/20 rounded text-[10.5px] font-bold text-[#FC5C03]">
                  {b.category}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{b.readTime}</span>
              </div>

              <h4 className="text-sm font-bold text-slate-900 leading-snug">{b.title}</h4>
              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">{b.excerpt}</p>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[10px] text-slate-400 font-mono">{b.date}</span>
              <button
                onClick={() => handleDelete(b.id)}
                className="p-1 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                title="Delete Article"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Blog Modal (White Theme) */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Create New Article</h3>
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

              <button
                type="submit"
                className="w-full py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white font-bold text-xs rounded-xl shadow-xs transition-colors cursor-pointer"
              >
                Publish Article
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
