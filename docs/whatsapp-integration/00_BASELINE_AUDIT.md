# WhatsApp integration baseline

Starting point: `bbf69ad` on `codex/production-optimization`. Existing optimization and icon work was dirty and preserved. Next.js with Prisma/MySQL. Existing WhatsApp manual UI and admin APIs use Baileys, encrypted session records, account leases, bounded cron, and queued jobs. `WhatsappContact.consent` is an account/contact boolean. It does not establish purpose-specific consent or verified user ownership.

| Feature | Baseline and candidate status |
| --- | --- |
| F01 OTP | WhatsApp path unverified. Approved authentication capability and isolated security acceptance required. |
| F02 Order updates | Dry-run confirmed/delivered event contracts. No producer wired. |
| F03 Payment alerts | Dry-run settled event contract. No verified lifecycle producer wired. |
| F04 Subscription reminders | Existing `commerce/subscription-reminders.ts`. Dry-run expiry event contract only. |
| F05 Abandoned checkout | Existing abandonment lifecycle in `commerce/abandoned-cart.ts`. WhatsApp integration open. |
| F06 Marketing | Manual scheduler is not a policy-gated campaign workflow. Campaign integration open. |
| F07 Stock alerts | Existing `commerce/stock-waitlist.ts`. WhatsApp purpose consent and integration open. |
| F08 Review requests | WhatsApp lifecycle producer and review eligibility open. |
| F09 Reactivation | WhatsApp cohort, consent and caps open. |
| F10 Support | Website support exists. Verified inbound and handoff through WhatsApp open. |
| F11 Admin messaging | Manual account/contact sends exist. Customer/order-bound template workflow open. |
| F12 Engine | Legacy queue and first event slice exist. Transactional producer, purpose consent, adapter and safe outbox open. |

Official [Business Messaging Policy](https://business.whatsapp.com/policy) and [Platform documentation](https://developers.facebook.com/documentation/business-messaging/whatsapp/overview) reviewed. Provider opt-in, category/template constraints, suppression and human escalation must be enforced before live activation. The existing transport provides no verified official approval or sandbox evidence.
