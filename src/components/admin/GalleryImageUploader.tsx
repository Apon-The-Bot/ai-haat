"use client";

import React, { useState, useRef } from "react";
import {
  UploadCloud,
  Plus,
  Trash2,
  Image as ImageIcon,
  RefreshCw,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { uploadCompressedImage } from "@/lib/image-compression";

interface GalleryImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  label?: string;
}

export default function GalleryImageUploader({
  images = [],
  onChange,
  label = "প্রোডাক্ট গ্যালারি ইমেজ (Multiple)",
}: GalleryImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [uploadingCount, setUploadingCount] = useState(0);

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const fileList = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (fileList.length === 0) return;

    setUploadingCount(fileList.length);

    try {
      const uploadedUrls: string[] = [];

      for (const file of fileList) {
        const res = await uploadCompressedImage(file, { maxWidth: 1200, quality: 0.82 });
        if (res.success && res.url) {
          uploadedUrls.push(res.url);
        }
      }

      if (uploadedUrls.length > 0) {
        onChange([...images, ...uploadedUrls]);
      }
    } catch (err: any) {
      console.error("Gallery upload error:", err);
      alert("গ্যালারি ইমেজ আপলোডে সমস্যা হয়েছে।");
    } finally {
      setUploadingCount(0);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeImage = (index: number) => {
    const next = images.filter((_, i) => i !== index);
    onChange(next);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <span>{label}</span>
          <span className="px-2 py-0.5 bg-[#FFF2E8] text-[#FC5C03] text-[10px] font-black rounded-md inline-flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Auto WebP
          </span>
        </label>
        <span className="text-xs text-slate-500 font-medium">মোট ছবি: {images.length} টি</span>
      </div>

      {/* Grid of Images */}
      <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
        {images.map((url, idx) => (
          <div
            key={idx}
            className="group relative aspect-square rounded-2xl border border-slate-200 overflow-hidden bg-slate-50 shadow-2xs hover:border-[#FC5C03] transition-all"
          >
            <img src={url} alt={`Gallery ${idx + 1}`} className="w-full h-full object-cover" />

            <div className="absolute inset-0 bg-slate-900/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1.5 p-2">
              <a
                href={url}
                target="_blank"
                rel="noreferrer"
                className="p-1.5 bg-white/90 hover:bg-white text-slate-800 rounded-lg transition-all"
                title="View full"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
              <button
                type="button"
                onClick={() => removeImage(idx)}
                className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all"
                title="Delete"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}

        {/* Upload More Trigger */}
        <button
          type="button"
          disabled={uploadingCount > 0}
          onClick={() => fileInputRef.current?.click()}
          className={`aspect-square rounded-2xl border-2 border-dashed border-slate-300 hover:border-[#FC5C03] hover:bg-[#FFF2E8]/20 flex flex-col items-center justify-center p-3 text-center transition-all cursor-pointer ${
            uploadingCount > 0 ? "bg-slate-50" : ""
          }`}
        >
          {uploadingCount > 0 ? (
            <div className="space-y-1">
              <RefreshCw className="w-5 h-5 animate-spin text-[#FC5C03] mx-auto" />
              <span className="text-[10px] font-bold text-slate-600">
                {uploadingCount} টি আপলোড হচ্ছে...
              </span>
            </div>
          ) : (
            <div className="space-y-1">
              <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center mx-auto group-hover:bg-[#FFF2E8] group-hover:text-[#FC5C03]">
                <Plus className="w-4 h-4" />
              </div>
              <span className="text-[11px] font-bold text-slate-700 block">+ ছবি যুক্ত করুন</span>
              <span className="text-[9px] text-slate-400 block">বাল্ক ফাইল সিলেক্ট</span>
            </div>
          )}
        </button>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
      />
    </div>
  );
}
