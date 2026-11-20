# Performance comparison

Both production builds completed with the same loopback-only database placeholder. Next.js reported **103 kB** of first-load JavaScript shared by all routes in both builds. The table uses the deduplicated JS files referenced by the root and route entry manifests. Gzip sizes are local per-file compression measurements in bytes. They exclude lazy interaction chunks and are separate from browser network transfer.

| Route | JavaScript before | JavaScript after | Gzip before | Gzip after |
| --- | ---: | ---: | ---: | ---: |
| / | 1,061,172 | 1,061,172 | 320,724 | 320,724 |
| /shop | 932,589 | 932,589 | 278,292 | 278,292 |
| /cart | 891,159 | 891,133 | 267,657 | 267,630 |
| /checkout/success | 828,714 | 828,675 | 249,355 | 249,340 |
| /gift-cards | 403,087 | 403,074 | 118,512 | 118,499 |
| /login | 401,067 | 401,067 | 118,968 | 118,968 |
| /dashboard | 412,536 | 412,536 | 121,673 | 121,673 |
| /admin/email-marketing/contacts | 384,020 | 384,007 | 112,753 | 112,737 |

The offline production-artifact browser checks recorded **zero Flaticon animation requests** in both builds. The shared player is outside the application entry graph while the registry is empty. The small differences above describe the current builds only. Unrelated work in the shared tree was also ongoing.

Live transfer, LCP, CLS, INP, animation CPU and memory, mobile scrolling smoothness and concurrent animation counts under realistic site load remain unmeasured. Collect these after the first licensed route integration using representative asset combinations and devices. The player limits concurrent video playback to three by design.
