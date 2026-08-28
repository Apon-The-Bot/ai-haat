# 07 — Release Gates & Defect Severity Protocol

## 1. Defect Severity Classification

* **P0 — Catastrophic Release Blocker**:
  * Financial leakage (price tampering, wallet double-spend, duplicate webhook credit, refund $> \text{paid}$).
  * Security breach (IDOR, credential leak to unauthenticated/public API, admin auth bypass).
  * Data corruption (stock double-delivery, loss of order historical snapshot).
  * *Policy: ZERO P0 defects allowed for release.*
* **P1 — Critical Workflow Blocker**:
  * Complete checkout blockage on supported payment methods.
  * Auto-delivery completely stalled despite valid inventory.
  * Broken authentication or inaccessible customer vault.
  * *Policy: ZERO P1 defects allowed unless business owner grants signed exemption.*
* **P2 — Major Non-Blocking Issue**:
  * Edge-case UI overflow on unusual screen widths, minor copy inaccuracies, slow analytics dispatch.
  * *Policy: Release permitted with scheduled patch sprint.*
* **P3 — Minor Visual / Non-Critical**:
  * Cosmetic animation glitches, minor spacing issues.

---

## 2. Fast PR Gate vs Full Release Gate

```mermaid
graph TD
    PR[Pull Request Trigger] --> Fast[Fast PR Gate: TypeScript + Unit + Schema + Core DB Invariants]
    Fast -->|Pass| Merge[Merge to Main]
    
    Merge --> Full[Full Release Gate]
    Full --> SEC[Security & IDOR Matrix]
    Full --> PAY[Payment & Webhook Races]
    Full --> WAL[Wallet Concurrency]
    Full --> E2E[Playwright E2E & Responsive]
    Full --> BUILD[Next.js Production Build]
    
    SEC --> RelCheck{All Passed?}
    PAY --> RelCheck
    WAL --> RelCheck
    E2E --> RelCheck
    BUILD --> RelCheck
    
    RelCheck -->|Yes| Deploy[Production Deployment]
    RelCheck -->|No| Abort[Block Release]
```
