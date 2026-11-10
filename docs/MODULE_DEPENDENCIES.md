# Module dependencies

- Authentication: route handlers and middleware use `src/lib/auth.ts` and `src/lib/auth-guard.ts`; authorization must remain server-side.
- Checkout → orders → payments: checkout UI calls existing API contracts; order persistence and payment flows remain in their current `src/lib` and `src/app/api` boundaries.
- Subscriptions: dashboard/customer routes consume existing subscription and wallet modules; activation and expiry behavior are business-critical.
- Admin users: admin pages call `src/app/api/admin/users/**`, with user-control and user-intelligence services underneath `src/lib/`.
- Products: public and admin product views share domain contracts and product services; do not create competing product models.

Do not import private implementation files across domains when a stable public function or type already exists. Avoid adding barrel exports unless they reduce coupling.
