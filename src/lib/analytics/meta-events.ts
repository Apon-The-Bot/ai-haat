export const META_EVENTS = ["PageView", "ViewContent", "Search", "AddToCart", "RemoveFromCart", "InitiateCheckout", "Purchase", "CompleteRegistration", "Lead"] as const;
export type MetaEventName = typeof META_EVENTS[number];
export const graphVersions = ["v26.0", "v25.0", "v24.0"] as const;
export const metaTriggers: Record<MetaEventName, string> = {
  PageView: "Eligible storefront navigation", ViewContent: "Product details viewed",
  Search: "Debounced product search", AddToCart: "Item added to cart",
  RemoveFromCart: "Item removed from cart", InitiateCheckout: "Signed-in checkout or Buy Now",
  Purchase: "Verified payment", CompleteRegistration: "New Google account created",
  Lead: "Product request accepted",
};
