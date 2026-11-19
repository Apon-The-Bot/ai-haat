# WhatsApp Automation release decision · NO-GO

20 November 2026. Local implementation and synthetic QA passed the checks below. Real MySQL contention, real delivery, durable session restoration and unattended execution on the subscribed Hostinger plan remain release gates. The controlled production rollout requested on this date is currently stopped at the backup gate.

## Execution and evidence

The bearer-protected POST endpoint selects a consenting recipient with a due job, due retry, saved credentials and available account lease. Idle ticks do not open a WhatsApp socket. Each invocation handles at most one account and three dispatch attempts. Interactive pairing has a separate 75-second window and limited reconnects. A paired idle account can be Ready with its socket closed. Cron socket lifetime defaults to 25 seconds (configurable between 8 and 30 seconds); DB and framework overhead are additional. The CLI awaits the response with a 95-second timeout. App requests reuse the existing Prisma pool; standalone QA clients disconnect on completion.

Account tokens fence writes. A 45-second job lease covers preflight; expired Processing rows without a submission can be reclaimed. Before network submission the transaction records Unknown, submission timestamp, generated ID, destination and group audience. Unknown is excluded from retries. Successful submission is recorded as Sent. The hourly limits are 60 attempts per account and 6 per resolved destination within an account, including ambiguous attempts. Counts and claims are serialized by the account row lock.

Group receipts use a snapshot of other members observed in group metadata. Delivered and Read require matching evidence for every snapshot member. Unmatched identifiers and absent receipts cannot advance the aggregate. During a closed socket interval, receipt events may be delayed or unavailable. The system cannot promise complete receipt history or continuous connectivity.

Each tick checks up to ten eligible media rows. Bytes are released after all references have terminal outcomes and their due and known submission timestamps are older than 30 days. Scheduled/paused recurrences retain their shared media. Expired attachments cannot be duplicated. This is a retention policy, not a hard storage ceiling. Account execution audit records elapsed time, connection time and accepted count without message bodies or keys.

| Check | Result |
|---|---|
| TypeScript, Prisma schema/client, lint, production build | Passed after the bounded-cron and release-control changes; lint warnings remain. The build used an unavailable loopback QA target and logged a product-data fallback during prerendering, then completed all 135 pages. |
| Local Node fixture suite | 11 passed. Includes overlapping mock dispatch, unknown outcome, consent, recipient quota, group acknowledgements, idle tick and two independent mocked cron runs. |
| Local Firefox component fixture | 360px and 1280px passed. API responses simulated. |
| Source architecture | 104 oversized files, same count as previous checkpoint. No new WhatsApp source file exceeds 300 lines. |
| Local synthetic resource measurement | One run including TypeScript transpilation and all 11 tests: 562 ms elapsed, 984 ms CPU, 123 MiB peak RSS. This measures the test process only. |
| Actual scheduling delay, socket latency, resource impact on storefront and hosting | Unmeasured. Record due/submitted timestamps, connection and elapsed audit values, and host resource graphs on staging. |
| Real database and WhatsApp acceptance | Blocked. No migrations applied, live recipient contacted, or account linked during this work. |
| Production backup gate | Hostinger screenshot evidence shows database and files backups completed and prepared for download at 2026-11-20 00:09. This is an external Hostinger restore point. A local encrypted copy and cryptographic checksum are still absent because the download has not been provided to the workspace. |
| Production HTTP smoke | Passed read-only on 20 November 2026: `/`, `/api/health` and `/login` returned HTTP 200. `/api/health` reported HEALTHY and database UP with 1 ms latency. Existing payment gateway mode reported WARN for development test mode; this is pre-existing production evidence and was not changed. |

## Hostinger and cron setup

The managed platform documents outbound WebSockets, a 120-second app request limit and process recycling. Permanent workers are unsupported. Native cron schedules run in UTC, stop after 30 minutes, accept one command up to 255 characters, and require explicit environment loading. Node's env-file option requires 20.6 or later. [Managed Node limits](https://www.hostinger.com/support/hostinger-node-js-limits-for-web-and-cloud-plans/) · [Native cron instructions](https://www.hostinger.com/support/how-to-run-cron-jobs-for-node-js-websites-at-hostinger/)

Read-only MCP verification after reauthorization: aihaat.shop is enabled on an active Business v5 order. Stored build settings specify Next.js, Node 22, npm, build script build, output .next and no custom entry file or project root. The public document root is /home/u298980084/domains/aihaat.shop/public_html. The cron list was empty. The environment inventory contained DATABASE_URL, NEXTAUTH_URL and CRON_SECRET; no WhatsApp-specific keys were listed. Only variable presence was checked.

The website file-list API returned “Directory does not exist” for the relative hbuilds/current/nodejs/scripts and hbuilds/config lookups. This API result does not establish the host's absolute runtime paths. In hPanel verify the prefilled Node executable and minimum interval under Advanced → Cron Jobs, actual resource quotas under plan/resource usage, and the application's private env-file and deployment path in the Node dashboard or authorized shell. Confirm the MySQL per-user connection limit with the host if absent from plan details. Outbound WhatsApp handshakes, app idle/restart behavior and scheduling accuracy still need authorized staging observation.

The MCP does not expose the active Business v5 CPU, RAM, MySQL connection quota or the minimum cron interval through the read-only operations available to this account. The documented Business plan comparison is not sufficient evidence for this specific order. These remain hPanel checks, not assumptions.

The exact installed cron command cannot be verified locally. From the verified deployment root on Hostinger, run its actual Node executable with `scripts/whatsapp-cron.mjs --print-command ABSOLUTE_ENV_FILE_PATH`. The script verifies path existence and prints the command with the host executable, deployment script path and explicit env loading. Paste that output in hPanel Custom Cron Jobs after approval. Choose the shortest permitted UTC interval that the resource measurements support. The helper POSTs to the HTTPS origin in NEXTAUTH_URL, rejects redirects, and passes CRON_SECRET in the Authorization header.

The local backup attempt also revealed that the current backup utility has no native `mysqldump` executable and uses its Prisma logical-dump fallback. The remote database connection did not complete within the bounded check. The read-only pre-deploy gate confirmed the production target and reported nine pending migrations, including the existing provider-catalog migration and eight WhatsApp/release migrations. Migration review found create/add/index/foreign-key statements and no DROP, TRUNCATE or DELETE statements. The Hostinger backup screenshot confirms an external restore point, but actual restoration has not been exercised and its downloaded artifact is not present locally. The interrupted attempt left generated temporary backup state in the backup directory. Automatic cleanup was blocked by the workstation's execution policy, so an operator should inspect and remove only the specifically named temporary file and `.backup.lock` after confirming no backup process is running.

## QA database and pairing

Windows service inventory, running-process and port checks and accessible drive searches found no reusable mysql.exe, mysqld.exe or mariadbd.exe. No MySQL service exists on this workstation. There was therefore no service command available to execute. The earlier execution policy rejected downloading, initializing and starting a temporary server. The rejection happened at process creation for the attempted download/initialization command, before MySQL could be installed or started. A service-start command alone cannot create the missing engine.

After MySQL Community Server 8 is installed manually, the minimum elevated PowerShell checks are:

```powershell
Get-Service | Where-Object { $_.Name -match 'MySQL|MariaDB' }
Get-CimInstance Win32_Service | Where-Object { $_.PathName -match 'mysqld|mariadbd' } | Select Name,State,PathName
Get-NetTCPConnection -State Listen -LocalPort 3306 -ErrorAction SilentlyContinue
Start-Service -Name '<SERVICE_NAME_FROM_THE_FIRST_COMMAND>'
```

If the installer did not create a service, open the MySQL Installer as Administrator and install MySQL Server 8.4 with TCP port 3306 bound to 127.0.0.1. Do not run the service command until the service name is returned by the inspection command. If Windows requests elevation, the operator must approve that UAC prompt. The agent cannot approve it.

With the server running, use the MySQL command-line client in an elevated or administrator-owned console. The following is a template that deliberately leaves the password interactive:

```powershell
& 'C:\Program Files\MySQL\MySQL Server 8.4\bin\mysql.exe' -u root -p -e "CREATE DATABASE aihaat_whatsapp_qa CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci; CREATE USER 'aihaat_wa_qa'@'127.0.0.1' IDENTIFIED BY '<GENERATE_AND_PASTE_A_UNIQUE_PASSWORD>'; GRANT ALL PRIVILEGES ON aihaat_whatsapp_qa.* TO 'aihaat_wa_qa'@'127.0.0.1'; FLUSH PRIVILEGES;"
```

Replace only the executable path if the installer reports another path. Do not put the password in command history. The existing `scripts/prepare-whatsapp-qa.mjs` refuses any host, schema, user or non-empty target outside the dedicated loopback QA database. The existing `scripts/test-whatsapp-mysql.mjs` then exercises account lease contention, expired lease recovery, job contention and rollback. The module currently has seven WhatsApp migrations through `20261120000600_whatsapp_zones`, plus the later additive `20261120000700_whatsapp_release_controls` migration. Apply all eight in a clean QA schema. No migration has run here.

1. Have an authorized operator install MySQL Community Server 8 locally using the official installer, or provide an existing approved local MySQL 8 instance. Bind to loopback. If the installer created a stopped service, in elevated PowerShell run `Get-Service | Where-Object Name -Match '^MySQL'` and then `Start-Service -Name 'ACTUAL_SERVICE_NAME'` with that returned name.
2. In that local server's admin console create the empty schema `aihaat_whatsapp_qa` and grant a dedicated loopback user `aihaat_wa_qa` access to that schema only. Use a unique password generated by the operator's password manager. Store DATABASE_URL, a stable random 32-byte hex WHATSAPP_SESSION_KEY, independent CRON_SECRET and NEXTAUTH_SECRET in the gitignored `.env.whatsapp-qa.local`. Use a private unsynced QA checkout for credential files. NEXTAUTH_URL must match the QA app origin. Set WHATSAPP_ENABLED=true and WHATSAPP_SENDING_ENABLED=false until recipient authorization. WHATSAPP_CRON_SOCKET_MS is optional.
3. In a clean process with QA variables only, run `node --env-file=.env.whatsapp-qa.local scripts/prepare-whatsapp-qa.mjs`. This requires an empty loopback QA schema. The historical 0_init is only a marker. The script materializes the current non-WhatsApp schema contract, then applies the seven preceding module migrations and the new additive release-controls migration in order. It does not establish a production migration history. Then run `node --env-file=.env.whatsapp-qa.local scripts/test-whatsapp-mysql.mjs`. Verify the information_schema indexes and foreign keys and repeat against a separate QA copy of the pre-upgrade schema. These scripts have not run against real MySQL in this environment.
4. Start the QA app with the dedicated env file and an MFA-enrolled QA admin. Open /admin/whatsapp, add an account, choose Connect and manually scan the QR. Test phone pairing separately. Never transmit the QR or code in chat. Confirm opt-out before enabling sending to an explicitly authorized recipient and test group. Run independent authenticated ticks, kill/restart the app, close the dashboard and record delivery evidence and delay. Verify logout from the linked device list.

## Deployment and rollback

After staging acceptance and explicit production approval, back up the database and session encryption key, verify migration history, apply reviewed additive migrations and deploy with sending disabled. Configure cron, validate an idle tick and enable sending only for the authorized smoke test. Record target-host evidence before general enablement.

For rollback disable cron, set WHATSAPP_SENDING_ENABLED=false and apply the host's environment reload procedure after approval. Let the in-flight lease expire and reconcile Unknown rows individually. Disable WHATSAPP_ENABLED before restoring the prior app. Keep the additive tables and encrypted auth records for investigation. Never replay ambiguous messages or roll back unrelated commerce data.
