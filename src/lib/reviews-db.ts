import { prisma } from "@/lib/prisma";
import { Review } from "@/types";
import { REVIEWS as seedReviews } from "@/data/reviews";
import fs from "fs";
import path from "path";

const dataDir = path.join(process.cwd(), "data");
const reviewsFile = path.join(dataDir, "reviews.json");

function ensureDir() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(reviewsFile)) {
    fs.writeFileSync(reviewsFile, JSON.stringify(seedReviews, null, 2), "utf-8");
  }
}

function getLocalReviews(): Review[] {
  ensureDir();
  try {
    const raw = fs.readFileSync(reviewsFile, "utf-8");
    const parsed = JSON.parse(raw) as Review[];
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    return seedReviews;
  } catch {
    return seedReviews;
  }
}

function saveLocalReviews(reviews: Review[]) {
  ensureDir();
  fs.writeFileSync(reviewsFile, JSON.stringify(reviews, null, 2), "utf-8");
}

export interface ReviewFilters {
  productId?: string;
  status?: string;
  search?: string;
  limit?: number;
}

export async function getAllReviews(filters?: ReviewFilters): Promise<Review[]> {
  try {
    const whereClause: any = {};

    if (filters?.status && filters.status !== "ALL") {
      whereClause.status = filters.status.toUpperCase();
    } else if (!filters?.status) {
      whereClause.status = { in: ["APPROVED", "approved"] };
    }

    if (filters?.productId && filters.productId !== "all") {
      whereClause.OR = [
        { productId: filters.productId },
        { product: { slug: filters.productId } },
      ];
    }

    const dbReviews = await prisma.review.findMany({
      where: whereClause,
      include: {
        product: {
          select: {
            id: true,
            slug: true,
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: filters?.limit,
    });

    if (dbReviews && dbReviews.length > 0) {
      let mapped = dbReviews.map((r) => ({
        id: r.id,
        author: r.author,
        userName: r.author,
        rating: r.rating,
        date: r.createdAt.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        }),
        comment: r.comment,
        isVerifiedPurchase: r.isVerifiedPurchase,
        status: (r.status.toUpperCase() as "APPROVED" | "PENDING" | "REJECTED"),
        productId: r.productId,
        productName: r.product?.name || "AI Haat Product",
        createdAt: r.createdAt.toISOString(),
      }));

      if (filters?.search) {
        const q = filters.search.toLowerCase().trim();
        mapped = mapped.filter(
          (r) =>
            r.author.toLowerCase().includes(q) ||
            r.comment.toLowerCase().includes(q) ||
            (r.productName && r.productName.toLowerCase().includes(q))
        );
      }

      return mapped;
    }
  } catch (err) {
    console.warn("[Prisma getAllReviews fallback to local]:", err);
  }

  let local = getLocalReviews();

  if (filters?.status && filters.status !== "ALL") {
    const targetStatus = filters.status.toUpperCase();
    local = local.filter((r) => (r.status?.toUpperCase() || "APPROVED") === targetStatus);
  }

  if (filters?.productId && filters.productId !== "all") {
    const pId = filters.productId.toLowerCase().trim();
    local = local.filter(
      (r) =>
        (r.productId && r.productId.toLowerCase() === pId) ||
        (r.productName && r.productName.toLowerCase().includes(pId))
    );
  }

  if (filters?.search) {
    const q = filters.search.toLowerCase().trim();
    local = local.filter(
      (r) =>
        r.author.toLowerCase().includes(q) ||
        r.comment.toLowerCase().includes(q) ||
        (r.productName && r.productName.toLowerCase().includes(q))
    );
  }

  if (filters?.limit && filters.limit > 0) {
    local = local.slice(0, filters.limit);
  }

  return local;
}

export async function createReview(input: {
  userId?: string;
  userName?: string;
  author?: string;
  rating: number;
  comment: string;
  productId?: string;
  productName?: string;
  isVerifiedPurchase?: boolean;
  status?: "APPROVED" | "PENDING" | "REJECTED" | string;
}): Promise<Review> {
  const authorName = (input.userName || input.author || "Anonymous Customer").trim();
  const normalizedRating = Math.max(1, Math.min(5, Math.round(input.rating || 5)));
  const dateStr = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const reviewStatus = (input.status ? input.status.toUpperCase() : "PENDING") as "APPROVED" | "PENDING" | "REJECTED";

  const newReview: Review = {
    id: `rev-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
    author: authorName,
    userName: authorName,
    rating: normalizedRating,
    date: dateStr,
    comment: input.comment.trim(),
    isVerifiedPurchase: input.isVerifiedPurchase ?? false,
    status: reviewStatus,
    productId: input.productId || "p-chatgpt-plus",
    productName: input.productName || "Verified Product",
    userId: input.userId,
    createdAt: new Date().toISOString(),
  };

  // 1. Save to local JSON storage for resilience
  const local = getLocalReviews();
  local.unshift(newReview);
  saveLocalReviews(local);

  // 2. Persist to Prisma DB if available
  try {
    let matchedProductId = input.productId;

    if (matchedProductId) {
      const existingProduct = await prisma.product.findFirst({
        where: {
          OR: [{ id: matchedProductId }, { slug: matchedProductId }],
        },
      });
      if (existingProduct) {
        matchedProductId = existingProduct.id;
      } else {
        // Find any product to attach or create a minimal one
        const fallbackProd = await prisma.product.findFirst();
        matchedProductId = fallbackProd ? fallbackProd.id : undefined;
      }
    }

    if (matchedProductId) {
      const dbReview = await prisma.review.create({
        data: {
          id: newReview.id,
          productId: matchedProductId,
          author: newReview.author,
          rating: newReview.rating,
          comment: newReview.comment,
          isVerifiedPurchase: newReview.isVerifiedPurchase,
          status: newReview.status || "PENDING",
        },
        include: {
          product: {
            select: { name: true },
          },
        },
      });

      if (dbReview?.product?.name) {
        newReview.productName = dbReview.product.name;
      }
    }
  } catch (err) {
    console.error("[Prisma createReview error]:", err);
  }

  return newReview;
}
