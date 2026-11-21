# Fulfillment policy engine

`resolveFulfillmentPolicy` applies deterministic precedence: order item, variant, product, supplier, then global. Automatic mode is allowed only for verified mappings with explicit automatic fulfillment capability, valid cost, enabled supplier, and usable availability. Emergency stop, maximum automatic purchase value, and minimum expected profit force manual review.
