"use client";

import React from "react";
import Link from "next/link";
import { BookOpen, Clock, ChevronRight } from "lucide-react";
import { BLOGS } from "@/data/blogs";
import { SafeImage } from "@/components/SafeImage";

export default function BlogPage() {
  return (
    <div className="w-full bg-white py-8 sm:py-12 min-h-[75vh]">
      <div className="max-w-[1500px] w-[calc(100%-24px)] md:w-[calc(100%-40px)] lg:w-[calc(100%-48px)] mx-auto">
        
        {/* Title */}
        <div className="text-center max-w-xl mx-auto mb-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#FFF2E8] text-[#FC5C03] rounded-full text-xs font-bold uppercase tracking-wider mb-2">
            <BookOpen className="w-3.5 h-3.5" />
            <span>ব্লগ ও টেক গাইড</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-[#1A1D26] tracking-tight">
            ডিজিটাল টেক ও সফটওয়্যার গাইড
          </h1>
          <p className="text-xs sm:text-sm text-[#4B5563] mt-1">
            এআই টুলস, সফটওয়্যার ট্রিকস এবং প্রিমিয়াম সাবস্ক্রিপশন সংক্রান্ত তথ্যমূলক আর্টিকেল।
          </p>
        </div>

        {/* Blog Posts Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {BLOGS.map((blog) => (
            <div
              key={blog.id}
              className="bg-white rounded-xl border border-[#E8E8EE] overflow-hidden shadow-2xs hover:border-[#FC5C03]/50 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="relative aspect-video w-full bg-gray-50 overflow-hidden">
                  <SafeImage
                    src={blog.image}
                    alt={blog.title}
                    aspectRatio="16/9"
                    objectFit="cover"
                    className="group-hover:scale-105 transition-transform duration-300"
                    sizes="(max-width: 768px) 100vw, 33vw"
                  />
                  <span className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-[#1A1D26] text-white text-[10px] font-bold rounded-md">
                    {blog.category}
                  </span>
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-2 text-[11px] text-gray-400">
                    <span>{blog.date}</span>
                    <span>•</span>
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      <span>{blog.readTime}</span>
                    </div>
                  </div>

                  <h3 className="text-sm font-bold text-[#1A1D26] group-hover:text-[#FC5C03] transition-colors leading-snug">
                    {blog.title}
                  </h3>

                  <p className="text-xs text-[#4B5563] line-clamp-2 leading-relaxed">
                    {blog.excerpt}
                  </p>
                </div>
              </div>

              <div className="p-4 pt-0">
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#FC5C03] group-hover:underline">
                  <span>সম্পূর্ণ পড়ুন</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
