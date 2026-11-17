import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireStaffAccess } from "@/lib/staff-access";
import { tryAutoFulfillOrder } from "@/lib/commerce/inventory";
import { Pagination } from "@/app/admin/reconciliation/view";
import { pageNumber, pageSize, type Query } from "@/app/admin/reconciliation/records";
import { StaffActionForm } from "../action-form";
import { StaffAccessRequired } from "../access-required";

const path = "/staff/fulfillment";
const eligible = {
  userId: { not: null },
  paymentStatus: "VERIFIED",
  deliveryStatus: { in: ["ORDER_PLACED", "PREPARING", "PROCESSING"] },
} as const satisfies import("@prisma/client").Prisma.OrderWhereInput;

async function fulfill(id: string) {
  "use server";
  const auth = await requireStaffAccess("FULFILLMENT");
  if (auth instanceof NextResponse) return { message: "Fulfillment permission and verified MFA are required." };
  const order = await prisma.order.findFirst({ where: { ...eligible, id }, select: { id: true } });
  if (!order) return { message: "This order is no longer eligible." };

  await prisma.adminAuditLog.create({
    data: {
      actorId: auth.user.id, actorEmail: auth.user.email,
      action: "STAFF_AUTO_FULFILL_REQUESTED", targetType: "ORDER", targetId: id,
    },
  });
  const result = await tryAutoFulfillOrder(order.id, { exactId: true });
  revalidatePath(path);
  return {
    success: result.success,
    message: result.success
      ? `Delivered ${result.deliveredItemsCount} unit(s). Current status: ${result.orderStatus}.`
      : "No units were reported as delivered. Refresh and check the order before retrying.",
  };
}

export default async function StaffFulfillmentPage({ searchParams }: { searchParams: Promise<Query> }) {
  const auth = await requireStaffAccess("FULFILLMENT");
  if (auth instanceof NextResponse) return <StaffAccessRequired path={path} />;
  const page = pageNumber(await searchParams);
  const orders = await prisma.order.findMany({
    where: eligible,
    orderBy: [{ createdAt: "asc" }, { id: "asc" }],
    skip: (page - 1) * pageSize, take: pageSize + 1,
    select: {
      id: true, orderNumber: true, deliveryStatus: true,
      items: { select: { id: true, productName: true, variationName: true, quantity: true } },
    },
  });
  return (
    <section className="space-y-4">
      <h1 className="text-2xl font-semibold">Paid orders awaiting delivery</h1>
      {!orders.length && <p>No orders on this page.</p>}
      <ul className="divide-y">
        {orders.slice(0, pageSize).map((order) => (
          <li key={order.id} className="space-y-2 py-3">
            <h2 className="font-semibold">{order.orderNumber} · {order.deliveryStatus.replaceAll("_", " ")}</h2>
            <ul>{order.items.map((item) => (
              <li key={item.id}>{item.productName} {item.variationName} × {item.quantity}</li>
            ))}</ul>
            <StaffActionForm action={fulfill.bind(null, order.id)} label="Deliver available stock" />
          </li>
        ))}
      </ul>
      <Pagination path={path} query={{}} page={page} more={orders.length > pageSize} />
    </section>
  );
}
