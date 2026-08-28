import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const variations = [
    { name: "srv1497 with %23", url: "mysql://u298980084_ai_haat_db:Rhythm%23Aihaatdb01@srv1497.hstgr.io:3306/u298980084_ai_haat" },
    { name: "localhost with %23", url: "mysql://u298980084_ai_haat_db:Rhythm%23Aihaatdb01@localhost:3306/u298980084_ai_haat" },
    { name: "127.0.0.1 with %23", url: "mysql://u298980084_ai_haat_db:Rhythm%23Aihaatdb01@127.0.0.1:3306/u298980084_ai_haat" },
    { name: "srv1497 user without _db", url: "mysql://u298980084_ai_haat:Rhythm%23Aihaatdb01@srv1497.hstgr.io:3306/u298980084_ai_haat" },
    { name: "localhost user without _db", url: "mysql://u298980084_ai_haat:Rhythm%23Aihaatdb01@localhost:3306/u298980084_ai_haat" },
    { name: "127.0.0.1 user without _db", url: "mysql://u298980084_ai_haat:Rhythm%23Aihaatdb01@127.0.0.1:3306/u298980084_ai_haat" },
    { name: "Current env DATABASE_URL", url: process.env.DATABASE_URL || "MISSING" },
  ];

  const results: any[] = [];

  for (const v of variations) {
    if (v.url === "MISSING") {
      results.push({ name: v.name, status: "SKIPPED", error: "Missing env" });
      continue;
    }
    try {
      const client = new PrismaClient({
        datasources: { db: { url: v.url } },
      });
      const count = await client.product.count();
      await client.$disconnect();
      results.push({ name: v.name, status: "SUCCESS", count, urlTested: v.url.replace(/:[^:@]+@/, ":***@") });
    } catch (e: any) {
      results.push({ name: v.name, status: "FAILED", error: e.message.split("\n").filter(Boolean).slice(-2).join(" ") });
    }
  }

  return NextResponse.json({
    envUrlRedacted: (process.env.DATABASE_URL || "").replace(/:[^:@]+@/, ":***@"),
    results,
  });
}
