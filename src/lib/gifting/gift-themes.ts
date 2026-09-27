import { GiftTheme } from "@/types";

export interface GiftThemeConfig {
  id: GiftTheme;
  nameEn: string;
  nameBn: string;
  emoji: string;
  gradient: string;
  accentColor: string;
  ribbonColor: string;
  cardBg: string;
  taglineEn: string;
  taglineBn: string;
}

export const GIFT_THEMES: Record<GiftTheme, GiftThemeConfig> = {
  neon: {
    id: "neon",
    nameEn: "Neon Tech / AI Glow",
    nameBn: "🌟 নিয়ন টেক / এআই গ্লো",
    emoji: "⚡",
    gradient: "from-cyan-500 via-indigo-600 to-purple-600",
    accentColor: "#06B6D4",
    ribbonColor: "#A855F7",
    cardBg: "bg-gradient-to-br from-slate-950 via-indigo-950 to-purple-950 text-white",
    taglineEn: "Supercharge your workflow with this digital surprise!",
    taglineBn: "তোমার কাজকে আরও সুপারচার্জ করতে এই ডিজিটাল সারপ্রাইজ!",
  },
  birthday: {
    id: "birthday",
    nameEn: "Birthday Joy & Confetti",
    nameBn: "🎂 শুভ জন্মদিন ও আনন্দ",
    emoji: "🎂",
    gradient: "from-amber-400 via-rose-500 to-orange-500",
    accentColor: "#F59E0B",
    ribbonColor: "#EF4444",
    cardBg: "bg-gradient-to-br from-amber-50 via-rose-50 to-orange-50 text-slate-900",
    taglineEn: "Wishing you a fantastic Birthday full of joy and success!",
    taglineBn: "জন্মদিনের একরাশ শুভেচ্ছা ও আগামী দিনগুলোর জন্য সাফল্য!",
  },
  festive: {
    id: "festive",
    nameEn: "Festive Celebration / Eid",
    nameBn: "🎉 উৎসবের আনন্দ / ঈদ মোবারক",
    emoji: "🎉",
    gradient: "from-emerald-500 via-teal-600 to-emerald-800",
    accentColor: "#10B981",
    ribbonColor: "#F59E0B",
    cardBg: "bg-gradient-to-br from-emerald-950 via-teal-950 to-slate-950 text-white",
    taglineEn: "Heartiest festive greetings and blessings on this special day!",
    taglineBn: "এই বিশেষ দিনে আন্তরিক উৎসবের শুভেচ্ছা ও শুভকামনা!",
  },
  friendship: {
    id: "friendship",
    nameEn: "Friendship & Gratitude",
    nameBn: "💖 বন্ধুত্ব ও আন্তরিক ধন্যবাদ",
    emoji: "💖",
    gradient: "from-rose-400 via-pink-500 to-rose-600",
    accentColor: "#F43F5E",
    ribbonColor: "#FB7185",
    cardBg: "bg-gradient-to-br from-rose-50 via-pink-50 to-rose-100 text-slate-900",
    taglineEn: "A small gift to thank you for always being there!",
    taglineBn: "সবসময় পাশে থাকার জন্য ভালোবাসার একটি ছোট্ট উপহার!",
  },
  midnight: {
    id: "midnight",
    nameEn: "Pro Hustler / Creator",
    nameBn: "🚀 প্রো ক্রিয়েটর / হ্যাসলার",
    emoji: "🚀",
    gradient: "from-slate-900 via-gray-900 to-zinc-950",
    accentColor: "#FC5C03",
    ribbonColor: "#FC5C03",
    cardBg: "bg-gradient-to-br from-slate-950 via-zinc-900 to-neutral-950 text-white",
    taglineEn: "Level up your craft and build something legendary!",
    taglineBn: "তোমার কাজের দক্ষতা আরও বাড়াতে এই প্রিমিয়াম গিফট!",
  },
};

export const QUICK_GREETINGS = [
  {
    tag: "🎂 জন্মদিন",
    message: "শুভ জন্মদিন দোস্ত! 🎂 তোমার জন্য এই বিশেষ ডিজিটাল উপহারটি পাঠালাম। দারুণভাবে উপভোগ কর!",
  },
  {
    tag: "🚀 ক্যারিয়ার ও ফ্রিল্যান্সিং",
    message: "তোমার কাজ ও ফ্রিল্যান্সিং ক্যারিয়ারের জন্য অনেক শুভকামনা! 🚀 আশা করি টুলসটি তোমার কাজের গতি দ্বিগুণ করবে।",
  },
  {
    tag: "🎉 ঈদ ও উৎসব",
    message: "ঈদ মোবারক! 🎉 উৎসবের খুশিতে তোমার জন্য ছোট একটি ডিজিটাল উপহার। ভালো থেকো সবসময়।",
  },
  {
    tag: "💖 আন্তরিক ধন্যবাদ",
    message: "সবসময় একজন দারুণ বন্ধু ও শুভাকাঙ্ক্ষী হিসেবে পাশে থাকার জন্য অসংখ্য ধন্যবাদ! ❤️",
  },
];
