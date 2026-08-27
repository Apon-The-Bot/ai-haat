import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAllOrders, saveOrder, updateOrderStatus, findOrderByNumberOrPhone } from "@/lib/orders-db";
import { sendNewOrderTelegramAlert } from "@/utils/telegram";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query") || searchParams.get("search");
    const email = searchParams.get("email");
    const phone = searchParams.get("phone");

    // 1. Try Prisma MySQL Database
    try {
      const whereClause: any = {};

      if (email) {
        whereClause.customerEmail = {
          equals: email.trim(),
        };
      }

      if (phone) {
        whereClause.customerPhone = {
          contains: phone.trim(),
        };
      }

      if (query) {
        const clean = query.trim();
        whereClause.OR = [
          { orderNumber: { contains: clean } },
          { id: { contains: clean } },
          { customerName: { contains: clean } },
          { customerEmail: { contains: clean } },
          { customerPhone: { contains: clean } },
          { trxId: { contains: clean } },
        ];
      }

      const dbOrders = await prisma.order.findMany({
        where: whereClause,
        include: {
          items: true,
          deliveredKeys: true,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      if (dbOrders && dbOrders.length > 0) {
        const formatted = dbOrders.map((o) => ({
          id: o.orderNumber || o.id,
          orderNumber: o.orderNumber || o.id,
          userId: o.userId,
          customerName: o.customerName,
          customerEmail: o.customerEmail,
          customerPhone: o.customerPhone,
          items: o.items.map((it) => ({
            productId: it.productId,
            productName: it.productName,
            variationName: it.variationName,
            quantity: it.quantity,
            priceBDT: it.priceBDT,
            image: it.image,
          })),
          totalBDT: o.totalBDT,
          subtotalBDT: o.subtotalBDT,
          discountBDT: o.discountBDT,
          paymentMethod: o.paymentMethod,
          senderNumber: o.senderNumber,
          trxId: o.trxId,
          paymentStatus: o.paymentStatus === "VERIFIED" ? "Completed" : o.paymentStatus === "FAILED" ? "Failed" : "Pending",
          deliveryStatus:
            o.deliveryStatus === "DELIVERED"
              ? "Delivered"
              : o.deliveryStatus === "CANCELLED"
              ? "Cancelled"
              : o.deliveryStatus === "PROCESSING"
              ? "Processing"
              : o.deliveryStatus === "PREPARING"
              ? "Preparing"
              : "Order Placed",
          credentialsDelivered: o.deliveredKeys?.[0]?.credentials || null,
          deliveryInstructions: o.deliveredKeys?.[0]?.instructions || null,
          notes: o.notes,
          date: o.createdAt ? new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "Today",
          createdAt: o.createdAt.toISOString(),
          updatedAt: o.updatedAt.toISOString(),
        }));

        return NextResponse.json({ success: true, orders: formatted });
      }
    } catch (dbErr) {
      console.warn("[Prisma GET Orders fallback to JSON]:", dbErr);
    }

    // 2. Fallback to Local JSON DB if MySQL returned empty or threw
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
      orderId,
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

    const generatedNumber = orderNumber || orderId || `AH-${Math.floor(10000 + Math.random() * 90000)}`;
    const now = new Date();
    const dateFormatted = now.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });

    const parsedItems = items.map((it: any) => ({
      productId: it.id || it.productId || it.product?.id || "",
      productName: it.product?.name || it.productName || it.name || "Digital Product",
      variationName: it.selectedVariation?.name || it.variationName || "Standard",
      quantity: Number(it.quantity) || 1,
      priceBDT: Number(it.selectedVariation?.priceBDT || it.priceBDT || 0),
      image: it.product?.image || it.image || "",
    }));

    const newOrder = {
      id: generatedNumber,
      orderNumber: generatedNumber,
      customerName,
      customerEmail: customerEmail || "",
      customerPhone,
      items: parsedItems,
      totalBDT: Number(totalBDT) || 0,
      subtotalBDT: Number(subtotalBDT || totalBDT) || 0,
      discountBDT: Number(discountBDT || 0),
      paymentMethod: paymentMethod || "gateway",
      senderNumber: senderNumber || "",
      trxId: trxId || "",
      paymentStatus: "Pending" as any,
      deliveryStatus: "Order Placed" as any,
      notes: notes || "",
      date: dateFormatted,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    // 1. Save to Prisma MySQL
    try {
      let userRecord = null;
      if (customerEmail) {
        userRecord = await prisma.user.findUnique({
          where: { email: customerEmail },
        });
      }

      await prisma.order.upsert({
        where: { orderNumber: generatedNumber },
        create: {
          id: generatedNumber,
          orderNumber: generatedNumber,
          userId: userRecord?.id || null,
          customerName,
          customerEmail: customerEmail || "customer@aihaat.shop",
          customerPhone,
          notes: notes || null,
          subtotalBDT: Number(subtotalBDT || totalBDT) || 0,
          discountBDT: Number(discountBDT || 0),
          totalBDT: Number(totalBDT) || 0,
          paymentMethod: paymentMethod || "gateway",
          senderNumber: senderNumber || null,
          trxId: trxId || null,
          paymentStatus: "PENDING",
          deliveryStatus: "ORDER_PLACED",
          items: {
            create: parsedItems.map((p: any) => ({
              productId: p.productId || null,
              productName: p.productName,
              variationName: p.variationName,
              priceBDT: p.priceBDT,
              quantity: p.quantity,
              image: p.image || null,
            })),
          },
        },
        update: {
          customerName,
          customerEmail: customerEmail || "customer@aihaat.shop",
          customerPhone,
          totalBDT: Number(totalBDT) || 0,
          paymentMethod: paymentMethod || "gateway",
          updatedAt: now,
        },
      });
      console.log(`✓ Order ${generatedNumber} synced to Prisma MySQL DB`);
    } catch (prismaErr) {
      console.warn("[Prisma Order Create Error - Non-fatal]:", prismaErr);
    }

    // 2. Backup in JSON file
    saveOrder(newOrder);

    // 3. Dispatch Telegram Alert safely
    try {
      await sendNewOrderTelegramAlert({
        orderNumber: generatedNumber,
        customerName,
        customerPhone,
        customerEmail: customerEmail || "customer@aihaat.shop",
        items: parsedItems,
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

    // 1. Update in Prisma MySQL
    try {
      const pStatus =
        paymentStatus === "Completed" || paymentStatus === "VERIFIED"
          ? "VERIFIED"
          : paymentStatus === "Failed"
          ? "FAILED"
          : "PENDING";

      const dStatus =
        deliveryStatus === "Delivered" || deliveryStatus === "DELIVERED"
          ? "DELIVERED"
          : deliveryStatus === "Cancelled" || deliveryStatus === "CANCELLED"
          ? "CANCELLED"
          : deliveryStatus === "Processing" || deliveryStatus === "PROCESSING"
          ? "PROCESSING"
          : deliveryStatus === "Preparing"
          ? "PREPARING"
          : "ORDER_PLACED";

      const orderRecord = await prisma.order.findFirst({
        where: {
          OR: [{ orderNumber: orderId }, { id: orderId }],
        },
      });

      if (orderRecord) {
        await prisma.order.update({
          where: { id: orderRecord.id },
          data: {
            ...(paymentStatus ? { paymentStatus: pStatus as any } : {}),
            ...(deliveryStatus ? { deliveryStatus: dStatus as any } : {}),
          },
        });

        if (credentialsDelivered) {
          await prisma.deliveredKey.create({
            data: {
              orderId: orderRecord.id,
              userId: orderRecord.userId,
              productName: "Delivered Service",
              accountType: "Digital Credentials",
              credentials: credentialsDelivered,
              instructions: deliveryInstructions || null,
            },
          });
        }
      }
    } catch (prismaErr) {
      console.warn("[Prisma Order PATCH error]:", prismaErr);
    }

    // 2. Update in JSON DB
    const updated = updateOrderStatus(orderId, {
      ...(paymentStatus ? { paymentStatus } : {}),
      ...(deliveryStatus ? { deliveryStatus } : {}),
      ...(credentialsDelivered !== undefined ? { credentialsDelivered } : {}),
      ...(deliveryInstructions !== undefined ? { deliveryInstructions } : {}),
    });

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
