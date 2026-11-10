# Environment security

- Hostinger managed Node.js receives secrets via its environment settings. `production.env` remains an ignored local import file. No values are included here.
- Core private variables include `DATABASE_URL`, `NEXTAUTH_SECRET`, Google OAuth client credentials, MFA encryption and peppers, SMTP password, PipraPay API key, cron secret and backup encryption key. The production validator checks names and formats without showing values.
- `ADMIN_EMAILS` is no longer required or used for runtime authorization. The database role is authoritative. Confirm existing authorized admin rows before deploying.
- Public values are the canonical URLs, optional WhatsApp number and exchange rate, and browser analytics IDs. Keep private integration tokens out of all `NEXT_PUBLIC_*` keys.
- The existing local import file passed format validation. Its database and SMTP values were found in tracked diagnostics, so those values must be replaced before using the file for a fresh production import.
- A syntactically valid configuration does not demonstrate database reachability, production payment credentials, mailbox authentication or callback configuration.
