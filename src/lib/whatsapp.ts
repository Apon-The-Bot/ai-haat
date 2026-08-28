import { prisma } from "@/lib/prisma";

export async function getSupportWhatsAppNumber(): Promise<string> {
  let numberStr = "8801712345678"; // Fallback

  try {
    const setting = await (prisma as any).siteSetting?.findUnique({
      where: { key: "general_whatsapp" }
    });
    
    if (setting?.value) {
      numberStr = setting.value;
    } else if (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER) {
      numberStr = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
    }
  } catch (error) {
    console.error("Error fetching whatsapp number from DB, using fallback/env", error);
    if (process.env.NEXT_PUBLIC_WHATSAPP_NUMBER) {
      numberStr = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;
    }
  }

  // Strip non-digits
  const digits = numberStr.replace(/\D/g, "");
  
  // Format for BD
  if (digits.startsWith("0")) {
    return "88" + digits;
  }
  if (!digits.startsWith("880") && digits.length === 10) {
     return "880" + digits;
  }
  if (!digits.startsWith("88") && digits.length === 11) {
      return "88" + digits;
  }
  return digits;
}

export async function generateSafeWhatsAppUrl(params: {
  ticketNumber?: string;
  orderNumber?: string;
  category?: string;
  subject?: string;
}): Promise<string> {
  const number = await getSupportWhatsAppNumber();
  
  let text = "Hello AI Haat, I need help";
  const parts: string[] = [];
  
  if (params.ticketNumber) parts.push(`Ticket #${params.ticketNumber}`);
  if (params.orderNumber) parts.push(`Order #${params.orderNumber}`);
  
  if (parts.length > 0) {
    text += ` with ${parts.join(" (")}${parts.length > 1 ? ")" : ""}`;
  }
  
  if (params.category) {
    text += `.\nCategory: ${params.category}`;
  }
  if (params.subject) {
    text += `.\nSubject: ${params.subject}`;
  }

  // Strictly omit any sensitive stuff - we only format the URL string here safely
  const encodedText = encodeURIComponent(text);
  return `https://wa.me/${number}?text=${encodedText}`;
}
