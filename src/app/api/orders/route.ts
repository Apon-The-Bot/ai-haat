import { NextRequest, NextResponse } from "next/server";
import { getAllOrders, saveOrder, updateOrderStatus, findOrderByNumberOrPhone } from "@/lib/orders-db";
import { sendNewOrderTelegramAlert } from "@/utils/telegram";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || searchParams.get("search");
    const email = searchParams.get("email");
    const phone = searchParams.get("phone");

    if (query) {
      const results = findOrderByNumberOrPhone(query);
      return NextResponse.json({ success: true, orders: results });
    }

    let orders = getAllOrders();

    if (email) {
      orders = orders.filter((o) => o.customerEmail?.toLowerCase() === email.toLowerCase());
    }

    if (phone) {
      orders = orders.filter((o) => o.customerPhone?.includes(phone));
    }

    return NextResponse.json({ success: true, orders });
  } catch (error: any) {
    console.error("[Orders GET Error]:", error);
    return NextResponse.json({ success: false, error: "Failed to fetch orders" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      orderNumber,
      customerName,
      customerPhone,
      customerEmail,
      items,
      totalBDT,
      subtotalBDT,
      discountBDT,
      paymentMethod,
      senderNumber,
      trxId,
      notes,
    } = body;

    if (!customerName || !customerPhone || !items || items.length === 0) {
      return NextResponse.json({ error: "Missing required order fields" }, { status: 400 });
    }

    const generatedNumber = orderNumber || `AH-${Date.now().toString().slice(-5)}`;
    const now = new Date();
    const dateFormatted = now.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const newOrder = {
      id: generatedNumber,
      orderNumber: generatedNumber,
      customerName,
      customerEmail: customerEmail || "",
      customerPhone,
      items: items.map((it: any) => ({
        productId: it.id || it.productId || "",
        productName: it.product?.name || it.productName || "Digital Product",
        variationName: it.selectedVariation?.name || it.variationName || "Standard",
        quantity: it.quantity || 1,
        priceBDT: it.selectedVariation?.priceBDT || it.priceBDT || 0,
        image: it.product?.image || it.image || "",
      })),
      totalBDT: Number(totalBDT) || 0,
      subtotalBDT: Number(subtotalBDT || totalBDT) || 0,
      discountBDT: Number(discountBDT || 0),
      paymentMethod: paymentMethod || "gateway",
      senderNumber: senderNumber || "",
      trxId: trxId || "",
      paymentStatus: (paymentMethod === "gateway" ? "Pending" : "Pending") as any,
      deliveryStatus: "Order Placed" as any,
      notes: notes || "",
      date: dateFormatted,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    saveOrder(newOrder);

    // Dispatch Telegram Alert safely
    try {
      await sendNewOrderTelegramAlert({
        orderNumber: generatedNumber,
        customerName,
        customerPhone,
        customerEmail: customerEmail || "customer@aihaat.shop",
        items,
        totalBDT,
        paymentMethod: paymentMethod || "gateway",
        senderNumber,
        trxId,
        notes,
      });
    } catch (tgErr) {
      console.warn("[Telegram Alert Error - Non-fatal]:", tgErr);
    }

    return NextResponse.json({
      success: true,
      message: "Order placed and saved successfully.",
      orderNumber: generatedNumber,
      order: newOrder,
    });
  } catch (error: any) {
    console.error("[Orders POST Error]:", error);
    return NextResponse.json({ error: error?.message || "Failed to process order" }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { orderId, paymentStatus, deliveryStatus, credentialsDelivered, deliveryInstructions } = body;

    if (!orderId) {
      return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
    }

    const updated = updateOrderStatus(orderId, {
      ...(paymentStatus ? { paymentStatus } : {}),
      ...(deliveryStatus ? { deliveryStatus } : {}),
      ...(credentialsDelivered !== undefined ? { credentialsDelivered } : {}),
      ...(deliveryInstructions !== undefined ? { deliveryInstructions } : {}),
    });

    if (!updated) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Order updated successfully.",
      order: updated,
    });
  } catch (error: any) {
    console.error("[Orders PATCH Error]:", error);
    return NextResponse.json({ error: error?.message || "Failed to update order" }, { status: 500 });
  }
}
