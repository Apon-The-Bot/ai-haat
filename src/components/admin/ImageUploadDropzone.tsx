"use client";

import React, { useState, useRef, useCallback } from "react";
import {
  UploadCloud,
  Image as ImageIcon,
  CheckCircle2,
  Trash2,
  Copy,
  Check,
  RefreshCw,
  Sparkles,
  Link2,
  ExternalLink,
  Layers,
} from "lucide-react";
import { uploadCompressedImage, CompressionOptions } from "@/lib/image-compression";

interface ImageUploadDropzoneProps {
  value?: string;
  onChange: (url: string) => void;
  label?: string;
  hint?: string;
  options?: CompressionOptions;
  className?: string;
}

export default function ImageUploadDropzone({
  value = "",
  onChange,
  label = "প্রোডাক্ট ইমেজ / থাম্বনেইল",
  hint = "যেকোনো সাইজের JPG, PNG, WEBP আপলোড করুন — স্বয়ংক্রিয়ভাবে কম্প্রেস ও WebP হয়ে যাবে",
  options = { maxWidth: 1200, maxHeight: 1200, quality: 0.82 },
  className = "",
}: ImageUploadDropzoneProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [stats, setStats] = useState<{ originalKB: number; compressedKB: number; savings: number } | null>(null);
  const [copied, setCopied] = useState(false);
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [manualUrl, setManualUrl] = useState(value);

  const handleFileProcess = async (file: File) => {
    if (!file || !file.type.startsWith("image/")) {
      alert("অনুগ্রহ করে একটি বৈধ ইমেজ ফাইল নির্বাচন করুন (JPG, PNG, WebP ইত্যাদি)।");
      return;
    }

    try {
      setIsUploading(true);
      setStats(null);

      const result = await uploadCompressedImage(file, options, (msg) => {
        setStatusMessage(msg);
      });

      if (result.success && result.url) {
        onChange(result.url);
        setManualUrl(result.url);
        setStats({
          originalKB: result.originalSizeKB,
          compressedKB: result.compressedSizeKB,
          savings: result.savingsPercent,
        });
      } else {
        alert(result.error || "ইমেজ আপলোড ব্যর্থ হয়েছে।");
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    } finally {
      setIsUploading(false);
      setStatusMessage("");
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const onDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const onDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
        handleFileProcess(e.dataTransfer.files[0]);
      }
    },
    [options]
  );

  const handleCopy = () => {
    if (!value) return;
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`space-y-2.5 ${className}`}>
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <span>{label}</span>
          <span className="px-2 py-0.5 bg-[#FFF2E8] text-[#FC5C03] text-[10px] font-black rounded-md inline-flex items-center gap-1">
            <Sparkles className="w-3 h-3" /> Auto WebP & Compact
          </span>
        </label>

        <button
          type="button"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-[11px] font-bold text-slate-500 hover:text-[#FC5C03] transition-colors flex items-center gap-1 cursor-pointer"
        >
          <Link2 className="w-3 h-3" />
          <span>{showUrlInput ? "ড্রপজোন ভিউ" : "সরাসরি URL দিন"}</span>
        </button>
      </div>

      {showUrlInput ? (
        <div className="flex gap-2">
          <input
            type="text"
            value={manualUrl}
            onChange={(e) => {
              setManualUrl(e.target.value);
              onChange(e.target.value);
            }}
            placeholder="https://... অথবা /uploads/..."
            className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-900 focus:outline-none focus:border-[#FC5C03]"
          />
          {value && (
            <div className="w-10 h-10 rounded-xl border border-slate-200 overflow-hidden bg-slate-100 flex-shrink-0">
              <img src={value} alt="Preview" className="w-full h-full object-cover" />
            </div>
          )}
        </div>
      ) : value ? (
        /* Preview State */
        <div className="p-4 bg-slate-50 border border-slate-200/90 rounded-2xl flex flex-col sm:flex-row items-center gap-4 transition-all">
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-xl overflow-hidden bg-white border border-slate-200 shadow-xs flex-shrink-0 group">
            <img src={value} alt="Preview" className="w-full h-full object-contain p-1" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
              <a
                href={value}
                target="_blank"
                rel="noreferrer"
                className="p-2 bg-white/90 text-slate-900 rounded-full hover:bg-white transition-all shadow-sm"
                title="Open original"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>

          <div className="flex-1 w-full space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-slate-700 truncate max-w-[200px] sm:max-w-xs block">
                {value.split("/").pop()}
              </span>
              <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-bold rounded-md flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3" /> Ready
              </span>
            </div>

            {stats && (
              <div className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 inline-block">
                ⚡ সাইজ কমেছে: {stats.originalKB} KB ➔ <b>{stats.compressedKB} KB</b> ({stats.savings}%
                সঞ্চয়)
              </div>
            )}

            <div className="flex items-center gap-2 pt-1 flex-wrap">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 text-xs font-bold rounded-lg transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isUploading ? "animate-spin" : ""}`} />
                <span>নতুন ছবি দিন</span>
              </button>

              <button
                type="button"
                onClick={handleCopy}
                className="px-3 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-bold rounded-lg transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">কপি হয়েছে</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>URL কপি</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  onChange("");
                  setManualUrl("");
                  setStats(null);
                }}
                className="px-3 py-1.5 bg-white border border-red-200 hover:bg-red-50 text-red-600 text-xs font-bold rounded-lg transition-all shadow-xs flex items-center gap-1.5 cursor-pointer ml-auto"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>রিমুভ</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* Dropzone Empty State */
        <div
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          onDrop={onDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center gap-2 relative ${
            isDragging
              ? "border-[#FC5C03] bg-[#FFF2E8]/40 scale-[1.01]"
              : "border-slate-300 hover:border-[#FC5C03] hover:bg-slate-50/70 bg-slate-50/30"
          }`}
        >
          {isUploading ? (
            <div className="space-y-2 py-4">
              <RefreshCw className="w-8 h-8 animate-spin text-[#FC5C03] mx-auto" />
              <p className="text-xs font-bold text-slate-800">{statusMessage || "কম্প্রেসিং ও আপলোড হচ্ছে..."}</p>
              <p className="text-[11px] text-slate-400">WebP ফরম্যাটে অপ্টিমাইজেশন চলছে</p>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 rounded-2xl bg-[#FFF2E8] text-[#FC5C03] flex items-center justify-center shadow-xs">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div className="space-y-0.5">
                <p className="text-xs font-bold text-slate-900">
                  <span className="text-[#FC5C03] underline">ছবি ব্রাউজ করুন</span> অথবা এখানে টেনে এনে ছেড়ে দিন
                </p>
                <p className="text-[11px] text-slate-500">{hint}</p>
              </div>
            </>
          )}
        </div>
      )}

      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileProcess(file);
        }}
      />
    </div>
  );
}
