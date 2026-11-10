# Hardcoded secrets audit

| Exposure | Current location remediated | Remaining work |
| --- | --- | --- |
| MySQL connection and password | `scripts/test-prisma-products.js`, `scripts/test-prisma-sanitize.js`, `scripts/test-explicit-db.js`, `docs/predeploy/01-verified-issues.md` | Rotate the affected database password, check access records and update Hostinger configuration. Historical Git copies may still be accessible. |
| SMTP password | `scripts/test-smtp.js`, `scripts/test-send-delivery.js` | Rotate the mailbox password and verify delivery. |
| Predictable invoice signing fallback | `src/lib/invoicing/tokens.ts` | The signing secret is now mandatory. Guest email-only authorization remains a separate issue. |
| Privileged identities | `src/lib/auth.ts`, `src/lib/auth-guard.ts`, `src/app/api/auth/me/route.ts`, invoice handler and admin navigation | Review existing database ADMIN rows for promotions that happened under the old policy. |

The suspicious historic build configuration could have accessed any environment variable present when it ran. No data exfiltration has been established by this audit. Review repository and deployment access logs and replace exposed credentials through their issuing services. Preserve encrypted vault and backup data when planning key replacement. Git history has not been rewritten.
