export const META_PROVIDER = "meta_capi_v2";
export const META_EVENT_AGE_MS = 24 * 60 * 60 * 1000;
export const purchaseEventId = (orderNumber: string) => `purchase_${orderNumber}`;

export function buildCapiPurchaseData(order: {
  orderNumber: string;
  totalBDT: number;
  items: Array<{ productId?: string | null; variationId?: string | null; priceBDT: number; quantity: number }>;
}) {
  const contents = order.items.filter((item) => item.productId).map((item) => ({
    id: item.variationId ? `${item.productId}:${item.variationId}` : String(item.productId),
    quantity: item.quantity,
    item_price: item.priceBDT,
  }));
  return {
    value: order.totalBDT, currency: "BDT", content_ids: contents.map((item) => item.id), contents,
    content_type: "product", num_items: order.items.reduce((sum, item) => sum + item.quantity, 0),
    order_id: order.orderNumber,
  };
}

export function purchaseEligible(order: { userId: string | null; metaConsentId: string | null; paymentStatus: string; deliveryStatus: string; totalBDT: number }) {
  return !!order.userId && !!order.metaConsentId && order.paymentStatus === "VERIFIED" &&
    order.deliveryStatus !== "CANCELLED" && Number.isFinite(order.totalBDT) && order.totalBDT > 0;
}
