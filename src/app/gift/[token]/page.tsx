import { Metadata } from "next";
import { notFound } from "next/navigation";
import { getGiftByClaimToken } from "@/lib/gifting/product-gifting";
import { GiftClaimClient, GiftClaimData } from "./GiftClaimClient";

interface PageProps {
  params: Promise<{
    token: string;
  }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { token } = await params;
  const gift = await getGiftByClaimToken(token);

  if (!gift) {
    return {
      title: "ডিজিটাল উপহার পাওয়া যায়নি | AI Haat",
      description: "AI Haat ডিজিটাল গিফট ক্লেইম পোর্টাল",
    };
  }

  const firstItemName = gift.items[0]?.productName || "ডিজিটাল প্রোডাক্ট";

  return {
    title: `🎁 ${gift.recipientName}, আপনার জন্য একটি উপহার পাঠিয়েছেন ${gift.senderName}! | AI Haat`,
    description: `${gift.senderName} আপনাকে ${firstItemName} উপহার পাঠিয়েছেন। এখনই আনবক্স করুন!`,
    openGraph: {
      title: `🎁 ${gift.recipientName}, আপনার জন্য একটি বিশেষ উপহার এসেছে!`,
      description: `${gift.senderName} আপনাকে ${firstItemName} উপহার পাঠিয়েছেন। আনবক্স করতে ট্যাপ করুন।`,
      images: [
        {
          url: "https://aihaat.shop/images/og-image.png",
          width: 1200,
          height: 630,
          alt: "AI Haat Digital Gift",
        },
      ],
    },
  };
}

export default async function GiftClaimPage({ params }: PageProps) {
  const { token } = await params;
  if (!token) notFound();

  const gift = await getGiftByClaimToken(token);
  if (!gift) {
    notFound();
  }

  return <GiftClaimClient initialGift={gift as GiftClaimData} token={token} />;
}
