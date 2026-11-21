# Hybrid fulfillment architecture

The existing order-item fulfillment handlers remain the execution boundary: `AUTO_STOCK` claims owned inventory, while `MANUAL`, `WORKSPACE_INVITE`, and `EXTERNAL_ACTIVATION` enter processing for staff action. `fulfillment-policy.ts` is the new side-effect-free decision layer for global → supplier → product → variant → order-item rules, capability-aware supplier eligibility, safety limits, and emergency automatic stop.

Verified supplier API purchasing is not currently established, so this phase does not create external purchases or alter paid orders.
