"use client";

import React, { useState, useRef } from "react";
import Image from "next/image";
import { UploadCloud, X, CheckCircle, Loader2, Image as ImageIcon } from "lucide-react";
import { useToast } from "@/context/ToastContext";

interface ImageUploadProps {
  value: string;
  onChange: (url: string) => void;
  label?: string;
  description?: string;
}

export function ImageUpload({
  value,
  onChange,
  label = "Product Image",
  description = "Upload high quality PNG, JPG, WebP or SVG (Recommended: 800x800px)",
}: ImageUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const { showToast } = useToast();

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showToast("দয়া করে শুধুমাত্র ইমেজ ফাইল (PNG, JPG, WebP, SVG) আপলোড করুন।", "error");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast("ইমেজের সাইজ সর্বোচ্চ 5MB হতে পারে।", "error");
      return;
    }

    try {
      setIsUploading(true);
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.url) {
        onChange(data.url);
        showToast("ইমেজ সফলভাবে আপলোড হয়েছে!", "success");
      } else {
        throw new Error(data.error || "Failed to upload image");
      }
    } catch (err: any) {
      console.error("[Upload Error]:", err);
      showToast(err.message || "ইমেজ আপলোড ব্যর্থ হয়েছে।", "error");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleRemove = () => {
    onChange("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold text-[#1A1D26]">{label}</label>
        {value && (
          <span className="text-[11px] font-bold text-emerald-600 flex items-center gap-1">
            <CheckCircle className="w-3 h-3" />
            <span>Uploaded</span>
          </span>
        )}
      </div>

      <input
        type="file"
        ref={fileInputRef}
        accept="image/png, image/jpeg, image/webp, image/svg+xml"
        className="hidden"
        onChange={(e) => {
          if (e.target.files && e.target.files[0]) {
            handleFileUpload(e.target.files[0]);
          }
        }}
      />

      {value ? (
        <div className="relative group rounded-2xl border-2 border-dashed border-gray-200 bg-gray-50/50 p-4 flex items-center gap-4">
          <div className="w-24 h-24 relative rounded-xl border border-gray-200 overflow-hidden bg-white shrink-0 shadow-2xs">
            <Image
              src={value}
              alt="Uploaded Preview"
              fill
              className="object-contain p-1"
            />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[#1A1D26] truncate">{value.split("/").pop()}</p>
            <p className="text-[11px] text-gray-500 mt-0.5">Image uploaded and ready to use.</p>
            <div className="flex items-center gap-2 mt-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-3 py-1.5 bg-white border border-gray-200 hover:border-gray-300 rounded-lg text-xs font-bold text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Change Image
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1"
              >
                <X className="w-3.5 h-3.5" />
                <span>Remove</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragOver(true);
          }}
          onDragLeave={() => setIsDragOver(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 ${
            isDragOver
              ? "border-[#FC5C03] bg-[#FFF2E8]/40"
              : "border-gray-300 hover:border-gray-400 bg-gray-50/50 hover:bg-gray-50"
          }`}
        >
          <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200 shadow-2xs flex items-center justify-center text-[#FC5C03]">
            {isUploading ? (
              <Loader2 className="w-6 h-6 animate-spin" />
            ) : (
              <UploadCloud className="w-6 h-6" />
            )}
          </div>
          <div>
            <p className="text-xs font-bold text-[#1A1D26]">
              {isUploading ? "Uploading image..." : "Click to upload or drag & drop"}
            </p>
            <p className="text-[11px] text-gray-500 mt-0.5">{description}</p>
          </div>
        </div>
      )}
    </div>
  );
}
