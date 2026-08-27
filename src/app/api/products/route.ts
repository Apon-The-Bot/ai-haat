import { NextRequest, NextResponse } from "next/server";
import { getAllProducts, createProduct, updateProductInDB, deleteProductFromDB } from "@/lib/products-db";
import { PRODUCTS } from "@/data/products";

export async function GET(req: NextRequest) {
  try {
    const dbProducts = await getAllProducts();
    // Merge or fallback to PRODUCTS if DB is empty
    const products = dbProducts.length > 0 ? dbProducts : PRODUCTS;
    return NextResponse.json({ success: true, products });
  } catch (error: any) {
    console.error("[Products GET Error]:", error);
    return NextResponse.json({ success: true, products: PRODUCTS });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      name,
      slug,
      category,
      categories,
      image,
      minPriceBDT,
      maxPriceBDT,
      deliveryMethod,
      shortDesc,
      descriptionBangla,
      descriptionEnglish,
      features,
      info,
      variations,
      inStock,
      isFeatured,
      isBestProduct,
      isBestSelling,
      badge,
    } = body;

    if (!name) {
      return NextResponse.json({ error: "Product name is required" }, { status: 400 });
    }

    const finalSlug = slug || name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-");
    const newProduct = {
      id: `p-${Date.now()}`,
      slug: finalSlug,
      name,
      category: category || "AI Tools",
      categories: categories || [category || "AI Tools"],
      image: image || "/images/placeholders/aihaat-placeholder.svg",
      rating: 5.0,
      ratingCount: 1,
      viewCount: 100,
      badge: badge || (isBestProduct ? "Best Product" : undefined),
      minPriceBDT: Number(minPriceBDT) || 0,
      maxPriceBDT: Number(maxPriceBDT) || 0,
      deliveryMethod: deliveryMethod || "EMAIL",
      shortDesc: shortDesc || "Official subscription.",
      descriptionBangla: descriptionBangla || shortDesc || "অফিসিয়াল সাবস্ক্রিপশন।",
      descriptionEnglish: descriptionEnglish || shortDesc || "Official subscription with warranty.",
      features: features || ["Instant Delivery", "Full Warranty", "24/7 Support"],
      info: info || {
        deliveryTime: "5 to 15 mins",
        deliveryType: "Email & Digital Vault Dispatch",
        warranty: "Full Warranty",
        validity: "1 Month",
        deviceSupport: "All Devices",
      },
      reviews: [],
      variations: (variations || []).map((v: any, i: number) => ({
        id: v.id || `v-${i}`,
        name: v.name,
        priceBDT: Number(v.priceBDT) || 0,
        originalPriceBDT: v.originalPriceBDT ? Number(v.originalPriceBDT) : undefined,
        description: v.description || "",
        inStock: v.inStock ?? true,
      })),
      inStock: inStock ?? true,
      isFeatured: isFeatured ?? false,
      isBestProduct: isBestProduct ?? false,
      isBestSelling: isBestSelling ?? false,
    };

    const saved = await createProduct(newProduct as any);

    return NextResponse.json({
      success: true,
      message: "Product created and saved to database successfully.",
      product: saved,
    });
  } catch (error: any) {
    console.error("[Products POST Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to create product" },
      { status: 500 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, slug, inStock, isFeatured, isBestProduct, isBestSelling, badge } = body;

    const target = id || slug;
    if (!target) {
      return NextResponse.json({ error: "Product id or slug is required" }, { status: 400 });
    }

    const updated = await updateProductInDB(target, {
      ...(inStock !== undefined ? { inStock } : {}),
      ...(isFeatured !== undefined ? { isFeatured } : {}),
      ...(isBestProduct !== undefined ? { isBestProduct } : {}),
      ...(isBestSelling !== undefined ? { isBestSelling } : {}),
      ...(badge !== undefined ? { badge } : {}),
    });

    return NextResponse.json({
      success: true,
      message: "Product updated successfully",
      product: updated,
    });
  } catch (error: any) {
    console.error("[Products PATCH Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to update product" },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Product id is required" }, { status: 400 });
    }

    await deleteProductFromDB(id);

    return NextResponse.json({
      success: true,
      message: "Product deleted from database successfully.",
    });
  } catch (error: any) {
    console.error("[Products DELETE Error]:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to delete product" },
      { status: 500 }
    );
  }
}
