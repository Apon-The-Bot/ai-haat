# Baseline

21 November 2026, Windows, Node 22.20.0, npm 10.9.3. Clean starting commit `bbf69adc9881ea79a6acd9cf36a9c339bd3050ae`. Three PowerShell `Measure-Command` runs of `node scripts/check-source-file-length.mjs` from the repository root took 2035.7, 1966.2 and 1974.4 ms. Existing working tree and dependencies were reused. Hosting telemetry, install time and comparable build stage metrics were unavailable.

Existing local Windows `.next` directory, measured with recursive PowerShell `Measure-Object -Property Length -Sum`: static 4,196,567 bytes, server 25,427,380 bytes, cache 1,232,040,921 bytes. These are directory sizes, not upload sizes. `Get-Service` found no MySQL/MariaDB service and `Get-Command` found neither `mysqld` nor Docker. No isolated DB endpoint was confirmed.
