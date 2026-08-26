"use client";

import React, { useState } from "react";
import { FileText, Plus, Trash2, Edit, Search, Check, Sparkles } from "lucide-react";
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
    if (confirm("আপনি কি নিশ্চিত এই ব্লগ পোস্টটি মুছে ফেলতে চান?")) {
      setBlogsList((prev) => prev.filter((b) => b.id !== id));
      showToast("ব্লগ পোস্ট মুছে ফেলা হয়েছে।", "success");
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
      date: "আজকে",
      readTime: "4 মিনিট",
    };

    setBlogsList([newBlog as any, ...blogsList]);
    setIsAddModalOpen(false);
    showToast("নতুন ব্লগ সফলভাবে প্রকাশিত হয়েছে!", "success");
    setTitle("");
    setExcerpt("");
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <h1 className="text-xl font-black text-white">ব্লগ ও গাইড ম্যানেজার (Blog Manager) ✍️</h1>
          <p className="text-xs text-slate-400">এআই ও টেক রিলেটেড আর্টিকেল এবং টিউটোরিয়াল প্রকাশ করুন</p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>+ নতুন ব্লগ লিখুন</span>
        </button>
      </div>

      {/* Blogs Table */}
      <div className="bg-slate-950/80 rounded-2xl border border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="py-3.5 px-4">শিরোনাম</th>
                <th className="py-3.5 px-4">ক্যাটাগরি</th>
                <th className="py-3.5 px-4">পড়ার সময়</th>
                <th className="py-3.5 px-4">তারিখ</th>
                <th className="py-3.5 px-4 text-right">অ্যাকশন</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/80 text-slate-300">
              {blogsList.map((blog) => (
                <tr key={blog.id} className="hover:bg-slate-900/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-white block">{blog.title}</span>
                    <span className="text-[10px] text-slate-500 font-mono">/blog/{blog.slug}</span>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded-md text-[10px] font-bold">
                      {blog.category}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-400">
                    {blog.readTime}
                  </td>

                  <td className="py-3.5 px-4 text-slate-500">
                    {blog.date}
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => handleDelete(blog.id)}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-red-950 text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-slate-950 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-sm font-bold text-white">+ নতুন ব্লগ প্রকাশ করুন</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleAddBlog} className="space-y-3.5">
              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">ব্লগের শিরোনাম *</label>
                <input
                  type="text"
                  required
                  placeholder="যেমন: চ্যাটজিপিটি প্লাস ব্যবহারের সেরা ৫টি টিপস"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">ক্যাটাগরি</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                >
                  <option value="AI & Tech">AI & Tech</option>
                  <option value="Tutorials">Tutorials</option>
                  <option value="Software Guide">Software Guide</option>
                  <option value="Security">Security</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-300 block mb-1">সংক্ষিপ্ত বিবরণ / কনটেন্ট *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="ব্লগ আর্টিকেলের মূল বিবরণ..."
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  className="w-full p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="w-1/3 py-2.5 border border-slate-800 text-slate-300 font-bold text-xs rounded-xl"
                >
                  বাতিল
                </button>
                <button
                  type="submit"
                  className="w-2/3 py-2.5 bg-[#FC5C03] hover:bg-[#EC4001] text-white font-bold text-xs rounded-xl"
                >
                  প্রকাশ করুন (Publish)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
