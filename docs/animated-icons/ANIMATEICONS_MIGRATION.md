# AnimateIcons migration

AnimateIcons is the selected provider for this batch. The app vendors the SVG shapes and motion variants actually used in AI Haat from upstream commit `23e58d0fcf4b77f38e303c2dad37624b6f20e15d`. Most are from the Lucide family. The award, help circle, link and share shapes are from the Huge family. The upstream MIT license and Lucide and Hugeicons notices accompany the components. [Pinned source](https://github.com/Avijit07x/animateicons/tree/23e58d0fcf4b77f38e303c2dad37624b6f20e15d)

## Coverage

| Source metric | Count |
| --- | ---: |
| Installed SVG animation modules | 153 |
| Named icon exports, including compatibility aliases | 157 |
| AnimateIcons references found by the current source audit | 1,437 |
| Remaining legacy library references | 16 |
| Remaining emoji candidates requiring classification | 428 |

The source audit counts identifier references rather than unique DOM instances. Coverage includes storefront, auth, cart, checkout, customer screens, admin navigation and forms, notifications and shared dialogs. Facebook remains as an official mark. Existing busy-state spinners keep their state-driven motion. Archive Restore and Scale lack a verified equivalent in this batch. The four remaining inline SVGs are the AI Haat mark, two Google marks and a busy spinner.

## Runtime

The shared `IconMotion` component keeps a single SVG root, forwards the existing size, style, accessibility props and SVG ref, and uses the project's existing Framer Motion runtime with its minimal feature set. It starts short animations by hover, interactive-parent focus or click. It skips disabled controls, hidden documents, offscreen icons and reduced-motion users. At most three icons run concurrently. Leaving the viewport or changing the motion preference stops active playback. The team can choose an exact export through the scoped icon module without changing the control's behavior.

The original Flaticon audit and reports are retained as records of that earlier pass. Run `node scripts/audit-animated-icons.mjs` for current counts.

## Verification

Typecheck, Next.js lint, source-length checks, and the production build passed. The build used a loopback-only database placeholder. Lint continues to report existing warnings.

Offline Chromium checks loaded `/`, `/shop`, `/cart`, `/checkout/success`, `/gift-cards`, `/login` and `/dashboard` at 320, 360, 390, 430, 768, 1024, 1280, 1440 and 1920 px. The run reported zero uncaught page errors. The home header Search control passed pointer hover, keyboard focus, reduced-motion suppression and opening the search overlay. The dynamic admin email contacts route requires a server render and was unavailable in this harness. Authenticated and payment states, real touch hardware and cross-browser results remain unverified.

Replay the browser checks with `node scripts/verify-animated-icons-build.mjs <baseline-dist> <updated-dist> --motion`. The harness blocks external requests and serves production files and safe API responses.

## Performance

Next.js reported 103 kB of shared first-load JS before and after. The route entry JavaScript below is the gzip sum of unique chunks declared in the Next.js root and route manifests. Bundle size increased on every sampled route. The previous artifacts were retained from the preceding work in the shared tree, so the comparison is between builds and may also include unrelated edits.

| Route | Baseline gzip bytes | AnimateIcons gzip bytes | Increase |
| --- | ---: | ---: | ---: |
| / | 320,724 | 342,595 | 21,871 |
| /shop | 278,292 | 322,480 | 44,188 |
| /cart | 267,630 | 311,259 | 43,629 |
| /checkout/success | 249,340 | 293,472 | 44,132 |
| /gift-cards | 118,499 | 163,440 | 44,941 |
| /login | 118,968 | 164,324 | 45,356 |
| /dashboard | 121,673 | 166,569 | 44,896 |

The SVGs are rendered locally and require no third-party asset requests. LCP, CLS, INP, animation CPU and memory, and mobile scrolling measurements remain open. No deployment was performed.
