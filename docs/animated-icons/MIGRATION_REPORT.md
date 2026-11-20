# Animated icon migration

| Measure | Count |
| --- | ---: |
| Legacy icon source references inventoried | 1,453 |
| Legacy icon source references migrated | 0 |
| Legacy icon source references pending | 1,453 |
| Decorative UI emoji occurrences removed | 19 |
| Official Flaticon animated assets integrated | 0 |
| Exact Flaticon candidates recorded | 6 |

The original scan also recorded 5 inline SVGs, 23 indirect icon component sites and 118 image references. These categories include overlapping references, product artwork and potential brand marks. They need contextual review before a definitive total of unique interface icons can be reported. The follow-up scan returned 428 emoji candidates across application, template and data sources. These are an unresolved review queue. The source scan does not enumerate values held in the database or submitted by users.

The 19 removals cover duplicated ornament in cart and fulfillment messages, gift checkout copy, the flash-sale progress label, reward messages, fulfillment select options, and email-marketing labels. Text supplies the meaning in each case. Existing success toasts continue to show their status glyph. Outbound notification templates and share messages retain their copy.

`src/components/animated-icons/AnimatedIcon.tsx` provides a typed registry and a shared player. It uses native video for local MP4 or WebM exports, a stable-size poster, and the caller's existing glyph while the poster is unavailable. It requests video only at playback, limits simultaneous playback to three elements, pauses when the icon leaves the viewport or the document is hidden, and cancels playback for reduced motion. The runtime imports no third-party animation package. The registry remains empty and the player has no application route consumers until a licensed asset can be verified.

The next implementation batch depends on authorized Flaticon downloads and the corresponding license and credit evidence. Start with the [six documented candidates](ASSET_MANIFEST.md), verify attribution and styling, then integrate shared navigation before migrating storefront, account, administration and system states. For CSS or text glyphs and data-driven entries, verify the actual rendering context against the [original inventory](ICON_AUDIT.md). The present reference count is a source count, and full visual classification is still open.

No deployment was performed.

## Current icon provider

The AnimateIcons batch was authorized after this Flaticon baseline. See the [current migration](ANIMATEICONS_MIGRATION.md) for source, licensing and coverage.
