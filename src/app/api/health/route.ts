import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const startTime = Date.now();
  const checks: Record<string, { status: "UP" | "DOWN" | "WARN"; latencyMs?: number; message?: string }> = {};

  // 1. Database Connection & Latency Check
  try {
    const dbStart = Date.now();
    await prisma.$queryRaw`SELECT 1`;
    checks.database = {
      status: "UP",
      latencyMs: Date.now() - dbStart,
    };
  } catch (err: any) {
    checks.database = {
      status: "DOWN",
      message: process.env.NODE_ENV === "production" ? "Database connection unavailable" : (err?.message || "Database connection failed"),
    };
  }

  // 2. Encryption Keys Check
  const hasMfaKey = Boolean(process.env.MFA_ENCRYPTION_KEY);
  const hasNextAuthSecret = Boolean(process.env.NEXTAUTH_SECRET);

  if (hasMfaKey && hasNextAuthSecret) {
    checks.security_keys = {
      status: "UP",
      message: "Cryptographic keys configured",
    };
  } else {
    checks.security_keys = {
      status: "WARN",
      message: "One or more security keys missing (using fallback development defaults)",
    };
  }

  // 3. SMTP Mailer Check
  const hasSmtp = Boolean(process.env.SMTP_HOST && process.env.SMTP_USER);
  checks.smtp_mailer = {
    status: hasSmtp ? "UP" : "WARN",
    message: hasSmtp ? "Hostinger SMTP configured" : "Simulated email mode active (no SMTP env)",
  };

  // 4. Payment Gateway Check
  const hasPipraPay = Boolean(process.env.PIPRAPAY_API_KEY && process.env.PIPRAPAY_MERCHANT_ID);
  checks.payment_gateway = {
    status: hasPipraPay ? "UP" : "WARN",
    message: hasPipraPay ? "PipraPay credentials loaded" : "Development test gateway mode active",
  };

  // 5. Telegram Bot Check
  const hasTelegram = Boolean(process.env.TELEGRAM_BOT_TOKEN && (process.env.TELEGRAM_ADMIN_CHAT_ID || process.env.TELEGRAM_CHAT_ID));
  checks.telegram_bot = {
    status: hasTelegram ? "UP" : "WARN",
    message: hasTelegram ? "Telegram notifications active" : "Telegram bot disabled / unconfigured",
  };

  const isHealthy = checks.database.status === "UP";
  const totalResponseTimeMs = Date.now() - startTime;

  return NextResponse.json(
    {
      status: isHealthy ? "HEALTHY" : "UNHEALTHY",
      environment: process.env.NODE_ENV || "development",
      domain: "aihaat.shop",
      timestamp: new Date().toISOString(),
      responseTimeMs: totalResponseTimeMs,
      uptimeSeconds: Math.floor(process.uptime()),
      memoryUsage: {
        rssMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
        heapUsedMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
      },
      checks,
    },
    { status: isHealthy ? 200 : 503 }
  );
}
