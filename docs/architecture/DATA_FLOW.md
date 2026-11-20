# Data flows

Customer commerce:

`storefront -> cart -> checkout -> payment callback/webhook -> order transaction -> fulfillment -> customer/admin views`

Admin operations:

`admin page -> NextAuth session -> admin/MFA guard -> API -> domain query/mutation -> audit log -> response`

WhatsApp automation:

`admin MFA -> account/contact/job API -> persisted job state -> immediate send or bounded cron -> Baileys -> persisted outcome/history`

Any refactor must preserve authorization at the same boundary and must not move a transaction across a service boundary without equivalent locking and idempotency evidence.
