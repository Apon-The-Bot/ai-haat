# Production security checklist

- [x] Remove confirmed plaintext credentials from the affected current files.
- [x] Require authenticated profile access and server-backed administrator roles.
- [x] Gate catalog mutation aliases with admin MFA and reject MFA lookup failures.
- [x] Keep private env files out of Git and public assets.
- [x] Add secret-pattern, dependency and auth regression checks to CI.
- [ ] Rotate exposed database and SMTP credentials, update hPanel and verify the integrations.
- [ ] Review historic obfuscated build code, prior builds and access logs. Replace other exposed secrets with a recovery plan for encrypted data.
- [ ] Verify that current database admins are authorized and can enroll and use MFA on staging.
- [ ] Replace guest invoice email-only authorization and review remaining role-only endpoints.
- [ ] Review private uploads, backup access, public artifacts, payment callbacks and live security headers.
- [ ] Run full staged deployment regression, including Google login, checkout, delivery, refunds and SMTP.
