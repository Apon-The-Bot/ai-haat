# Original icon inventory

The inventory scans 533 application source files using TypeScript syntax. Rows represent source findings. Imports and Unicode escape rows are supporting evidence. Dynamic rendering references may pair with definition rows. Image, emoji, SVG and font candidates require visual and ownership review. CMS values, customer content and database records are outside this source scan.

Next.js 15.5.29 App Router uses React 18, Tailwind, CSS theme tokens and existing Framer Motion/CSS effects. The inventory covers shared components, storefront, auth, checkout, wallet, dashboard, administration and server-side templates. Product artwork, payment marks and AI Haat artwork require preservation. References keep an existing glyph until an approved equivalent is integrated.

- Legacy import: 130
- Legacy reference: 1453
- Emoji candidate: 447
- Icon component: 23
- Image reference: 118
- Inline SVG: 5

| Route or component | Location | Existing source | Meaning or identifier | Context | Proposed match or review | Playback | Priority | Original status | Risk |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| /admin/DashboardAnalytics.tsx | src/app/admin/DashboardAnalytics.tsx:2 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /admin/DashboardAnalytics.tsx | src/app/admin/DashboardAnalytics.tsx:101 | Legacy reference | Plus | Rendered | Plus | Context review | Normal | Pending | Confirm semantics in context |
| /admin/DashboardAnalytics.tsx | src/app/admin/DashboardAnalytics.tsx:109 | Legacy reference | KeyRound | Rendered | KeyRound | Context review | Normal | Pending | Confirm semantics in context |
| /admin/DashboardAnalytics.tsx | src/app/admin/DashboardAnalytics.tsx:117 | Legacy reference | Tag | Rendered | Tag | Context review | Normal | Pending | Confirm semantics in context |
| /admin/DashboardAnalytics.tsx | src/app/admin/DashboardAnalytics.tsx:125 | Legacy reference | TrendingUp | Rendered | TrendingUp | Context review | Normal | Pending | Confirm semantics in context |
| /admin/DashboardRecentOrders.tsx | src/app/admin/DashboardRecentOrders.tsx:2 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /admin/DashboardRecentOrders.tsx | src/app/admin/DashboardRecentOrders.tsx:30 | Legacy reference | ShoppingBag | Rendered | ShoppingBag | Context review | Normal | Pending | Confirm semantics in context |
| /admin/DashboardRecentOrders.tsx | src/app/admin/DashboardRecentOrders.tsx:38 | Legacy reference | ArrowRight | Rendered | ArrowRight | Context review | Normal | Pending | Confirm semantics in context |
| /admin/activity/page.tsx | src/app/admin/activity/page.tsx:3 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /admin/activity/page.tsx | src/app/admin/activity/page.tsx:41 | Legacy reference | ShieldCheck | Rendered | ShieldCheck | Context review | Normal | Pending | Confirm semantics in context |
| /admin/activity/page.tsx | src/app/admin/activity/page.tsx:41 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| /admin/activity/page.tsx | src/app/admin/activity/page.tsx:41 | Legacy reference | Download | Rendered | Download | Context review | Normal | Pending | Confirm semantics in context |
| /admin/activity/page.tsx | src/app/admin/activity/page.tsx:42 | Legacy reference | Search | Rendered | Search | Context review | Normal | Pending | Confirm semantics in context |
| /admin/affiliates/page.tsx | src/app/admin/affiliates/page.tsx:6 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /admin/affiliates/page.tsx | src/app/admin/affiliates/page.tsx:296 | Legacy reference | CheckCircle2 | Rendered | CheckCircle2 | Context review | Normal | Pending | Confirm semantics in context |
| /admin/affiliates/page.tsx | src/app/admin/affiliates/page.tsx:305 | Legacy reference | ShieldCheck | Rendered | ShieldCheck | Context review | Normal | Pending | Confirm semantics in context |
| /admin/affiliates/page.tsx | src/app/admin/affiliates/page.tsx:322 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| /admin/affiliates/page.tsx | src/app/admin/affiliates/page.tsx:332 | Legacy reference | Clock | Rendered | Clock | Context review | Normal | Pending | Confirm semantics in context |
| /admin/affiliates/page.tsx | src/app/admin/affiliates/page.tsx:343 | Legacy reference | AlertCircle | Rendered | AlertCircle | State | Normal | Pending | Confirm semantics in context |
| /admin/affiliates/page.tsx | src/app/admin/affiliates/page.tsx:347 | Legacy reference | AlertCircle | Rendered | AlertCircle | State | Normal | Pending | Confirm semantics in context |
| /admin/affiliates/page.tsx | src/app/admin/affiliates/page.tsx:364 | Legacy reference | CheckCircle | Rendered | CheckCircle | Context review | Normal | Pending | Confirm semantics in context |
| /admin/affiliates/page.tsx | src/app/admin/affiliates/page.tsx:368 | Legacy reference | CheckCircle | Rendered | CheckCircle | Context review | Normal | Pending | Confirm semantics in context |
| /admin/affiliates/page.tsx | src/app/admin/affiliates/page.tsx:385 | Legacy reference | TrendingUp | Rendered | TrendingUp | Context review | Normal | Pending | Confirm semantics in context |
| /admin/affiliates/page.tsx | src/app/admin/affiliates/page.tsx:389 | Legacy reference | TrendingUp | Rendered | TrendingUp | Context review | Normal | Pending | Confirm semantics in context |
| /admin/affiliates/page.tsx | src/app/admin/affiliates/page.tsx:406 | Legacy reference | Users | Rendered | Users | Context review | Normal | Pending | Confirm semantics in context |
| /admin/affiliates/page.tsx | src/app/admin/affiliates/page.tsx:410 | Legacy reference | Users | Rendered | Users | Context review | Normal | Pending | Confirm semantics in context |
| /admin/affiliates/page.tsx | src/app/admin/affiliates/page.tsx:436 | Legacy reference | Wallet | Rendered | Wallet | Context review | Normal | Pending | Confirm semantics in context |
| /admin/affiliates/page.tsx | src/app/admin/affiliates/page.tsx:453 | Legacy reference | Users | Rendered | Users | Context review | Normal | Pending | Confirm semantics in context |
| /admin/affiliates/page.tsx | src/app/admin/affiliates/page.tsx:465 | Legacy reference | Layers | Rendered | Layers | Context review | Normal | Pending | Confirm semantics in context |
| /admin/affiliates/page.tsx | src/app/admin/affiliates/page.tsx:493 | Legacy reference | Search | Rendered | Search | Context review | Normal | Pending | Confirm semantics in context |
| /admin/affiliates/page.tsx | src/app/admin/affiliates/page.tsx:553 | Legacy reference | Wallet | Rendered | Wallet | Context review | Normal | Pending | Confirm semantics in context |
| /admin/affiliates/page.tsx | src/app/admin/affiliates/page.tsx:554 | Legacy reference | Building | Rendered | Building | Context review | Normal | Pending | Confirm semantics in context |
| /admin/affiliates/page.tsx | src/app/admin/affiliates/page.tsx:555 | Legacy reference | Smartphone | Rendered | Smartphone | Context review | Normal | Pending | Confirm semantics in context |
| /admin/affiliates/page.tsx | src/app/admin/affiliates/page.tsx:645 | Legacy reference | Search | Rendered | Search | Context review | Normal | Pending | Confirm semantics in context |
| /admin/affiliates/page.tsx | src/app/admin/affiliates/page.tsx:656 | Legacy reference | Filter | Rendered | Filter | Context review | Normal | Pending | Confirm semantics in context |
| /admin/affiliates/page.tsx | src/app/admin/affiliates/page.tsx:770 | Legacy reference | Edit | Rendered | Edit | Context review | Normal | Pending | Confirm semantics in context |
| /admin/affiliates/page.tsx | src/app/admin/affiliates/page.tsx:811 | Legacy reference | Search | Rendered | Search | Context review | Normal | Pending | Confirm semantics in context |
| /admin/affiliates/page.tsx | src/app/admin/affiliates/page.tsx:911 | Legacy reference | XCircle | Rendered | XCircle | Context review | Normal | Pending | Confirm semantics in context |
| /admin/affiliates/page.tsx | src/app/admin/affiliates/page.tsx:916 | Emoji candidate | ⚡ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| /admin/affiliates/page.tsx | src/app/admin/affiliates/page.tsx:950 | Legacy reference | XCircle | Rendered | XCircle | Context review | Normal | Pending | Confirm semantics in context |
| /admin/affiliates/page.tsx | src/app/admin/affiliates/page.tsx:1011 | Legacy reference | XCircle | Rendered | XCircle | Context review | Normal | Pending | Confirm semantics in context |
| /admin/affiliates/page.tsx | src/app/admin/affiliates/page.tsx:1016 | Emoji candidate | ⚠️ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| /admin/affiliates/page.tsx | src/app/admin/affiliates/page.tsx:1056 | Legacy reference | XCircle | Rendered | XCircle | Context review | Normal | Pending | Confirm semantics in context |
| /admin/alerts/page.tsx | src/app/admin/alerts/page.tsx:5 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /admin/alerts/page.tsx | src/app/admin/alerts/page.tsx:14 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| /admin/alerts/page.tsx | src/app/admin/alerts/page.tsx:14 | Legacy reference | ShieldAlert | Rendered | ShieldAlert | State | Normal | Pending | Confirm semantics in context |
| /admin/alerts/page.tsx | src/app/admin/alerts/page.tsx:14 | Legacy reference | AlertTriangle | Rendered | AlertTriangle | State | Normal | Pending | Confirm semantics in context |
| /admin/alerts/page.tsx | src/app/admin/alerts/page.tsx:14 | Legacy reference | ArrowRight | Rendered | ArrowRight | Context review | Normal | Pending | Confirm semantics in context |
| /admin/audit-logs/page.tsx | src/app/admin/audit-logs/page.tsx:4 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /admin/audit-logs/page.tsx | src/app/admin/audit-logs/page.tsx:89 | Legacy reference | ShieldAlert | Rendered | ShieldAlert | State | Normal | Pending | Confirm semantics in context |
| /admin/audit-logs/page.tsx | src/app/admin/audit-logs/page.tsx:105 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| /admin/audit-logs/page.tsx | src/app/admin/audit-logs/page.tsx:112 | Legacy reference | Search | Rendered | Search | Context review | Normal | Pending | Confirm semantics in context |
| /admin/audit-logs/page.tsx | src/app/admin/audit-logs/page.tsx:187 | Legacy reference | User | Rendered | User | Context review | Normal | Pending | Confirm semantics in context |
| /admin/audit-logs/page.tsx | src/app/admin/audit-logs/page.tsx:215 | Legacy reference | Eye | Rendered | Eye | Context review | Normal | Pending | Confirm semantics in context |
| /admin/audit-logs/page.tsx | src/app/admin/audit-logs/page.tsx:225 | Legacy reference | Activity | Rendered | Activity | Context review | Normal | Pending | Confirm semantics in context |
| /admin/audit-logs/page.tsx | src/app/admin/audit-logs/page.tsx:263 | Legacy reference | ChevronLeft | Rendered | ChevronLeft | Context review | Normal | Pending | Confirm semantics in context |
| /admin/audit-logs/page.tsx | src/app/admin/audit-logs/page.tsx:272 | Legacy reference | ChevronRight | Rendered | ChevronRight | Context review | Normal | Pending | Confirm semantics in context |
| /admin/audit-logs/page.tsx | src/app/admin/audit-logs/page.tsx:284 | Legacy reference | ShieldAlert | Rendered | ShieldAlert | State | Normal | Pending | Confirm semantics in context |
| /admin/audit-logs/page.tsx | src/app/admin/audit-logs/page.tsx:291 | Legacy reference | X | Rendered | X | Context review | Normal | Pending | Confirm semantics in context |
| /admin/blogs/page.tsx | src/app/admin/blogs/page.tsx:4 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /admin/blogs/page.tsx | src/app/admin/blogs/page.tsx:97 | Legacy reference | FileText | Rendered | FileText | Context review | Normal | Pending | Confirm semantics in context |
| /admin/blogs/page.tsx | src/app/admin/blogs/page.tsx:109 | Legacy reference | Plus | Rendered | Plus | Context review | Normal | Pending | Confirm semantics in context |
| /admin/blogs/page.tsx | src/app/admin/blogs/page.tsx:118 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| /admin/blogs/page.tsx | src/app/admin/blogs/page.tsx:150 | Legacy reference | Trash2 | Rendered | Trash2 | Context review | Normal | Pending | Confirm semantics in context |
| /admin/blogs/page.tsx | src/app/admin/blogs/page.tsx:158 | Legacy reference | FileText | Rendered | FileText | Context review | Normal | Pending | Confirm semantics in context |
| /admin/blogs/page.tsx | src/app/admin/blogs/page.tsx:174 | Legacy reference | X | Rendered | X | Context review | Normal | Pending | Confirm semantics in context |
| /admin/categories/page.tsx | src/app/admin/categories/page.tsx:5 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /admin/categories/page.tsx | src/app/admin/categories/page.tsx:190 | Legacy reference | FolderTree | Rendered | FolderTree | Context review | Normal | Pending | Confirm semantics in context |
| /admin/categories/page.tsx | src/app/admin/categories/page.tsx:202 | Legacy reference | Package | Rendered | Package | Context review | Normal | Pending | Confirm semantics in context |
| /admin/categories/page.tsx | src/app/admin/categories/page.tsx:209 | Legacy reference | Plus | Rendered | Plus | Context review | Normal | Pending | Confirm semantics in context |
| /admin/categories/page.tsx | src/app/admin/categories/page.tsx:217 | Legacy reference | Search | Rendered | Search | Context review | Normal | Pending | Confirm semantics in context |
| /admin/categories/page.tsx | src/app/admin/categories/page.tsx:235 | Legacy reference | FolderTree | Rendered | FolderTree | Context review | Normal | Pending | Confirm semantics in context |
| /admin/categories/page.tsx | src/app/admin/categories/page.tsx:246 | Legacy reference | Plus | Rendered | Plus | Context review | Normal | Pending | Confirm semantics in context |
| /admin/categories/page.tsx | src/app/admin/categories/page.tsx:263 | Legacy reference | Image | Rendered | Image | Context review | Normal | Pending | Confirm semantics in context |
| /admin/categories/page.tsx | src/app/admin/categories/page.tsx:272 | Legacy reference | Edit2 | Rendered | Edit2 | Context review | Normal | Pending | Confirm semantics in context |
| /admin/categories/page.tsx | src/app/admin/categories/page.tsx:279 | Legacy reference | Trash2 | Rendered | Trash2 | Context review | Normal | Pending | Confirm semantics in context |
| /admin/categories/page.tsx | src/app/admin/categories/page.tsx:303 | Legacy reference | CheckCircle2 | Rendered | CheckCircle2 | Context review | Normal | Pending | Confirm semantics in context |
| /admin/categories/page.tsx | src/app/admin/categories/page.tsx:307 | Legacy reference | XCircle | Rendered | XCircle | Context review | Normal | Pending | Confirm semantics in context |
| /admin/categories/page.tsx | src/app/admin/categories/page.tsx:336 | Legacy reference | X | Rendered | X | Context review | Normal | Pending | Confirm semantics in context |
| /admin/categories/page.tsx | src/app/admin/categories/page.tsx:454 | Legacy reference | AlertTriangle | Rendered | AlertTriangle | State | Normal | Pending | Confirm semantics in context |
| /admin/categories/page.tsx | src/app/admin/categories/page.tsx:463 | Legacy reference | AlertTriangle | Rendered | AlertTriangle | State | Normal | Pending | Confirm semantics in context |
| /admin/categories/page.tsx | src/app/admin/categories/page.tsx:485 | Legacy reference | Trash2 | Rendered | Trash2 | Context review | Normal | Pending | Confirm semantics in context |
| /admin/command-center/page.tsx | src/app/admin/command-center/page.tsx:6 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /admin/command-center/page.tsx | src/app/admin/command-center/page.tsx:78 | Legacy reference | Clock3 | Source reference | Clock3 | Context review | Normal | Pending | Confirm semantics in context |
| /admin/command-center/page.tsx | src/app/admin/command-center/page.tsx:79 | Legacy reference | WalletCards | Source reference | WalletCards | Context review | Normal | Pending | Confirm semantics in context |
| /admin/command-center/page.tsx | src/app/admin/command-center/page.tsx:80 | Legacy reference | Users | Source reference | Users | Context review | Normal | Pending | Confirm semantics in context |
| /admin/command-center/page.tsx | src/app/admin/command-center/page.tsx:81 | Legacy reference | ShieldAlert | Source reference | ShieldAlert | State | Normal | Pending | Confirm semantics in context |
| /admin/command-center/page.tsx | src/app/admin/command-center/page.tsx:88 | Legacy reference | LayoutDashboard | Rendered | LayoutDashboard | Context review | Normal | Pending | Confirm semantics in context |
| /admin/command-center/page.tsx | src/app/admin/command-center/page.tsx:93 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| /admin/command-center/page.tsx | src/app/admin/command-center/page.tsx:97 | Legacy reference | AlertTriangle | Rendered | AlertTriangle | State | Normal | Pending | Confirm semantics in context |
| /admin/command-center/page.tsx | src/app/admin/command-center/page.tsx:102 | Icon component | Icon | Rendered | Trace source | Context review | Normal | Review | May refer to an inventory entry elsewhere |
| /admin/command-center/page.tsx | src/app/admin/command-center/page.tsx:104 | Legacy reference | ArrowRight | Rendered | ArrowRight | Context review | Normal | Pending | Confirm semantics in context |
| /admin/command-center/page.tsx | src/app/admin/command-center/page.tsx:110 | Legacy reference | CheckCircle2 | Rendered | CheckCircle2 | Context review | Normal | Pending | Confirm semantics in context |
| /admin/command-center/page.tsx | src/app/admin/command-center/page.tsx:115 | Legacy reference | Clock3 | Rendered | Clock3 | Context review | Normal | Pending | Confirm semantics in context |
| /admin/command-center/page.tsx | src/app/admin/command-center/page.tsx:120 | Legacy reference | Search | Rendered | Search | Context review | Normal | Pending | Confirm semantics in context |
| /admin/command-center/page.tsx | src/app/admin/command-center/page.tsx:128 | Legacy reference | ShieldAlert | Rendered | ShieldAlert | State | Normal | Pending | Confirm semantics in context |
| /admin/command-center/page.tsx | src/app/admin/command-center/page.tsx:133 | Legacy reference | ArrowRight | Rendered | ArrowRight | Context review | Normal | Pending | Confirm semantics in context |
| /admin/command-center/page.tsx | src/app/admin/command-center/page.tsx:148 | Legacy reference | ArrowRight | Rendered | ArrowRight | Context review | Normal | Pending | Confirm semantics in context |
| /admin/coupons/page.tsx | src/app/admin/coupons/page.tsx:6 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /admin/coupons/page.tsx | src/app/admin/coupons/page.tsx:260 | Legacy reference | Tag | Rendered | Tag | Context review | Normal | Pending | Confirm semantics in context |
| /admin/coupons/page.tsx | src/app/admin/coupons/page.tsx:276 | Legacy reference | Plus | Rendered | Plus | Context review | Normal | Pending | Confirm semantics in context |
| /admin/coupons/page.tsx | src/app/admin/coupons/page.tsx:285 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| /admin/coupons/page.tsx | src/app/admin/coupons/page.tsx:312 | Legacy reference | Search | Rendered | Search | Context review | Normal | Pending | Confirm semantics in context |
| /admin/coupons/page.tsx | src/app/admin/coupons/page.tsx:355 | Legacy reference | Check | Rendered | Check | Context review | Normal | Pending | Confirm semantics in context |
| /admin/coupons/page.tsx | src/app/admin/coupons/page.tsx:357 | Legacy reference | Copy | Rendered | Copy | Context review | Normal | Pending | Confirm semantics in context |
| /admin/coupons/page.tsx | src/app/admin/coupons/page.tsx:413 | Legacy reference | Power | Rendered | Power | Context review | Normal | Pending | Confirm semantics in context |
| /admin/coupons/page.tsx | src/app/admin/coupons/page.tsx:426 | Legacy reference | Copy | Rendered | Copy | Context review | Normal | Pending | Confirm semantics in context |
| /admin/coupons/page.tsx | src/app/admin/coupons/page.tsx:434 | Legacy reference | Edit2 | Rendered | Edit2 | Context review | Normal | Pending | Confirm semantics in context |
| /admin/coupons/page.tsx | src/app/admin/coupons/page.tsx:442 | Legacy reference | Trash2 | Rendered | Trash2 | Context review | Normal | Pending | Confirm semantics in context |
| /admin/coupons/page.tsx | src/app/admin/coupons/page.tsx:453 | Legacy reference | Tag | Rendered | Tag | Context review | Normal | Pending | Confirm semantics in context |
| /admin/coupons/page.tsx | src/app/admin/coupons/page.tsx:472 | Legacy reference | Tag | Rendered | Tag | Context review | Normal | Pending | Confirm semantics in context |
| /admin/coupons/page.tsx | src/app/admin/coupons/page.tsx:479 | Legacy reference | X | Rendered | X | Context review | Normal | Pending | Confirm semantics in context |
| /admin/coupons/page.tsx | src/app/admin/coupons/page.tsx:591 | Legacy reference | Search | Rendered | Search | Context review | Normal | Pending | Confirm semantics in context |
| /admin/coupons/page.tsx | src/app/admin/coupons/page.tsx:605 | Legacy reference | X | Rendered | X | Context review | Normal | Pending | Confirm semantics in context |
| /admin/coupons/simulator/page.tsx | src/app/admin/coupons/simulator/page.tsx:4 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /admin/coupons/simulator/page.tsx | src/app/admin/coupons/simulator/page.tsx:61 | Legacy reference | Calculator | Rendered | Calculator | Context review | Normal | Pending | Confirm semantics in context |
| /admin/coupons/simulator/page.tsx | src/app/admin/coupons/simulator/page.tsx:62 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| /admin/coupons/simulator/page.tsx | src/app/admin/coupons/simulator/page.tsx:72 | Legacy reference | Plus | Rendered | Plus | Context review | Normal | Pending | Confirm semantics in context |
| /admin/coupons/simulator/page.tsx | src/app/admin/coupons/simulator/page.tsx:74 | Legacy reference | Trash2 | Rendered | Trash2 | Context review | Normal | Pending | Confirm semantics in context |
| /admin/customers/page.tsx | src/app/admin/customers/page.tsx:5 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /admin/customers/page.tsx | src/app/admin/customers/page.tsx:7 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /admin/customers/page.tsx | src/app/admin/customers/page.tsx:34 | Legacy reference | Users | Rendered | Users | Context review | Normal | Pending | Confirm semantics in context |
| /admin/customers/page.tsx | src/app/admin/customers/page.tsx:34 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| /admin/customers/page.tsx | src/app/admin/customers/page.tsx:35 | Legacy reference | Search | Rendered | Search | Context review | Normal | Pending | Confirm semantics in context |
| /admin/customers/page.tsx | src/app/admin/customers/page.tsx:37 | Legacy reference | ChevronRight | Rendered | ChevronRight | Context review | Normal | Pending | Confirm semantics in context |
| /admin/customers/page.tsx | src/app/admin/customers/page.tsx:46 | Legacy reference | Tag | Rendered | Tag | Context review | Normal | Pending | Confirm semantics in context |
| /admin/customers/page.tsx | src/app/admin/customers/page.tsx:46 | Legacy reference | ShieldAlert | Rendered | ShieldAlert | State | Normal | Pending | Confirm semantics in context |
| /admin/customers/page.tsx | src/app/admin/customers/page.tsx:46 | Legacy reference | MessageSquare | Rendered | MessageSquare | Context review | Normal | Pending | Confirm semantics in context |
| /admin/customers/page.tsx | src/app/admin/customers/page.tsx:46 | Legacy reference | Ticket | Rendered | Ticket | Context review | Normal | Pending | Confirm semantics in context |
| /admin/customers/page.tsx | src/app/admin/customers/page.tsx:46 | Legacy reference | Undo2 | Rendered | Undo2 | Context review | Normal | Pending | Confirm semantics in context |
| /admin/demand/page.tsx | src/app/admin/demand/page.tsx:5 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /admin/demand/page.tsx | src/app/admin/demand/page.tsx:16 | Legacy reference | LucideIcon | Source reference | LucideIcon | Context review | Normal | Pending | Confirm semantics in context |
| /admin/demand/page.tsx | src/app/admin/demand/page.tsx:17 | Legacy reference | ClipboardList | Source reference | ClipboardList | Context review | Normal | Pending | Confirm semantics in context |
| /admin/demand/page.tsx | src/app/admin/demand/page.tsx:18 | Legacy reference | Users | Source reference | Users | Context review | Normal | Pending | Confirm semantics in context |
| /admin/demand/page.tsx | src/app/admin/demand/page.tsx:19 | Legacy reference | Package | Source reference | Package | Context review | Normal | Pending | Confirm semantics in context |
| /admin/demand/page.tsx | src/app/admin/demand/page.tsx:20 | Legacy reference | Package | Source reference | Package | Context review | Normal | Pending | Confirm semantics in context |
| /admin/demand/page.tsx | src/app/admin/demand/page.tsx:21 | Legacy reference | AlertTriangle | Source reference | AlertTriangle | State | Normal | Pending | Confirm semantics in context |
| /admin/demand/page.tsx | src/app/admin/demand/page.tsx:59 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| /admin/demand/page.tsx | src/app/admin/demand/page.tsx:63 | Icon component | Icon | Rendered | Trace source | Context review | Normal | Review | May refer to an inventory entry elsewhere |
| /admin/demand/page.tsx | src/app/admin/demand/page.tsx:69 | Legacy reference | Search | Rendered | Search | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/campaigns/[id]/edit/page.tsx | src/app/admin/email-marketing/campaigns/[id]/edit/page.tsx:7 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /admin/email-marketing/campaigns/[id]/edit/page.tsx | src/app/admin/email-marketing/campaigns/[id]/edit/page.tsx:153 | Emoji candidate | 🚀 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| /admin/email-marketing/campaigns/[id]/edit/page.tsx | src/app/admin/email-marketing/campaigns/[id]/edit/page.tsx:217 | Legacy reference | ArrowLeft | Rendered | ArrowLeft | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/campaigns/[id]/edit/page.tsx | src/app/admin/email-marketing/campaigns/[id]/edit/page.tsx:334 | Legacy reference | ShoppingBag | Rendered | ShoppingBag | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/campaigns/[id]/edit/page.tsx | src/app/admin/email-marketing/campaigns/[id]/edit/page.tsx:342 | Legacy reference | Tag | Rendered | Tag | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/campaigns/[id]/edit/page.tsx | src/app/admin/email-marketing/campaigns/[id]/edit/page.tsx:385 | Legacy reference | Save | Rendered | Save | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/campaigns/[id]/edit/page.tsx | src/app/admin/email-marketing/campaigns/[id]/edit/page.tsx:394 | Legacy reference | Eye | Rendered | Eye | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/campaigns/[id]/edit/page.tsx | src/app/admin/email-marketing/campaigns/[id]/edit/page.tsx:431 | Legacy reference | ShoppingBag | Rendered | ShoppingBag | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/campaigns/[id]/edit/page.tsx | src/app/admin/email-marketing/campaigns/[id]/edit/page.tsx:437 | Legacy reference | Search | Rendered | Search | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/campaigns/[id]/edit/page.tsx | src/app/admin/email-marketing/campaigns/[id]/edit/page.tsx:476 | Legacy reference | Tag | Rendered | Tag | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/campaigns/[id]/page.tsx | src/app/admin/email-marketing/campaigns/[id]/page.tsx:9 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /admin/email-marketing/campaigns/[id]/page.tsx | src/app/admin/email-marketing/campaigns/[id]/page.tsx:234 | Legacy reference | ArrowLeft | Rendered | ArrowLeft | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/campaigns/[id]/page.tsx | src/app/admin/email-marketing/campaigns/[id]/page.tsx:267 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/campaigns/[id]/page.tsx | src/app/admin/email-marketing/campaigns/[id]/page.tsx:274 | Legacy reference | Send | Rendered | Send | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/campaigns/[id]/page.tsx | src/app/admin/email-marketing/campaigns/[id]/page.tsx:284 | Legacy reference | Edit2 | Rendered | Edit2 | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/campaigns/[id]/page.tsx | src/app/admin/email-marketing/campaigns/[id]/page.tsx:292 | Legacy reference | Send | Rendered | Send | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/campaigns/[id]/page.tsx | src/app/admin/email-marketing/campaigns/[id]/page.tsx:303 | Legacy reference | Trash2 | Rendered | Trash2 | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/campaigns/[id]/page.tsx | src/app/admin/email-marketing/campaigns/[id]/page.tsx:416 | Legacy reference | Eye | Rendered | Eye | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/campaigns/[id]/page.tsx | src/app/admin/email-marketing/campaigns/[id]/page.tsx:419 | Legacy reference | ChevronUp | Rendered | ChevronUp | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/campaigns/[id]/page.tsx | src/app/admin/email-marketing/campaigns/[id]/page.tsx:419 | Legacy reference | ChevronDown | Rendered | ChevronDown | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/campaigns/[id]/page.tsx | src/app/admin/email-marketing/campaigns/[id]/page.tsx:456 | Legacy reference | Search | Rendered | Search | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/campaigns/[id]/page.tsx | src/app/admin/email-marketing/campaigns/[id]/page.tsx:514 | Emoji candidate | 👁️ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| /admin/email-marketing/campaigns/[id]/page.tsx | src/app/admin/email-marketing/campaigns/[id]/page.tsx:524 | Emoji candidate | 🖱️ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| /admin/email-marketing/campaigns/[id]/page.tsx | src/app/admin/email-marketing/campaigns/[id]/page.tsx:534 | Emoji candidate | ⚠️ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| /admin/email-marketing/campaigns/[id]/page.tsx | src/app/admin/email-marketing/campaigns/[id]/page.tsx:583 | Legacy reference | Send | Rendered | Send | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/campaigns/new/page.tsx | src/app/admin/email-marketing/campaigns/new/page.tsx:7 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /admin/email-marketing/campaigns/new/page.tsx | src/app/admin/email-marketing/campaigns/new/page.tsx:214 | Emoji candidate | 🚀 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| /admin/email-marketing/campaigns/new/page.tsx | src/app/admin/email-marketing/campaigns/new/page.tsx:371 | Legacy reference | Send | Rendered | Send | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/campaigns/new/page.tsx | src/app/admin/email-marketing/campaigns/new/page.tsx:411 | Legacy reference | CheckCircle2 | Rendered | CheckCircle2 | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/campaigns/new/page.tsx | src/app/admin/email-marketing/campaigns/new/page.tsx:450 | Emoji candidate | 🔥 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| /admin/email-marketing/campaigns/new/page.tsx | src/app/admin/email-marketing/campaigns/new/page.tsx:522 | Legacy reference | ArrowRight | Rendered | ArrowRight | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/campaigns/new/page.tsx | src/app/admin/email-marketing/campaigns/new/page.tsx:563 | Legacy reference | Check | Rendered | Check | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/campaigns/new/page.tsx | src/app/admin/email-marketing/campaigns/new/page.tsx:664 | Emoji candidate | 🛡️ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| /admin/email-marketing/campaigns/new/page.tsx | src/app/admin/email-marketing/campaigns/new/page.tsx:691 | Legacy reference | ArrowRight | Rendered | ArrowRight | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/campaigns/new/page.tsx | src/app/admin/email-marketing/campaigns/new/page.tsx:733 | Legacy reference | ShoppingBag | Rendered | ShoppingBag | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/campaigns/new/page.tsx | src/app/admin/email-marketing/campaigns/new/page.tsx:742 | Legacy reference | Tag | Rendered | Tag | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/campaigns/new/page.tsx | src/app/admin/email-marketing/campaigns/new/page.tsx:809 | Legacy reference | ArrowRight | Rendered | ArrowRight | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/campaigns/new/page.tsx | src/app/admin/email-marketing/campaigns/new/page.tsx:818 | Legacy reference | Eye | Rendered | Eye | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/campaigns/new/page.tsx | src/app/admin/email-marketing/campaigns/new/page.tsx:831 | Legacy reference | Monitor | Rendered | Monitor | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/campaigns/new/page.tsx | src/app/admin/email-marketing/campaigns/new/page.tsx:841 | Legacy reference | Smartphone | Rendered | Smartphone | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/campaigns/new/page.tsx | src/app/admin/email-marketing/campaigns/new/page.tsx:946 | Legacy reference | Send | Rendered | Send | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/campaigns/new/page.tsx | src/app/admin/email-marketing/campaigns/new/page.tsx:985 | Emoji candidate | 🚀 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| /admin/email-marketing/campaigns/new/page.tsx | src/app/admin/email-marketing/campaigns/new/page.tsx:986 | Legacy reference | Check | Rendered | Check | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/campaigns/new/page.tsx | src/app/admin/email-marketing/campaigns/new/page.tsx:1003 | Emoji candidate | 📅 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| /admin/email-marketing/campaigns/new/page.tsx | src/app/admin/email-marketing/campaigns/new/page.tsx:1004 | Legacy reference | Check | Rendered | Check | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/campaigns/new/page.tsx | src/app/admin/email-marketing/campaigns/new/page.tsx:1041 | Legacy reference | AlertTriangle | Rendered | AlertTriangle | State | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/campaigns/new/page.tsx | src/app/admin/email-marketing/campaigns/new/page.tsx:1078 | Emoji candidate | 🚀 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| /admin/email-marketing/campaigns/new/page.tsx | src/app/admin/email-marketing/campaigns/new/page.tsx:1091 | Legacy reference | ShoppingBag | Rendered | ShoppingBag | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/campaigns/new/page.tsx | src/app/admin/email-marketing/campaigns/new/page.tsx:1100 | Legacy reference | Search | Rendered | Search | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/campaigns/new/page.tsx | src/app/admin/email-marketing/campaigns/new/page.tsx:1140 | Legacy reference | Tag | Rendered | Tag | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/campaigns/page.tsx | src/app/admin/email-marketing/campaigns/page.tsx:5 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /admin/email-marketing/campaigns/page.tsx | src/app/admin/email-marketing/campaigns/page.tsx:38 | Legacy reference | ArrowLeft | Rendered | ArrowLeft | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/campaigns/page.tsx | src/app/admin/email-marketing/campaigns/page.tsx:51 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/campaigns/page.tsx | src/app/admin/email-marketing/campaigns/page.tsx:57 | Legacy reference | Plus | Rendered | Plus | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/campaigns/page.tsx | src/app/admin/email-marketing/campaigns/page.tsx:95 | Legacy reference | Mail | Rendered | Mail | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/contacts/page.tsx | src/app/admin/email-marketing/contacts/page.tsx:7 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /admin/email-marketing/contacts/page.tsx | src/app/admin/email-marketing/contacts/page.tsx:220 | Legacy reference | Users | Rendered | Users | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/contacts/page.tsx | src/app/admin/email-marketing/contacts/page.tsx:236 | Legacy reference | Upload | Rendered | Upload | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/contacts/page.tsx | src/app/admin/email-marketing/contacts/page.tsx:237 | Emoji candidate | 📥 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| /admin/email-marketing/contacts/page.tsx | src/app/admin/email-marketing/contacts/page.tsx:244 | Legacy reference | Plus | Rendered | Plus | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/contacts/page.tsx | src/app/admin/email-marketing/contacts/page.tsx:253 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/contacts/page.tsx | src/app/admin/email-marketing/contacts/page.tsx:309 | Legacy reference | Search | Rendered | Search | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/contacts/page.tsx | src/app/admin/email-marketing/contacts/page.tsx:346 | Legacy reference | ShieldBan | Rendered | ShieldBan | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/contacts/page.tsx | src/app/admin/email-marketing/contacts/page.tsx:351 | Legacy reference | UserCheck | Rendered | UserCheck | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/contacts/page.tsx | src/app/admin/email-marketing/contacts/page.tsx:356 | Legacy reference | UserX | Rendered | UserX | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/contacts/page.tsx | src/app/admin/email-marketing/contacts/page.tsx:395 | Legacy reference | ShieldBan | Rendered | ShieldBan | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/contacts/page.tsx | src/app/admin/email-marketing/contacts/page.tsx:419 | Legacy reference | Plus | Rendered | Plus | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/contacts/page.tsx | src/app/admin/email-marketing/contacts/page.tsx:500 | Legacy reference | FileSpreadsheet | Rendered | FileSpreadsheet | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/logs/page.tsx | src/app/admin/email-marketing/logs/page.tsx:5 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /admin/email-marketing/logs/page.tsx | src/app/admin/email-marketing/logs/page.tsx:77 | Emoji candidate | 🖱️ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| /admin/email-marketing/logs/page.tsx | src/app/admin/email-marketing/logs/page.tsx:78 | Emoji candidate | 👁️ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| /admin/email-marketing/logs/page.tsx | src/app/admin/email-marketing/logs/page.tsx:79 | Emoji candidate | 📤 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| /admin/email-marketing/logs/page.tsx | src/app/admin/email-marketing/logs/page.tsx:80 | Emoji candidate | 🟢 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| /admin/email-marketing/logs/page.tsx | src/app/admin/email-marketing/logs/page.tsx:81 | Emoji candidate | 🚫 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| /admin/email-marketing/logs/page.tsx | src/app/admin/email-marketing/logs/page.tsx:82 | Emoji candidate | ⚠️ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| /admin/email-marketing/logs/page.tsx | src/app/admin/email-marketing/logs/page.tsx:92 | Legacy reference | Inbox | Rendered | Inbox | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/logs/page.tsx | src/app/admin/email-marketing/logs/page.tsx:113 | Legacy reference | Radio | Rendered | Radio | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/logs/page.tsx | src/app/admin/email-marketing/logs/page.tsx:122 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/logs/page.tsx | src/app/admin/email-marketing/logs/page.tsx:146 | Legacy reference | Search | Rendered | Search | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/logs/page.tsx | src/app/admin/email-marketing/logs/page.tsx:192 | Legacy reference | MousePointer | Rendered | MousePointer | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/logs/page.tsx | src/app/admin/email-marketing/logs/page.tsx:193 | Legacy reference | Eye | Rendered | Eye | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/logs/page.tsx | src/app/admin/email-marketing/logs/page.tsx:194 | Legacy reference | Send | Rendered | Send | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/logs/page.tsx | src/app/admin/email-marketing/logs/page.tsx:195 | Legacy reference | CheckCircle2 | Rendered | CheckCircle2 | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/logs/page.tsx | src/app/admin/email-marketing/logs/page.tsx:196 | Legacy reference | UserX | Rendered | UserX | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/logs/page.tsx | src/app/admin/email-marketing/logs/page.tsx:197 | Legacy reference | AlertTriangle | Rendered | AlertTriangle | State | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/logs/page.tsx | src/app/admin/email-marketing/logs/page.tsx:213 | Legacy reference | ExternalLink | Rendered | ExternalLink | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/logs/page.tsx | src/app/admin/email-marketing/logs/page.tsx:223 | Emoji candidate | 🔗 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| /admin/email-marketing/page.tsx | src/app/admin/email-marketing/page.tsx:7 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /admin/email-marketing/page.tsx | src/app/admin/email-marketing/page.tsx:112 | Legacy reference | Sparkles | Rendered | Sparkles | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/page.tsx | src/app/admin/email-marketing/page.tsx:151 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/page.tsx | src/app/admin/email-marketing/page.tsx:158 | Legacy reference | Plus | Rendered | Plus | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/page.tsx | src/app/admin/email-marketing/page.tsx:172 | Legacy reference | Users | Rendered | Users | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/page.tsx | src/app/admin/email-marketing/page.tsx:188 | Legacy reference | Send | Rendered | Send | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/page.tsx | src/app/admin/email-marketing/page.tsx:204 | Legacy reference | CheckCircle2 | Rendered | CheckCircle2 | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/page.tsx | src/app/admin/email-marketing/page.tsx:220 | Legacy reference | Eye | Rendered | Eye | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/page.tsx | src/app/admin/email-marketing/page.tsx:236 | Legacy reference | MousePointer | Rendered | MousePointer | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/page.tsx | src/app/admin/email-marketing/page.tsx:252 | Legacy reference | CalendarClock | Rendered | CalendarClock | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/page.tsx | src/app/admin/email-marketing/page.tsx:325 | Legacy reference | ShieldCheck | Rendered | ShieldCheck | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/page.tsx | src/app/admin/email-marketing/page.tsx:355 | Legacy reference | Send | Rendered | Send | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/page.tsx | src/app/admin/email-marketing/page.tsx:363 | Legacy reference | FileCode | Rendered | FileCode | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/page.tsx | src/app/admin/email-marketing/page.tsx:371 | Legacy reference | Users | Rendered | Users | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/page.tsx | src/app/admin/email-marketing/page.tsx:379 | Legacy reference | Inbox | Rendered | Inbox | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/page.tsx | src/app/admin/email-marketing/page.tsx:393 | Legacy reference | Radio | Rendered | Radio | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/page.tsx | src/app/admin/email-marketing/page.tsx:401 | Legacy reference | ArrowRight | Rendered | ArrowRight | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/page.tsx | src/app/admin/email-marketing/page.tsx:456 | Legacy reference | Mail | Rendered | Mail | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/scheduled/page.tsx | src/app/admin/email-marketing/scheduled/page.tsx:5 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /admin/email-marketing/scheduled/page.tsx | src/app/admin/email-marketing/scheduled/page.tsx:108 | Legacy reference | CalendarClock | Rendered | CalendarClock | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/scheduled/page.tsx | src/app/admin/email-marketing/scheduled/page.tsx:124 | Legacy reference | Plus | Rendered | Plus | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/scheduled/page.tsx | src/app/admin/email-marketing/scheduled/page.tsx:133 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/scheduled/page.tsx | src/app/admin/email-marketing/scheduled/page.tsx:142 | Legacy reference | Terminal | Rendered | Terminal | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/scheduled/page.tsx | src/app/admin/email-marketing/scheduled/page.tsx:169 | Emoji candidate | ⚡ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| /admin/email-marketing/scheduled/page.tsx | src/app/admin/email-marketing/scheduled/page.tsx:195 | Emoji candidate | ⏳ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| /admin/email-marketing/scheduled/page.tsx | src/app/admin/email-marketing/scheduled/page.tsx:213 | Emoji candidate | 📅 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| /admin/email-marketing/scheduled/page.tsx | src/app/admin/email-marketing/scheduled/page.tsx:223 | Legacy reference | Send | Rendered | Send | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/scheduled/page.tsx | src/app/admin/email-marketing/scheduled/page.tsx:232 | Legacy reference | Edit2 | Rendered | Edit2 | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/scheduled/page.tsx | src/app/admin/email-marketing/scheduled/page.tsx:240 | Legacy reference | Trash2 | Rendered | Trash2 | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/scheduled/page.tsx | src/app/admin/email-marketing/scheduled/page.tsx:249 | Legacy reference | CalendarClock | Rendered | CalendarClock | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/segments/page.tsx | src/app/admin/email-marketing/segments/page.tsx:5 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /admin/email-marketing/segments/page.tsx | src/app/admin/email-marketing/segments/page.tsx:186 | Legacy reference | Sliders | Rendered | Sliders | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/segments/page.tsx | src/app/admin/email-marketing/segments/page.tsx:202 | Legacy reference | Plus | Rendered | Plus | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/segments/page.tsx | src/app/admin/email-marketing/segments/page.tsx:211 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/segments/page.tsx | src/app/admin/email-marketing/segments/page.tsx:252 | Legacy reference | Trash2 | Rendered | Trash2 | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/segments/page.tsx | src/app/admin/email-marketing/segments/page.tsx:259 | Legacy reference | Send | Rendered | Send | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/segments/page.tsx | src/app/admin/email-marketing/segments/page.tsx:268 | Legacy reference | Sliders | Rendered | Sliders | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/segments/page.tsx | src/app/admin/email-marketing/segments/page.tsx:281 | Legacy reference | Sliders | Rendered | Sliders | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/settings/page.tsx | src/app/admin/email-marketing/settings/page.tsx:5 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /admin/email-marketing/settings/page.tsx | src/app/admin/email-marketing/settings/page.tsx:200 | Legacy reference | Server | Rendered | Server | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/settings/page.tsx | src/app/admin/email-marketing/settings/page.tsx:217 | Legacy reference | Send | Rendered | Send | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/settings/page.tsx | src/app/admin/email-marketing/settings/page.tsx:227 | Legacy reference | ShieldCheck | Rendered | ShieldCheck | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/settings/page.tsx | src/app/admin/email-marketing/settings/page.tsx:236 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/settings/page.tsx | src/app/admin/email-marketing/settings/page.tsx:249 | Legacy reference | Globe | Rendered | Globe | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/settings/page.tsx | src/app/admin/email-marketing/settings/page.tsx:309 | Legacy reference | Server | Rendered | Server | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/settings/page.tsx | src/app/admin/email-marketing/settings/page.tsx:397 | Legacy reference | Sliders | Rendered | Sliders | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/settings/page.tsx | src/app/admin/email-marketing/settings/page.tsx:483 | Legacy reference | ShieldCheck | Rendered | ShieldCheck | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/settings/page.tsx | src/app/admin/email-marketing/settings/page.tsx:495 | Emoji candidate | 🔄 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| /admin/email-marketing/settings/page.tsx | src/app/admin/email-marketing/settings/page.tsx:523 | Legacy reference | Copy | Rendered | Copy | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/settings/page.tsx | src/app/admin/email-marketing/settings/page.tsx:550 | Legacy reference | Copy | Rendered | Copy | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/settings/page.tsx | src/app/admin/email-marketing/settings/page.tsx:577 | Legacy reference | Copy | Rendered | Copy | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/settings/page.tsx | src/app/admin/email-marketing/settings/page.tsx:592 | Legacy reference | Save | Rendered | Save | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/settings/page.tsx | src/app/admin/email-marketing/settings/page.tsx:605 | Legacy reference | Send | Rendered | Send | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/suppressions/page.tsx | src/app/admin/email-marketing/suppressions/page.tsx:5 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /admin/email-marketing/suppressions/page.tsx | src/app/admin/email-marketing/suppressions/page.tsx:127 | Legacy reference | ShieldBan | Rendered | ShieldBan | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/suppressions/page.tsx | src/app/admin/email-marketing/suppressions/page.tsx:143 | Legacy reference | Plus | Rendered | Plus | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/suppressions/page.tsx | src/app/admin/email-marketing/suppressions/page.tsx:152 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/suppressions/page.tsx | src/app/admin/email-marketing/suppressions/page.tsx:159 | Legacy reference | ShieldCheck | Rendered | ShieldCheck | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/suppressions/page.tsx | src/app/admin/email-marketing/suppressions/page.tsx:193 | Legacy reference | Search | Rendered | Search | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/suppressions/page.tsx | src/app/admin/email-marketing/suppressions/page.tsx:277 | Legacy reference | ShieldBan | Rendered | ShieldBan | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/templates/[id]/page.tsx | src/app/admin/email-marketing/templates/[id]/page.tsx:7 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /admin/email-marketing/templates/[id]/page.tsx | src/app/admin/email-marketing/templates/[id]/page.tsx:123 | Legacy reference | ArrowLeft | Rendered | ArrowLeft | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/templates/[id]/page.tsx | src/app/admin/email-marketing/templates/[id]/page.tsx:138 | Legacy reference | Send | Rendered | Send | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/templates/[id]/page.tsx | src/app/admin/email-marketing/templates/[id]/page.tsx:147 | Legacy reference | Trash2 | Rendered | Trash2 | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/templates/[id]/page.tsx | src/app/admin/email-marketing/templates/[id]/page.tsx:240 | Legacy reference | Save | Rendered | Save | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/templates/[id]/page.tsx | src/app/admin/email-marketing/templates/[id]/page.tsx:249 | Legacy reference | Eye | Rendered | Eye | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/templates/new/page.tsx | src/app/admin/email-marketing/templates/new/page.tsx:7 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /admin/email-marketing/templates/new/page.tsx | src/app/admin/email-marketing/templates/new/page.tsx:73 | Legacy reference | ArrowLeft | Rendered | ArrowLeft | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/templates/new/page.tsx | src/app/admin/email-marketing/templates/new/page.tsx:181 | Legacy reference | Save | Rendered | Save | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/templates/new/page.tsx | src/app/admin/email-marketing/templates/new/page.tsx:190 | Legacy reference | Eye | Rendered | Eye | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/templates/page.tsx | src/app/admin/email-marketing/templates/page.tsx:6 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /admin/email-marketing/templates/page.tsx | src/app/admin/email-marketing/templates/page.tsx:114 | Legacy reference | FileCode | Rendered | FileCode | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/templates/page.tsx | src/app/admin/email-marketing/templates/page.tsx:130 | Legacy reference | Plus | Rendered | Plus | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/templates/page.tsx | src/app/admin/email-marketing/templates/page.tsx:139 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/templates/page.tsx | src/app/admin/email-marketing/templates/page.tsx:163 | Legacy reference | Search | Rendered | Search | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/templates/page.tsx | src/app/admin/email-marketing/templates/page.tsx:216 | Legacy reference | Eye | Rendered | Eye | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/templates/page.tsx | src/app/admin/email-marketing/templates/page.tsx:224 | Legacy reference | Copy | Rendered | Copy | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/templates/page.tsx | src/app/admin/email-marketing/templates/page.tsx:232 | Legacy reference | Edit2 | Rendered | Edit2 | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/templates/page.tsx | src/app/admin/email-marketing/templates/page.tsx:240 | Legacy reference | Trash2 | Rendered | Trash2 | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/templates/page.tsx | src/app/admin/email-marketing/templates/page.tsx:248 | Legacy reference | Send | Rendered | Send | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/templates/page.tsx | src/app/admin/email-marketing/templates/page.tsx:256 | Legacy reference | FileCode | Rendered | FileCode | Context review | Normal | Pending | Confirm semantics in context |
| /admin/email-marketing/templates/page.tsx | src/app/admin/email-marketing/templates/page.tsx:310 | Legacy reference | Send | Rendered | Send | Context review | Normal | Pending | Confirm semantics in context |
| /admin/error.tsx | src/app/admin/error.tsx:5 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /admin/error.tsx | src/app/admin/error.tsx:22 | Legacy reference | AlertCircle | Rendered | AlertCircle | State | Normal | Pending | Confirm semantics in context |
| /admin/error.tsx | src/app/admin/error.tsx:39 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| /admin/error.tsx | src/app/admin/error.tsx:47 | Legacy reference | LayoutDashboard | Rendered | LayoutDashboard | Context review | Normal | Pending | Confirm semantics in context |
| /admin/fraud/page.tsx | src/app/admin/fraud/page.tsx:5 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /admin/fraud/page.tsx | src/app/admin/fraud/page.tsx:12 | Legacy reference | AlertTriangle | Source reference | AlertTriangle | State | Normal | Pending | Confirm semantics in context |
| /admin/fraud/page.tsx | src/app/admin/fraud/page.tsx:13 | Legacy reference | ShieldAlert | Source reference | ShieldAlert | State | Normal | Pending | Confirm semantics in context |
| /admin/fraud/page.tsx | src/app/admin/fraud/page.tsx:14 | Legacy reference | WalletCards | Source reference | WalletCards | Context review | Normal | Pending | Confirm semantics in context |
| /admin/fraud/page.tsx | src/app/admin/fraud/page.tsx:15 | Legacy reference | Fingerprint | Source reference | Fingerprint | Context review | Normal | Pending | Confirm semantics in context |
| /admin/fraud/page.tsx | src/app/admin/fraud/page.tsx:25 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| /admin/fraud/page.tsx | src/app/admin/fraud/page.tsx:27 | Icon component | Icon | Rendered | Trace source | Context review | Normal | Review | May refer to an inventory entry elsewhere |
| /admin/inventory/batches/page.tsx | src/app/admin/inventory/batches/page.tsx:7 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /admin/inventory/batches/page.tsx | src/app/admin/inventory/batches/page.tsx:263 | Legacy reference | ArrowLeft | Rendered | ArrowLeft | Context review | Normal | Pending | Confirm semantics in context |
| /admin/inventory/batches/page.tsx | src/app/admin/inventory/batches/page.tsx:266 | Legacy reference | FileSpreadsheet | Rendered | FileSpreadsheet | Context review | Normal | Pending | Confirm semantics in context |
| /admin/inventory/batches/page.tsx | src/app/admin/inventory/batches/page.tsx:279 | Legacy reference | Download | Rendered | Download | Context review | Normal | Pending | Confirm semantics in context |
| /admin/inventory/batches/page.tsx | src/app/admin/inventory/batches/page.tsx:287 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| /admin/inventory/batches/page.tsx | src/app/admin/inventory/batches/page.tsx:293 | Legacy reference | Plus | Rendered | Plus | Context review | Normal | Pending | Confirm semantics in context |
| /admin/inventory/batches/page.tsx | src/app/admin/inventory/batches/page.tsx:303 | Legacy reference | Layers | Rendered | Layers | Context review | Normal | Pending | Confirm semantics in context |
| /admin/inventory/batches/page.tsx | src/app/admin/inventory/batches/page.tsx:313 | Legacy reference | DollarSign | Rendered | DollarSign | Context review | Normal | Pending | Confirm semantics in context |
| /admin/inventory/batches/page.tsx | src/app/admin/inventory/batches/page.tsx:323 | Legacy reference | PackageCheck | Rendered | PackageCheck | Context review | Normal | Pending | Confirm semantics in context |
| /admin/inventory/batches/page.tsx | src/app/admin/inventory/batches/page.tsx:333 | Legacy reference | Clock | Rendered | Clock | Context review | Normal | Pending | Confirm semantics in context |
| /admin/inventory/batches/page.tsx | src/app/admin/inventory/batches/page.tsx:345 | Legacy reference | Search | Rendered | Search | Context review | Normal | Pending | Confirm semantics in context |
| /admin/inventory/batches/page.tsx | src/app/admin/inventory/batches/page.tsx:464 | Legacy reference | Edit2 | Rendered | Edit2 | Context review | Normal | Pending | Confirm semantics in context |
| /admin/inventory/batches/page.tsx | src/app/admin/inventory/batches/page.tsx:640 | Legacy reference | ShieldAlert | Rendered | ShieldAlert | State | Normal | Pending | Confirm semantics in context |
| /admin/inventory/batches/page.tsx | src/app/admin/inventory/batches/page.tsx:650 | Legacy reference | AlertTriangle | Rendered | AlertTriangle | State | Normal | Pending | Confirm semantics in context |
| /admin/inventory/page.tsx | src/app/admin/inventory/page.tsx:8 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /admin/inventory/page.tsx | src/app/admin/inventory/page.tsx:77 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| /admin/inventory/page.tsx | src/app/admin/inventory/page.tsx:496 | Legacy reference | CheckCircle | Source reference | CheckCircle | Context review | Normal | Pending | Confirm semantics in context |
| /admin/inventory/page.tsx | src/app/admin/inventory/page.tsx:504 | Legacy reference | Clock | Source reference | Clock | Context review | Normal | Pending | Confirm semantics in context |
| /admin/inventory/page.tsx | src/app/admin/inventory/page.tsx:512 | Legacy reference | Download | Source reference | Download | Context review | Normal | Pending | Confirm semantics in context |
| /admin/inventory/page.tsx | src/app/admin/inventory/page.tsx:520 | Legacy reference | Trash2 | Source reference | Trash2 | Context review | Normal | Pending | Confirm semantics in context |
| /admin/inventory/page.tsx | src/app/admin/inventory/page.tsx:533 | Legacy reference | PackageCheck | Rendered | PackageCheck | Context review | Normal | Pending | Confirm semantics in context |
| /admin/inventory/page.tsx | src/app/admin/inventory/page.tsx:549 | Legacy reference | Plus | Rendered | Plus | Context review | Normal | Pending | Confirm semantics in context |
| /admin/inventory/page.tsx | src/app/admin/inventory/page.tsx:561 | Legacy reference | FileSpreadsheet | Rendered | FileSpreadsheet | Context review | Normal | Pending | Confirm semantics in context |
| /admin/inventory/page.tsx | src/app/admin/inventory/page.tsx:570 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| /admin/inventory/page.tsx | src/app/admin/inventory/page.tsx:585 | Legacy reference | PackageCheck | Rendered | PackageCheck | Context review | Normal | Pending | Confirm semantics in context |
| /admin/inventory/page.tsx | src/app/admin/inventory/page.tsx:597 | Legacy reference | MessageSquare | Rendered | MessageSquare | Context review | Normal | Pending | Confirm semantics in context |
| /admin/inventory/page.tsx | src/app/admin/inventory/page.tsx:609 | Legacy reference | Bell | Rendered | Bell | Context review | Normal | Pending | Confirm semantics in context |
| /admin/inventory/page.tsx | src/app/admin/inventory/page.tsx:617 | Legacy reference | FileSpreadsheet | Rendered | FileSpreadsheet | Context review | Normal | Pending | Confirm semantics in context |
| /admin/inventory/page.tsx | src/app/admin/inventory/page.tsx:625 | Legacy reference | PackageCheck | Rendered | PackageCheck | Context review | Normal | Pending | Confirm semantics in context |
| /admin/inventory/page.tsx | src/app/admin/inventory/page.tsx:648 | Legacy reference | Search | Rendered | Search | Context review | Normal | Pending | Confirm semantics in context |
| /admin/inventory/page.tsx | src/app/admin/inventory/page.tsx:784 | Legacy reference | Eye | Rendered | Eye | Context review | Normal | Pending | Confirm semantics in context |
| /admin/inventory/page.tsx | src/app/admin/inventory/page.tsx:877 | Legacy reference | CheckCircle | Rendered | CheckCircle | Context review | Normal | Pending | Confirm semantics in context |
| /admin/inventory/page.tsx | src/app/admin/inventory/page.tsx:887 | Legacy reference | CheckCircle | Rendered | CheckCircle | Context review | Normal | Pending | Confirm semantics in context |
| /admin/inventory/page.tsx | src/app/admin/inventory/page.tsx:913 | Legacy reference | X | Rendered | X | Context review | Normal | Pending | Confirm semantics in context |
| /admin/inventory/page.tsx | src/app/admin/inventory/page.tsx:1020 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| /admin/inventory/page.tsx | src/app/admin/inventory/page.tsx:1036 | Legacy reference | X | Rendered | X | Context review | Normal | Pending | Confirm semantics in context |
| /admin/inventory/page.tsx | src/app/admin/inventory/page.tsx:1107 | Legacy reference | FileSpreadsheet | Rendered | FileSpreadsheet | Context review | Normal | Pending | Confirm semantics in context |
| /admin/inventory/page.tsx | src/app/admin/inventory/page.tsx:1157 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| /admin/inventory/page.tsx | src/app/admin/inventory/page.tsx:1176 | Legacy reference | X | Rendered | X | Context review | Normal | Pending | Confirm semantics in context |
| /admin/inventory/page.tsx | src/app/admin/inventory/page.tsx:1180 | Legacy reference | ShieldAlert | Rendered | ShieldAlert | State | Normal | Pending | Confirm semantics in context |
| /admin/inventory/page.tsx | src/app/admin/inventory/page.tsx:1198 | Legacy reference | Check | Rendered | Check | Context review | Normal | Pending | Confirm semantics in context |
| /admin/inventory/page.tsx | src/app/admin/inventory/page.tsx:1198 | Legacy reference | Copy | Rendered | Copy | Context review | Normal | Pending | Confirm semantics in context |
| /admin/mfa-setup/page.tsx | src/app/admin/mfa-setup/page.tsx:6 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /admin/mfa-setup/page.tsx | src/app/admin/mfa-setup/page.tsx:151 | Legacy reference | AlertCircle | Rendered | AlertCircle | State | Normal | Pending | Confirm semantics in context |
| /admin/mfa-setup/page.tsx | src/app/admin/mfa-setup/page.tsx:159 | Legacy reference | ShieldAlert | Rendered | ShieldAlert | State | Normal | Pending | Confirm semantics in context |
| /admin/mfa-setup/page.tsx | src/app/admin/mfa-setup/page.tsx:174 | Legacy reference | Loader2 | Rendered | Loader2 | Loop while busy | Normal | Pending | Confirm semantics in context |
| /admin/mfa-setup/page.tsx | src/app/admin/mfa-setup/page.tsx:177 | Legacy reference | ChevronRight | Rendered | ChevronRight | Context review | Normal | Pending | Confirm semantics in context |
| /admin/mfa-setup/page.tsx | src/app/admin/mfa-setup/page.tsx:250 | Legacy reference | Loader2 | Rendered | Loader2 | Loop while busy | Normal | Pending | Confirm semantics in context |
| /admin/mfa-setup/page.tsx | src/app/admin/mfa-setup/page.tsx:265 | Legacy reference | ShieldCheck | Rendered | ShieldCheck | Context review | Normal | Pending | Confirm semantics in context |
| /admin/mfa-setup/page.tsx | src/app/admin/mfa-setup/page.tsx:284 | Legacy reference | Copy | Rendered | Copy | Context review | Normal | Pending | Confirm semantics in context |
| /admin/mfa-setup/page.tsx | src/app/admin/mfa-setup/page.tsx:287 | Legacy reference | Download | Rendered | Download | Context review | Normal | Pending | Confirm semantics in context |
| /admin/notifications/page.tsx | src/app/admin/notifications/page.tsx:6 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /admin/notifications/page.tsx | src/app/admin/notifications/page.tsx:144 | Legacy reference | Bell | Rendered | Bell | Context review | Normal | Pending | Confirm semantics in context |
| /admin/notifications/page.tsx | src/app/admin/notifications/page.tsx:158 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| /admin/notifications/page.tsx | src/app/admin/notifications/page.tsx:167 | Legacy reference | Layers | Rendered | Layers | Context review | Normal | Pending | Confirm semantics in context |
| /admin/notifications/page.tsx | src/app/admin/notifications/page.tsx:177 | Legacy reference | CheckCircle | Rendered | CheckCircle | Context review | Normal | Pending | Confirm semantics in context |
| /admin/notifications/page.tsx | src/app/admin/notifications/page.tsx:187 | Legacy reference | Clock | Rendered | Clock | Context review | Normal | Pending | Confirm semantics in context |
| /admin/notifications/page.tsx | src/app/admin/notifications/page.tsx:197 | Legacy reference | AlertTriangle | Rendered | AlertTriangle | State | Normal | Pending | Confirm semantics in context |
| /admin/notifications/page.tsx | src/app/admin/notifications/page.tsx:209 | Legacy reference | Search | Rendered | Search | Context review | Normal | Pending | Confirm semantics in context |
| /admin/notifications/page.tsx | src/app/admin/notifications/page.tsx:307 | Legacy reference | Eye | Rendered | Eye | Context review | Normal | Pending | Confirm semantics in context |
| /admin/notifications/page.tsx | src/app/admin/notifications/page.tsx:316 | Legacy reference | RotateCcw | Rendered | RotateCcw | Context review | Normal | Pending | Confirm semantics in context |
| /admin/orders/page.tsx | src/app/admin/orders/page.tsx:7 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /admin/orders/page.tsx | src/app/admin/orders/page.tsx:639 | Legacy reference | CheckCircle2 | Source reference | CheckCircle2 | Context review | Normal | Pending | Confirm semantics in context |
| /admin/orders/page.tsx | src/app/admin/orders/page.tsx:647 | Legacy reference | CreditCard | Source reference | CreditCard | Context review | Normal | Pending | Confirm semantics in context |
| /admin/orders/page.tsx | src/app/admin/orders/page.tsx:655 | Legacy reference | Download | Source reference | Download | Context review | Normal | Pending | Confirm semantics in context |
| /admin/orders/page.tsx | src/app/admin/orders/page.tsx:663 | Legacy reference | Ban | Source reference | Ban | Context review | Normal | Pending | Confirm semantics in context |
| /admin/orders/page.tsx | src/app/admin/orders/page.tsx:677 | Legacy reference | ShoppingBag | Rendered | ShoppingBag | Context review | Normal | Pending | Confirm semantics in context |
| /admin/orders/page.tsx | src/app/admin/orders/page.tsx:694 | Legacy reference | FileSpreadsheet | Rendered | FileSpreadsheet | Context review | Normal | Pending | Confirm semantics in context |
| /admin/orders/page.tsx | src/app/admin/orders/page.tsx:703 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| /admin/orders/page.tsx | src/app/admin/orders/page.tsx:753 | Legacy reference | Search | Rendered | Search | Context review | Normal | Pending | Confirm semantics in context |
| /admin/orders/page.tsx | src/app/admin/orders/page.tsx:889 | Legacy reference | Eye | Rendered | Eye | Context review | Normal | Pending | Confirm semantics in context |
| /admin/orders/page.tsx | src/app/admin/orders/page.tsx:902 | Legacy reference | KeyRound | Rendered | KeyRound | Context review | Normal | Pending | Confirm semantics in context |
| /admin/orders/page.tsx | src/app/admin/orders/page.tsx:912 | Legacy reference | Mail | Rendered | Mail | Context review | Normal | Pending | Confirm semantics in context |
| /admin/orders/page.tsx | src/app/admin/orders/page.tsx:922 | Legacy reference | ShoppingBag | Rendered | ShoppingBag | Context review | Normal | Pending | Confirm semantics in context |
| /admin/orders/page.tsx | src/app/admin/orders/page.tsx:995 | Legacy reference | Check | Rendered | Check | Context review | Normal | Pending | Confirm semantics in context |
| /admin/orders/page.tsx | src/app/admin/orders/page.tsx:997 | Legacy reference | Copy | Rendered | Copy | Context review | Normal | Pending | Confirm semantics in context |
| /admin/orders/page.tsx | src/app/admin/orders/page.tsx:1019 | Legacy reference | MessageSquare | Rendered | MessageSquare | Context review | Normal | Pending | Confirm semantics in context |
| /admin/orders/page.tsx | src/app/admin/orders/page.tsx:1109 | Legacy reference | KeyRound | Rendered | KeyRound | Context review | Normal | Pending | Confirm semantics in context |
| /admin/orders/page.tsx | src/app/admin/orders/page.tsx:1118 | Legacy reference | Mail | Rendered | Mail | Context review | Normal | Pending | Confirm semantics in context |
| /admin/orders/page.tsx | src/app/admin/orders/page.tsx:1129 | Legacy reference | Eye | Rendered | Eye | Context review | Normal | Pending | Confirm semantics in context |
| /admin/orders/page.tsx | src/app/admin/orders/page.tsx:1140 | Legacy reference | ShoppingBag | Rendered | ShoppingBag | Context review | Normal | Pending | Confirm semantics in context |
| /admin/orders/page.tsx | src/app/admin/orders/page.tsx:1179 | Legacy reference | ChevronLeft | Rendered | ChevronLeft | Context review | Normal | Pending | Confirm semantics in context |
| /admin/orders/page.tsx | src/app/admin/orders/page.tsx:1188 | Legacy reference | ChevronRight | Rendered | ChevronRight | Context review | Normal | Pending | Confirm semantics in context |
| /admin/orders/page.tsx | src/app/admin/orders/page.tsx:1203 | Legacy reference | ShoppingBag | Rendered | ShoppingBag | Context review | Normal | Pending | Confirm semantics in context |
| /admin/orders/page.tsx | src/app/admin/orders/page.tsx:1216 | Legacy reference | Check | Rendered | Check | Context review | Normal | Pending | Confirm semantics in context |
| /admin/orders/page.tsx | src/app/admin/orders/page.tsx:1218 | Legacy reference | Copy | Rendered | Copy | Context review | Normal | Pending | Confirm semantics in context |
| /admin/orders/page.tsx | src/app/admin/orders/page.tsx:1232 | Legacy reference | X | Rendered | X | Context review | Normal | Pending | Confirm semantics in context |
| /admin/orders/page.tsx | src/app/admin/orders/page.tsx:1240 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| /admin/orders/page.tsx | src/app/admin/orders/page.tsx:1296 | Legacy reference | User | Rendered | User | Context review | Normal | Pending | Confirm semantics in context |
| /admin/orders/page.tsx | src/app/admin/orders/page.tsx:1306 | Legacy reference | MessageSquare | Rendered | MessageSquare | Context review | Normal | Pending | Confirm semantics in context |
| /admin/orders/page.tsx | src/app/admin/orders/page.tsx:1331 | Legacy reference | Layers | Rendered | Layers | Context review | Normal | Pending | Confirm semantics in context |
| /admin/orders/page.tsx | src/app/admin/orders/page.tsx:1348 | Legacy reference | CheckCircle2 | Rendered | CheckCircle2 | Context review | Normal | Pending | Confirm semantics in context |
| /admin/orders/page.tsx | src/app/admin/orders/page.tsx:1371 | Legacy reference | KeyRound | Rendered | KeyRound | Context review | Normal | Pending | Confirm semantics in context |
| /admin/orders/page.tsx | src/app/admin/orders/page.tsx:1409 | Legacy reference | RotateCcw | Rendered | RotateCcw | Context review | Normal | Pending | Confirm semantics in context |
| /admin/orders/page.tsx | src/app/admin/orders/page.tsx:1417 | Legacy reference | Ban | Rendered | Ban | Context review | Normal | Pending | Confirm semantics in context |
| /admin/orders/page.tsx | src/app/admin/orders/page.tsx:1430 | Legacy reference | KeyRound | Rendered | KeyRound | Context review | Normal | Pending | Confirm semantics in context |
| /admin/orders/page.tsx | src/app/admin/orders/page.tsx:1438 | Legacy reference | Mail | Rendered | Mail | Context review | Normal | Pending | Confirm semantics in context |
| /admin/orders/page.tsx | src/app/admin/orders/page.tsx:1460 | Legacy reference | Mail | Rendered | Mail | Context review | Normal | Pending | Confirm semantics in context |
| /admin/orders/page.tsx | src/app/admin/orders/page.tsx:1480 | Legacy reference | X | Rendered | X | Context review | Normal | Pending | Confirm semantics in context |
| /admin/orders/page.tsx | src/app/admin/orders/page.tsx:1496 | Legacy reference | Edit3 | Rendered | Edit3 | Context review | Normal | Pending | Confirm semantics in context |
| /admin/orders/page.tsx | src/app/admin/orders/page.tsx:1509 | Legacy reference | Eye | Rendered | Eye | Context review | Normal | Pending | Confirm semantics in context |
| /admin/orders/page.tsx | src/app/admin/orders/page.tsx:1565 | Legacy reference | Download | Rendered | Download | Context review | Normal | Pending | Confirm semantics in context |
| /admin/orders/page.tsx | src/app/admin/orders/page.tsx:1607 | Legacy reference | Send | Rendered | Send | Context review | Normal | Pending | Confirm semantics in context |
| /admin/orders/page.tsx | src/app/admin/orders/page.tsx:1648 | Legacy reference | Send | Rendered | Send | Context review | Normal | Pending | Confirm semantics in context |
| /admin/orders/page.tsx | src/app/admin/orders/page.tsx:1665 | Legacy reference | AlertTriangle | Rendered | AlertTriangle | State | Normal | Pending | Confirm semantics in context |
| /admin/orders/page.tsx | src/app/admin/orders/page.tsx:1687 | Emoji candidate | ❌ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| /admin/orders/page.tsx | src/app/admin/orders/page.tsx:1690 | Emoji candidate | ❌ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| /admin/orders/page.tsx | src/app/admin/orders/page.tsx:1693 | Emoji candidate | ❌ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| /admin/orders/page.tsx | src/app/admin/orders/page.tsx:1696 | Emoji candidate | ❌ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| /admin/page.tsx | src/app/admin/page.tsx:10 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /admin/page.tsx | src/app/admin/page.tsx:83 | Legacy reference | Sparkles | Rendered | Sparkles | Context review | Normal | Pending | Confirm semantics in context |
| /admin/page.tsx | src/app/admin/page.tsx:122 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| /admin/page.tsx | src/app/admin/page.tsx:138 | Legacy reference | TrendingUp | Rendered | TrendingUp | Context review | Normal | Pending | Confirm semantics in context |
| /admin/page.tsx | src/app/admin/page.tsx:154 | Legacy reference | ShoppingBag | Rendered | ShoppingBag | Context review | Normal | Pending | Confirm semantics in context |
| /admin/page.tsx | src/app/admin/page.tsx:170 | Legacy reference | Clock | Rendered | Clock | Context review | Normal | Pending | Confirm semantics in context |
| /admin/page.tsx | src/app/admin/page.tsx:186 | Legacy reference | Wallet | Rendered | Wallet | Context review | Normal | Pending | Confirm semantics in context |
| /admin/page.tsx | src/app/admin/page.tsx:202 | Legacy reference | KeyRound | Rendered | KeyRound | Context review | Normal | Pending | Confirm semantics in context |
| /admin/page.tsx | src/app/admin/page.tsx:218 | Legacy reference | Users | Rendered | Users | Context review | Normal | Pending | Confirm semantics in context |
| /admin/products/edit/[id]/page.tsx | src/app/admin/products/edit/[id]/page.tsx:6 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /admin/products/edit/[id]/page.tsx | src/app/admin/products/edit/[id]/page.tsx:47 | Legacy reference | AlertTriangle | Rendered | AlertTriangle | State | Normal | Pending | Confirm semantics in context |
| /admin/products/launch/page.tsx | src/app/admin/products/launch/page.tsx:7 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /admin/products/launch/page.tsx | src/app/admin/products/launch/page.tsx:24 | Legacy reference | Loader2 | Rendered | Loader2 | Loop while busy | Normal | Pending | Confirm semantics in context |
| /admin/products/launch/page.tsx | src/app/admin/products/launch/page.tsx:37 | Legacy reference | ExternalLink | Rendered | ExternalLink | Context review | Normal | Pending | Confirm semantics in context |
| /admin/products/launch/page.tsx | src/app/admin/products/launch/page.tsx:38 | Legacy reference | CheckCircle2 | Rendered | CheckCircle2 | Context review | Normal | Pending | Confirm semantics in context |
| /admin/products/launch/page.tsx | src/app/admin/products/launch/page.tsx:38 | Legacy reference | AlertCircle | Rendered | AlertCircle | State | Normal | Pending | Confirm semantics in context |
| /admin/products/launch/page.tsx | src/app/admin/products/launch/page.tsx:40 | Legacy reference | CheckCircle2 | Rendered | CheckCircle2 | Context review | Normal | Pending | Confirm semantics in context |
| /admin/products/launch/page.tsx | src/app/admin/products/launch/page.tsx:40 | Legacy reference | TriangleAlert | Rendered | TriangleAlert | State | Normal | Pending | Confirm semantics in context |
| /admin/products/launch/page.tsx | src/app/admin/products/launch/page.tsx:40 | Legacy reference | AlertCircle | Rendered | AlertCircle | State | Normal | Pending | Confirm semantics in context |
| /admin/products/launch/page.tsx | src/app/admin/products/launch/page.tsx:41 | Legacy reference | PackageCheck | Rendered | PackageCheck | Context review | Normal | Pending | Confirm semantics in context |
| /admin/products/page.tsx | src/app/admin/products/page.tsx:7 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /admin/products/page.tsx | src/app/admin/products/page.tsx:440 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| /admin/products/page.tsx | src/app/admin/products/page.tsx:446 | Legacy reference | FolderTree | Rendered | FolderTree | Context review | Normal | Pending | Confirm semantics in context |
| /admin/products/page.tsx | src/app/admin/products/page.tsx:453 | Legacy reference | Plus | Rendered | Plus | Context review | Normal | Pending | Confirm semantics in context |
| /admin/products/page.tsx | src/app/admin/products/page.tsx:487 | Legacy reference | Search | Rendered | Search | Context review | Normal | Pending | Confirm semantics in context |
| /admin/products/page.tsx | src/app/admin/products/page.tsx:556 | Legacy reference | CheckCircle2 | Source reference | CheckCircle2 | Context review | Normal | Pending | Confirm semantics in context |
| /admin/products/page.tsx | src/app/admin/products/page.tsx:563 | Legacy reference | XCircle | Source reference | XCircle | Context review | Normal | Pending | Confirm semantics in context |
| /admin/products/page.tsx | src/app/admin/products/page.tsx:570 | Legacy reference | DollarSign | Source reference | DollarSign | Context review | Normal | Pending | Confirm semantics in context |
| /admin/products/page.tsx | src/app/admin/products/page.tsx:577 | Legacy reference | Download | Source reference | Download | Context review | Normal | Pending | Confirm semantics in context |
| /admin/products/page.tsx | src/app/admin/products/page.tsx:584 | Legacy reference | Trash2 | Source reference | Trash2 | Context review | Normal | Pending | Confirm semantics in context |
| /admin/products/page.tsx | src/app/admin/products/page.tsx:673 | Legacy reference | Zap | Rendered | Zap | Context review | Normal | Pending | Confirm semantics in context |
| /admin/products/page.tsx | src/app/admin/products/page.tsx:673 | Legacy reference | User | Rendered | User | Context review | Normal | Pending | Confirm semantics in context |
| /admin/products/page.tsx | src/app/admin/products/page.tsx:711 | Legacy reference | Edit2 | Rendered | Edit2 | Context review | Normal | Pending | Confirm semantics in context |
| /admin/products/page.tsx | src/app/admin/products/page.tsx:712 | Legacy reference | Copy | Rendered | Copy | Context review | Normal | Pending | Confirm semantics in context |
| /admin/products/page.tsx | src/app/admin/products/page.tsx:713 | Legacy reference | KeyRound | Rendered | KeyRound | Context review | Normal | Pending | Confirm semantics in context |
| /admin/products/page.tsx | src/app/admin/products/page.tsx:714 | Legacy reference | Trash2 | Rendered | Trash2 | Context review | Normal | Pending | Confirm semantics in context |
| /admin/products/page.tsx | src/app/admin/products/page.tsx:715 | Legacy reference | ExternalLink | Rendered | ExternalLink | Context review | Normal | Pending | Confirm semantics in context |
| /admin/proofs/page.tsx | src/app/admin/proofs/page.tsx:4 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /admin/proofs/page.tsx | src/app/admin/proofs/page.tsx:101 | Legacy reference | ShieldCheck | Rendered | ShieldCheck | Context review | Normal | Pending | Confirm semantics in context |
| /admin/proofs/page.tsx | src/app/admin/proofs/page.tsx:113 | Legacy reference | Plus | Rendered | Plus | Context review | Normal | Pending | Confirm semantics in context |
| /admin/proofs/page.tsx | src/app/admin/proofs/page.tsx:122 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| /admin/proofs/page.tsx | src/app/admin/proofs/page.tsx:154 | Legacy reference | Star | Rendered | Star | Context review | Normal | Pending | Confirm semantics in context |
| /admin/proofs/page.tsx | src/app/admin/proofs/page.tsx:163 | Legacy reference | Trash2 | Rendered | Trash2 | Context review | Normal | Pending | Confirm semantics in context |
| /admin/proofs/page.tsx | src/app/admin/proofs/page.tsx:171 | Legacy reference | ShieldCheck | Rendered | ShieldCheck | Context review | Normal | Pending | Confirm semantics in context |
| /admin/proofs/page.tsx | src/app/admin/proofs/page.tsx:187 | Legacy reference | X | Rendered | X | Context review | Normal | Pending | Confirm semantics in context |
| /admin/refunds/page.tsx | src/app/admin/refunds/page.tsx:6 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /admin/refunds/page.tsx | src/app/admin/refunds/page.tsx:140 | Legacy reference | RotateCcw | Rendered | RotateCcw | Context review | Normal | Pending | Confirm semantics in context |
| /admin/refunds/page.tsx | src/app/admin/refunds/page.tsx:157 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| /admin/refunds/page.tsx | src/app/admin/refunds/page.tsx:225 | Legacy reference | Search | Rendered | Search | Context review | Normal | Pending | Confirm semantics in context |
| /admin/refunds/page.tsx | src/app/admin/refunds/page.tsx:239 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| /admin/refunds/page.tsx | src/app/admin/refunds/page.tsx:244 | Legacy reference | AlertCircle | Rendered | AlertCircle | State | Normal | Pending | Confirm semantics in context |
| /admin/refunds/page.tsx | src/app/admin/refunds/page.tsx:249 | Legacy reference | CheckCircle2 | Rendered | CheckCircle2 | Context review | Normal | Pending | Confirm semantics in context |
| /admin/refunds/page.tsx | src/app/admin/refunds/page.tsx:293 | Legacy reference | User | Rendered | User | Context review | Normal | Pending | Confirm semantics in context |
| /admin/refunds/page.tsx | src/app/admin/refunds/page.tsx:297 | Legacy reference | Mail | Rendered | Mail | Context review | Normal | Pending | Confirm semantics in context |
| /admin/refunds/page.tsx | src/app/admin/refunds/page.tsx:302 | Legacy reference | Phone | Rendered | Phone | Context review | Normal | Pending | Confirm semantics in context |
| /admin/refunds/page.tsx | src/app/admin/refunds/page.tsx:351 | Legacy reference | Sparkles | Rendered | Sparkles | Context review | Normal | Pending | Confirm semantics in context |
| /admin/refunds/page.tsx | src/app/admin/refunds/page.tsx:395 | Legacy reference | X | Rendered | X | Context review | Normal | Pending | Confirm semantics in context |
| /admin/replacements/page.tsx | src/app/admin/replacements/page.tsx:6 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /admin/replacements/page.tsx | src/app/admin/replacements/page.tsx:144 | Legacy reference | ShieldCheck | Rendered | ShieldCheck | Context review | Normal | Pending | Confirm semantics in context |
| /admin/replacements/page.tsx | src/app/admin/replacements/page.tsx:161 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| /admin/replacements/page.tsx | src/app/admin/replacements/page.tsx:229 | Legacy reference | Search | Rendered | Search | Context review | Normal | Pending | Confirm semantics in context |
| /admin/replacements/page.tsx | src/app/admin/replacements/page.tsx:243 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| /admin/replacements/page.tsx | src/app/admin/replacements/page.tsx:248 | Legacy reference | AlertCircle | Rendered | AlertCircle | State | Normal | Pending | Confirm semantics in context |
| /admin/replacements/page.tsx | src/app/admin/replacements/page.tsx:253 | Legacy reference | CheckCircle2 | Rendered | CheckCircle2 | Context review | Normal | Pending | Confirm semantics in context |
| /admin/replacements/page.tsx | src/app/admin/replacements/page.tsx:301 | Legacy reference | User | Rendered | User | Context review | Normal | Pending | Confirm semantics in context |
| /admin/replacements/page.tsx | src/app/admin/replacements/page.tsx:305 | Legacy reference | Mail | Rendered | Mail | Context review | Normal | Pending | Confirm semantics in context |
| /admin/replacements/page.tsx | src/app/admin/replacements/page.tsx:310 | Legacy reference | Phone | Rendered | Phone | Context review | Normal | Pending | Confirm semantics in context |
| /admin/replacements/page.tsx | src/app/admin/replacements/page.tsx:356 | Legacy reference | CheckCircle2 | Rendered | CheckCircle2 | Context review | Normal | Pending | Confirm semantics in context |
| /admin/replacements/page.tsx | src/app/admin/replacements/page.tsx:364 | Legacy reference | ShieldAlert | Rendered | ShieldAlert | State | Normal | Pending | Confirm semantics in context |
| /admin/replacements/page.tsx | src/app/admin/replacements/page.tsx:388 | Legacy reference | X | Rendered | X | Context review | Normal | Pending | Confirm semantics in context |
| /admin/reports/page.tsx | src/app/admin/reports/page.tsx:7 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /admin/reports/page.tsx | src/app/admin/reports/page.tsx:107 | Legacy reference | TrendingUp | Rendered | TrendingUp | Context review | Normal | Pending | Confirm semantics in context |
| /admin/reports/page.tsx | src/app/admin/reports/page.tsx:154 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| /admin/reports/page.tsx | src/app/admin/reports/page.tsx:162 | Legacy reference | TrendingUp | Source reference | TrendingUp | Context review | Normal | Pending | Confirm semantics in context |
| /admin/reports/page.tsx | src/app/admin/reports/page.tsx:163 | Legacy reference | DollarSign | Source reference | DollarSign | Context review | Normal | Pending | Confirm semantics in context |
| /admin/reports/page.tsx | src/app/admin/reports/page.tsx:164 | Legacy reference | Building2 | Source reference | Building2 | Context review | Normal | Pending | Confirm semantics in context |
| /admin/reports/page.tsx | src/app/admin/reports/page.tsx:165 | Legacy reference | ShoppingBag | Source reference | ShoppingBag | Context review | Normal | Pending | Confirm semantics in context |
| /admin/reports/page.tsx | src/app/admin/reports/page.tsx:166 | Legacy reference | Layers | Source reference | Layers | Context review | Normal | Pending | Confirm semantics in context |
| /admin/reports/page.tsx | src/app/admin/reports/page.tsx:167 | Legacy reference | Users | Source reference | Users | Context review | Normal | Pending | Confirm semantics in context |
| /admin/reports/page.tsx | src/app/admin/reports/page.tsx:168 | Legacy reference | CreditCard | Source reference | CreditCard | Context review | Normal | Pending | Confirm semantics in context |
| /admin/reports/page.tsx | src/app/admin/reports/page.tsx:169 | Legacy reference | Tag | Source reference | Tag | Context review | Normal | Pending | Confirm semantics in context |
| /admin/reports/page.tsx | src/app/admin/reports/page.tsx:170 | Legacy reference | Layers | Source reference | Layers | Context review | Normal | Pending | Confirm semantics in context |
| /admin/reports/page.tsx | src/app/admin/reports/page.tsx:171 | Legacy reference | RotateCcw | Source reference | RotateCcw | Context review | Normal | Pending | Confirm semantics in context |
| /admin/reports/page.tsx | src/app/admin/reports/page.tsx:172 | Legacy reference | Radio | Source reference | Radio | Context review | Normal | Pending | Confirm semantics in context |
| /admin/reports/page.tsx | src/app/admin/reports/page.tsx:186 | Icon component | Icon | Rendered | Trace source | Context review | Normal | Review | May refer to an inventory entry elsewhere |
| /admin/reports/page.tsx | src/app/admin/reports/page.tsx:226 | Legacy reference | DollarSign | Rendered | DollarSign | Context review | Normal | Pending | Confirm semantics in context |
| /admin/reports/page.tsx | src/app/admin/reports/page.tsx:254 | Legacy reference | Building2 | Rendered | Building2 | Context review | Normal | Pending | Confirm semantics in context |
| /admin/reports/page.tsx | src/app/admin/reports/page.tsx:266 | Legacy reference | Undo2 | Rendered | Undo2 | Context review | Normal | Pending | Confirm semantics in context |
| /admin/reports/page.tsx | src/app/admin/reports/page.tsx:278 | Legacy reference | ShoppingBag | Rendered | ShoppingBag | Context review | Normal | Pending | Confirm semantics in context |
| /admin/reports/page.tsx | src/app/admin/reports/page.tsx:292 | Legacy reference | TrendingUp | Rendered | TrendingUp | Context review | Normal | Pending | Confirm semantics in context |
| /admin/reports/page.tsx | src/app/admin/reports/page.tsx:315 | Legacy reference | Download | Rendered | Download | Context review | Normal | Pending | Confirm semantics in context |
| /admin/reports/page.tsx | src/app/admin/reports/page.tsx:441 | Legacy reference | Download | Rendered | Download | Context review | Normal | Pending | Confirm semantics in context |
| /admin/reports/page.tsx | src/app/admin/reports/page.tsx:524 | Legacy reference | Download | Rendered | Download | Context review | Normal | Pending | Confirm semantics in context |
| /admin/reports/page.tsx | src/app/admin/reports/page.tsx:565 | Legacy reference | Download | Rendered | Download | Context review | Normal | Pending | Confirm semantics in context |
| /admin/reports/page.tsx | src/app/admin/reports/page.tsx:612 | Legacy reference | Download | Rendered | Download | Context review | Normal | Pending | Confirm semantics in context |
| /admin/reports/page.tsx | src/app/admin/reports/page.tsx:661 | Legacy reference | Download | Rendered | Download | Context review | Normal | Pending | Confirm semantics in context |
| /admin/reports/page.tsx | src/app/admin/reports/page.tsx:710 | Legacy reference | Download | Rendered | Download | Context review | Normal | Pending | Confirm semantics in context |
| /admin/search/page.tsx | src/app/admin/search/page.tsx:5 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /admin/search/page.tsx | src/app/admin/search/page.tsx:18 | Legacy reference | ShoppingBag | Source reference | ShoppingBag | Context review | Normal | Pending | Confirm semantics in context |
| /admin/search/page.tsx | src/app/admin/search/page.tsx:18 | Legacy reference | UserRound | Source reference | UserRound | Context review | Normal | Pending | Confirm semantics in context |
| /admin/search/page.tsx | src/app/admin/search/page.tsx:18 | Legacy reference | Headphones | Source reference | Headphones | Context review | Normal | Pending | Confirm semantics in context |
| /admin/search/page.tsx | src/app/admin/search/page.tsx:18 | Legacy reference | Box | Source reference | Box | Context review | Normal | Pending | Confirm semantics in context |
| /admin/search/page.tsx | src/app/admin/search/page.tsx:66 | Legacy reference | Search | Rendered | Search | Context review | Normal | Pending | Confirm semantics in context |
| /admin/search/page.tsx | src/app/admin/search/page.tsx:69 | Legacy reference | Loader2 | Rendered | Loader2 | Loop while busy | Normal | Pending | Confirm semantics in context |
| /admin/search/page.tsx | src/app/admin/search/page.tsx:69 | Legacy reference | X | Rendered | X | Context review | Normal | Pending | Confirm semantics in context |
| /admin/search/page.tsx | src/app/admin/search/page.tsx:69 | Legacy reference | Command | Rendered | Command | Context review | Normal | Pending | Confirm semantics in context |
| /admin/search/page.tsx | src/app/admin/search/page.tsx:77 | Legacy reference | Search | Rendered | Search | Context review | Normal | Pending | Confirm semantics in context |
| /admin/search/page.tsx | src/app/admin/search/page.tsx:78 | Legacy reference | Search | Source reference | Search | Context review | Normal | Pending | Confirm semantics in context |
| /admin/search/page.tsx | src/app/admin/search/page.tsx:78 | Icon component | Icon | Rendered | Trace source | Context review | Normal | Review | May refer to an inventory entry elsewhere |
| /admin/search/page.tsx | src/app/admin/search/page.tsx:78 | Legacy reference | ArrowRight | Rendered | ArrowRight | Context review | Normal | Pending | Confirm semantics in context |
| /admin/settings-center/page.tsx | src/app/admin/settings-center/page.tsx:4 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /admin/settings-center/page.tsx | src/app/admin/settings-center/page.tsx:26 | Legacy reference | Settings | Source reference | Settings | Context review | Normal | Pending | Confirm semantics in context |
| /admin/settings-center/page.tsx | src/app/admin/settings-center/page.tsx:95 | Legacy reference | CreditCard | Source reference | CreditCard | Context review | Normal | Pending | Confirm semantics in context |
| /admin/settings-center/page.tsx | src/app/admin/settings-center/page.tsx:96 | Legacy reference | Mail | Source reference | Mail | Context review | Normal | Pending | Confirm semantics in context |
| /admin/settings-center/page.tsx | src/app/admin/settings-center/page.tsx:97 | Legacy reference | Bell | Source reference | Bell | Context review | Normal | Pending | Confirm semantics in context |
| /admin/settings-center/page.tsx | src/app/admin/settings-center/page.tsx:98 | Legacy reference | MessageCircle | Source reference | MessageCircle | Context review | Normal | Pending | Confirm semantics in context |
| /admin/settings-center/page.tsx | src/app/admin/settings-center/page.tsx:99 | Legacy reference | Truck | Source reference | Truck | Context review | Normal | Pending | Confirm semantics in context |
| /admin/settings-center/page.tsx | src/app/admin/settings-center/page.tsx:100 | Legacy reference | Bell | Source reference | Bell | Context review | Normal | Pending | Confirm semantics in context |
| /admin/settings-center/page.tsx | src/app/admin/settings-center/page.tsx:101 | Legacy reference | Smartphone | Source reference | Smartphone | Context review | Normal | Pending | Confirm semantics in context |
| /admin/settings-center/page.tsx | src/app/admin/settings-center/page.tsx:102 | Legacy reference | ShieldCheck | Source reference | ShieldCheck | Context review | Normal | Pending | Confirm semantics in context |
| /admin/settings-center/page.tsx | src/app/admin/settings-center/page.tsx:114 | Legacy reference | Settings | Rendered | Settings | Context review | Normal | Pending | Confirm semantics in context |
| /admin/settings-center/page.tsx | src/app/admin/settings-center/page.tsx:118 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| /admin/settings-center/page.tsx | src/app/admin/settings-center/page.tsx:121 | Legacy reference | AlertTriangle | Rendered | AlertTriangle | State | Normal | Pending | Confirm semantics in context |
| /admin/settings-center/page.tsx | src/app/admin/settings-center/page.tsx:128 | Icon component | Icon | Rendered | Trace source | Context review | Normal | Review | May refer to an inventory entry elsewhere |
| /admin/settings-center/page.tsx | src/app/admin/settings-center/page.tsx:128 | Legacy reference | CheckCircle2 | Rendered | CheckCircle2 | Context review | Normal | Pending | Confirm semantics in context |
| /admin/settings-center/page.tsx | src/app/admin/settings-center/page.tsx:129 | Legacy reference | ArrowUpRight | Rendered | ArrowUpRight | Context review | Normal | Pending | Confirm semantics in context |
| /admin/settings-center/page.tsx | src/app/admin/settings-center/page.tsx:134 | Legacy reference | ShieldCheck | Rendered | ShieldCheck | Context review | Normal | Pending | Confirm semantics in context |
| /admin/settings/page.tsx | src/app/admin/settings/page.tsx:4 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /admin/settings/page.tsx | src/app/admin/settings/page.tsx:35 | Emoji candidate | 🔥 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| /admin/settings/page.tsx | src/app/admin/settings/page.tsx:206 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| /admin/settings/page.tsx | src/app/admin/settings/page.tsx:219 | Legacy reference | Settings | Rendered | Settings | Context review | Normal | Pending | Confirm semantics in context |
| /admin/settings/page.tsx | src/app/admin/settings/page.tsx:235 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| /admin/settings/page.tsx | src/app/admin/settings/page.tsx:242 | Legacy reference | Globe | Source reference | Globe | Context review | Normal | Pending | Confirm semantics in context |
| /admin/settings/page.tsx | src/app/admin/settings/page.tsx:243 | Legacy reference | ShoppingBag | Source reference | ShoppingBag | Context review | Normal | Pending | Confirm semantics in context |
| /admin/settings/page.tsx | src/app/admin/settings/page.tsx:244 | Legacy reference | CreditCard | Source reference | CreditCard | Context review | Normal | Pending | Confirm semantics in context |
| /admin/settings/page.tsx | src/app/admin/settings/page.tsx:245 | Legacy reference | Bell | Source reference | Bell | Context review | Normal | Pending | Confirm semantics in context |
| /admin/settings/page.tsx | src/app/admin/settings/page.tsx:246 | Legacy reference | Shield | Source reference | Shield | Context review | Normal | Pending | Confirm semantics in context |
| /admin/settings/page.tsx | src/app/admin/settings/page.tsx:260 | Icon component | Icon | Rendered | Trace source | Context review | Normal | Review | May refer to an inventory entry elsewhere |
| /admin/settings/page.tsx | src/app/admin/settings/page.tsx:289 | Legacy reference | Smartphone | Rendered | Smartphone | Context review | Normal | Pending | Confirm semantics in context |
| /admin/settings/page.tsx | src/app/admin/settings/page.tsx:303 | Legacy reference | Mail | Rendered | Mail | Context review | Normal | Pending | Confirm semantics in context |
| /admin/settings/page.tsx | src/app/admin/settings/page.tsx:317 | Legacy reference | MessageSquare | Rendered | MessageSquare | Context review | Normal | Pending | Confirm semantics in context |
| /admin/settings/page.tsx | src/app/admin/settings/page.tsx:356 | Legacy reference | Save | Rendered | Save | Context review | Normal | Pending | Confirm semantics in context |
| /admin/settings/page.tsx | src/app/admin/settings/page.tsx:418 | Legacy reference | Save | Rendered | Save | Context review | Normal | Pending | Confirm semantics in context |
| /admin/settings/page.tsx | src/app/admin/settings/page.tsx:438 | Legacy reference | Save | Rendered | Save | Context review | Normal | Pending | Confirm semantics in context |
| /admin/settings/page.tsx | src/app/admin/settings/page.tsx:571 | Legacy reference | Save | Rendered | Save | Context review | Normal | Pending | Confirm semantics in context |
| /admin/settings/page.tsx | src/app/admin/settings/page.tsx:607 | Legacy reference | Info | Rendered | Info | Context review | Normal | Pending | Confirm semantics in context |
| /admin/subscriptions/page.tsx | src/app/admin/subscriptions/page.tsx:5 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /admin/subscriptions/page.tsx | src/app/admin/subscriptions/page.tsx:13 | Legacy reference | Clock3 | Source reference | Clock3 | Context review | Normal | Pending | Confirm semantics in context |
| /admin/subscriptions/page.tsx | src/app/admin/subscriptions/page.tsx:14 | Legacy reference | Clock3 | Source reference | Clock3 | Context review | Normal | Pending | Confirm semantics in context |
| /admin/subscriptions/page.tsx | src/app/admin/subscriptions/page.tsx:15 | Legacy reference | AlertTriangle | Source reference | AlertTriangle | State | Normal | Pending | Confirm semantics in context |
| /admin/subscriptions/page.tsx | src/app/admin/subscriptions/page.tsx:16 | Legacy reference | RotateCcw | Source reference | RotateCcw | Context review | Normal | Pending | Confirm semantics in context |
| /admin/subscriptions/page.tsx | src/app/admin/subscriptions/page.tsx:17 | Legacy reference | RotateCcw | Source reference | RotateCcw | Context review | Normal | Pending | Confirm semantics in context |
| /admin/subscriptions/page.tsx | src/app/admin/subscriptions/page.tsx:18 | Legacy reference | Bell | Source reference | Bell | Context review | Normal | Pending | Confirm semantics in context |
| /admin/subscriptions/page.tsx | src/app/admin/subscriptions/page.tsx:38 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| /admin/subscriptions/page.tsx | src/app/admin/subscriptions/page.tsx:40 | Icon component | Icon | Rendered | Trace source | Context review | Normal | Review | May refer to an inventory entry elsewhere |
| /admin/suppliers/page.tsx | src/app/admin/suppliers/page.tsx:9 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /admin/suppliers/page.tsx | src/app/admin/suppliers/page.tsx:268 | Legacy reference | Building2 | Rendered | Building2 | Context review | Normal | Pending | Confirm semantics in context |
| /admin/suppliers/page.tsx | src/app/admin/suppliers/page.tsx:282 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| /admin/suppliers/page.tsx | src/app/admin/suppliers/page.tsx:288 | Legacy reference | Plus | Rendered | Plus | Context review | Normal | Pending | Confirm semantics in context |
| /admin/suppliers/page.tsx | src/app/admin/suppliers/page.tsx:301 | Legacy reference | Building2 | Rendered | Building2 | Context review | Normal | Pending | Confirm semantics in context |
| /admin/suppliers/page.tsx | src/app/admin/suppliers/page.tsx:311 | Legacy reference | DollarSign | Rendered | DollarSign | Context review | Normal | Pending | Confirm semantics in context |
| /admin/suppliers/page.tsx | src/app/admin/suppliers/page.tsx:321 | Legacy reference | PackageCheck | Rendered | PackageCheck | Context review | Normal | Pending | Confirm semantics in context |
| /admin/suppliers/page.tsx | src/app/admin/suppliers/page.tsx:331 | Legacy reference | Layers | Rendered | Layers | Context review | Normal | Pending | Confirm semantics in context |
| /admin/suppliers/page.tsx | src/app/admin/suppliers/page.tsx:386 | Legacy reference | Mail | Rendered | Mail | Context review | Normal | Pending | Confirm semantics in context |
| /admin/suppliers/page.tsx | src/app/admin/suppliers/page.tsx:387 | Legacy reference | Phone | Rendered | Phone | Context review | Normal | Pending | Confirm semantics in context |
| /admin/suppliers/page.tsx | src/app/admin/suppliers/page.tsx:388 | Legacy reference | Send | Rendered | Send | Context review | Normal | Pending | Confirm semantics in context |
| /admin/suppliers/page.tsx | src/app/admin/suppliers/page.tsx:389 | Legacy reference | Globe | Rendered | Globe | Context review | Normal | Pending | Confirm semantics in context |
| /admin/suppliers/page.tsx | src/app/admin/suppliers/page.tsx:400 | Legacy reference | Sliders | Rendered | Sliders | Context review | Normal | Pending | Confirm semantics in context |
| /admin/suppliers/page.tsx | src/app/admin/suppliers/page.tsx:446 | Legacy reference | Key | Rendered | Key | Context review | Normal | Pending | Confirm semantics in context |
| /admin/suppliers/page.tsx | src/app/admin/suppliers/page.tsx:457 | Legacy reference | Power | Rendered | Power | Context review | Normal | Pending | Confirm semantics in context |
| /admin/suppliers/page.tsx | src/app/admin/suppliers/page.tsx:603 | Legacy reference | Sliders | Rendered | Sliders | Context review | Normal | Pending | Confirm semantics in context |
| /admin/suppliers/page.tsx | src/app/admin/suppliers/page.tsx:628 | Legacy reference | Trash2 | Rendered | Trash2 | Context review | Normal | Pending | Confirm semantics in context |
| /admin/suppliers/page.tsx | src/app/admin/suppliers/page.tsx:751 | Legacy reference | ShieldCheck | Rendered | ShieldCheck | Context review | Normal | Pending | Confirm semantics in context |
| /admin/suppliers/page.tsx | src/app/admin/suppliers/page.tsx:769 | Legacy reference | Copy | Rendered | Copy | Context review | Normal | Pending | Confirm semantics in context |
| /admin/suppliers/page.tsx | src/app/admin/suppliers/page.tsx:786 | Legacy reference | Copy | Rendered | Copy | Context review | Normal | Pending | Confirm semantics in context |
| /admin/suppliers/page.tsx | src/app/admin/suppliers/page.tsx:803 | Legacy reference | Copy | Rendered | Copy | Context review | Normal | Pending | Confirm semantics in context |
| /admin/suppliers/page.tsx | src/app/admin/suppliers/page.tsx:843 | Legacy reference | CheckCircle | Rendered | CheckCircle | Context review | Normal | Pending | Confirm semantics in context |
| /admin/suppliers/scorecard/page.tsx | src/app/admin/suppliers/scorecard/page.tsx:5 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /admin/suppliers/scorecard/page.tsx | src/app/admin/suppliers/scorecard/page.tsx:55 | Legacy reference | ArrowLeft | Rendered | ArrowLeft | Context review | Normal | Pending | Confirm semantics in context |
| /admin/suppliers/scorecard/page.tsx | src/app/admin/suppliers/scorecard/page.tsx:59 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| /admin/suppliers/scorecard/page.tsx | src/app/admin/suppliers/scorecard/page.tsx:74 | Legacy reference | Star | Rendered | Star | Context review | Normal | Pending | Confirm semantics in context |
| /admin/suppliers/scorecard/page.tsx | src/app/admin/suppliers/scorecard/page.tsx:79 | Legacy reference | CheckCircle2 | Rendered | CheckCircle2 | Context review | Normal | Pending | Confirm semantics in context |
| /admin/suppliers/scorecard/page.tsx | src/app/admin/suppliers/scorecard/page.tsx:79 | Legacy reference | AlertTriangle | Rendered | AlertTriangle | State | Normal | Pending | Confirm semantics in context |
| /admin/support/[id]/page.tsx | src/app/admin/support/[id]/page.tsx:5 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /admin/support/[id]/page.tsx | src/app/admin/support/[id]/page.tsx:45 | Legacy reference | ArrowLeft | Rendered | ArrowLeft | Context review | Normal | Pending | Confirm semantics in context |
| /admin/support/[id]/page.tsx | src/app/admin/support/[id]/page.tsx:114 | Legacy reference | Lock | Rendered | Lock | Context review | Normal | Pending | Confirm semantics in context |
| /admin/support/[id]/page.tsx | src/app/admin/support/[id]/page.tsx:182 | Legacy reference | MessageSquare | Rendered | MessageSquare | Context review | Normal | Pending | Confirm semantics in context |
| /admin/support/[id]/page.tsx | src/app/admin/support/[id]/page.tsx:191 | Legacy reference | Lock | Rendered | Lock | Context review | Normal | Pending | Confirm semantics in context |
| /admin/support/[id]/page.tsx | src/app/admin/support/[id]/page.tsx:222 | Legacy reference | Send | Rendered | Send | Context review | Normal | Pending | Confirm semantics in context |
| /admin/support/[id]/page.tsx | src/app/admin/support/[id]/page.tsx:236 | Legacy reference | User | Rendered | User | Context review | Normal | Pending | Confirm semantics in context |
| /admin/support/[id]/page.tsx | src/app/admin/support/[id]/page.tsx:241 | Legacy reference | ShieldCheck | Rendered | ShieldCheck | Context review | Normal | Pending | Confirm semantics in context |
| /admin/support/[id]/page.tsx | src/app/admin/support/[id]/page.tsx:248 | Legacy reference | Mail | Rendered | Mail | Context review | Normal | Pending | Confirm semantics in context |
| /admin/support/[id]/page.tsx | src/app/admin/support/[id]/page.tsx:252 | Legacy reference | Phone | Rendered | Phone | Context review | Normal | Pending | Confirm semantics in context |
| /admin/support/[id]/page.tsx | src/app/admin/support/[id]/page.tsx:262 | Legacy reference | ShoppingBag | Rendered | ShoppingBag | Context review | Normal | Pending | Confirm semantics in context |
| /admin/support/[id]/page.tsx | src/app/admin/support/[id]/page.tsx:266 | Legacy reference | ExternalLink | Rendered | ExternalLink | Context review | Normal | Pending | Confirm semantics in context |
| /admin/support/[id]/page.tsx | src/app/admin/support/[id]/page.tsx:296 | Legacy reference | Package | Rendered | Package | Context review | Normal | Pending | Confirm semantics in context |
| /admin/support/[id]/page.tsx | src/app/admin/support/[id]/page.tsx:310 | Legacy reference | Key | Rendered | Key | Context review | Normal | Pending | Confirm semantics in context |
| /admin/support/[id]/page.tsx | src/app/admin/support/[id]/page.tsx:323 | Legacy reference | RotateCcw | Rendered | RotateCcw | Context review | Normal | Pending | Confirm semantics in context |
| /admin/support/[id]/page.tsx | src/app/admin/support/[id]/page.tsx:326 | Legacy reference | ArrowRight | Rendered | ArrowRight | Context review | Normal | Pending | Confirm semantics in context |
| /admin/support/[id]/page.tsx | src/app/admin/support/[id]/page.tsx:330 | Legacy reference | Undo2 | Rendered | Undo2 | Context review | Normal | Pending | Confirm semantics in context |
| /admin/support/[id]/page.tsx | src/app/admin/support/[id]/page.tsx:333 | Legacy reference | ArrowRight | Rendered | ArrowRight | Context review | Normal | Pending | Confirm semantics in context |
| /admin/support/[id]/page.tsx | src/app/admin/support/[id]/page.tsx:342 | Legacy reference | MessageSquare | Rendered | MessageSquare | Context review | Normal | Pending | Confirm semantics in context |
| /admin/support/[id]/page.tsx | src/app/admin/support/[id]/page.tsx:345 | Legacy reference | ExternalLink | Rendered | ExternalLink | Context review | Normal | Pending | Confirm semantics in context |
| /admin/support/page.tsx | src/app/admin/support/page.tsx:6 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /admin/support/page.tsx | src/app/admin/support/page.tsx:66 | Legacy reference | LifeBuoy | Source reference | LifeBuoy | Context review | Normal | Pending | Confirm semantics in context |
| /admin/support/page.tsx | src/app/admin/support/page.tsx:67 | Legacy reference | Clock | Source reference | Clock | Context review | Normal | Pending | Confirm semantics in context |
| /admin/support/page.tsx | src/app/admin/support/page.tsx:68 | Legacy reference | AlertTriangle | Source reference | AlertTriangle | State | Normal | Pending | Confirm semantics in context |
| /admin/support/page.tsx | src/app/admin/support/page.tsx:69 | Legacy reference | CheckCircle2 | Source reference | CheckCircle2 | Context review | Normal | Pending | Confirm semantics in context |
| /admin/support/page.tsx | src/app/admin/support/page.tsx:91 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| /admin/support/page.tsx | src/app/admin/support/page.tsx:107 | Icon component | Icon | Rendered | Trace source | Context review | Normal | Review | May refer to an inventory entry elsewhere |
| /admin/support/page.tsx | src/app/admin/support/page.tsx:117 | Legacy reference | Search | Rendered | Search | Context review | Normal | Pending | Confirm semantics in context |
| /admin/support/page.tsx | src/app/admin/support/page.tsx:170 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| /admin/support/page.tsx | src/app/admin/support/page.tsx:175 | Legacy reference | AlertCircle | Rendered | AlertCircle | State | Normal | Pending | Confirm semantics in context |
| /admin/support/page.tsx | src/app/admin/support/page.tsx:180 | Legacy reference | CheckCircle2 | Rendered | CheckCircle2 | Context review | Normal | Pending | Confirm semantics in context |
| /admin/support/page.tsx | src/app/admin/support/page.tsx:206 | Legacy reference | User | Rendered | User | Context review | Normal | Pending | Confirm semantics in context |
| /admin/support/page.tsx | src/app/admin/support/page.tsx:222 | Legacy reference | Hash | Rendered | Hash | Context review | Normal | Pending | Confirm semantics in context |
| /admin/support/page.tsx | src/app/admin/support/page.tsx:270 | Legacy reference | ArrowRight | Rendered | ArrowRight | Context review | Normal | Pending | Confirm semantics in context |
| /admin/users/[id]/page.tsx | src/app/admin/users/[id]/page.tsx:7 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /admin/users/[id]/page.tsx | src/app/admin/users/[id]/page.tsx:593 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| /admin/users/[id]/page.tsx | src/app/admin/users/[id]/page.tsx:603 | Legacy reference | Users | Rendered | Users | Context review | Normal | Pending | Confirm semantics in context |
| /admin/users/[id]/page.tsx | src/app/admin/users/[id]/page.tsx:610 | Legacy reference | ChevronLeft | Rendered | ChevronLeft | Context review | Normal | Pending | Confirm semantics in context |
| /admin/users/[id]/page.tsx | src/app/admin/users/[id]/page.tsx:628 | Legacy reference | ChevronLeft | Rendered | ChevronLeft | Context review | Normal | Pending | Confirm semantics in context |
| /admin/users/[id]/page.tsx | src/app/admin/users/[id]/page.tsx:652 | Legacy reference | ShieldCheck | Rendered | ShieldCheck | Context review | Normal | Pending | Confirm semantics in context |
| /admin/users/[id]/page.tsx | src/app/admin/users/[id]/page.tsx:677 | Legacy reference | X | Rendered | X | Context review | Normal | Pending | Confirm semantics in context |
| /admin/users/[id]/page.tsx | src/app/admin/users/[id]/page.tsx:704 | Legacy reference | Wallet | Rendered | Wallet | Context review | Normal | Pending | Confirm semantics in context |
| /admin/users/[id]/page.tsx | src/app/admin/users/[id]/page.tsx:715 | Legacy reference | ShieldAlert | Rendered | ShieldAlert | State | Normal | Pending | Confirm semantics in context |
| /admin/users/[id]/page.tsx | src/app/admin/users/[id]/page.tsx:724 | Legacy reference | KeyRound | Rendered | KeyRound | Context review | Normal | Pending | Confirm semantics in context |
| /admin/users/[id]/page.tsx | src/app/admin/users/[id]/page.tsx:786 | Legacy reference | Users | Source reference | Users | Context review | Normal | Pending | Confirm semantics in context |
| /admin/users/[id]/page.tsx | src/app/admin/users/[id]/page.tsx:787 | Legacy reference | UserCheck | Source reference | UserCheck | Context review | Normal | Pending | Confirm semantics in context |
| /admin/users/[id]/page.tsx | src/app/admin/users/[id]/page.tsx:788 | Legacy reference | ShieldAlert | Source reference | ShieldAlert | State | Normal | Pending | Confirm semantics in context |
| /admin/users/[id]/page.tsx | src/app/admin/users/[id]/page.tsx:789 | Legacy reference | SlidersHorizontal | Source reference | SlidersHorizontal | Context review | Normal | Pending | Confirm semantics in context |
| /admin/users/[id]/page.tsx | src/app/admin/users/[id]/page.tsx:790 | Legacy reference | Wallet | Source reference | Wallet | Context review | Normal | Pending | Confirm semantics in context |
| /admin/users/[id]/page.tsx | src/app/admin/users/[id]/page.tsx:791 | Legacy reference | ShoppingBag | Source reference | ShoppingBag | Context review | Normal | Pending | Confirm semantics in context |
| /admin/users/[id]/page.tsx | src/app/admin/users/[id]/page.tsx:792 | Legacy reference | KeyRound | Source reference | KeyRound | Context review | Normal | Pending | Confirm semantics in context |
| /admin/users/[id]/page.tsx | src/app/admin/users/[id]/page.tsx:793 | Legacy reference | Coins | Source reference | Coins | Context review | Normal | Pending | Confirm semantics in context |
| /admin/users/[id]/page.tsx | src/app/admin/users/[id]/page.tsx:794 | Legacy reference | ShieldCheck | Source reference | ShieldCheck | Context review | Normal | Pending | Confirm semantics in context |
| /admin/users/[id]/page.tsx | src/app/admin/users/[id]/page.tsx:795 | Legacy reference | Globe | Source reference | Globe | Context review | Normal | Pending | Confirm semantics in context |
| /admin/users/[id]/page.tsx | src/app/admin/users/[id]/page.tsx:796 | Legacy reference | FileText | Source reference | FileText | Context review | Normal | Pending | Confirm semantics in context |
| /admin/users/[id]/page.tsx | src/app/admin/users/[id]/page.tsx:797 | Legacy reference | Activity | Source reference | Activity | Context review | Normal | Pending | Confirm semantics in context |
| /admin/users/[id]/page.tsx | src/app/admin/users/[id]/page.tsx:811 | Icon component | Icon | Rendered | Trace source | Context review | Normal | Review | May refer to an inventory entry elsewhere |
| /admin/users/[id]/page.tsx | src/app/admin/users/[id]/page.tsx:869 | Legacy reference | Check | Rendered | Check | Context review | Normal | Pending | Confirm semantics in context |
| /admin/users/[id]/page.tsx | src/app/admin/users/[id]/page.tsx:1195 | Legacy reference | Lock | Rendered | Lock | Context review | Normal | Pending | Confirm semantics in context |
| /admin/users/[id]/page.tsx | src/app/admin/users/[id]/page.tsx:1359 | Legacy reference | FileText | Rendered | FileText | Context review | Normal | Pending | Confirm semantics in context |
| /admin/users/[id]/page.tsx | src/app/admin/users/[id]/page.tsx:1419 | Legacy reference | Eye | Rendered | Eye | Context review | Normal | Pending | Confirm semantics in context |
| /admin/users/[id]/page.tsx | src/app/admin/users/[id]/page.tsx:1430 | Legacy reference | Copy | Rendered | Copy | Context review | Normal | Pending | Confirm semantics in context |
| /admin/users/[id]/page.tsx | src/app/admin/users/[id]/page.tsx:1450 | Legacy reference | Coins | Rendered | Coins | Context review | Normal | Pending | Confirm semantics in context |
| /admin/users/[id]/page.tsx | src/app/admin/users/[id]/page.tsx:1465 | Legacy reference | Share2 | Rendered | Share2 | Context review | Normal | Pending | Confirm semantics in context |
| /admin/users/[id]/page.tsx | src/app/admin/users/[id]/page.tsx:1524 | Legacy reference | Laptop | Rendered | Laptop | Context review | Normal | Pending | Confirm semantics in context |
| /admin/users/[id]/page.tsx | src/app/admin/users/[id]/page.tsx:1659 | Legacy reference | Lock | Rendered | Lock | Context review | Normal | Pending | Confirm semantics in context |
| /admin/users/[id]/page.tsx | src/app/admin/users/[id]/page.tsx:1663 | Legacy reference | X | Rendered | X | Context review | Normal | Pending | Confirm semantics in context |
| /admin/users/[id]/page.tsx | src/app/admin/users/[id]/page.tsx:1715 | Legacy reference | Lock | Rendered | Lock | Context review | Normal | Pending | Confirm semantics in context |
| /admin/users/[id]/page.tsx | src/app/admin/users/[id]/page.tsx:1719 | Legacy reference | X | Rendered | X | Context review | Normal | Pending | Confirm semantics in context |
| /admin/users/[id]/page.tsx | src/app/admin/users/[id]/page.tsx:1769 | Legacy reference | AlertCircle | Rendered | AlertCircle | State | Normal | Pending | Confirm semantics in context |
| /admin/users/[id]/page.tsx | src/app/admin/users/[id]/page.tsx:1814 | Legacy reference | ShieldAlert | Rendered | ShieldAlert | State | Normal | Pending | Confirm semantics in context |
| /admin/users/[id]/page.tsx | src/app/admin/users/[id]/page.tsx:1818 | Legacy reference | X | Rendered | X | Context review | Normal | Pending | Confirm semantics in context |
| /admin/users/[id]/page.tsx | src/app/admin/users/[id]/page.tsx:1896 | Legacy reference | Wallet | Rendered | Wallet | Context review | Normal | Pending | Confirm semantics in context |
| /admin/users/[id]/page.tsx | src/app/admin/users/[id]/page.tsx:1900 | Legacy reference | X | Rendered | X | Context review | Normal | Pending | Confirm semantics in context |
| /admin/users/page.tsx | src/app/admin/users/page.tsx:5 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /admin/users/page.tsx | src/app/admin/users/page.tsx:362 | Legacy reference | Clock | Rendered | Clock | Context review | Normal | Pending | Confirm semantics in context |
| /admin/users/page.tsx | src/app/admin/users/page.tsx:372 | Legacy reference | Ban | Rendered | Ban | Context review | Normal | Pending | Confirm semantics in context |
| /admin/users/page.tsx | src/app/admin/users/page.tsx:379 | Legacy reference | Lock | Rendered | Lock | Context review | Normal | Pending | Confirm semantics in context |
| /admin/users/page.tsx | src/app/admin/users/page.tsx:399 | Legacy reference | Users | Rendered | Users | Context review | Normal | Pending | Confirm semantics in context |
| /admin/users/page.tsx | src/app/admin/users/page.tsx:415 | Legacy reference | Download | Rendered | Download | Context review | Normal | Pending | Confirm semantics in context |
| /admin/users/page.tsx | src/app/admin/users/page.tsx:423 | Legacy reference | UserPlus | Rendered | UserPlus | Context review | Normal | Pending | Confirm semantics in context |
| /admin/users/page.tsx | src/app/admin/users/page.tsx:474 | Legacy reference | Search | Rendered | Search | Context review | Normal | Pending | Confirm semantics in context |
| /admin/users/page.tsx | src/app/admin/users/page.tsx:522 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| /admin/users/page.tsx | src/app/admin/users/page.tsx:559 | Legacy reference | Download | Rendered | Download | Context review | Normal | Pending | Confirm semantics in context |
| /admin/users/page.tsx | src/app/admin/users/page.tsx:578 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| /admin/users/page.tsx | src/app/admin/users/page.tsx:583 | Legacy reference | Users | Rendered | Users | Context review | Normal | Pending | Confirm semantics in context |
| /admin/users/page.tsx | src/app/admin/users/page.tsx:639 | Legacy reference | Wallet | Rendered | Wallet | Context review | Normal | Pending | Confirm semantics in context |
| /admin/users/page.tsx | src/app/admin/users/page.tsx:649 | Legacy reference | ShieldAlert | Rendered | ShieldAlert | State | Normal | Pending | Confirm semantics in context |
| /admin/users/page.tsx | src/app/admin/users/page.tsx:658 | Legacy reference | ChevronRight | Rendered | ChevronRight | Context review | Normal | Pending | Confirm semantics in context |
| /admin/users/page.tsx | src/app/admin/users/page.tsx:694 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| /admin/users/page.tsx | src/app/admin/users/page.tsx:701 | Legacy reference | Users | Rendered | Users | Context review | Normal | Pending | Confirm semantics in context |
| /admin/users/page.tsx | src/app/admin/users/page.tsx:739 | Legacy reference | ShieldCheck | Rendered | ShieldCheck | Context review | Normal | Pending | Confirm semantics in context |
| /admin/users/page.tsx | src/app/admin/users/page.tsx:752 | Legacy reference | Copy | Rendered | Copy | Context review | Normal | Pending | Confirm semantics in context |
| /admin/users/page.tsx | src/app/admin/users/page.tsx:780 | Legacy reference | Wallet | Rendered | Wallet | Context review | Normal | Pending | Confirm semantics in context |
| /admin/users/page.tsx | src/app/admin/users/page.tsx:785 | Legacy reference | Coins | Rendered | Coins | Context review | Normal | Pending | Confirm semantics in context |
| /admin/users/page.tsx | src/app/admin/users/page.tsx:833 | Legacy reference | Wallet | Rendered | Wallet | Context review | Normal | Pending | Confirm semantics in context |
| /admin/users/page.tsx | src/app/admin/users/page.tsx:844 | Legacy reference | ShieldAlert | Rendered | ShieldAlert | State | Normal | Pending | Confirm semantics in context |
| /admin/users/page.tsx | src/app/admin/users/page.tsx:852 | Legacy reference | ChevronRight | Rendered | ChevronRight | Context review | Normal | Pending | Confirm semantics in context |
| /admin/users/page.tsx | src/app/admin/users/page.tsx:894 | Legacy reference | ChevronLeft | Rendered | ChevronLeft | Context review | Normal | Pending | Confirm semantics in context |
| /admin/users/page.tsx | src/app/admin/users/page.tsx:906 | Legacy reference | ChevronRight | Rendered | ChevronRight | Context review | Normal | Pending | Confirm semantics in context |
| /admin/users/page.tsx | src/app/admin/users/page.tsx:919 | Legacy reference | UserPlus | Rendered | UserPlus | Context review | Normal | Pending | Confirm semantics in context |
| /admin/users/page.tsx | src/app/admin/users/page.tsx:927 | Legacy reference | X | Rendered | X | Context review | Normal | Pending | Confirm semantics in context |
| /admin/users/page.tsx | src/app/admin/users/page.tsx:1033 | Legacy reference | ShieldAlert | Rendered | ShieldAlert | State | Normal | Pending | Confirm semantics in context |
| /admin/users/page.tsx | src/app/admin/users/page.tsx:1037 | Legacy reference | X | Rendered | X | Context review | Normal | Pending | Confirm semantics in context |
| /admin/users/page.tsx | src/app/admin/users/page.tsx:1124 | Legacy reference | Wallet | Rendered | Wallet | Context review | Normal | Pending | Confirm semantics in context |
| /admin/users/page.tsx | src/app/admin/users/page.tsx:1128 | Legacy reference | X | Rendered | X | Context review | Normal | Pending | Confirm semantics in context |
| /admin/wallet/page.tsx | src/app/admin/wallet/page.tsx:4 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /admin/wallet/page.tsx | src/app/admin/wallet/page.tsx:253 | Legacy reference | Wallet | Rendered | Wallet | Context review | Normal | Pending | Confirm semantics in context |
| /admin/wallet/page.tsx | src/app/admin/wallet/page.tsx:269 | Legacy reference | PlusCircle | Rendered | PlusCircle | Context review | Normal | Pending | Confirm semantics in context |
| /admin/wallet/page.tsx | src/app/admin/wallet/page.tsx:278 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| /admin/wallet/page.tsx | src/app/admin/wallet/page.tsx:286 | Legacy reference | Search | Rendered | Search | Context review | Normal | Pending | Confirm semantics in context |
| /admin/wallet/page.tsx | src/app/admin/wallet/page.tsx:386 | Legacy reference | Check | Rendered | Check | Context review | Normal | Pending | Confirm semantics in context |
| /admin/wallet/page.tsx | src/app/admin/wallet/page.tsx:397 | Legacy reference | X | Rendered | X | Context review | Normal | Pending | Confirm semantics in context |
| /admin/wallet/page.tsx | src/app/admin/wallet/page.tsx:406 | Legacy reference | Wallet | Rendered | Wallet | Context review | Normal | Pending | Confirm semantics in context |
| /admin/wallet/page.tsx | src/app/admin/wallet/page.tsx:458 | Legacy reference | Check | Rendered | Check | Context review | Normal | Pending | Confirm semantics in context |
| /admin/wallet/page.tsx | src/app/admin/wallet/page.tsx:460 | Legacy reference | Copy | Rendered | Copy | Context review | Normal | Pending | Confirm semantics in context |
| /admin/wallet/page.tsx | src/app/admin/wallet/page.tsx:531 | Legacy reference | Check | Rendered | Check | Context review | Normal | Pending | Confirm semantics in context |
| /admin/wallet/page.tsx | src/app/admin/wallet/page.tsx:543 | Legacy reference | X | Rendered | X | Context review | Normal | Pending | Confirm semantics in context |
| /admin/wallet/page.tsx | src/app/admin/wallet/page.tsx:557 | Legacy reference | Wallet | Rendered | Wallet | Context review | Normal | Pending | Confirm semantics in context |
| /admin/wallet/page.tsx | src/app/admin/wallet/page.tsx:595 | Legacy reference | ChevronLeft | Rendered | ChevronLeft | Context review | Normal | Pending | Confirm semantics in context |
| /admin/wallet/page.tsx | src/app/admin/wallet/page.tsx:604 | Legacy reference | ChevronRight | Rendered | ChevronRight | Context review | Normal | Pending | Confirm semantics in context |
| /admin/wallet/page.tsx | src/app/admin/wallet/page.tsx:616 | Legacy reference | XCircle | Rendered | XCircle | Context review | Normal | Pending | Confirm semantics in context |
| /admin/wallet/page.tsx | src/app/admin/wallet/page.tsx:623 | Legacy reference | X | Rendered | X | Context review | Normal | Pending | Confirm semantics in context |
| /admin/wallet/page.tsx | src/app/admin/wallet/page.tsx:684 | Legacy reference | Wallet | Rendered | Wallet | Context review | Normal | Pending | Confirm semantics in context |
| /admin/wallet/page.tsx | src/app/admin/wallet/page.tsx:691 | Legacy reference | X | Rendered | X | Context review | Normal | Pending | Confirm semantics in context |
| /admin/wallet/page.tsx | src/app/admin/wallet/page.tsx:707 | Legacy reference | ArrowUpRight | Rendered | ArrowUpRight | Context review | Normal | Pending | Confirm semantics in context |
| /admin/wallet/page.tsx | src/app/admin/wallet/page.tsx:720 | Legacy reference | ArrowDownRight | Rendered | ArrowDownRight | Context review | Normal | Pending | Confirm semantics in context |
| /admin/whatsapp/compress-image.ts | src/app/admin/whatsapp/compress-image.ts:20 | Image reference | .jpg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| /api/admin/email-marketing/settings/test-email/route.ts | src/app/api/admin/email-marketing/settings/test-email/route.ts:22 | Emoji candidate | 🚀 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| /api/admin/email-marketing/settings/test-email/route.ts | src/app/api/admin/email-marketing/settings/test-email/route.ts:45 | Emoji candidate | 🧪 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| /api/admin/gateways/route.ts | src/app/api/admin/gateways/route.ts:25 | Image reference | /images/payments/bkash.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| /api/admin/gateways/route.ts | src/app/api/admin/gateways/route.ts:33 | Image reference | /images/payments/nagad.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| /api/admin/gateways/route.ts | src/app/api/admin/gateways/route.ts:41 | Image reference | /images/payments/rocket.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| /api/admin/gateways/route.ts | src/app/api/admin/gateways/route.ts:49 | Image reference | /images/payments/upay.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| /api/admin/settings/general/route.ts | src/app/api/admin/settings/general/route.ts:38 | Emoji candidate | 🔥 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| /api/admin/settings/telegram/test/route.ts | src/app/api/admin/settings/telegram/test/route.ts:14 | Emoji candidate | 🤖 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| /api/admin/settings/telegram/test/route.ts | src/app/api/admin/settings/telegram/test/route.ts:14 | Emoji candidate | ✅ | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| /api/admin/settings/telegram/test/route.ts | src/app/api/admin/settings/telegram/test/route.ts:14 | Emoji candidate | ⏰ | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| /api/cart/recover/route.ts | src/app/api/cart/recover/route.ts:48 | Image reference | /images/placeholder.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| /api/settings/route.ts | src/app/api/settings/route.ts:32 | Emoji candidate | 🔥 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| /api/settings/route.ts | src/app/api/settings/route.ts:41 | Emoji candidate | 🔥 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| /api/wallet/purchase/route.ts | src/app/api/wallet/purchase/route.ts:231 | Emoji candidate | ⚡ | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| /api/wallet/purchase/route.ts | src/app/api/wallet/purchase/route.ts:231 | Emoji candidate | 🆔 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| /api/wallet/purchase/route.ts | src/app/api/wallet/purchase/route.ts:234 | Emoji candidate | 👤 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| /api/wallet/purchase/route.ts | src/app/api/wallet/purchase/route.ts:235 | Emoji candidate | 💰 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| /api/wallet/purchase/route.ts | src/app/api/wallet/purchase/route.ts:236 | Emoji candidate | 💳 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| /api/wallet/purchase/route.ts | src/app/api/wallet/purchase/route.ts:236 | Emoji candidate | 🔑 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| /api/wallet/purchase/route.ts | src/app/api/wallet/purchase/route.ts:238 | Emoji candidate | 💵 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| /api/wallet/purchase/route.ts | src/app/api/wallet/purchase/route.ts:239 | Emoji candidate | ⏰ | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| /auth/verify/page.tsx | src/app/auth/verify/page.tsx:7 | Legacy import | lucide-react | Source reference | — | Context review | High | Evidence | Import declaration |
| /auth/verify/page.tsx | src/app/auth/verify/page.tsx:125 | Legacy reference | AlertCircle | Rendered | AlertCircle | State | High | Pending | Confirm semantics in context |
| /auth/verify/page.tsx | src/app/auth/verify/page.tsx:162 | Legacy reference | Loader2 | Rendered | Loader2 | Loop while busy | High | Pending | Confirm semantics in context |
| /auth/verify/recovery/page.tsx | src/app/auth/verify/recovery/page.tsx:7 | Legacy import | lucide-react | Source reference | — | Context review | High | Evidence | Import declaration |
| /auth/verify/recovery/page.tsx | src/app/auth/verify/recovery/page.tsx:73 | Legacy reference | AlertTriangle | Rendered | AlertTriangle | State | High | Pending | Confirm semantics in context |
| /auth/verify/recovery/page.tsx | src/app/auth/verify/recovery/page.tsx:82 | Legacy reference | AlertCircle | Rendered | AlertCircle | State | High | Pending | Confirm semantics in context |
| /auth/verify/recovery/page.tsx | src/app/auth/verify/recovery/page.tsx:109 | Legacy reference | Loader2 | Rendered | Loader2 | Loop while busy | High | Pending | Confirm semantics in context |
| /blog/[slug]/page.tsx | src/app/blog/[slug]/page.tsx:7 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /blog/[slug]/page.tsx | src/app/blog/[slug]/page.tsx:116 | Image reference | /images/logo.png | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| /blog/[slug]/page.tsx | src/app/blog/[slug]/page.tsx:166 | Legacy reference | ArrowLeft | Rendered | ArrowLeft | Context review | Normal | Pending | Confirm semantics in context |
| /blog/[slug]/page.tsx | src/app/blog/[slug]/page.tsx:177 | Legacy reference | Clock | Rendered | Clock | Context review | Normal | Pending | Confirm semantics in context |
| /blog/[slug]/page.tsx | src/app/blog/[slug]/page.tsx:182 | Legacy reference | Calendar | Rendered | Calendar | Context review | Normal | Pending | Confirm semantics in context |
| /blog/[slug]/page.tsx | src/app/blog/[slug]/page.tsx:255 | Legacy reference | Sparkles | Rendered | Sparkles | Context review | Normal | Pending | Confirm semantics in context |
| /blog/[slug]/page.tsx | src/app/blog/[slug]/page.tsx:269 | Legacy reference | ShoppingBag | Rendered | ShoppingBag | Context review | Normal | Pending | Confirm semantics in context |
| /blog/[slug]/page.tsx | src/app/blog/[slug]/page.tsx:296 | Legacy reference | ChevronRight | Rendered | ChevronRight | Context review | Normal | Pending | Confirm semantics in context |
| /blog/page.tsx | src/app/blog/page.tsx:21 | Image reference | /images/og-image.png | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| /blog/page.tsx | src/app/blog/page.tsx:35 | Image reference | /images/og-image.png | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| /blog/page.tsx | src/app/blog/page.tsx:52 | Image reference | /images/logo.png | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| /checkout/success/page.tsx | src/app/checkout/success/page.tsx:6 | Legacy import | lucide-react | Source reference | — | Context review | High | Evidence | Import declaration |
| /checkout/success/page.tsx | src/app/checkout/success/page.tsx:99 | Legacy reference | CheckCircle2 | Rendered | CheckCircle2 | Context review | High | Pending | Confirm semantics in context |
| /checkout/success/page.tsx | src/app/checkout/success/page.tsx:101 | Legacy reference | Clock | Rendered | Clock | Context review | High | Pending | Confirm semantics in context |
| /checkout/success/page.tsx | src/app/checkout/success/page.tsx:103 | Legacy reference | XCircle | Rendered | XCircle | Context review | High | Pending | Confirm semantics in context |
| /checkout/success/page.tsx | src/app/checkout/success/page.tsx:138 | Legacy reference | Gift | Rendered | Gift | Context review | High | Pending | Confirm semantics in context |
| /checkout/success/page.tsx | src/app/checkout/success/page.tsx:139 | Emoji candidate | 🎁 | Source reference | Review purpose | Context review | High | Review | May be application copy or shared data |
| /checkout/success/page.tsx | src/app/checkout/success/page.tsx:139 | Emoji candidate | 🎁 | Source reference | Review purpose | Context review | High | Review | May be application copy or shared data |
| /checkout/success/page.tsx | src/app/checkout/success/page.tsx:192 | Legacy reference | Check | Rendered | Check | Context review | High | Pending | Confirm semantics in context |
| /checkout/success/page.tsx | src/app/checkout/success/page.tsx:192 | Legacy reference | Copy | Rendered | Copy | Context review | High | Pending | Confirm semantics in context |
| /checkout/success/page.tsx | src/app/checkout/success/page.tsx:200 | Emoji candidate | 🎁 | Source reference | Review purpose | Context review | High | Review | May be application copy or shared data |
| /checkout/success/page.tsx | src/app/checkout/success/page.tsx:208 | Legacy reference | MessageCircle | Rendered | MessageCircle | Context review | High | Pending | Confirm semantics in context |
| /checkout/success/page.tsx | src/app/checkout/success/page.tsx:216 | Legacy reference | ExternalLink | Rendered | ExternalLink | Context review | High | Pending | Confirm semantics in context |
| /checkout/success/page.tsx | src/app/checkout/success/page.tsx:237 | Legacy reference | Copy | Rendered | Copy | Context review | High | Pending | Confirm semantics in context |
| /checkout/success/page.tsx | src/app/checkout/success/page.tsx:258 | Legacy reference | Mail | Rendered | Mail | Context review | High | Pending | Confirm semantics in context |
| /checkout/success/page.tsx | src/app/checkout/success/page.tsx:270 | Legacy reference | KeyRound | Rendered | KeyRound | Context review | High | Pending | Confirm semantics in context |
| /checkout/success/page.tsx | src/app/checkout/success/page.tsx:278 | Legacy reference | Clock | Rendered | Clock | Context review | High | Pending | Confirm semantics in context |
| /checkout/success/page.tsx | src/app/checkout/success/page.tsx:293 | Emoji candidate | 💬 | Source reference | Review purpose | Context review | High | Review | May be application copy or shared data |
| /checkout/success/page.tsx | src/app/checkout/success/page.tsx:300 | Legacy reference | ShoppingBag | Rendered | ShoppingBag | Context review | High | Pending | Confirm semantics in context |
| /checkout/success/page.tsx | src/app/checkout/success/page.tsx:302 | Legacy reference | ArrowRight | Rendered | ArrowRight | Context review | High | Pending | Confirm semantics in context |
| /dashboard/affiliate/page.tsx | src/app/dashboard/affiliate/page.tsx:7 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /dashboard/affiliate/page.tsx | src/app/dashboard/affiliate/page.tsx:246 | Legacy reference | Award | Rendered | Award | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/affiliate/page.tsx | src/app/dashboard/affiliate/page.tsx:250 | Legacy reference | Share2 | Rendered | Share2 | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/affiliate/page.tsx | src/app/dashboard/affiliate/page.tsx:267 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/affiliate/page.tsx | src/app/dashboard/affiliate/page.tsx:275 | Legacy reference | QrCode | Rendered | QrCode | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/affiliate/page.tsx | src/app/dashboard/affiliate/page.tsx:283 | Legacy reference | Wallet | Rendered | Wallet | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/affiliate/page.tsx | src/app/dashboard/affiliate/page.tsx:294 | Legacy reference | Wallet | Rendered | Wallet | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/affiliate/page.tsx | src/app/dashboard/affiliate/page.tsx:305 | Legacy reference | Info | Rendered | Info | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/affiliate/page.tsx | src/app/dashboard/affiliate/page.tsx:314 | Legacy reference | Clock | Rendered | Clock | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/affiliate/page.tsx | src/app/dashboard/affiliate/page.tsx:318 | Legacy reference | Clock | Rendered | Clock | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/affiliate/page.tsx | src/app/dashboard/affiliate/page.tsx:333 | Legacy reference | TrendingUp | Rendered | TrendingUp | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/affiliate/page.tsx | src/app/dashboard/affiliate/page.tsx:351 | Legacy reference | MousePointerClick | Rendered | MousePointerClick | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/affiliate/page.tsx | src/app/dashboard/affiliate/page.tsx:403 | Legacy reference | CheckCircle2 | Rendered | CheckCircle2 | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/affiliate/page.tsx | src/app/dashboard/affiliate/page.tsx:408 | Legacy reference | Copy | Rendered | Copy | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/affiliate/page.tsx | src/app/dashboard/affiliate/page.tsx:419 | Legacy reference | QrCode | Rendered | QrCode | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/affiliate/page.tsx | src/app/dashboard/affiliate/page.tsx:460 | Legacy reference | Award | Rendered | Award | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/affiliate/page.tsx | src/app/dashboard/affiliate/page.tsx:508 | Legacy reference | ShieldCheck | Rendered | ShieldCheck | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/affiliate/page.tsx | src/app/dashboard/affiliate/page.tsx:525 | Legacy reference | Layers | Rendered | Layers | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/affiliate/page.tsx | src/app/dashboard/affiliate/page.tsx:536 | Legacy reference | Wallet | Rendered | Wallet | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/affiliate/page.tsx | src/app/dashboard/affiliate/page.tsx:602 | Legacy reference | Layers | Rendered | Layers | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/affiliate/page.tsx | src/app/dashboard/affiliate/page.tsx:668 | Legacy reference | Wallet | Rendered | Wallet | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/affiliate/page.tsx | src/app/dashboard/affiliate/page.tsx:691 | Legacy reference | XCircle | Rendered | XCircle | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/affiliate/page.tsx | src/app/dashboard/affiliate/page.tsx:713 | Image reference | .png | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| /dashboard/affiliate/page.tsx | src/app/dashboard/affiliate/page.tsx:716 | Legacy reference | Download | Rendered | Download | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/affiliate/page.tsx | src/app/dashboard/affiliate/page.tsx:724 | Legacy reference | Copy | Rendered | Copy | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/affiliate/page.tsx | src/app/dashboard/affiliate/page.tsx:739 | Legacy reference | CheckCircle | Rendered | CheckCircle | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/affiliate/page.tsx | src/app/dashboard/affiliate/page.tsx:765 | Legacy reference | XCircle | Rendered | XCircle | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/affiliate/page.tsx | src/app/dashboard/affiliate/page.tsx:772 | Legacy reference | AlertCircle | Rendered | AlertCircle | State | Normal | Pending | Confirm semantics in context |
| /dashboard/affiliate/page.tsx | src/app/dashboard/affiliate/page.tsx:784 | Legacy reference | Wallet | Source reference | Wallet | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/affiliate/page.tsx | src/app/dashboard/affiliate/page.tsx:785 | Legacy reference | Smartphone | Source reference | Smartphone | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/affiliate/page.tsx | src/app/dashboard/affiliate/page.tsx:786 | Legacy reference | Smartphone | Source reference | Smartphone | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/affiliate/page.tsx | src/app/dashboard/affiliate/page.tsx:787 | Legacy reference | Smartphone | Source reference | Smartphone | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/affiliate/page.tsx | src/app/dashboard/affiliate/page.tsx:788 | Legacy reference | Building | Source reference | Building | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/affiliate/page.tsx | src/app/dashboard/affiliate/page.tsx:803 | Icon component | Icon | Rendered | Trace source | Context review | Normal | Review | May refer to an inventory entry elsewhere |
| /dashboard/affiliate/page.tsx | src/app/dashboard/affiliate/page.tsx:946 | Emoji candidate | ⚡ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| /dashboard/affiliate/page.tsx | src/app/dashboard/affiliate/page.tsx:957 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/earn/page.tsx | src/app/dashboard/earn/page.tsx:5 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /dashboard/earn/page.tsx | src/app/dashboard/earn/page.tsx:23 | Legacy reference | Gift | Rendered | Gift | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/earn/page.tsx | src/app/dashboard/earn/page.tsx:23 | Legacy reference | Users | Rendered | Users | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/earn/page.tsx | src/app/dashboard/earn/page.tsx:23 | Legacy reference | ArrowRight | Rendered | ArrowRight | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/earn/page.tsx | src/app/dashboard/earn/page.tsx:23 | Legacy reference | Link2 | Rendered | Link2 | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/earn/page.tsx | src/app/dashboard/earn/page.tsx:23 | Legacy reference | ArrowRight | Rendered | ArrowRight | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/keys/page.tsx | src/app/dashboard/keys/page.tsx:7 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /dashboard/keys/page.tsx | src/app/dashboard/keys/page.tsx:506 | Legacy reference | ShieldCheck | Rendered | ShieldCheck | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/keys/page.tsx | src/app/dashboard/keys/page.tsx:510 | Legacy reference | Zap | Rendered | Zap | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/keys/page.tsx | src/app/dashboard/keys/page.tsx:530 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/keys/page.tsx | src/app/dashboard/keys/page.tsx:537 | Legacy reference | ShoppingCart | Rendered | ShoppingCart | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/keys/page.tsx | src/app/dashboard/keys/page.tsx:546 | Legacy reference | Search | Rendered | Search | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/keys/page.tsx | src/app/dashboard/keys/page.tsx:643 | Legacy reference | KeyRound | Rendered | KeyRound | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/keys/page.tsx | src/app/dashboard/keys/page.tsx:658 | Legacy reference | RotateCcw | Rendered | RotateCcw | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/keys/page.tsx | src/app/dashboard/keys/page.tsx:665 | Legacy reference | Clock | Rendered | Clock | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/keys/page.tsx | src/app/dashboard/keys/page.tsx:713 | Legacy reference | ShieldCheck | Rendered | ShieldCheck | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/keys/page.tsx | src/app/dashboard/keys/page.tsx:769 | Legacy reference | RotateCcw | Rendered | RotateCcw | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/keys/page.tsx | src/app/dashboard/keys/page.tsx:772 | Emoji candidate | 🚨 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| /dashboard/keys/page.tsx | src/app/dashboard/keys/page.tsx:772 | Emoji candidate | 🚨 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| /dashboard/keys/page.tsx | src/app/dashboard/keys/page.tsx:796 | Legacy reference | EyeOff | Rendered | EyeOff | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/keys/page.tsx | src/app/dashboard/keys/page.tsx:801 | Legacy reference | Eye | Rendered | Eye | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/keys/page.tsx | src/app/dashboard/keys/page.tsx:810 | Legacy reference | Clock | Rendered | Clock | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/keys/page.tsx | src/app/dashboard/keys/page.tsx:823 | Legacy reference | Copy | Rendered | Copy | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/keys/page.tsx | src/app/dashboard/keys/page.tsx:832 | Legacy reference | Download | Rendered | Download | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/keys/page.tsx | src/app/dashboard/keys/page.tsx:846 | Legacy reference | User | Rendered | User | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/keys/page.tsx | src/app/dashboard/keys/page.tsx:854 | Legacy reference | Copy | Rendered | Copy | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/keys/page.tsx | src/app/dashboard/keys/page.tsx:868 | Legacy reference | Lock | Rendered | Lock | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/keys/page.tsx | src/app/dashboard/keys/page.tsx:877 | Legacy reference | EyeOff | Rendered | EyeOff | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/keys/page.tsx | src/app/dashboard/keys/page.tsx:877 | Legacy reference | Eye | Rendered | Eye | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/keys/page.tsx | src/app/dashboard/keys/page.tsx:884 | Legacy reference | Copy | Rendered | Copy | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/keys/page.tsx | src/app/dashboard/keys/page.tsx:901 | Legacy reference | KeyRound | Rendered | KeyRound | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/keys/page.tsx | src/app/dashboard/keys/page.tsx:908 | Legacy reference | Copy | Rendered | Copy | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/keys/page.tsx | src/app/dashboard/keys/page.tsx:922 | Legacy reference | Info | Rendered | Info | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/keys/page.tsx | src/app/dashboard/keys/page.tsx:939 | Legacy reference | BookOpen | Rendered | BookOpen | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/keys/page.tsx | src/app/dashboard/keys/page.tsx:947 | Legacy reference | ChevronUp | Rendered | ChevronUp | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/keys/page.tsx | src/app/dashboard/keys/page.tsx:947 | Legacy reference | ChevronDown | Rendered | ChevronDown | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/keys/page.tsx | src/app/dashboard/keys/page.tsx:958 | Legacy reference | AlertTriangle | Rendered | AlertTriangle | State | Normal | Pending | Confirm semantics in context |
| /dashboard/keys/page.tsx | src/app/dashboard/keys/page.tsx:974 | Emoji candidate | ⛔ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| /dashboard/keys/page.tsx | src/app/dashboard/keys/page.tsx:974 | Emoji candidate | ⚠️ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| /dashboard/keys/page.tsx | src/app/dashboard/keys/page.tsx:989 | Legacy reference | Sparkles | Rendered | Sparkles | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/keys/page.tsx | src/app/dashboard/keys/page.tsx:1009 | Legacy reference | Copy | Rendered | Copy | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/keys/page.tsx | src/app/dashboard/keys/page.tsx:1024 | Emoji candidate | 💡 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| /dashboard/keys/page.tsx | src/app/dashboard/keys/page.tsx:1057 | Legacy reference | Zap | Rendered | Zap | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/keys/page.tsx | src/app/dashboard/keys/page.tsx:1073 | Legacy reference | Banknote | Rendered | Banknote | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/keys/page.tsx | src/app/dashboard/keys/page.tsx:1084 | Legacy reference | ExternalLink | Rendered | ExternalLink | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/keys/page.tsx | src/app/dashboard/keys/page.tsx:1097 | Legacy reference | KeyRound | Rendered | KeyRound | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/keys/page.tsx | src/app/dashboard/keys/page.tsx:1126 | Legacy reference | X | Rendered | X | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/keys/page.tsx | src/app/dashboard/keys/page.tsx:1131 | Legacy reference | ShieldCheck | Rendered | ShieldCheck | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/keys/page.tsx | src/app/dashboard/keys/page.tsx:1148 | Legacy reference | CheckCircle2 | Rendered | CheckCircle2 | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/keys/page.tsx | src/app/dashboard/keys/page.tsx:1151 | Emoji candidate | 🎉 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| /dashboard/keys/page.tsx | src/app/dashboard/keys/page.tsx:1151 | Emoji candidate | 🎉 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| /dashboard/keys/page.tsx | src/app/dashboard/keys/page.tsx:1166 | Legacy reference | AlertCircle | Rendered | AlertCircle | State | Normal | Pending | Confirm semantics in context |
| /dashboard/keys/page.tsx | src/app/dashboard/keys/page.tsx:1205 | Legacy reference | Zap | Rendered | Zap | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/keys/page.tsx | src/app/dashboard/keys/page.tsx:1219 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/keys/page.tsx | src/app/dashboard/keys/page.tsx:1222 | Legacy reference | Send | Rendered | Send | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/keys/page.tsx | src/app/dashboard/keys/page.tsx:1241 | Legacy reference | X | Rendered | X | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/keys/page.tsx | src/app/dashboard/keys/page.tsx:1246 | Legacy reference | Banknote | Rendered | Banknote | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/keys/page.tsx | src/app/dashboard/keys/page.tsx:1259 | Legacy reference | CheckCircle2 | Rendered | CheckCircle2 | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/keys/page.tsx | src/app/dashboard/keys/page.tsx:1271 | Legacy reference | AlertCircle | Rendered | AlertCircle | State | Normal | Pending | Confirm semantics in context |
| /dashboard/keys/page.tsx | src/app/dashboard/keys/page.tsx:1346 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/keys/page.tsx | src/app/dashboard/keys/page.tsx:1349 | Legacy reference | Send | Rendered | Send | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/notifications/page.tsx | src/app/dashboard/notifications/page.tsx:5 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /dashboard/notifications/page.tsx | src/app/dashboard/notifications/page.tsx:89 | Legacy reference | KeyRound | Source reference | KeyRound | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/notifications/page.tsx | src/app/dashboard/notifications/page.tsx:91 | Legacy reference | Wallet | Source reference | Wallet | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/notifications/page.tsx | src/app/dashboard/notifications/page.tsx:93 | Legacy reference | ShoppingBag | Source reference | ShoppingBag | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/notifications/page.tsx | src/app/dashboard/notifications/page.tsx:95 | Legacy reference | RotateCcw | Source reference | RotateCcw | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/notifications/page.tsx | src/app/dashboard/notifications/page.tsx:97 | Legacy reference | Sparkles | Source reference | Sparkles | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/notifications/page.tsx | src/app/dashboard/notifications/page.tsx:110 | Legacy reference | Sparkles | Rendered | Sparkles | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/notifications/page.tsx | src/app/dashboard/notifications/page.tsx:129 | Legacy reference | CheckCheck | Rendered | CheckCheck | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/notifications/page.tsx | src/app/dashboard/notifications/page.tsx:139 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/notifications/page.tsx | src/app/dashboard/notifications/page.tsx:161 | Icon component | Icon | Rendered | Trace source | Context review | Normal | Review | May refer to an inventory entry elsewhere |
| /dashboard/notifications/page.tsx | src/app/dashboard/notifications/page.tsx:200 | Legacy reference | BellOff | Rendered | BellOff | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/orders/page.tsx | src/app/dashboard/orders/page.tsx:6 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /dashboard/orders/page.tsx | src/app/dashboard/orders/page.tsx:195 | Legacy reference | ShoppingBag | Rendered | ShoppingBag | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/orders/page.tsx | src/app/dashboard/orders/page.tsx:212 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/orders/page.tsx | src/app/dashboard/orders/page.tsx:220 | Legacy reference | Search | Rendered | Search | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/orders/page.tsx | src/app/dashboard/orders/page.tsx:279 | Legacy reference | Gift | Rendered | Gift | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/orders/page.tsx | src/app/dashboard/orders/page.tsx:337 | Legacy reference | Gift | Rendered | Gift | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/orders/page.tsx | src/app/dashboard/orders/page.tsx:346 | Legacy reference | KeyRound | Rendered | KeyRound | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/orders/page.tsx | src/app/dashboard/orders/page.tsx:354 | Legacy reference | Eye | Rendered | Eye | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/orders/page.tsx | src/app/dashboard/orders/page.tsx:364 | Legacy reference | Download | Rendered | Download | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/orders/page.tsx | src/app/dashboard/orders/page.tsx:374 | Legacy reference | MessageSquare | Rendered | MessageSquare | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/orders/page.tsx | src/app/dashboard/orders/page.tsx:385 | Legacy reference | PackageOpen | Rendered | PackageOpen | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/orders/page.tsx | src/app/dashboard/orders/page.tsx:415 | Legacy reference | X | Rendered | X | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/orders/page.tsx | src/app/dashboard/orders/page.tsx:497 | Legacy reference | Gift | Rendered | Gift | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/orders/page.tsx | src/app/dashboard/orders/page.tsx:509 | Emoji candidate | 🎁 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| /dashboard/orders/page.tsx | src/app/dashboard/orders/page.tsx:510 | Emoji candidate | 🎁 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| /dashboard/orders/page.tsx | src/app/dashboard/orders/page.tsx:512 | Emoji candidate | ⏳ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| /dashboard/orders/page.tsx | src/app/dashboard/orders/page.tsx:513 | Emoji candidate | ⏳ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| /dashboard/orders/page.tsx | src/app/dashboard/orders/page.tsx:555 | Legacy reference | Copy | Rendered | Copy | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/orders/page.tsx | src/app/dashboard/orders/page.tsx:563 | Emoji candidate | 🎁 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| /dashboard/orders/page.tsx | src/app/dashboard/orders/page.tsx:571 | Legacy reference | MessageCircle | Rendered | MessageCircle | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/orders/page.tsx | src/app/dashboard/orders/page.tsx:579 | Legacy reference | ExternalLink | Rendered | ExternalLink | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/orders/page.tsx | src/app/dashboard/orders/page.tsx:595 | Legacy reference | KeyRound | Rendered | KeyRound | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/orders/page.tsx | src/app/dashboard/orders/page.tsx:600 | Legacy reference | Clock | Rendered | Clock | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/page.tsx | src/app/dashboard/page.tsx:5 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /dashboard/page.tsx | src/app/dashboard/page.tsx:130 | Legacy reference | Wallet | Rendered | Wallet | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/page.tsx | src/app/dashboard/page.tsx:141 | Legacy reference | Plus | Rendered | Plus | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/page.tsx | src/app/dashboard/page.tsx:153 | Legacy reference | Compass | Rendered | Compass | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/page.tsx | src/app/dashboard/page.tsx:164 | Legacy reference | Clock | Rendered | Clock | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/page.tsx | src/app/dashboard/page.tsx:176 | Legacy reference | ShoppingBag | Rendered | ShoppingBag | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/page.tsx | src/app/dashboard/page.tsx:185 | Legacy reference | KeyRound | Rendered | KeyRound | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/page.tsx | src/app/dashboard/page.tsx:194 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/page.tsx | src/app/dashboard/page.tsx:220 | Legacy reference | ShoppingBag | Rendered | ShoppingBag | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/preferences/page.tsx | src/app/dashboard/preferences/page.tsx:5 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /dashboard/preferences/page.tsx | src/app/dashboard/preferences/page.tsx:79 | Legacy reference | ArrowLeft | Rendered | ArrowLeft | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/preferences/page.tsx | src/app/dashboard/preferences/page.tsx:93 | Legacy reference | CheckCircle2 | Rendered | CheckCircle2 | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/preferences/page.tsx | src/app/dashboard/preferences/page.tsx:154 | Legacy reference | Loader2 | Rendered | Loader2 | Loop while busy | Normal | Pending | Confirm semantics in context |
| /dashboard/preferences/page.tsx | src/app/dashboard/preferences/page.tsx:154 | Legacy reference | Save | Rendered | Save | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/refunds/page.tsx | src/app/dashboard/refunds/page.tsx:6 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /dashboard/refunds/page.tsx | src/app/dashboard/refunds/page.tsx:97 | Legacy reference | Clock | Source reference | Clock | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/refunds/page.tsx | src/app/dashboard/refunds/page.tsx:103 | Legacy reference | AlertCircle | Source reference | AlertCircle | State | Normal | Pending | Confirm semantics in context |
| /dashboard/refunds/page.tsx | src/app/dashboard/refunds/page.tsx:109 | Legacy reference | CheckCircle2 | Source reference | CheckCircle2 | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/refunds/page.tsx | src/app/dashboard/refunds/page.tsx:115 | Legacy reference | CheckCircle2 | Source reference | CheckCircle2 | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/refunds/page.tsx | src/app/dashboard/refunds/page.tsx:121 | Legacy reference | XCircle | Source reference | XCircle | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/refunds/page.tsx | src/app/dashboard/refunds/page.tsx:127 | Legacy reference | ShieldAlert | Source reference | ShieldAlert | State | Normal | Pending | Confirm semantics in context |
| /dashboard/refunds/page.tsx | src/app/dashboard/refunds/page.tsx:139 | Legacy reference | Banknote | Rendered | Banknote | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/refunds/page.tsx | src/app/dashboard/refunds/page.tsx:156 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/refunds/page.tsx | src/app/dashboard/refunds/page.tsx:180 | Legacy reference | Search | Rendered | Search | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/refunds/page.tsx | src/app/dashboard/refunds/page.tsx:238 | Icon component | StatusIcon | Rendered | Trace source | Context review | Normal | Review | May refer to an inventory entry elsewhere |
| /dashboard/refunds/page.tsx | src/app/dashboard/refunds/page.tsx:311 | Legacy reference | MessageSquare | Rendered | MessageSquare | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/refunds/page.tsx | src/app/dashboard/refunds/page.tsx:313 | Legacy reference | ExternalLink | Rendered | ExternalLink | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/refunds/page.tsx | src/app/dashboard/refunds/page.tsx:323 | Legacy reference | Banknote | Rendered | Banknote | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/replacements/page.tsx | src/app/dashboard/replacements/page.tsx:5 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /dashboard/replacements/page.tsx | src/app/dashboard/replacements/page.tsx:69 | Legacy reference | CheckCircle2 | Source reference | CheckCircle2 | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/replacements/page.tsx | src/app/dashboard/replacements/page.tsx:75 | Legacy reference | Clock | Source reference | Clock | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/replacements/page.tsx | src/app/dashboard/replacements/page.tsx:81 | Legacy reference | XCircle | Source reference | XCircle | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/replacements/page.tsx | src/app/dashboard/replacements/page.tsx:87 | Legacy reference | Clock | Source reference | Clock | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/replacements/page.tsx | src/app/dashboard/replacements/page.tsx:100 | Legacy reference | RotateCcw | Rendered | RotateCcw | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/replacements/page.tsx | src/app/dashboard/replacements/page.tsx:117 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/replacements/page.tsx | src/app/dashboard/replacements/page.tsx:149 | Icon component | Icon | Rendered | Trace source | Context review | Normal | Review | May refer to an inventory entry elsewhere |
| /dashboard/replacements/page.tsx | src/app/dashboard/replacements/page.tsx:174 | Legacy reference | CheckCircle2 | Rendered | CheckCircle2 | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/replacements/page.tsx | src/app/dashboard/replacements/page.tsx:187 | Legacy reference | ShieldCheck | Rendered | ShieldCheck | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/replacements/page.tsx | src/app/dashboard/replacements/page.tsx:200 | Legacy reference | KeyRound | Rendered | KeyRound | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/replacements/page.tsx | src/app/dashboard/replacements/page.tsx:210 | Legacy reference | ExternalLink | Rendered | ExternalLink | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/replacements/page.tsx | src/app/dashboard/replacements/page.tsx:222 | Legacy reference | RotateCcw | Rendered | RotateCcw | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/replacements/page.tsx | src/app/dashboard/replacements/page.tsx:246 | Legacy reference | ShieldCheck | Rendered | ShieldCheck | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/security/page.tsx | src/app/dashboard/security/page.tsx:4 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /dashboard/security/page.tsx | src/app/dashboard/security/page.tsx:162 | Legacy reference | Loader2 | Rendered | Loader2 | Loop while busy | Normal | Pending | Confirm semantics in context |
| /dashboard/security/page.tsx | src/app/dashboard/security/page.tsx:174 | Legacy reference | ShieldCheck | Rendered | ShieldCheck | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/security/page.tsx | src/app/dashboard/security/page.tsx:182 | Legacy reference | Shield | Rendered | Shield | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/security/page.tsx | src/app/dashboard/security/page.tsx:226 | Legacy reference | Key | Rendered | Key | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/security/page.tsx | src/app/dashboard/security/page.tsx:243 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/security/page.tsx | src/app/dashboard/security/page.tsx:249 | Legacy reference | AlertTriangle | Rendered | AlertTriangle | State | Normal | Pending | Confirm semantics in context |
| /dashboard/security/page.tsx | src/app/dashboard/security/page.tsx:280 | Legacy reference | Loader2 | Rendered | Loader2 | Loop while busy | Normal | Pending | Confirm semantics in context |
| /dashboard/security/page.tsx | src/app/dashboard/security/page.tsx:324 | Legacy reference | Loader2 | Rendered | Loader2 | Loop while busy | Normal | Pending | Confirm semantics in context |
| /dashboard/security/page.tsx | src/app/dashboard/security/page.tsx:331 | Legacy reference | ShieldCheck | Rendered | ShieldCheck | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/security/page.tsx | src/app/dashboard/security/page.tsx:349 | Legacy reference | Copy | Rendered | Copy | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/security/page.tsx | src/app/dashboard/security/page.tsx:352 | Legacy reference | Download | Rendered | Download | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/support/[id]/page.tsx | src/app/dashboard/support/[id]/page.tsx:6 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /dashboard/support/[id]/page.tsx | src/app/dashboard/support/[id]/page.tsx:96 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/support/[id]/page.tsx | src/app/dashboard/support/[id]/page.tsx:105 | Legacy reference | AlertCircle | Rendered | AlertCircle | State | Normal | Pending | Confirm semantics in context |
| /dashboard/support/[id]/page.tsx | src/app/dashboard/support/[id]/page.tsx:122 | Legacy reference | ArrowLeft | Rendered | ArrowLeft | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/support/[id]/page.tsx | src/app/dashboard/support/[id]/page.tsx:138 | Legacy reference | Clock | Rendered | Clock | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/support/[id]/page.tsx | src/app/dashboard/support/[id]/page.tsx:172 | Legacy reference | ShieldCheck | Rendered | ShieldCheck | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/support/[id]/page.tsx | src/app/dashboard/support/[id]/page.tsx:216 | Legacy reference | Send | Rendered | Send | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/support/[id]/page.tsx | src/app/dashboard/support/[id]/page.tsx:238 | Legacy reference | ExternalLink | Rendered | ExternalLink | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/support/[id]/page.tsx | src/app/dashboard/support/[id]/page.tsx:268 | Legacy reference | KeyRound | Rendered | KeyRound | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/support/[id]/page.tsx | src/app/dashboard/support/[id]/page.tsx:272 | Legacy reference | RotateCcw | Rendered | RotateCcw | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/support/[id]/page.tsx | src/app/dashboard/support/[id]/page.tsx:284 | Legacy reference | MessageCircle | Rendered | MessageCircle | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/support/[id]/page.tsx | src/app/dashboard/support/[id]/page.tsx:300 | Legacy reference | MessageCircle | Rendered | MessageCircle | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/support/new/page.tsx | src/app/dashboard/support/new/page.tsx:6 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /dashboard/support/new/page.tsx | src/app/dashboard/support/new/page.tsx:87 | Legacy reference | CheckCircle2 | Rendered | CheckCircle2 | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/support/new/page.tsx | src/app/dashboard/support/new/page.tsx:109 | Legacy reference | ArrowLeft | Rendered | ArrowLeft | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/support/new/page.tsx | src/app/dashboard/support/new/page.tsx:123 | Legacy reference | ShieldAlert | Rendered | ShieldAlert | State | Normal | Pending | Confirm semantics in context |
| /dashboard/support/new/page.tsx | src/app/dashboard/support/new/page.tsx:240 | Legacy reference | Loader2 | Rendered | Loader2 | Loop while busy | Normal | Pending | Confirm semantics in context |
| /dashboard/support/new/page.tsx | src/app/dashboard/support/new/page.tsx:242 | Legacy reference | Send | Rendered | Send | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/support/new/page.tsx | src/app/dashboard/support/new/page.tsx:254 | Legacy reference | Loader2 | Rendered | Loader2 | Loop while busy | Normal | Pending | Confirm semantics in context |
| /dashboard/support/page.tsx | src/app/dashboard/support/page.tsx:5 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /dashboard/support/page.tsx | src/app/dashboard/support/page.tsx:87 | Legacy reference | Plus | Rendered | Plus | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/support/page.tsx | src/app/dashboard/support/page.tsx:97 | Legacy reference | MessageCircle | Rendered | MessageCircle | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/support/page.tsx | src/app/dashboard/support/page.tsx:115 | Legacy reference | ExternalLink | Rendered | ExternalLink | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/support/page.tsx | src/app/dashboard/support/page.tsx:147 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/support/page.tsx | src/app/dashboard/support/page.tsx:152 | Legacy reference | AlertCircle | Rendered | AlertCircle | State | Normal | Pending | Confirm semantics in context |
| /dashboard/support/page.tsx | src/app/dashboard/support/page.tsx:183 | Legacy reference | Clock | Rendered | Clock | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/support/page.tsx | src/app/dashboard/support/page.tsx:197 | Legacy reference | HelpCircle | Rendered | HelpCircle | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/support/page.tsx | src/app/dashboard/support/page.tsx:214 | Legacy reference | HelpCircle | Rendered | HelpCircle | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/support/page.tsx | src/app/dashboard/support/page.tsx:229 | Legacy reference | ChevronDown | Rendered | ChevronDown | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/wallet/page.tsx | src/app/dashboard/wallet/page.tsx:5 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /dashboard/wallet/page.tsx | src/app/dashboard/wallet/page.tsx:173 | Emoji candidate | 🎉 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| /dashboard/wallet/page.tsx | src/app/dashboard/wallet/page.tsx:174 | Emoji candidate | 🎉 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| /dashboard/wallet/page.tsx | src/app/dashboard/wallet/page.tsx:216 | Legacy reference | PlusCircle | Rendered | PlusCircle | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/wallet/page.tsx | src/app/dashboard/wallet/page.tsx:228 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/wallet/page.tsx | src/app/dashboard/wallet/page.tsx:237 | Legacy reference | Gift | Rendered | Gift | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/wallet/page.tsx | src/app/dashboard/wallet/page.tsx:299 | Legacy reference | ArrowDownLeft | Rendered | ArrowDownLeft | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/wallet/page.tsx | src/app/dashboard/wallet/page.tsx:301 | Legacy reference | ArrowUpRight | Rendered | ArrowUpRight | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/wallet/page.tsx | src/app/dashboard/wallet/page.tsx:350 | Legacy reference | Wallet | Rendered | Wallet | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/wallet/page.tsx | src/app/dashboard/wallet/page.tsx:371 | Legacy reference | Wallet | Rendered | Wallet | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/wallet/page.tsx | src/app/dashboard/wallet/page.tsx:381 | Legacy reference | X | Rendered | X | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/wallet/page.tsx | src/app/dashboard/wallet/page.tsx:433 | Legacy reference | Zap | Rendered | Zap | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/wishlist/page.tsx | src/app/dashboard/wishlist/page.tsx:5 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /dashboard/wishlist/page.tsx | src/app/dashboard/wishlist/page.tsx:23 | Legacy reference | Heart | Rendered | Heart | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/wishlist/page.tsx | src/app/dashboard/wishlist/page.tsx:23 | Legacy reference | Heart | Rendered | Heart | Context review | Normal | Pending | Confirm semantics in context |
| /dashboard/wishlist/page.tsx | src/app/dashboard/wishlist/page.tsx:23 | Legacy reference | Trash2 | Rendered | Trash2 | Context review | Normal | Pending | Confirm semantics in context |
| /error.tsx | src/app/error.tsx:5 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /error.tsx | src/app/error.tsx:24 | Legacy reference | AlertTriangle | Rendered | AlertTriangle | State | Normal | Pending | Confirm semantics in context |
| /error.tsx | src/app/error.tsx:42 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| /error.tsx | src/app/error.tsx:50 | Legacy reference | Home | Rendered | Home | Context review | Normal | Pending | Confirm semantics in context |
| /error.tsx | src/app/error.tsx:57 | Legacy reference | MessageSquare | Rendered | MessageSquare | Context review | Normal | Pending | Confirm semantics in context |
| /gift-cards/page.tsx | src/app/gift-cards/page.tsx:4 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /gift-cards/page.tsx | src/app/gift-cards/page.tsx:59 | Emoji candidate | 🎉 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| /gift-cards/page.tsx | src/app/gift-cards/page.tsx:78 | Legacy reference | Gift | Rendered | Gift | Context review | Normal | Pending | Confirm semantics in context |
| /gift-cards/page.tsx | src/app/gift-cards/page.tsx:99 | Legacy reference | Sparkles | Rendered | Sparkles | Context review | Normal | Pending | Confirm semantics in context |
| /gift-cards/page.tsx | src/app/gift-cards/page.tsx:124 | Legacy reference | ShieldCheck | Rendered | ShieldCheck | Context review | Normal | Pending | Confirm semantics in context |
| /gift-cards/page.tsx | src/app/gift-cards/page.tsx:182 | Legacy reference | User | Rendered | User | Context review | Normal | Pending | Confirm semantics in context |
| /gift-cards/page.tsx | src/app/gift-cards/page.tsx:196 | Legacy reference | Mail | Rendered | Mail | Context review | Normal | Pending | Confirm semantics in context |
| /gift-cards/page.tsx | src/app/gift-cards/page.tsx:237 | Legacy reference | Gift | Rendered | Gift | Context review | Normal | Pending | Confirm semantics in context |
| /gift-cards/page.tsx | src/app/gift-cards/page.tsx:239 | Legacy reference | ArrowRight | Rendered | ArrowRight | Context review | Normal | Pending | Confirm semantics in context |
| /gift/[token]/GiftClaimClient.tsx | src/app/gift/[token]/GiftClaimClient.tsx:6 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /gift/[token]/GiftClaimClient.tsx | src/app/gift/[token]/GiftClaimClient.tsx:200 | Emoji candidate | ❤️ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| /gift/[token]/GiftClaimClient.tsx | src/app/gift/[token]/GiftClaimClient.tsx:200 | Emoji candidate | 🎁 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| /gift/[token]/GiftClaimClient.tsx | src/app/gift/[token]/GiftClaimClient.tsx:203 | Emoji candidate | ❤️ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| /gift/[token]/GiftClaimClient.tsx | src/app/gift/[token]/GiftClaimClient.tsx:203 | Emoji candidate | 🎁 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| /gift/[token]/GiftClaimClient.tsx | src/app/gift/[token]/GiftClaimClient.tsx:234 | Legacy reference | ShieldCheck | Rendered | ShieldCheck | Context review | Normal | Pending | Confirm semantics in context |
| /gift/[token]/GiftClaimClient.tsx | src/app/gift/[token]/GiftClaimClient.tsx:288 | Emoji candidate | 🎀 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| /gift/[token]/GiftClaimClient.tsx | src/app/gift/[token]/GiftClaimClient.tsx:293 | Legacy reference | Gift | Rendered | Gift | Context review | Normal | Pending | Confirm semantics in context |
| /gift/[token]/GiftClaimClient.tsx | src/app/gift/[token]/GiftClaimClient.tsx:302 | Emoji candidate | 🎉 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| /gift/[token]/GiftClaimClient.tsx | src/app/gift/[token]/GiftClaimClient.tsx:323 | Legacy reference | Sparkles | Rendered | Sparkles | Context review | Normal | Pending | Confirm semantics in context |
| /gift/[token]/GiftClaimClient.tsx | src/app/gift/[token]/GiftClaimClient.tsx:324 | Emoji candidate | 🎁 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| /gift/[token]/GiftClaimClient.tsx | src/app/gift/[token]/GiftClaimClient.tsx:375 | Legacy reference | Gift | Rendered | Gift | Context review | Normal | Pending | Confirm semantics in context |
| /gift/[token]/GiftClaimClient.tsx | src/app/gift/[token]/GiftClaimClient.tsx:403 | Image reference | /images/placeholders/aihaat-placeholder.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| /gift/[token]/GiftClaimClient.tsx | src/app/gift/[token]/GiftClaimClient.tsx:410 | Legacy reference | Gift | Rendered | Gift | Context review | Normal | Pending | Confirm semantics in context |
| /gift/[token]/GiftClaimClient.tsx | src/app/gift/[token]/GiftClaimClient.tsx:440 | Legacy reference | Key | Rendered | Key | Context review | Normal | Pending | Confirm semantics in context |
| /gift/[token]/GiftClaimClient.tsx | src/app/gift/[token]/GiftClaimClient.tsx:477 | Legacy reference | Check | Rendered | Check | Context review | Normal | Pending | Confirm semantics in context |
| /gift/[token]/GiftClaimClient.tsx | src/app/gift/[token]/GiftClaimClient.tsx:482 | Legacy reference | Copy | Rendered | Copy | Context review | Normal | Pending | Confirm semantics in context |
| /gift/[token]/GiftClaimClient.tsx | src/app/gift/[token]/GiftClaimClient.tsx:505 | Legacy reference | Copy | Rendered | Copy | Context review | Normal | Pending | Confirm semantics in context |
| /gift/[token]/GiftClaimClient.tsx | src/app/gift/[token]/GiftClaimClient.tsx:524 | Legacy reference | EyeOff | Rendered | EyeOff | Context review | Normal | Pending | Confirm semantics in context |
| /gift/[token]/GiftClaimClient.tsx | src/app/gift/[token]/GiftClaimClient.tsx:526 | Legacy reference | Eye | Rendered | Eye | Context review | Normal | Pending | Confirm semantics in context |
| /gift/[token]/GiftClaimClient.tsx | src/app/gift/[token]/GiftClaimClient.tsx:534 | Legacy reference | Copy | Rendered | Copy | Context review | Normal | Pending | Confirm semantics in context |
| /gift/[token]/GiftClaimClient.tsx | src/app/gift/[token]/GiftClaimClient.tsx:560 | Legacy reference | Check | Rendered | Check | Context review | Normal | Pending | Confirm semantics in context |
| /gift/[token]/GiftClaimClient.tsx | src/app/gift/[token]/GiftClaimClient.tsx:565 | Legacy reference | Copy | Rendered | Copy | Context review | Normal | Pending | Confirm semantics in context |
| /gift/[token]/GiftClaimClient.tsx | src/app/gift/[token]/GiftClaimClient.tsx:587 | Legacy reference | ExternalLink | Rendered | ExternalLink | Context review | Normal | Pending | Confirm semantics in context |
| /gift/[token]/GiftClaimClient.tsx | src/app/gift/[token]/GiftClaimClient.tsx:595 | Emoji candidate | 💡 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| /gift/[token]/GiftClaimClient.tsx | src/app/gift/[token]/GiftClaimClient.tsx:604 | Legacy reference | Clock | Rendered | Clock | Context review | Normal | Pending | Confirm semantics in context |
| /gift/[token]/GiftClaimClient.tsx | src/app/gift/[token]/GiftClaimClient.tsx:617 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| /gift/[token]/GiftClaimClient.tsx | src/app/gift/[token]/GiftClaimClient.tsx:632 | Legacy reference | MessageCircle | Rendered | MessageCircle | Context review | Normal | Pending | Confirm semantics in context |
| /gift/[token]/GiftClaimClient.tsx | src/app/gift/[token]/GiftClaimClient.tsx:641 | Legacy reference | ArrowRight | Rendered | ArrowRight | Context review | Normal | Pending | Confirm semantics in context |
| /gift/[token]/GiftClaimClient.tsx | src/app/gift/[token]/GiftClaimClient.tsx:648 | Emoji candidate | 📌 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| /layout.tsx | src/app/layout.tsx:49 | Image reference | /images/og-image.png | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| /layout.tsx | src/app/layout.tsx:63 | Image reference | /images/og-image.png | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| /layout.tsx | src/app/layout.tsx:77 | Image reference | /images/logo.png | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| /layout.tsx | src/app/layout.tsx:78 | Image reference | /images/logo.png | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| /login/page.tsx | src/app/login/page.tsx:7 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /login/page.tsx | src/app/login/page.tsx:39 | Legacy reference | Sparkles | Rendered | Sparkles | Context review | Normal | Pending | Confirm semantics in context |
| /login/page.tsx | src/app/login/page.tsx:57 | Inline SVG | SVG | Rendered | Review markup | Context review | Normal | Review | May be a logo or illustration |
| /login/page.tsx | src/app/login/page.tsx:76 | Legacy reference | ArrowRight | Rendered | ArrowRight | Context review | Normal | Pending | Confirm semantics in context |
| /login/page.tsx | src/app/login/page.tsx:82 | Legacy reference | ShieldCheck | Rendered | ShieldCheck | Context review | Normal | Pending | Confirm semantics in context |
| /not-found.tsx | src/app/not-found.tsx:6 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /not-found.tsx | src/app/not-found.tsx:59 | Legacy reference | Search | Rendered | Search | Context review | Normal | Pending | Confirm semantics in context |
| /not-found.tsx | src/app/not-found.tsx:87 | Legacy reference | Home | Rendered | Home | Context review | Normal | Pending | Confirm semantics in context |
| /not-found.tsx | src/app/not-found.tsx:95 | Legacy reference | ShoppingBag | Rendered | ShoppingBag | Context review | Normal | Pending | Confirm semantics in context |
| /page.tsx | src/app/page.tsx:26 | Image reference | /images/og-image.png | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| /page.tsx | src/app/page.tsx:40 | Image reference | /images/og-image.png | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| /privacy/page.tsx | src/app/privacy/page.tsx:4 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /privacy/page.tsx | src/app/privacy/page.tsx:32 | Legacy reference | ArrowLeft | Rendered | ArrowLeft | Context review | Normal | Pending | Confirm semantics in context |
| /privacy/page.tsx | src/app/privacy/page.tsx:38 | Legacy reference | Lock | Rendered | Lock | Context review | Normal | Pending | Confirm semantics in context |
| /product/[slug]/page.tsx | src/app/product/[slug]/page.tsx:46 | Image reference | images/logo.png | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| /product/[slug]/page.tsx | src/app/product/[slug]/page.tsx:118 | Image reference | images/logo.png | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| /shop/page.tsx | src/app/shop/page.tsx:21 | Image reference | /images/og-image.png | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| /shop/page.tsx | src/app/shop/page.tsx:35 | Image reference | /images/og-image.png | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| /terms/page.tsx | src/app/terms/page.tsx:4 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /terms/page.tsx | src/app/terms/page.tsx:32 | Legacy reference | ArrowLeft | Rendered | ArrowLeft | Context review | Normal | Pending | Confirm semantics in context |
| /terms/page.tsx | src/app/terms/page.tsx:38 | Legacy reference | FileText | Rendered | FileText | Context review | Normal | Pending | Confirm semantics in context |
| /wallet/page.tsx | src/app/wallet/page.tsx:4 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| /wallet/page.tsx | src/app/wallet/page.tsx:85 | Legacy reference | Wallet | Rendered | Wallet | Context review | Normal | Pending | Confirm semantics in context |
| /wallet/page.tsx | src/app/wallet/page.tsx:108 | Legacy reference | ShieldCheck | Rendered | ShieldCheck | Context review | Normal | Pending | Confirm semantics in context |
| /wallet/page.tsx | src/app/wallet/page.tsx:128 | Legacy reference | PlusCircle | Rendered | PlusCircle | Context review | Normal | Pending | Confirm semantics in context |
| /wallet/page.tsx | src/app/wallet/page.tsx:179 | Legacy reference | Zap | Rendered | Zap | Context review | Normal | Pending | Confirm semantics in context |
| /wallet/page.tsx | src/app/wallet/page.tsx:220 | Legacy reference | Wallet | Rendered | Wallet | Context review | Normal | Pending | Confirm semantics in context |
| AuthModal.tsx | src/components/AuthModal.tsx:6 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| AuthModal.tsx | src/components/AuthModal.tsx:62 | Legacy reference | X | Rendered | X | Context review | Normal | Pending | Confirm semantics in context |
| AuthModal.tsx | src/components/AuthModal.tsx:96 | Inline SVG | SVG | Rendered | Review markup | Context review | Normal | Review | May be a logo or illustration |
| AuthModal.tsx | src/components/AuthModal.tsx:121 | Legacy reference | CheckCircle2 | Rendered | CheckCircle2 | Context review | Normal | Pending | Confirm semantics in context |
| AuthModal.tsx | src/components/AuthModal.tsx:125 | Legacy reference | CheckCircle2 | Rendered | CheckCircle2 | Context review | Normal | Pending | Confirm semantics in context |
| AuthModal.tsx | src/components/AuthModal.tsx:129 | Legacy reference | CheckCircle2 | Rendered | CheckCircle2 | Context review | Normal | Pending | Confirm semantics in context |
| AuthModal.tsx | src/components/AuthModal.tsx:138 | Legacy reference | ShieldCheck | Rendered | ShieldCheck | Context review | Normal | Pending | Confirm semantics in context |
| CartDrawer.tsx | src/components/CartDrawer.tsx:5 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| CartDrawer.tsx | src/components/CartDrawer.tsx:160 | Legacy reference | ShoppingBag | Rendered | ShoppingBag | Context review | Normal | Pending | Confirm semantics in context |
| CartDrawer.tsx | src/components/CartDrawer.tsx:171 | Legacy reference | X | Rendered | X | Context review | Normal | Pending | Confirm semantics in context |
| CartDrawer.tsx | src/components/CartDrawer.tsx:210 | Legacy reference | Minus | Rendered | Minus | Context review | Normal | Pending | Confirm semantics in context |
| CartDrawer.tsx | src/components/CartDrawer.tsx:221 | Legacy reference | Plus | Rendered | Plus | Context review | Normal | Pending | Confirm semantics in context |
| CartDrawer.tsx | src/components/CartDrawer.tsx:234 | Legacy reference | Trash2 | Rendered | Trash2 | Context review | Normal | Pending | Confirm semantics in context |
| CartDrawer.tsx | src/components/CartDrawer.tsx:241 | Legacy reference | ShoppingBag | Rendered | ShoppingBag | Context review | Normal | Pending | Confirm semantics in context |
| CartDrawer.tsx | src/components/CartDrawer.tsx:268 | Legacy reference | CheckCircle2 | Rendered | CheckCircle2 | Context review | Normal | Pending | Confirm semantics in context |
| CartDrawer.tsx | src/components/CartDrawer.tsx:282 | Legacy reference | Tag | Rendered | Tag | Context review | Normal | Pending | Confirm semantics in context |
| CartDrawer.tsx | src/components/CartDrawer.tsx:326 | Legacy reference | ArrowRight | Rendered | ArrowRight | Context review | Normal | Pending | Confirm semantics in context |
| ConfirmModal.tsx | src/components/ConfirmModal.tsx:4 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| ConfirmModal.tsx | src/components/ConfirmModal.tsx:69 | Legacy reference | Trash2 | Rendered | Trash2 | Context review | Normal | Pending | Confirm semantics in context |
| ConfirmModal.tsx | src/components/ConfirmModal.tsx:71 | Legacy reference | AlertTriangle | Rendered | AlertTriangle | State | Normal | Pending | Confirm semantics in context |
| ConfirmModal.tsx | src/components/ConfirmModal.tsx:73 | Legacy reference | Info | Rendered | Info | Context review | Normal | Pending | Confirm semantics in context |
| ConfirmModal.tsx | src/components/ConfirmModal.tsx:92 | Legacy reference | X | Rendered | X | Context review | Normal | Pending | Confirm semantics in context |
| ConfirmModal.tsx | src/components/ConfirmModal.tsx:122 | Legacy reference | Check | Rendered | Check | Context review | Normal | Pending | Confirm semantics in context |
| Footer.tsx | src/components/Footer.tsx:5 | Legacy import | lucide-react | Source reference | — | Context review | High | Evidence | Import declaration |
| Footer.tsx | src/components/Footer.tsx:60 | Legacy reference | Phone | Rendered | Phone | Context review | High | Pending | Confirm semantics in context |
| Footer.tsx | src/components/Footer.tsx:61 | Legacy reference | Mail | Rendered | Mail | Context review | High | Pending | Confirm semantics in context |
| Footer.tsx | src/components/Footer.tsx:62 | Legacy reference | MapPin | Rendered | MapPin | Context review | High | Pending | Confirm semantics in context |
| Footer.tsx | src/components/Footer.tsx:65 | Legacy reference | Facebook | Rendered | Facebook | Context review | High | Review brand | Confirm semantics in context |
| Footer.tsx | src/components/Footer.tsx:66 | Legacy reference | MessageCircle | Rendered | MessageCircle | Context review | High | Pending | Confirm semantics in context |
| Footer.tsx | src/components/Footer.tsx:67 | Legacy reference | Mail | Rendered | Mail | Context review | High | Pending | Confirm semantics in context |
| Footer.tsx | src/components/Footer.tsx:82 | Legacy reference | Send | Rendered | Send | Context review | High | Pending | Confirm semantics in context |
| Footer.tsx | src/components/Footer.tsx:84 | Legacy reference | ShieldCheck | Rendered | ShieldCheck | Context review | High | Pending | Confirm semantics in context |
| Footer.tsx | src/components/Footer.tsx:90 | Emoji candidate | © | Source reference | Review purpose | Context review | High | Review | May be application copy or shared data |
| Header.tsx | src/components/Header.tsx:6 | Legacy import | lucide-react | Source reference | — | Context review | High | Evidence | Import declaration |
| Header.tsx | src/components/Header.tsx:115 | Legacy reference | Menu | Rendered | Menu | Context review | High | Pending | Confirm semantics in context |
| Header.tsx | src/components/Header.tsx:128 | Legacy reference | Search | Rendered | Search | Context review | High | Pending | Confirm semantics in context |
| Header.tsx | src/components/Header.tsx:185 | Legacy reference | ChevronRight | Rendered | ChevronRight | Context review | High | Pending | Confirm semantics in context |
| Header.tsx | src/components/Header.tsx:218 | Legacy reference | Search | Rendered | Search | Context review | High | Pending | Confirm semantics in context |
| Header.tsx | src/components/Header.tsx:254 | Legacy reference | ShoppingBag | Rendered | ShoppingBag | Context review | High | Pending | Confirm semantics in context |
| Header.tsx | src/components/Header.tsx:285 | Legacy reference | ShieldCheck | Rendered | ShieldCheck | Context review | High | Pending | Confirm semantics in context |
| Header.tsx | src/components/Header.tsx:344 | Legacy reference | X | Rendered | X | Context review | High | Pending | Confirm semantics in context |
| Header.tsx | src/components/Header.tsx:349 | Legacy reference | Search | Rendered | Search | Context review | High | Pending | Confirm semantics in context |
| Header.tsx | src/components/Header.tsx:402 | Legacy reference | X | Rendered | X | Context review | High | Pending | Confirm semantics in context |
| Header.tsx | src/components/Header.tsx:425 | Legacy reference | Gift | Rendered | Gift | Context review | High | Pending | Confirm semantics in context |
| Header.tsx | src/components/Header.tsx:426 | Legacy reference | ChevronRight | Rendered | ChevronRight | Context review | High | Pending | Confirm semantics in context |
| ImageUpload.tsx | src/components/ImageUpload.tsx:4 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| ImageUpload.tsx | src/components/ImageUpload.tsx:86 | Legacy reference | CheckCircle | Rendered | CheckCircle | Context review | Normal | Pending | Confirm semantics in context |
| ImageUpload.tsx | src/components/ImageUpload.tsx:131 | Legacy reference | X | Rendered | X | Context review | Normal | Pending | Confirm semantics in context |
| ImageUpload.tsx | src/components/ImageUpload.tsx:154 | Legacy reference | Loader2 | Rendered | Loader2 | Loop while busy | Normal | Pending | Confirm semantics in context |
| ImageUpload.tsx | src/components/ImageUpload.tsx:156 | Legacy reference | UploadCloud | Rendered | UploadCloud | Context review | Normal | Pending | Confirm semantics in context |
| Logo.tsx | src/components/Logo.tsx:34 | Inline SVG | SVG | Rendered | Review markup | Context review | Normal | Review | May be a logo or illustration |
| PaymentLogo.tsx | src/components/PaymentLogo.tsx:14 | Image reference | /images/payments/bkash.jpg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| PaymentLogo.tsx | src/components/PaymentLogo.tsx:18 | Image reference | /images/payments/bkash.jpg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| PaymentLogo.tsx | src/components/PaymentLogo.tsx:21 | Image reference | /images/payments/nagad.jpg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| PaymentLogo.tsx | src/components/PaymentLogo.tsx:24 | Image reference | /images/payments/rocket.jpg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| PaymentLogo.tsx | src/components/PaymentLogo.tsx:27 | Image reference | /images/payments/upay.jpg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| PaymentLogo.tsx | src/components/PaymentLogo.tsx:30 | Image reference | /images/payments/visa.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| PaymentLogo.tsx | src/components/PaymentLogo.tsx:33 | Image reference | /images/payments/mastercard.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| ProductCard.tsx | src/components/ProductCard.tsx:6 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| ProductCard.tsx | src/components/ProductCard.tsx:98 | Legacy reference | Heart | Rendered | Heart | Context review | Normal | Pending | Confirm semantics in context |
| ProductCard.tsx | src/components/ProductCard.tsx:142 | Legacy reference | Star | Rendered | Star | Context review | Normal | Pending | Confirm semantics in context |
| ProductCard.tsx | src/components/ProductCard.tsx:165 | Legacy reference | AlertCircle | Rendered | AlertCircle | State | Normal | Pending | Confirm semantics in context |
| ProductCard.tsx | src/components/ProductCard.tsx:230 | Legacy reference | Bell | Rendered | Bell | Context review | Normal | Pending | Confirm semantics in context |
| ProductCard.tsx | src/components/ProductCard.tsx:243 | Legacy reference | ShoppingBag | Rendered | ShoppingBag | Context review | Normal | Pending | Confirm semantics in context |
| ProductCard.tsx | src/components/ProductCard.tsx:254 | Legacy reference | Zap | Rendered | Zap | Context review | Normal | Pending | Confirm semantics in context |
| AboutClient.tsx | src/components/about/AboutClient.tsx:4 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| AboutClient.tsx | src/components/about/AboutClient.tsx:29 | Legacy reference | ShieldCheck | Rendered | ShieldCheck | Context review | Normal | Pending | Confirm semantics in context |
| AboutClient.tsx | src/components/about/AboutClient.tsx:39 | Legacy reference | Zap | Rendered | Zap | Context review | Normal | Pending | Confirm semantics in context |
| AboutClient.tsx | src/components/about/AboutClient.tsx:49 | Legacy reference | RotateCcw | Rendered | RotateCcw | Context review | Normal | Pending | Confirm semantics in context |
| AboutClient.tsx | src/components/about/AboutClient.tsx:59 | Legacy reference | Headphones | Rendered | Headphones | Context review | Normal | Pending | Confirm semantics in context |
| AboutClient.tsx | src/components/about/AboutClient.tsx:77 | Legacy reference | MapPin | Rendered | MapPin | Context review | Normal | Pending | Confirm semantics in context |
| AboutClient.tsx | src/components/about/AboutClient.tsx:85 | Legacy reference | Mail | Rendered | Mail | Context review | Normal | Pending | Confirm semantics in context |
| AboutClient.tsx | src/components/about/AboutClient.tsx:93 | Legacy reference | Phone | Rendered | Phone | Context review | Normal | Pending | Confirm semantics in context |
| AdminLayoutClient.tsx | src/components/admin/AdminLayoutClient.tsx:6 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| AdminLayoutClient.tsx | src/components/admin/AdminLayoutClient.tsx:78 | Legacy reference | ShieldAlert | Rendered | ShieldAlert | State | Normal | Pending | Confirm semantics in context |
| AdminLayoutClient.tsx | src/components/admin/AdminLayoutClient.tsx:94 | Legacy reference | LogIn | Rendered | LogIn | Context review | Normal | Pending | Confirm semantics in context |
| AdminLayoutClient.tsx | src/components/admin/AdminLayoutClient.tsx:119 | Legacy reference | Menu | Rendered | Menu | Context review | Normal | Pending | Confirm semantics in context |
| AdminLayoutClient.tsx | src/components/admin/AdminLayoutClient.tsx:138 | Legacy reference | Bell | Rendered | Bell | Context review | Normal | Pending | Confirm semantics in context |
| AdminLayoutClient.tsx | src/components/admin/AdminLayoutClient.tsx:148 | Legacy reference | Store | Rendered | Store | Context review | Normal | Pending | Confirm semantics in context |
| AdminLayoutClient.tsx | src/components/admin/AdminLayoutClient.tsx:156 | Legacy reference | ExternalLink | Rendered | ExternalLink | Context review | Normal | Pending | Confirm semantics in context |
| AdminLayoutClient.tsx | src/components/admin/AdminLayoutClient.tsx:199 | Icon component | Icon | Rendered | Trace source | Context review | Normal | Review | May refer to an inventory entry elsewhere |
| AdminLayoutClient.tsx | src/components/admin/AdminLayoutClient.tsx:215 | Legacy reference | LogOut | Rendered | LogOut | Context review | Normal | Review brand | Confirm semantics in context |
| AdminLayoutClient.tsx | src/components/admin/AdminLayoutClient.tsx:226 | Legacy reference | ShieldAlert | Rendered | ShieldAlert | State | Normal | Pending | Confirm semantics in context |
| AdminMobileNavigation.tsx | src/components/admin/AdminMobileNavigation.tsx:5 | Legacy import | lucide-react | Source reference | — | Context review | High | Evidence | Import declaration |
| AdminMobileNavigation.tsx | src/components/admin/AdminMobileNavigation.tsx:35 | Legacy reference | X | Rendered | X | Context review | High | Pending | Confirm semantics in context |
| AdminMobileNavigation.tsx | src/components/admin/AdminMobileNavigation.tsx:52 | Legacy reference | ChevronUp | Rendered | ChevronUp | Context review | High | Pending | Confirm semantics in context |
| AdminMobileNavigation.tsx | src/components/admin/AdminMobileNavigation.tsx:54 | Legacy reference | ChevronDown | Rendered | ChevronDown | Context review | High | Pending | Confirm semantics in context |
| AdminMobileNavigation.tsx | src/components/admin/AdminMobileNavigation.tsx:78 | Icon component | Icon | Rendered | Trace source | Context review | High | Review | May refer to an inventory entry elsewhere |
| AdminMobileNavigation.tsx | src/components/admin/AdminMobileNavigation.tsx:101 | Legacy reference | LogOut | Rendered | LogOut | Context review | High | Review brand | Confirm semantics in context |
| BulkActionBar.tsx | src/components/admin/BulkActionBar.tsx:4 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| BulkActionBar.tsx | src/components/admin/BulkActionBar.tsx:70 | Legacy reference | X | Rendered | X | Context review | Normal | Pending | Confirm semantics in context |
| BulkActionBar.tsx | src/components/admin/BulkActionBar.tsx:98 | Icon component | Icon | Rendered | Trace source | Context review | Normal | Review | May refer to an inventory entry elsewhere |
| GalleryImageUploader.tsx | src/components/admin/GalleryImageUploader.tsx:4 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| GalleryImageUploader.tsx | src/components/admin/GalleryImageUploader.tsx:71 | Legacy reference | Sparkles | Rendered | Sparkles | Context review | Normal | Pending | Confirm semantics in context |
| GalleryImageUploader.tsx | src/components/admin/GalleryImageUploader.tsx:94 | Legacy reference | ExternalLink | Rendered | ExternalLink | Context review | Normal | Pending | Confirm semantics in context |
| GalleryImageUploader.tsx | src/components/admin/GalleryImageUploader.tsx:102 | Legacy reference | Trash2 | Rendered | Trash2 | Context review | Normal | Pending | Confirm semantics in context |
| GalleryImageUploader.tsx | src/components/admin/GalleryImageUploader.tsx:119 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| GalleryImageUploader.tsx | src/components/admin/GalleryImageUploader.tsx:127 | Legacy reference | Plus | Rendered | Plus | Context review | Normal | Pending | Confirm semantics in context |
| ImageUploadDropzone.tsx | src/components/admin/ImageUploadDropzone.tsx:4 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| ImageUploadDropzone.tsx | src/components/admin/ImageUploadDropzone.tsx:116 | Legacy reference | Sparkles | Rendered | Sparkles | Context review | Normal | Pending | Confirm semantics in context |
| ImageUploadDropzone.tsx | src/components/admin/ImageUploadDropzone.tsx:125 | Legacy reference | Link2 | Rendered | Link2 | Context review | Normal | Pending | Confirm semantics in context |
| ImageUploadDropzone.tsx | src/components/admin/ImageUploadDropzone.tsx:161 | Legacy reference | ExternalLink | Rendered | ExternalLink | Context review | Normal | Pending | Confirm semantics in context |
| ImageUploadDropzone.tsx | src/components/admin/ImageUploadDropzone.tsx:172 | Legacy reference | CheckCircle2 | Rendered | CheckCircle2 | Context review | Normal | Pending | Confirm semantics in context |
| ImageUploadDropzone.tsx | src/components/admin/ImageUploadDropzone.tsx:178 | Emoji candidate | ⚡ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| ImageUploadDropzone.tsx | src/components/admin/ImageUploadDropzone.tsx:190 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| ImageUploadDropzone.tsx | src/components/admin/ImageUploadDropzone.tsx:201 | Legacy reference | Check | Rendered | Check | Context review | Normal | Pending | Confirm semantics in context |
| ImageUploadDropzone.tsx | src/components/admin/ImageUploadDropzone.tsx:206 | Legacy reference | Copy | Rendered | Copy | Context review | Normal | Pending | Confirm semantics in context |
| ImageUploadDropzone.tsx | src/components/admin/ImageUploadDropzone.tsx:221 | Legacy reference | Trash2 | Rendered | Trash2 | Context review | Normal | Pending | Confirm semantics in context |
| ImageUploadDropzone.tsx | src/components/admin/ImageUploadDropzone.tsx:242 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| ImageUploadDropzone.tsx | src/components/admin/ImageUploadDropzone.tsx:249 | Legacy reference | UploadCloud | Rendered | UploadCloud | Context review | Normal | Pending | Confirm semantics in context |
| ProductEditorForm.tsx | src/components/admin/ProductEditorForm.tsx:5 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| ProductEditorForm.tsx | src/components/admin/ProductEditorForm.tsx:285 | Legacy reference | AlertTriangle | Rendered | AlertTriangle | State | Normal | Pending | Confirm semantics in context |
| ProductEditorForm.tsx | src/components/admin/ProductEditorForm.tsx:342 | Legacy reference | Lock | Rendered | Lock | Context review | Normal | Pending | Confirm semantics in context |
| ProductEditorForm.tsx | src/components/admin/ProductEditorForm.tsx:342 | Legacy reference | Unlock | Rendered | Unlock | Context review | Normal | Pending | Confirm semantics in context |
| ProductEditorForm.tsx | src/components/admin/ProductEditorForm.tsx:486 | Legacy reference | Trash2 | Rendered | Trash2 | Context review | Normal | Pending | Confirm semantics in context |
| ProductEditorForm.tsx | src/components/admin/ProductEditorForm.tsx:581 | Legacy reference | Plus | Rendered | Plus | Context review | Normal | Pending | Confirm semantics in context |
| ProductEditorForm.tsx | src/components/admin/ProductEditorForm.tsx:600 | Emoji candidate | ⚡ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| ProductEditorForm.tsx | src/components/admin/ProductEditorForm.tsx:601 | Emoji candidate | 👤 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| ProductEditorForm.tsx | src/components/admin/ProductEditorForm.tsx:602 | Emoji candidate | 🔒 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| ProductEditorForm.tsx | src/components/admin/ProductEditorForm.tsx:603 | Emoji candidate | ✉️ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| ProductEditorForm.tsx | src/components/admin/ProductEditorForm.tsx:604 | Emoji candidate | 🌐 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| ProductEditorForm.tsx | src/components/admin/ProductEditorForm.tsx:646 | Legacy reference | Info | Rendered | Info | Context review | Normal | Pending | Confirm semantics in context |
| ProductEditorForm.tsx | src/components/admin/ProductEditorForm.tsx:769 | Legacy reference | Search | Rendered | Search | Context review | Normal | Pending | Confirm semantics in context |
| ProductEditorForm.tsx | src/components/admin/ProductEditorForm.tsx:801 | Legacy reference | CheckCircle2 | Rendered | CheckCircle2 | Context review | Normal | Pending | Confirm semantics in context |
| ProductEditorForm.tsx | src/components/admin/ProductEditorForm.tsx:823 | Inline SVG | SVG | Rendered | Review markup | Context review | Normal | Review | May be a logo or illustration |
| ProductEditorForm.tsx | src/components/admin/ProductEditorForm.tsx:828 | Legacy reference | Save | Rendered | Save | Context review | Normal | Pending | Confirm semantics in context |
| StockWaitlistAdminTab.tsx | src/components/admin/StockWaitlistAdminTab.tsx:4 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| StockWaitlistAdminTab.tsx | src/components/admin/StockWaitlistAdminTab.tsx:125 | Legacy reference | Users | Rendered | Users | Context review | Normal | Pending | Confirm semantics in context |
| StockWaitlistAdminTab.tsx | src/components/admin/StockWaitlistAdminTab.tsx:142 | Legacy reference | Package | Rendered | Package | Context review | Normal | Pending | Confirm semantics in context |
| StockWaitlistAdminTab.tsx | src/components/admin/StockWaitlistAdminTab.tsx:149 | Legacy reference | Sparkles | Rendered | Sparkles | Context review | Normal | Pending | Confirm semantics in context |
| StockWaitlistAdminTab.tsx | src/components/admin/StockWaitlistAdminTab.tsx:165 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| StockWaitlistAdminTab.tsx | src/components/admin/StockWaitlistAdminTab.tsx:219 | Legacy reference | Users | Rendered | Users | Context review | Normal | Pending | Confirm semantics in context |
| StockWaitlistAdminTab.tsx | src/components/admin/StockWaitlistAdminTab.tsx:237 | Legacy reference | Send | Rendered | Send | Context review | Normal | Pending | Confirm semantics in context |
| StockWaitlistAdminTab.tsx | src/components/admin/StockWaitlistAdminTab.tsx:250 | Legacy reference | Plus | Rendered | Plus | Context review | Normal | Pending | Confirm semantics in context |
| StockWaitlistAdminTab.tsx | src/components/admin/StockWaitlistAdminTab.tsx:295 | Legacy reference | Clock | Rendered | Clock | Context review | Normal | Pending | Confirm semantics in context |
| StockWaitlistAdminTab.tsx | src/components/admin/StockWaitlistAdminTab.tsx:312 | Legacy reference | CheckCircle | Rendered | CheckCircle | Context review | Normal | Pending | Confirm semantics in context |
| UserIntelligencePanel.tsx | src/components/admin/UserIntelligencePanel.tsx:4 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| UserIntelligencePanel.tsx | src/components/admin/UserIntelligencePanel.tsx:66 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| UserIntelligencePanel.tsx | src/components/admin/UserIntelligencePanel.tsx:76 | Legacy reference | AlertTriangle | Rendered | AlertTriangle | State | Normal | Pending | Confirm semantics in context |
| UserIntelligencePanel.tsx | src/components/admin/UserIntelligencePanel.tsx:126 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| UserIntelligencePanel.tsx | src/components/admin/UserIntelligencePanel.tsx:135 | Legacy reference | AlertTriangle | Rendered | AlertTriangle | State | Normal | Pending | Confirm semantics in context |
| UserIntelligencePanel.tsx | src/components/admin/UserIntelligencePanel.tsx:152 | Legacy reference | Laptop | Source reference | Laptop | Context review | Normal | Pending | Confirm semantics in context |
| UserIntelligencePanel.tsx | src/components/admin/UserIntelligencePanel.tsx:153 | Legacy reference | Globe | Source reference | Globe | Context review | Normal | Pending | Confirm semantics in context |
| UserIntelligencePanel.tsx | src/components/admin/UserIntelligencePanel.tsx:154 | Legacy reference | MapPin | Source reference | MapPin | Context review | Normal | Pending | Confirm semantics in context |
| UserIntelligencePanel.tsx | src/components/admin/UserIntelligencePanel.tsx:155 | Legacy reference | ShieldAlert | Source reference | ShieldAlert | State | Normal | Pending | Confirm semantics in context |
| UserIntelligencePanel.tsx | src/components/admin/UserIntelligencePanel.tsx:156 | Legacy reference | Activity | Source reference | Activity | Context review | Normal | Pending | Confirm semantics in context |
| UserIntelligencePanel.tsx | src/components/admin/UserIntelligencePanel.tsx:157 | Legacy reference | Lock | Source reference | Lock | Context review | Normal | Pending | Confirm semantics in context |
| UserIntelligencePanel.tsx | src/components/admin/UserIntelligencePanel.tsx:171 | Icon component | Icon | Rendered | Trace source | Context review | Normal | Review | May refer to an inventory entry elsewhere |
| UserIntelligencePanel.tsx | src/components/admin/UserIntelligencePanel.tsx:194 | Legacy reference | Laptop | Rendered | Laptop | Context review | Normal | Pending | Confirm semantics in context |
| UserIntelligencePanel.tsx | src/components/admin/UserIntelligencePanel.tsx:208 | Legacy reference | Smartphone | Rendered | Smartphone | Context review | Normal | Pending | Confirm semantics in context |
| UserIntelligencePanel.tsx | src/components/admin/UserIntelligencePanel.tsx:210 | Legacy reference | Tablet | Rendered | Tablet | Context review | Normal | Pending | Confirm semantics in context |
| UserIntelligencePanel.tsx | src/components/admin/UserIntelligencePanel.tsx:212 | Legacy reference | Laptop | Rendered | Laptop | Context review | Normal | Pending | Confirm semantics in context |
| UserIntelligencePanel.tsx | src/components/admin/UserIntelligencePanel.tsx:283 | Legacy reference | CheckCircle2 | Rendered | CheckCircle2 | Context review | Normal | Pending | Confirm semantics in context |
| UserIntelligencePanel.tsx | src/components/admin/UserIntelligencePanel.tsx:287 | Legacy reference | CheckCircle2 | Rendered | CheckCircle2 | Context review | Normal | Pending | Confirm semantics in context |
| UserIntelligencePanel.tsx | src/components/admin/UserIntelligencePanel.tsx:291 | Legacy reference | CheckCircle2 | Rendered | CheckCircle2 | Context review | Normal | Pending | Confirm semantics in context |
| UserIntelligencePanel.tsx | src/components/admin/UserIntelligencePanel.tsx:295 | Legacy reference | CheckCircle2 | Rendered | CheckCircle2 | Context review | Normal | Pending | Confirm semantics in context |
| UserIntelligencePanel.tsx | src/components/admin/UserIntelligencePanel.tsx:316 | Legacy reference | Globe | Rendered | Globe | Context review | Normal | Pending | Confirm semantics in context |
| UserIntelligencePanel.tsx | src/components/admin/UserIntelligencePanel.tsx:386 | Legacy reference | Globe | Rendered | Globe | Context review | Normal | Pending | Confirm semantics in context |
| UserIntelligencePanel.tsx | src/components/admin/UserIntelligencePanel.tsx:422 | Legacy reference | Info | Rendered | Info | Context review | Normal | Pending | Confirm semantics in context |
| UserIntelligencePanel.tsx | src/components/admin/UserIntelligencePanel.tsx:433 | Legacy reference | MapPin | Rendered | MapPin | Context review | Normal | Pending | Confirm semantics in context |
| UserIntelligencePanel.tsx | src/components/admin/UserIntelligencePanel.tsx:468 | Legacy reference | Lock | Rendered | Lock | Context review | Normal | Pending | Confirm semantics in context |
| UserIntelligencePanel.tsx | src/components/admin/UserIntelligencePanel.tsx:489 | Legacy reference | ShieldCheck | Rendered | ShieldCheck | Context review | Normal | Pending | Confirm semantics in context |
| UserIntelligencePanel.tsx | src/components/admin/UserIntelligencePanel.tsx:501 | Legacy reference | ShieldAlert | Rendered | ShieldAlert | State | Normal | Pending | Confirm semantics in context |
| admin-navigation.ts | src/components/admin/admin-navigation.ts:1 | Legacy import | lucide-react | Source reference | — | Context review | High | Evidence | Import declaration |
| admin-navigation.ts | src/components/admin/admin-navigation.ts:42 | Legacy reference | LayoutDashboard | Source reference | LayoutDashboard | Context review | High | Pending | Confirm semantics in context |
| admin-navigation.ts | src/components/admin/admin-navigation.ts:43 | Legacy reference | LayoutDashboard | Source reference | LayoutDashboard | Context review | High | Pending | Confirm semantics in context |
| admin-navigation.ts | src/components/admin/admin-navigation.ts:44 | Legacy reference | Activity | Source reference | Activity | Context review | High | Pending | Confirm semantics in context |
| admin-navigation.ts | src/components/admin/admin-navigation.ts:45 | Legacy reference | Bell | Source reference | Bell | Context review | High | Pending | Confirm semantics in context |
| admin-navigation.ts | src/components/admin/admin-navigation.ts:46 | Legacy reference | Send | Source reference | Send | Context review | High | Pending | Confirm semantics in context |
| admin-navigation.ts | src/components/admin/admin-navigation.ts:47 | Legacy reference | Search | Source reference | Search | Context review | High | Pending | Confirm semantics in context |
| admin-navigation.ts | src/components/admin/admin-navigation.ts:48 | Legacy reference | ListChecks | Source reference | ListChecks | Context review | High | Pending | Confirm semantics in context |
| admin-navigation.ts | src/components/admin/admin-navigation.ts:54 | Legacy reference | ShoppingBag | Source reference | ShoppingBag | Context review | High | Pending | Confirm semantics in context |
| admin-navigation.ts | src/components/admin/admin-navigation.ts:55 | Legacy reference | Layers | Source reference | Layers | Context review | High | Pending | Confirm semantics in context |
| admin-navigation.ts | src/components/admin/admin-navigation.ts:56 | Legacy reference | Boxes | Source reference | Boxes | Context review | High | Pending | Confirm semantics in context |
| admin-navigation.ts | src/components/admin/admin-navigation.ts:57 | Legacy reference | Tag | Source reference | Tag | Context review | High | Pending | Confirm semantics in context |
| admin-navigation.ts | src/components/admin/admin-navigation.ts:58 | Legacy reference | Calculator | Source reference | Calculator | Context review | High | Pending | Confirm semantics in context |
| admin-navigation.ts | src/components/admin/admin-navigation.ts:59 | Legacy reference | RotateCcw | Source reference | RotateCcw | Context review | High | Pending | Confirm semantics in context |
| admin-navigation.ts | src/components/admin/admin-navigation.ts:60 | Legacy reference | Undo2 | Source reference | Undo2 | Context review | High | Pending | Confirm semantics in context |
| admin-navigation.ts | src/components/admin/admin-navigation.ts:61 | Legacy reference | Truck | Source reference | Truck | Context review | High | Pending | Confirm semantics in context |
| admin-navigation.ts | src/components/admin/admin-navigation.ts:62 | Legacy reference | BarChart3 | Source reference | BarChart3 | Context review | High | Pending | Confirm semantics in context |
| admin-navigation.ts | src/components/admin/admin-navigation.ts:68 | Legacy reference | Package | Source reference | Package | Context review | High | Pending | Confirm semantics in context |
| admin-navigation.ts | src/components/admin/admin-navigation.ts:69 | Legacy reference | ClipboardCheck | Source reference | ClipboardCheck | Context review | High | Pending | Confirm semantics in context |
| admin-navigation.ts | src/components/admin/admin-navigation.ts:70 | Legacy reference | ShieldCheck | Source reference | ShieldCheck | Context review | High | Pending | Confirm semantics in context |
| admin-navigation.ts | src/components/admin/admin-navigation.ts:71 | Legacy reference | Tag | Source reference | Tag | Context review | High | Pending | Confirm semantics in context |
| admin-navigation.ts | src/components/admin/admin-navigation.ts:72 | Legacy reference | FolderTree | Source reference | FolderTree | Context review | High | Pending | Confirm semantics in context |
| admin-navigation.ts | src/components/admin/admin-navigation.ts:78 | Legacy reference | Users | Source reference | Users | Context review | High | Pending | Confirm semantics in context |
| admin-navigation.ts | src/components/admin/admin-navigation.ts:79 | Legacy reference | UserRound | Source reference | UserRound | Context review | High | Pending | Confirm semantics in context |
| admin-navigation.ts | src/components/admin/admin-navigation.ts:80 | Legacy reference | CalendarClock | Source reference | CalendarClock | Context review | High | Pending | Confirm semantics in context |
| admin-navigation.ts | src/components/admin/admin-navigation.ts:81 | Legacy reference | Wallet | Source reference | Wallet | Context review | High | Pending | Confirm semantics in context |
| admin-navigation.ts | src/components/admin/admin-navigation.ts:82 | Legacy reference | Share2 | Source reference | Share2 | Context review | High | Pending | Confirm semantics in context |
| admin-navigation.ts | src/components/admin/admin-navigation.ts:83 | Legacy reference | LifeBuoy | Source reference | LifeBuoy | Context review | High | Pending | Confirm semantics in context |
| admin-navigation.ts | src/components/admin/admin-navigation.ts:89 | Legacy reference | LayoutDashboard | Source reference | LayoutDashboard | Context review | High | Pending | Confirm semantics in context |
| admin-navigation.ts | src/components/admin/admin-navigation.ts:90 | Legacy reference | Send | Source reference | Send | Context review | High | Pending | Confirm semantics in context |
| admin-navigation.ts | src/components/admin/admin-navigation.ts:91 | Legacy reference | Radio | Source reference | Radio | Context review | High | Pending | Confirm semantics in context |
| admin-navigation.ts | src/components/admin/admin-navigation.ts:92 | Legacy reference | FileCode | Source reference | FileCode | Context review | High | Pending | Confirm semantics in context |
| admin-navigation.ts | src/components/admin/admin-navigation.ts:93 | Legacy reference | UserCheck | Source reference | UserCheck | Context review | High | Pending | Confirm semantics in context |
| admin-navigation.ts | src/components/admin/admin-navigation.ts:94 | Legacy reference | Layers | Source reference | Layers | Context review | High | Pending | Confirm semantics in context |
| admin-navigation.ts | src/components/admin/admin-navigation.ts:95 | Legacy reference | CalendarClock | Source reference | CalendarClock | Context review | High | Pending | Confirm semantics in context |
| admin-navigation.ts | src/components/admin/admin-navigation.ts:96 | Legacy reference | ShieldBan | Source reference | ShieldBan | Context review | High | Pending | Confirm semantics in context |
| admin-navigation.ts | src/components/admin/admin-navigation.ts:97 | Legacy reference | Inbox | Source reference | Inbox | Context review | High | Pending | Confirm semantics in context |
| admin-navigation.ts | src/components/admin/admin-navigation.ts:98 | Legacy reference | Sliders | Source reference | Sliders | Context review | High | Pending | Confirm semantics in context |
| admin-navigation.ts | src/components/admin/admin-navigation.ts:104 | Legacy reference | FileText | Source reference | FileText | Context review | High | Pending | Confirm semantics in context |
| admin-navigation.ts | src/components/admin/admin-navigation.ts:105 | Legacy reference | ShieldCheck | Source reference | ShieldCheck | Context review | High | Pending | Confirm semantics in context |
| admin-navigation.ts | src/components/admin/admin-navigation.ts:111 | Legacy reference | TrendingUp | Source reference | TrendingUp | Context review | High | Pending | Confirm semantics in context |
| admin-navigation.ts | src/components/admin/admin-navigation.ts:112 | Legacy reference | Wallet | Source reference | Wallet | Context review | High | Pending | Confirm semantics in context |
| admin-navigation.ts | src/components/admin/admin-navigation.ts:113 | Legacy reference | ListChecks | Source reference | ListChecks | Context review | High | Pending | Confirm semantics in context |
| admin-navigation.ts | src/components/admin/admin-navigation.ts:119 | Legacy reference | Settings | Source reference | Settings | Context review | High | Pending | Confirm semantics in context |
| admin-navigation.ts | src/components/admin/admin-navigation.ts:120 | Legacy reference | Sliders | Source reference | Sliders | Context review | High | Pending | Confirm semantics in context |
| admin-navigation.ts | src/components/admin/admin-navigation.ts:121 | Legacy reference | Settings | Source reference | Settings | Context review | High | Pending | Confirm semantics in context |
| admin-navigation.ts | src/components/admin/admin-navigation.ts:122 | Legacy reference | Package | Source reference | Package | Context review | High | Pending | Confirm semantics in context |
| admin-navigation.ts | src/components/admin/admin-navigation.ts:123 | Legacy reference | Bell | Source reference | Bell | Context review | High | Pending | Confirm semantics in context |
| admin-navigation.ts | src/components/admin/admin-navigation.ts:124 | Legacy reference | Activity | Source reference | Activity | Context review | High | Pending | Confirm semantics in context |
| admin-navigation.ts | src/components/admin/admin-navigation.ts:125 | Legacy reference | Activity | Source reference | Activity | Context review | High | Pending | Confirm semantics in context |
| admin-navigation.ts | src/components/admin/admin-navigation.ts:126 | Legacy reference | ShieldCheck | Source reference | ShieldCheck | Context review | High | Pending | Confirm semantics in context |
| admin-navigation.ts | src/components/admin/admin-navigation.ts:127 | Legacy reference | ShieldCheck | Source reference | ShieldCheck | Context review | High | Pending | Confirm semantics in context |
| BlogListClient.tsx | src/components/blog/BlogListClient.tsx:5 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| BlogListClient.tsx | src/components/blog/BlogListClient.tsx:17 | Legacy reference | BookOpen | Rendered | BookOpen | Context review | Normal | Pending | Confirm semantics in context |
| BlogListClient.tsx | src/components/blog/BlogListClient.tsx:56 | Legacy reference | Clock | Rendered | Clock | Context review | Normal | Pending | Confirm semantics in context |
| BlogListClient.tsx | src/components/blog/BlogListClient.tsx:74 | Legacy reference | ChevronRight | Rendered | ChevronRight | Context review | Normal | Pending | Confirm semantics in context |
| CartPageClient.tsx | src/components/cart/CartPageClient.tsx:6 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| CartPageClient.tsx | src/components/cart/CartPageClient.tsx:73 | Emoji candidate | 🛒 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| CartPageClient.tsx | src/components/cart/CartPageClient.tsx:214 | Legacy reference | ArrowLeft | Rendered | ArrowLeft | Context review | Normal | Pending | Confirm semantics in context |
| CartPageClient.tsx | src/components/cart/CartPageClient.tsx:239 | Legacy reference | Trash2 | Rendered | Trash2 | Context review | Normal | Pending | Confirm semantics in context |
| CartPageClient.tsx | src/components/cart/CartPageClient.tsx:258 | Legacy reference | Zap | Rendered | Zap | Context review | Normal | Pending | Confirm semantics in context |
| CartPageClient.tsx | src/components/cart/CartPageClient.tsx:304 | Legacy reference | AlertCircle | Rendered | AlertCircle | State | Normal | Pending | Confirm semantics in context |
| CartPageClient.tsx | src/components/cart/CartPageClient.tsx:321 | Legacy reference | Minus | Rendered | Minus | Context review | Normal | Pending | Confirm semantics in context |
| CartPageClient.tsx | src/components/cart/CartPageClient.tsx:332 | Legacy reference | Plus | Rendered | Plus | Context review | Normal | Pending | Confirm semantics in context |
| CartPageClient.tsx | src/components/cart/CartPageClient.tsx:350 | Legacy reference | Trash2 | Rendered | Trash2 | Context review | Normal | Pending | Confirm semantics in context |
| CartPageClient.tsx | src/components/cart/CartPageClient.tsx:362 | Legacy reference | ArrowLeft | Rendered | ArrowLeft | Context review | Normal | Pending | Confirm semantics in context |
| CartPageClient.tsx | src/components/cart/CartPageClient.tsx:375 | Legacy reference | Percent | Rendered | Percent | Context review | Normal | Pending | Confirm semantics in context |
| CartPageClient.tsx | src/components/cart/CartPageClient.tsx:401 | Legacy reference | Tag | Rendered | Tag | Context review | Normal | Pending | Confirm semantics in context |
| CartPageClient.tsx | src/components/cart/CartPageClient.tsx:458 | Legacy reference | Tag | Rendered | Tag | Context review | Normal | Pending | Confirm semantics in context |
| CartPageClient.tsx | src/components/cart/CartPageClient.tsx:493 | Legacy reference | CheckCircle2 | Rendered | CheckCircle2 | Context review | Normal | Pending | Confirm semantics in context |
| CartPageClient.tsx | src/components/cart/CartPageClient.tsx:533 | Legacy reference | Tag | Rendered | Tag | Context review | Normal | Pending | Confirm semantics in context |
| CartPageClient.tsx | src/components/cart/CartPageClient.tsx:563 | Legacy reference | AlertCircle | Rendered | AlertCircle | State | Normal | Pending | Confirm semantics in context |
| CartPageClient.tsx | src/components/cart/CartPageClient.tsx:585 | Legacy reference | ArrowRight | Rendered | ArrowRight | Context review | Normal | Pending | Confirm semantics in context |
| CartPageClient.tsx | src/components/cart/CartPageClient.tsx:592 | Legacy reference | ShieldCheck | Rendered | ShieldCheck | Context review | Normal | Pending | Confirm semantics in context |
| CartPageClient.tsx | src/components/cart/CartPageClient.tsx:596 | Legacy reference | Clock | Rendered | Clock | Context review | Normal | Pending | Confirm semantics in context |
| CartPageClient.tsx | src/components/cart/CartPageClient.tsx:600 | Legacy reference | Zap | Rendered | Zap | Context review | Normal | Pending | Confirm semantics in context |
| CartPageClient.tsx | src/components/cart/CartPageClient.tsx:614 | Legacy reference | ShoppingBag | Rendered | ShoppingBag | Context review | Normal | Pending | Confirm semantics in context |
| CartPageClient.tsx | src/components/cart/CartPageClient.tsx:631 | Legacy reference | Sparkles | Rendered | Sparkles | Context review | Normal | Pending | Confirm semantics in context |
| CheckoutPageClient.tsx | src/components/checkout/CheckoutPageClient.tsx:6 | Legacy import | lucide-react | Source reference | — | Context review | High | Evidence | Import declaration |
| CheckoutPageClient.tsx | src/components/checkout/CheckoutPageClient.tsx:615 | Legacy reference | ArrowLeft | Rendered | ArrowLeft | Context review | High | Pending | Confirm semantics in context |
| CheckoutPageClient.tsx | src/components/checkout/CheckoutPageClient.tsx:628 | Legacy reference | ShieldCheck | Rendered | ShieldCheck | Context review | High | Pending | Confirm semantics in context |
| CheckoutPageClient.tsx | src/components/checkout/CheckoutPageClient.tsx:637 | Legacy reference | Sparkles | Rendered | Sparkles | Context review | High | Pending | Confirm semantics in context |
| CheckoutPageClient.tsx | src/components/checkout/CheckoutPageClient.tsx:718 | Legacy reference | AlertCircle | Rendered | AlertCircle | State | High | Pending | Confirm semantics in context |
| CheckoutPageClient.tsx | src/components/checkout/CheckoutPageClient.tsx:744 | Legacy reference | AlertCircle | Rendered | AlertCircle | State | High | Pending | Confirm semantics in context |
| CheckoutPageClient.tsx | src/components/checkout/CheckoutPageClient.tsx:776 | Legacy reference | AlertCircle | Rendered | AlertCircle | State | High | Pending | Confirm semantics in context |
| CheckoutPageClient.tsx | src/components/checkout/CheckoutPageClient.tsx:817 | Legacy reference | Mail | Rendered | Mail | Context review | High | Pending | Confirm semantics in context |
| CheckoutPageClient.tsx | src/components/checkout/CheckoutPageClient.tsx:849 | Legacy reference | Smartphone | Rendered | Smartphone | Context review | High | Pending | Confirm semantics in context |
| CheckoutPageClient.tsx | src/components/checkout/CheckoutPageClient.tsx:881 | Legacy reference | MessageCircle | Rendered | MessageCircle | Context review | High | Pending | Confirm semantics in context |
| CheckoutPageClient.tsx | src/components/checkout/CheckoutPageClient.tsx:923 | Legacy reference | AlertCircle | Rendered | AlertCircle | State | High | Pending | Confirm semantics in context |
| CheckoutPageClient.tsx | src/components/checkout/CheckoutPageClient.tsx:952 | Legacy reference | AlertCircle | Rendered | AlertCircle | State | High | Pending | Confirm semantics in context |
| CheckoutPageClient.tsx | src/components/checkout/CheckoutPageClient.tsx:992 | Legacy reference | AlertCircle | Rendered | AlertCircle | State | High | Pending | Confirm semantics in context |
| CheckoutPageClient.tsx | src/components/checkout/CheckoutPageClient.tsx:1066 | Legacy reference | AlertCircle | Rendered | AlertCircle | State | High | Pending | Confirm semantics in context |
| CheckoutPageClient.tsx | src/components/checkout/CheckoutPageClient.tsx:1076 | Legacy reference | PlusCircle | Rendered | PlusCircle | Context review | High | Pending | Confirm semantics in context |
| CheckoutPageClient.tsx | src/components/checkout/CheckoutPageClient.tsx:1098 | Legacy reference | Zap | Rendered | Zap | Context review | High | Pending | Confirm semantics in context |
| CheckoutPageClient.tsx | src/components/checkout/CheckoutPageClient.tsx:1190 | Emoji candidate | ⚠️ | Source reference | Review purpose | Context review | High | Review | May be application copy or shared data |
| CheckoutPageClient.tsx | src/components/checkout/CheckoutPageClient.tsx:1210 | Legacy reference | Tag | Rendered | Tag | Context review | High | Pending | Confirm semantics in context |
| CheckoutPageClient.tsx | src/components/checkout/CheckoutPageClient.tsx:1255 | Legacy reference | Tag | Rendered | Tag | Context review | High | Pending | Confirm semantics in context |
| CheckoutPageClient.tsx | src/components/checkout/CheckoutPageClient.tsx:1278 | Legacy reference | AlertCircle | Rendered | AlertCircle | State | High | Pending | Confirm semantics in context |
| CheckoutPageClient.tsx | src/components/checkout/CheckoutPageClient.tsx:1299 | Legacy reference | Wallet | Rendered | Wallet | Context review | High | Pending | Confirm semantics in context |
| CheckoutPageClient.tsx | src/components/checkout/CheckoutPageClient.tsx:1304 | Legacy reference | Zap | Rendered | Zap | Context review | High | Pending | Confirm semantics in context |
| CheckoutPageClient.tsx | src/components/checkout/CheckoutPageClient.tsx:1312 | Legacy reference | Lock | Rendered | Lock | Context review | High | Pending | Confirm semantics in context |
| CheckoutPageClient.tsx | src/components/checkout/CheckoutPageClient.tsx:1342 | Legacy reference | CheckCircle2 | Rendered | CheckCircle2 | Context review | High | Pending | Confirm semantics in context |
| CheckoutPageClient.tsx | src/components/checkout/CheckoutPageClient.tsx:1357 | Legacy reference | Gift | Rendered | Gift | Context review | High | Pending | Confirm semantics in context |
| CheckoutPageClient.tsx | src/components/checkout/CheckoutPageClient.tsx:1358 | Emoji candidate | 🎁 | Source reference | Review purpose | Context review | High | Review | May be application copy or shared data |
| CheckoutPageClient.tsx | src/components/checkout/CheckoutPageClient.tsx:1391 | Legacy reference | Copy | Rendered | Copy | Context review | High | Pending | Confirm semantics in context |
| CheckoutPageClient.tsx | src/components/checkout/CheckoutPageClient.tsx:1399 | Emoji candidate | 🎁 | Source reference | Review purpose | Context review | High | Review | May be application copy or shared data |
| CheckoutPageClient.tsx | src/components/checkout/CheckoutPageClient.tsx:1401 | Emoji candidate | ✨ | Source reference | Review purpose | Context review | High | Review | May be application copy or shared data |
| CheckoutPageClient.tsx | src/components/checkout/CheckoutPageClient.tsx:1407 | Legacy reference | MessageCircle | Rendered | MessageCircle | Context review | High | Pending | Confirm semantics in context |
| DigitalGiftingSection.tsx | src/components/checkout/DigitalGiftingSection.tsx:4 | Legacy import | lucide-react | Source reference | — | Context review | High | Evidence | Import declaration |
| DigitalGiftingSection.tsx | src/components/checkout/DigitalGiftingSection.tsx:57 | Legacy reference | Gift | Rendered | Gift | Context review | High | Pending | Confirm semantics in context |
| DigitalGiftingSection.tsx | src/components/checkout/DigitalGiftingSection.tsx:69 | Emoji candidate | 🎁 | Source reference | Review purpose | Context review | High | Review | May be application copy or shared data |
| DigitalGiftingSection.tsx | src/components/checkout/DigitalGiftingSection.tsx:113 | Legacy reference | User | Rendered | User | Context review | High | Pending | Confirm semantics in context |
| DigitalGiftingSection.tsx | src/components/checkout/DigitalGiftingSection.tsx:129 | Legacy reference | Mail | Rendered | Mail | Context review | High | Pending | Confirm semantics in context |
| DigitalGiftingSection.tsx | src/components/checkout/DigitalGiftingSection.tsx:144 | Legacy reference | Phone | Rendered | Phone | Context review | High | Pending | Confirm semantics in context |
| DigitalGiftingSection.tsx | src/components/checkout/DigitalGiftingSection.tsx:161 | Legacy reference | Sparkles | Rendered | Sparkles | Context review | High | Pending | Confirm semantics in context |
| DigitalGiftingSection.tsx | src/components/checkout/DigitalGiftingSection.tsx:183 | Legacy reference | Check | Rendered | Check | Context review | High | Pending | Confirm semantics in context |
| DigitalGiftingSection.tsx | src/components/checkout/DigitalGiftingSection.tsx:202 | Legacy reference | Heart | Rendered | Heart | Context review | High | Pending | Confirm semantics in context |
| DigitalGiftingSection.tsx | src/components/checkout/DigitalGiftingSection.tsx:238 | Legacy reference | EyeOff | Rendered | EyeOff | Context review | High | Pending | Confirm semantics in context |
| QuickCheckoutModal.tsx | src/components/checkout/QuickCheckoutModal.tsx:6 | Legacy import | lucide-react | Source reference | — | Context review | High | Evidence | Import declaration |
| QuickCheckoutModal.tsx | src/components/checkout/QuickCheckoutModal.tsx:423 | Legacy reference | Zap | Rendered | Zap | Context review | High | Pending | Confirm semantics in context |
| QuickCheckoutModal.tsx | src/components/checkout/QuickCheckoutModal.tsx:440 | Legacy reference | X | Rendered | X | Context review | High | Pending | Confirm semantics in context |
| QuickCheckoutModal.tsx | src/components/checkout/QuickCheckoutModal.tsx:450 | Legacy reference | CheckCircle2 | Rendered | CheckCircle2 | Context review | High | Pending | Confirm semantics in context |
| QuickCheckoutModal.tsx | src/components/checkout/QuickCheckoutModal.tsx:465 | Legacy reference | Gift | Rendered | Gift | Context review | High | Pending | Confirm semantics in context |
| QuickCheckoutModal.tsx | src/components/checkout/QuickCheckoutModal.tsx:466 | Emoji candidate | 🎁 | Source reference | Review purpose | Context review | High | Review | May be application copy or shared data |
| QuickCheckoutModal.tsx | src/components/checkout/QuickCheckoutModal.tsx:487 | Legacy reference | Copy | Rendered | Copy | Context review | High | Pending | Confirm semantics in context |
| QuickCheckoutModal.tsx | src/components/checkout/QuickCheckoutModal.tsx:493 | Emoji candidate | 🎁 | Source reference | Review purpose | Context review | High | Review | May be application copy or shared data |
| QuickCheckoutModal.tsx | src/components/checkout/QuickCheckoutModal.tsx:498 | Legacy reference | MessageCircle | Rendered | MessageCircle | Context review | High | Pending | Confirm semantics in context |
| QuickCheckoutModal.tsx | src/components/checkout/QuickCheckoutModal.tsx:611 | Legacy reference | Minus | Rendered | Minus | Context review | High | Pending | Confirm semantics in context |
| QuickCheckoutModal.tsx | src/components/checkout/QuickCheckoutModal.tsx:622 | Legacy reference | Plus | Rendered | Plus | Context review | High | Pending | Confirm semantics in context |
| QuickCheckoutModal.tsx | src/components/checkout/QuickCheckoutModal.tsx:697 | Legacy reference | Mail | Rendered | Mail | Context review | High | Pending | Confirm semantics in context |
| QuickCheckoutModal.tsx | src/components/checkout/QuickCheckoutModal.tsx:712 | Legacy reference | MessageCircle | Rendered | MessageCircle | Context review | High | Pending | Confirm semantics in context |
| QuickCheckoutModal.tsx | src/components/checkout/QuickCheckoutModal.tsx:809 | Legacy reference | Wallet | Rendered | Wallet | Context review | High | Pending | Confirm semantics in context |
| QuickCheckoutModal.tsx | src/components/checkout/QuickCheckoutModal.tsx:822 | Legacy reference | Tag | Rendered | Tag | Context review | High | Pending | Confirm semantics in context |
| QuickCheckoutModal.tsx | src/components/checkout/QuickCheckoutModal.tsx:828 | Legacy reference | Tag | Rendered | Tag | Context review | High | Pending | Confirm semantics in context |
| QuickCheckoutModal.tsx | src/components/checkout/QuickCheckoutModal.tsx:893 | Emoji candidate | ❌ | Source reference | Review purpose | Context review | High | Review | May be application copy or shared data |
| QuickCheckoutModal.tsx | src/components/checkout/QuickCheckoutModal.tsx:896 | Legacy reference | Zap | Rendered | Zap | Context review | High | Pending | Confirm semantics in context |
| QuickCheckoutModal.tsx | src/components/checkout/QuickCheckoutModal.tsx:899 | Emoji candidate | ⚡ | Source reference | Review purpose | Context review | High | Review | May be application copy or shared data |
| QuickCheckoutModal.tsx | src/components/checkout/QuickCheckoutModal.tsx:900 | Emoji candidate | ⚡ | Source reference | Review purpose | Context review | High | Review | May be application copy or shared data |
| QuickCheckoutModal.tsx | src/components/checkout/QuickCheckoutModal.tsx:907 | Legacy reference | Lock | Rendered | Lock | Context review | High | Pending | Confirm semantics in context |
| AdaptiveImage.tsx | src/components/common/AdaptiveImage.tsx:16 | Image reference | /images/placeholders/aihaat-placeholder.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| AdaptiveImage.tsx | src/components/common/AdaptiveImage.tsx:19 | Image reference | /images/products/chatgpt.png | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| AdaptiveImage.tsx | src/components/common/AdaptiveImage.tsx:19 | Image reference | /images/products/chatgpt.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| AdaptiveImage.tsx | src/components/common/AdaptiveImage.tsx:20 | Image reference | /images/products/chatgpt-plus.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| AdaptiveImage.tsx | src/components/common/AdaptiveImage.tsx:22 | Image reference | /images/test.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| ComparisonView.tsx | src/components/compare/ComparisonView.tsx:5 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| ComparisonView.tsx | src/components/compare/ComparisonView.tsx:191 | Legacy reference | Scale | Rendered | Scale | Context review | Normal | Pending | Confirm semantics in context |
| ComparisonView.tsx | src/components/compare/ComparisonView.tsx:206 | Emoji candidate | ✍️ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| ComparisonView.tsx | src/components/compare/ComparisonView.tsx:207 | Emoji candidate | 🎨 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| ComparisonView.tsx | src/components/compare/ComparisonView.tsx:208 | Emoji candidate | 💻 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| ComparisonView.tsx | src/components/compare/ComparisonView.tsx:238 | Legacy reference | Star | Rendered | Star | Context review | Normal | Pending | Confirm semantics in context |
| ComparisonView.tsx | src/components/compare/ComparisonView.tsx:276 | Legacy reference | Check | Rendered | Check | Context review | Normal | Pending | Confirm semantics in context |
| ComparisonView.tsx | src/components/compare/ComparisonView.tsx:278 | Legacy reference | X | Rendered | X | Context review | Normal | Pending | Confirm semantics in context |
| ComparisonView.tsx | src/components/compare/ComparisonView.tsx:284 | Legacy reference | Check | Rendered | Check | Context review | Normal | Pending | Confirm semantics in context |
| ComparisonView.tsx | src/components/compare/ComparisonView.tsx:286 | Legacy reference | X | Rendered | X | Context review | Normal | Pending | Confirm semantics in context |
| ComparisonView.tsx | src/components/compare/ComparisonView.tsx:292 | Legacy reference | Check | Rendered | Check | Context review | Normal | Pending | Confirm semantics in context |
| ComparisonView.tsx | src/components/compare/ComparisonView.tsx:294 | Legacy reference | X | Rendered | X | Context review | Normal | Pending | Confirm semantics in context |
| ComparisonView.tsx | src/components/compare/ComparisonView.tsx:300 | Legacy reference | Check | Rendered | Check | Context review | Normal | Pending | Confirm semantics in context |
| ComparisonView.tsx | src/components/compare/ComparisonView.tsx:302 | Legacy reference | X | Rendered | X | Context review | Normal | Pending | Confirm semantics in context |
| ComparisonView.tsx | src/components/compare/ComparisonView.tsx:320 | Image reference | /logo.png | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| ComparisonView.tsx | src/components/compare/ComparisonView.tsx:340 | Legacy reference | Zap | Rendered | Zap | Context review | Normal | Pending | Confirm semantics in context |
| ComparisonView.tsx | src/components/compare/ComparisonView.tsx:351 | Legacy reference | ArrowRight | Rendered | ArrowRight | Context review | Normal | Pending | Confirm semantics in context |
| ComparisonView.tsx | src/components/compare/ComparisonView.tsx:362 | Legacy reference | ShieldCheck | Rendered | ShieldCheck | Context review | Normal | Pending | Confirm semantics in context |
| ComparisonView.tsx | src/components/compare/ComparisonView.tsx:376 | Legacy reference | ArrowRight | Rendered | ArrowRight | Context review | Normal | Pending | Confirm semantics in context |
| FlashSaleBanner.tsx | src/components/cro/FlashSaleBanner.tsx:4 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| FlashSaleBanner.tsx | src/components/cro/FlashSaleBanner.tsx:62 | Legacy reference | Flame | Rendered | Flame | Context review | Normal | Pending | Confirm semantics in context |
| FlashSaleBanner.tsx | src/components/cro/FlashSaleBanner.tsx:89 | Emoji candidate | 🔥 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| FloatingOfferBar.tsx | src/components/cro/FloatingOfferBar.tsx:5 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| FloatingOfferBar.tsx | src/components/cro/FloatingOfferBar.tsx:89 | Legacy reference | Sparkles | Rendered | Sparkles | Context review | Normal | Pending | Confirm semantics in context |
| FloatingOfferBar.tsx | src/components/cro/FloatingOfferBar.tsx:113 | Legacy reference | Tag | Rendered | Tag | Context review | Normal | Pending | Confirm semantics in context |
| FloatingOfferBar.tsx | src/components/cro/FloatingOfferBar.tsx:117 | Legacy reference | Check | Rendered | Check | Context review | Normal | Pending | Confirm semantics in context |
| FloatingOfferBar.tsx | src/components/cro/FloatingOfferBar.tsx:122 | Legacy reference | Copy | Rendered | Copy | Context review | Normal | Pending | Confirm semantics in context |
| FloatingOfferBar.tsx | src/components/cro/FloatingOfferBar.tsx:132 | Legacy reference | Check | Rendered | Check | Context review | Normal | Pending | Confirm semantics in context |
| FloatingOfferBar.tsx | src/components/cro/FloatingOfferBar.tsx:143 | Legacy reference | X | Rendered | X | Context review | Normal | Pending | Confirm semantics in context |
| FloatingWhatsAppWidget.tsx | src/components/cro/FloatingWhatsAppWidget.tsx:6 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| FloatingWhatsAppWidget.tsx | src/components/cro/FloatingWhatsAppWidget.tsx:19 | Emoji candidate | ⚡ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| FloatingWhatsAppWidget.tsx | src/components/cro/FloatingWhatsAppWidget.tsx:20 | Emoji candidate | ⚡ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| FloatingWhatsAppWidget.tsx | src/components/cro/FloatingWhatsAppWidget.tsx:24 | Emoji candidate | 🔑 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| FloatingWhatsAppWidget.tsx | src/components/cro/FloatingWhatsAppWidget.tsx:25 | Emoji candidate | 🔑 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| FloatingWhatsAppWidget.tsx | src/components/cro/FloatingWhatsAppWidget.tsx:29 | Emoji candidate | 💳 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| FloatingWhatsAppWidget.tsx | src/components/cro/FloatingWhatsAppWidget.tsx:30 | Emoji candidate | 💳 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| FloatingWhatsAppWidget.tsx | src/components/cro/FloatingWhatsAppWidget.tsx:34 | Emoji candidate | 🛡️ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| FloatingWhatsAppWidget.tsx | src/components/cro/FloatingWhatsAppWidget.tsx:35 | Emoji candidate | 🛡️ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| FloatingWhatsAppWidget.tsx | src/components/cro/FloatingWhatsAppWidget.tsx:117 | Legacy reference | MessageCircle | Rendered | MessageCircle | Context review | Normal | Pending | Confirm semantics in context |
| FloatingWhatsAppWidget.tsx | src/components/cro/FloatingWhatsAppWidget.tsx:132 | Legacy reference | ShieldCheck | Rendered | ShieldCheck | Context review | Normal | Pending | Confirm semantics in context |
| FloatingWhatsAppWidget.tsx | src/components/cro/FloatingWhatsAppWidget.tsx:147 | Legacy reference | X | Rendered | X | Context review | Normal | Pending | Confirm semantics in context |
| FloatingWhatsAppWidget.tsx | src/components/cro/FloatingWhatsAppWidget.tsx:157 | Legacy reference | Sparkles | Rendered | Sparkles | Context review | Normal | Pending | Confirm semantics in context |
| FloatingWhatsAppWidget.tsx | src/components/cro/FloatingWhatsAppWidget.tsx:167 | Legacy reference | CheckCheck | Rendered | CheckCheck | Context review | Normal | Pending | Confirm semantics in context |
| FloatingWhatsAppWidget.tsx | src/components/cro/FloatingWhatsAppWidget.tsx:185 | Legacy reference | Send | Rendered | Send | Context review | Normal | Pending | Confirm semantics in context |
| FloatingWhatsAppWidget.tsx | src/components/cro/FloatingWhatsAppWidget.tsx:207 | Legacy reference | Send | Rendered | Send | Context review | Normal | Pending | Confirm semantics in context |
| FloatingWhatsAppWidget.tsx | src/components/cro/FloatingWhatsAppWidget.tsx:214 | Legacy reference | Zap | Rendered | Zap | Context review | Normal | Pending | Confirm semantics in context |
| FloatingWhatsAppWidget.tsx | src/components/cro/FloatingWhatsAppWidget.tsx:253 | Legacy reference | X | Rendered | X | Context review | Normal | Pending | Confirm semantics in context |
| FloatingWhatsAppWidget.tsx | src/components/cro/FloatingWhatsAppWidget.tsx:256 | Legacy reference | MessageCircle | Rendered | MessageCircle | Context review | Normal | Pending | Confirm semantics in context |
| FrequentlyBoughtTogether.tsx | src/components/cro/FrequentlyBoughtTogether.tsx:4 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| FrequentlyBoughtTogether.tsx | src/components/cro/FrequentlyBoughtTogether.tsx:33 | Image reference | /images/products/canva-pro.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| FrequentlyBoughtTogether.tsx | src/components/cro/FrequentlyBoughtTogether.tsx:42 | Image reference | /images/products/nordvpn.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| FrequentlyBoughtTogether.tsx | src/components/cro/FrequentlyBoughtTogether.tsx:51 | Image reference | /images/products/chatgpt.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| FrequentlyBoughtTogether.tsx | src/components/cro/FrequentlyBoughtTogether.tsx:60 | Image reference | /images/products/windows-11.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| FrequentlyBoughtTogether.tsx | src/components/cro/FrequentlyBoughtTogether.tsx:69 | Image reference | /images/products/microsoft-365.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| FrequentlyBoughtTogether.tsx | src/components/cro/FrequentlyBoughtTogether.tsx:148 | Emoji candidate | 🎉 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| FrequentlyBoughtTogether.tsx | src/components/cro/FrequentlyBoughtTogether.tsx:161 | Legacy reference | Sparkles | Rendered | Sparkles | Context review | Normal | Pending | Confirm semantics in context |
| FrequentlyBoughtTogether.tsx | src/components/cro/FrequentlyBoughtTogether.tsx:184 | Image reference | /images/placeholder.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| FrequentlyBoughtTogether.tsx | src/components/cro/FrequentlyBoughtTogether.tsx:197 | Legacy reference | Check | Rendered | Check | Context review | Normal | Pending | Confirm semantics in context |
| FrequentlyBoughtTogether.tsx | src/components/cro/FrequentlyBoughtTogether.tsx:203 | Legacy reference | Plus | Rendered | Plus | Context review | Normal | Pending | Confirm semantics in context |
| FrequentlyBoughtTogether.tsx | src/components/cro/FrequentlyBoughtTogether.tsx:262 | Legacy reference | ShoppingBag | Rendered | ShoppingBag | Context review | Normal | Pending | Confirm semantics in context |
| RecentPurchasePopup.tsx | src/components/cro/RecentPurchasePopup.tsx:6 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| RecentPurchasePopup.tsx | src/components/cro/RecentPurchasePopup.tsx:34 | Image reference | /images/products/chatgpt-plus.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| RecentPurchasePopup.tsx | src/components/cro/RecentPurchasePopup.tsx:47 | Image reference | /images/products/windows-11.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| RecentPurchasePopup.tsx | src/components/cro/RecentPurchasePopup.tsx:60 | Image reference | /images/products/canva-pro.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| RecentPurchasePopup.tsx | src/components/cro/RecentPurchasePopup.tsx:73 | Image reference | /images/products/capcut-pro.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| RecentPurchasePopup.tsx | src/components/cro/RecentPurchasePopup.tsx:86 | Image reference | /images/products/gemini-advanced.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| RecentPurchasePopup.tsx | src/components/cro/RecentPurchasePopup.tsx:99 | Image reference | /images/products/nordvpn.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| RecentPurchasePopup.tsx | src/components/cro/RecentPurchasePopup.tsx:112 | Image reference | /images/products/chatgpt-plus.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| RecentPurchasePopup.tsx | src/components/cro/RecentPurchasePopup.tsx:125 | Image reference | /images/products/microsoft-365.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| RecentPurchasePopup.tsx | src/components/cro/RecentPurchasePopup.tsx:138 | Image reference | /images/products/telegram-premium.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| RecentPurchasePopup.tsx | src/components/cro/RecentPurchasePopup.tsx:151 | Image reference | /images/products/youtube-premium.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| RecentPurchasePopup.tsx | src/components/cro/RecentPurchasePopup.tsx:164 | Image reference | /images/products/cursor.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| RecentPurchasePopup.tsx | src/components/cro/RecentPurchasePopup.tsx:177 | Image reference | /images/products/netflix.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| RecentPurchasePopup.tsx | src/components/cro/RecentPurchasePopup.tsx:190 | Image reference | /images/products/canva-pro.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| RecentPurchasePopup.tsx | src/components/cro/RecentPurchasePopup.tsx:203 | Image reference | /images/products/discord-nitro.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| RecentPurchasePopup.tsx | src/components/cro/RecentPurchasePopup.tsx:216 | Image reference | /images/products/google-one.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| RecentPurchasePopup.tsx | src/components/cro/RecentPurchasePopup.tsx:229 | Image reference | /images/products/elevenlabs.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| RecentPurchasePopup.tsx | src/components/cro/RecentPurchasePopup.tsx:399 | Legacy reference | ShieldCheck | Rendered | ShieldCheck | Context review | Normal | Pending | Confirm semantics in context |
| RecentPurchasePopup.tsx | src/components/cro/RecentPurchasePopup.tsx:423 | Legacy reference | X | Rendered | X | Context review | Normal | Pending | Confirm semantics in context |
| TieredPricingTable.tsx | src/components/cro/TieredPricingTable.tsx:4 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| TieredPricingTable.tsx | src/components/cro/TieredPricingTable.tsx:36 | Legacy reference | Users | Rendered | Users | Context review | Normal | Pending | Confirm semantics in context |
| DashboardLayoutClient.tsx | src/components/dashboard/DashboardLayoutClient.tsx:6 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| DashboardLayoutClient.tsx | src/components/dashboard/DashboardLayoutClient.tsx:90 | Legacy reference | LayoutDashboard | Source reference | LayoutDashboard | Context review | Normal | Pending | Confirm semantics in context |
| DashboardLayoutClient.tsx | src/components/dashboard/DashboardLayoutClient.tsx:96 | Legacy reference | ShoppingBag | Source reference | ShoppingBag | Context review | Normal | Pending | Confirm semantics in context |
| DashboardLayoutClient.tsx | src/components/dashboard/DashboardLayoutClient.tsx:102 | Legacy reference | KeyRound | Source reference | KeyRound | Context review | Normal | Pending | Confirm semantics in context |
| DashboardLayoutClient.tsx | src/components/dashboard/DashboardLayoutClient.tsx:108 | Legacy reference | Wallet | Source reference | Wallet | Context review | Normal | Pending | Confirm semantics in context |
| DashboardLayoutClient.tsx | src/components/dashboard/DashboardLayoutClient.tsx:114 | Legacy reference | MoreHorizontal | Source reference | MoreHorizontal | Context review | Normal | Pending | Confirm semantics in context |
| DashboardLayoutClient.tsx | src/components/dashboard/DashboardLayoutClient.tsx:120 | Legacy reference | RotateCcw | Source reference | RotateCcw | Context review | Normal | Pending | Confirm semantics in context |
| DashboardLayoutClient.tsx | src/components/dashboard/DashboardLayoutClient.tsx:121 | Legacy reference | Banknote | Source reference | Banknote | Context review | Normal | Pending | Confirm semantics in context |
| DashboardLayoutClient.tsx | src/components/dashboard/DashboardLayoutClient.tsx:122 | Legacy reference | Bell | Source reference | Bell | Context review | Normal | Pending | Confirm semantics in context |
| DashboardLayoutClient.tsx | src/components/dashboard/DashboardLayoutClient.tsx:123 | Legacy reference | ShieldCheck | Source reference | ShieldCheck | Context review | Normal | Pending | Confirm semantics in context |
| DashboardLayoutClient.tsx | src/components/dashboard/DashboardLayoutClient.tsx:124 | Legacy reference | Settings | Source reference | Settings | Context review | Normal | Pending | Confirm semantics in context |
| DashboardLayoutClient.tsx | src/components/dashboard/DashboardLayoutClient.tsx:125 | Legacy reference | Heart | Source reference | Heart | Context review | Normal | Pending | Confirm semantics in context |
| DashboardLayoutClient.tsx | src/components/dashboard/DashboardLayoutClient.tsx:126 | Legacy reference | Gift | Source reference | Gift | Context review | Normal | Pending | Confirm semantics in context |
| DashboardLayoutClient.tsx | src/components/dashboard/DashboardLayoutClient.tsx:127 | Legacy reference | Mail | Source reference | Mail | Context review | Normal | Pending | Confirm semantics in context |
| DashboardLayoutClient.tsx | src/components/dashboard/DashboardLayoutClient.tsx:128 | Legacy reference | LifeBuoy | Source reference | LifeBuoy | Context review | Normal | Pending | Confirm semantics in context |
| DashboardLayoutClient.tsx | src/components/dashboard/DashboardLayoutClient.tsx:129 | Legacy reference | Share2 | Source reference | Share2 | Context review | Normal | Pending | Confirm semantics in context |
| DashboardLayoutClient.tsx | src/components/dashboard/DashboardLayoutClient.tsx:134 | Legacy reference | LayoutDashboard | Source reference | LayoutDashboard | Context review | Normal | Pending | Confirm semantics in context |
| DashboardLayoutClient.tsx | src/components/dashboard/DashboardLayoutClient.tsx:135 | Legacy reference | ShoppingBag | Source reference | ShoppingBag | Context review | Normal | Pending | Confirm semantics in context |
| DashboardLayoutClient.tsx | src/components/dashboard/DashboardLayoutClient.tsx:136 | Legacy reference | KeyRound | Source reference | KeyRound | Context review | Normal | Pending | Confirm semantics in context |
| DashboardLayoutClient.tsx | src/components/dashboard/DashboardLayoutClient.tsx:137 | Legacy reference | RotateCcw | Source reference | RotateCcw | Context review | Normal | Pending | Confirm semantics in context |
| DashboardLayoutClient.tsx | src/components/dashboard/DashboardLayoutClient.tsx:138 | Legacy reference | Banknote | Source reference | Banknote | Context review | Normal | Pending | Confirm semantics in context |
| DashboardLayoutClient.tsx | src/components/dashboard/DashboardLayoutClient.tsx:139 | Legacy reference | Wallet | Source reference | Wallet | Context review | Normal | Pending | Confirm semantics in context |
| DashboardLayoutClient.tsx | src/components/dashboard/DashboardLayoutClient.tsx:140 | Legacy reference | Bell | Source reference | Bell | Context review | Normal | Pending | Confirm semantics in context |
| DashboardLayoutClient.tsx | src/components/dashboard/DashboardLayoutClient.tsx:141 | Legacy reference | ShieldCheck | Source reference | ShieldCheck | Context review | Normal | Pending | Confirm semantics in context |
| DashboardLayoutClient.tsx | src/components/dashboard/DashboardLayoutClient.tsx:142 | Legacy reference | Settings | Source reference | Settings | Context review | Normal | Pending | Confirm semantics in context |
| DashboardLayoutClient.tsx | src/components/dashboard/DashboardLayoutClient.tsx:143 | Legacy reference | Heart | Source reference | Heart | Context review | Normal | Pending | Confirm semantics in context |
| DashboardLayoutClient.tsx | src/components/dashboard/DashboardLayoutClient.tsx:144 | Legacy reference | Gift | Source reference | Gift | Context review | Normal | Pending | Confirm semantics in context |
| DashboardLayoutClient.tsx | src/components/dashboard/DashboardLayoutClient.tsx:145 | Legacy reference | Mail | Source reference | Mail | Context review | Normal | Pending | Confirm semantics in context |
| DashboardLayoutClient.tsx | src/components/dashboard/DashboardLayoutClient.tsx:146 | Legacy reference | LifeBuoy | Source reference | LifeBuoy | Context review | Normal | Pending | Confirm semantics in context |
| DashboardLayoutClient.tsx | src/components/dashboard/DashboardLayoutClient.tsx:147 | Legacy reference | Share2 | Source reference | Share2 | Context review | Normal | Pending | Confirm semantics in context |
| DashboardLayoutClient.tsx | src/components/dashboard/DashboardLayoutClient.tsx:178 | Legacy reference | Lock | Rendered | Lock | Context review | Normal | Pending | Confirm semantics in context |
| DashboardLayoutClient.tsx | src/components/dashboard/DashboardLayoutClient.tsx:196 | Legacy reference | LogIn | Rendered | LogIn | Context review | Normal | Pending | Confirm semantics in context |
| DashboardLayoutClient.tsx | src/components/dashboard/DashboardLayoutClient.tsx:205 | Legacy reference | UserPlus | Rendered | UserPlus | Context review | Normal | Pending | Confirm semantics in context |
| DashboardLayoutClient.tsx | src/components/dashboard/DashboardLayoutClient.tsx:216 | Legacy reference | ArrowRight | Rendered | ArrowRight | Context review | Normal | Pending | Confirm semantics in context |
| DashboardLayoutClient.tsx | src/components/dashboard/DashboardLayoutClient.tsx:264 | Legacy reference | ShieldCheck | Rendered | ShieldCheck | Context review | Normal | Pending | Confirm semantics in context |
| DashboardLayoutClient.tsx | src/components/dashboard/DashboardLayoutClient.tsx:267 | Legacy reference | ChevronRight | Rendered | ChevronRight | Context review | Normal | Pending | Confirm semantics in context |
| DashboardLayoutClient.tsx | src/components/dashboard/DashboardLayoutClient.tsx:275 | Legacy reference | Globe | Rendered | Globe | Context review | Normal | Pending | Confirm semantics in context |
| DashboardLayoutClient.tsx | src/components/dashboard/DashboardLayoutClient.tsx:339 | Icon component | Icon | Rendered | Trace source | Context review | Normal | Review | May refer to an inventory entry elsewhere |
| DashboardLayoutClient.tsx | src/components/dashboard/DashboardLayoutClient.tsx:342 | Legacy reference | ChevronRight | Rendered | ChevronRight | Context review | Normal | Pending | Confirm semantics in context |
| DashboardLayoutClient.tsx | src/components/dashboard/DashboardLayoutClient.tsx:354 | Legacy reference | ShieldCheck | Rendered | ShieldCheck | Context review | Normal | Pending | Confirm semantics in context |
| DashboardLayoutClient.tsx | src/components/dashboard/DashboardLayoutClient.tsx:357 | Legacy reference | ExternalLink | Rendered | ExternalLink | Context review | Normal | Pending | Confirm semantics in context |
| DashboardLayoutClient.tsx | src/components/dashboard/DashboardLayoutClient.tsx:365 | Legacy reference | ShoppingBag | Rendered | ShoppingBag | Context review | Normal | Pending | Confirm semantics in context |
| DashboardLayoutClient.tsx | src/components/dashboard/DashboardLayoutClient.tsx:374 | Legacy reference | LogOut | Rendered | LogOut | Context review | Normal | Review brand | Confirm semantics in context |
| DashboardLayoutClient.tsx | src/components/dashboard/DashboardLayoutClient.tsx:427 | Icon component | Icon | Rendered | Trace source | Context review | Normal | Review | May refer to an inventory entry elsewhere |
| DashboardLayoutClient.tsx | src/components/dashboard/DashboardLayoutClient.tsx:471 | Legacy reference | X | Rendered | X | Context review | Normal | Pending | Confirm semantics in context |
| DashboardLayoutClient.tsx | src/components/dashboard/DashboardLayoutClient.tsx:491 | Icon component | Icon | Rendered | Trace source | Context review | Normal | Review | May refer to an inventory entry elsewhere |
| DashboardLayoutClient.tsx | src/components/dashboard/DashboardLayoutClient.tsx:503 | Legacy reference | Globe | Rendered | Globe | Context review | Normal | Pending | Confirm semantics in context |
| DashboardLayoutClient.tsx | src/components/dashboard/DashboardLayoutClient.tsx:534 | Legacy reference | ShieldCheck | Rendered | ShieldCheck | Context review | Normal | Pending | Confirm semantics in context |
| DashboardLayoutClient.tsx | src/components/dashboard/DashboardLayoutClient.tsx:544 | Legacy reference | ShoppingBag | Rendered | ShoppingBag | Context review | Normal | Pending | Confirm semantics in context |
| DashboardLayoutClient.tsx | src/components/dashboard/DashboardLayoutClient.tsx:553 | Legacy reference | LogOut | Rendered | LogOut | Context review | Normal | Review brand | Confirm semantics in context |
| ReferralHubClient.tsx | src/components/dashboard/ReferralHubClient.tsx:4 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| ReferralHubClient.tsx | src/components/dashboard/ReferralHubClient.tsx:145 | Emoji candidate | 🎉 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| ReferralHubClient.tsx | src/components/dashboard/ReferralHubClient.tsx:165 | Emoji candidate | 🔥 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| ReferralHubClient.tsx | src/components/dashboard/ReferralHubClient.tsx:165 | Emoji candidate | 🎁 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| ReferralHubClient.tsx | src/components/dashboard/ReferralHubClient.tsx:165 | Emoji candidate | ✨ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| ReferralHubClient.tsx | src/components/dashboard/ReferralHubClient.tsx:174 | Legacy reference | Gift | Rendered | Gift | Context review | Normal | Pending | Confirm semantics in context |
| ReferralHubClient.tsx | src/components/dashboard/ReferralHubClient.tsx:216 | Legacy reference | Sparkles | Rendered | Sparkles | Context review | Normal | Pending | Confirm semantics in context |
| ReferralHubClient.tsx | src/components/dashboard/ReferralHubClient.tsx:254 | Legacy reference | Check | Rendered | Check | Context review | Normal | Pending | Confirm semantics in context |
| ReferralHubClient.tsx | src/components/dashboard/ReferralHubClient.tsx:254 | Legacy reference | Copy | Rendered | Copy | Context review | Normal | Pending | Confirm semantics in context |
| ReferralHubClient.tsx | src/components/dashboard/ReferralHubClient.tsx:266 | Legacy reference | Users | Rendered | Users | Context review | Normal | Pending | Confirm semantics in context |
| ReferralHubClient.tsx | src/components/dashboard/ReferralHubClient.tsx:279 | Legacy reference | TrendingUp | Rendered | TrendingUp | Context review | Normal | Pending | Confirm semantics in context |
| ReferralHubClient.tsx | src/components/dashboard/ReferralHubClient.tsx:292 | Legacy reference | Wallet | Rendered | Wallet | Context review | Normal | Pending | Confirm semantics in context |
| ReferralHubClient.tsx | src/components/dashboard/ReferralHubClient.tsx:305 | Legacy reference | Coins | Rendered | Coins | Context review | Normal | Pending | Confirm semantics in context |
| ReferralHubClient.tsx | src/components/dashboard/ReferralHubClient.tsx:321 | Legacy reference | Share2 | Rendered | Share2 | Context review | Normal | Pending | Confirm semantics in context |
| ReferralHubClient.tsx | src/components/dashboard/ReferralHubClient.tsx:341 | Legacy reference | Check | Rendered | Check | Context review | Normal | Pending | Confirm semantics in context |
| ReferralHubClient.tsx | src/components/dashboard/ReferralHubClient.tsx:341 | Legacy reference | Copy | Rendered | Copy | Context review | Normal | Pending | Confirm semantics in context |
| ReferralHubClient.tsx | src/components/dashboard/ReferralHubClient.tsx:384 | Legacy reference | Award | Rendered | Award | Context review | Normal | Pending | Confirm semantics in context |
| ReferralHubClient.tsx | src/components/dashboard/ReferralHubClient.tsx:426 | Emoji candidate | ✅ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| ReferralHubClient.tsx | src/components/dashboard/ReferralHubClient.tsx:426 | Emoji candidate | ✅ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| ReferralHubClient.tsx | src/components/dashboard/ReferralHubClient.tsx:428 | Emoji candidate | 🔥 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| ReferralHubClient.tsx | src/components/dashboard/ReferralHubClient.tsx:428 | Emoji candidate | 🔥 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| ReferralHubClient.tsx | src/components/dashboard/ReferralHubClient.tsx:429 | Emoji candidate | 🔒 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| ReferralHubClient.tsx | src/components/dashboard/ReferralHubClient.tsx:429 | Emoji candidate | 🔒 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| ReferralHubClient.tsx | src/components/dashboard/ReferralHubClient.tsx:469 | Legacy reference | Sparkles | Rendered | Sparkles | Context review | Normal | Pending | Confirm semantics in context |
| ReferralHubClient.tsx | src/components/dashboard/ReferralHubClient.tsx:493 | Legacy reference | Clock | Rendered | Clock | Context review | Normal | Pending | Confirm semantics in context |
| ReferralHubClient.tsx | src/components/dashboard/ReferralHubClient.tsx:503 | Legacy reference | Users | Rendered | Users | Context review | Normal | Pending | Confirm semantics in context |
| ReferralHubClient.tsx | src/components/dashboard/ReferralHubClient.tsx:531 | Legacy reference | Info | Rendered | Info | Context review | Normal | Pending | Confirm semantics in context |
| RewardsClubView.tsx | src/components/dashboard/RewardsClubView.tsx:4 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| RewardsClubView.tsx | src/components/dashboard/RewardsClubView.tsx:58 | Emoji candidate | 🎉 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| RewardsClubView.tsx | src/components/dashboard/RewardsClubView.tsx:95 | Legacy reference | Sparkles | Rendered | Sparkles | Context review | Normal | Pending | Confirm semantics in context |
| RewardsClubView.tsx | src/components/dashboard/RewardsClubView.tsx:109 | Emoji candidate | 💡 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| RewardsClubView.tsx | src/components/dashboard/RewardsClubView.tsx:123 | Emoji candidate | 🎉 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| RewardsClubView.tsx | src/components/dashboard/RewardsClubView.tsx:138 | Legacy reference | Check | Rendered | Check | Context review | Normal | Pending | Confirm semantics in context |
| RewardsClubView.tsx | src/components/dashboard/RewardsClubView.tsx:138 | Legacy reference | Copy | Rendered | Copy | Context review | Normal | Pending | Confirm semantics in context |
| RewardsClubView.tsx | src/components/dashboard/RewardsClubView.tsx:197 | Legacy reference | Gift | Rendered | Gift | Context review | Normal | Pending | Confirm semantics in context |
| RewardsClubView.tsx | src/components/dashboard/RewardsClubView.tsx:224 | Legacy reference | Clock | Rendered | Clock | Context review | Normal | Pending | Confirm semantics in context |
| Hero.tsx | src/components/home/Hero.tsx:5 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| Hero.tsx | src/components/home/Hero.tsx:57 | Legacy reference | ArrowRight | Rendered | ArrowRight | Context review | Normal | Pending | Confirm semantics in context |
| Hero.tsx | src/components/home/Hero.tsx:71 | Legacy reference | Zap | Rendered | Zap | Context review | Normal | Pending | Confirm semantics in context |
| Hero.tsx | src/components/home/Hero.tsx:75 | Legacy reference | Shield | Rendered | Shield | Context review | Normal | Pending | Confirm semantics in context |
| Hero.tsx | src/components/home/Hero.tsx:79 | Legacy reference | Headphones | Rendered | Headphones | Context review | Normal | Pending | Confirm semantics in context |
| HowToOrder.tsx | src/components/home/HowToOrder.tsx:4 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| HowToOrder.tsx | src/components/home/HowToOrder.tsx:13 | Legacy reference | MousePointerClick | Source reference | MousePointerClick | Context review | Normal | Pending | Confirm semantics in context |
| HowToOrder.tsx | src/components/home/HowToOrder.tsx:19 | Legacy reference | CreditCard | Source reference | CreditCard | Context review | Normal | Pending | Confirm semantics in context |
| HowToOrder.tsx | src/components/home/HowToOrder.tsx:25 | Legacy reference | Send | Source reference | Send | Context review | Normal | Pending | Confirm semantics in context |
| HowToOrder.tsx | src/components/home/HowToOrder.tsx:36 | Legacy reference | CheckCircle2 | Rendered | CheckCircle2 | Context review | Normal | Pending | Confirm semantics in context |
| HowToOrder.tsx | src/components/home/HowToOrder.tsx:63 | Icon component | Icon | Rendered | Trace source | Context review | Normal | Review | May refer to an inventory entry elsewhere |
| HowToOrder.tsx | src/components/home/HowToOrder.tsx:82 | Legacy reference | CheckCircle2 | Rendered | CheckCircle2 | Context review | Normal | Pending | Confirm semantics in context |
| Partners.tsx | src/components/home/Partners.tsx:5 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| Partners.tsx | src/components/home/Partners.tsx:15 | Legacy reference | ShieldCheck | Rendered | ShieldCheck | Context review | Normal | Pending | Confirm semantics in context |
| ProductSection.tsx | src/components/home/ProductSection.tsx:7 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| ProductSection.tsx | src/components/home/ProductSection.tsx:76 | Legacy reference | ChevronRight | Rendered | ChevronRight | Context review | Normal | Pending | Confirm semantics in context |
| LegalDocumentPage.tsx | src/components/legal/LegalDocumentPage.tsx:2 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| LegalDocumentPage.tsx | src/components/legal/LegalDocumentPage.tsx:8 | Legacy reference | ArrowLeft | Rendered | ArrowLeft | Context review | Normal | Pending | Confirm semantics in context |
| LegalDocumentPage.tsx | src/components/legal/LegalDocumentPage.tsx:10 | Legacy reference | FileText | Rendered | FileText | Context review | Normal | Pending | Confirm semantics in context |
| LegalDocumentPage.tsx | src/components/legal/LegalDocumentPage.tsx:15 | Legacy reference | ShieldCheck | Rendered | ShieldCheck | Context review | Normal | Pending | Confirm semantics in context |
| OrderTrackingClient.tsx | src/components/order-tracking/OrderTrackingClient.tsx:6 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| OrderTrackingClient.tsx | src/components/order-tracking/OrderTrackingClient.tsx:210 | Legacy reference | Package | Source reference | Package | Context review | Normal | Pending | Confirm semantics in context |
| OrderTrackingClient.tsx | src/components/order-tracking/OrderTrackingClient.tsx:219 | Legacy reference | CheckCircle2 | Source reference | CheckCircle2 | Context review | Normal | Pending | Confirm semantics in context |
| OrderTrackingClient.tsx | src/components/order-tracking/OrderTrackingClient.tsx:228 | Legacy reference | Sparkles | Source reference | Sparkles | Context review | Normal | Pending | Confirm semantics in context |
| OrderTrackingClient.tsx | src/components/order-tracking/OrderTrackingClient.tsx:237 | Legacy reference | Truck | Source reference | Truck | Context review | Normal | Pending | Confirm semantics in context |
| OrderTrackingClient.tsx | src/components/order-tracking/OrderTrackingClient.tsx:248 | Legacy reference | Truck | Rendered | Truck | Context review | Normal | Pending | Confirm semantics in context |
| OrderTrackingClient.tsx | src/components/order-tracking/OrderTrackingClient.tsx:266 | Legacy reference | Search | Rendered | Search | Context review | Normal | Pending | Confirm semantics in context |
| OrderTrackingClient.tsx | src/components/order-tracking/OrderTrackingClient.tsx:295 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| OrderTrackingClient.tsx | src/components/order-tracking/OrderTrackingClient.tsx:300 | Legacy reference | Search | Rendered | Search | Context review | Normal | Pending | Confirm semantics in context |
| OrderTrackingClient.tsx | src/components/order-tracking/OrderTrackingClient.tsx:330 | Legacy reference | Package | Rendered | Package | Context review | Normal | Pending | Confirm semantics in context |
| OrderTrackingClient.tsx | src/components/order-tracking/OrderTrackingClient.tsx:405 | Legacy reference | Check | Rendered | Check | Context review | Normal | Pending | Confirm semantics in context |
| OrderTrackingClient.tsx | src/components/order-tracking/OrderTrackingClient.tsx:407 | Legacy reference | Copy | Rendered | Copy | Context review | Normal | Pending | Confirm semantics in context |
| OrderTrackingClient.tsx | src/components/order-tracking/OrderTrackingClient.tsx:426 | Legacy reference | CreditCard | Rendered | CreditCard | Context review | Normal | Pending | Confirm semantics in context |
| OrderTrackingClient.tsx | src/components/order-tracking/OrderTrackingClient.tsx:439 | Legacy reference | XCircle | Rendered | XCircle | Context review | Normal | Pending | Confirm semantics in context |
| OrderTrackingClient.tsx | src/components/order-tracking/OrderTrackingClient.tsx:441 | Legacy reference | CheckCircle2 | Rendered | CheckCircle2 | Context review | Normal | Pending | Confirm semantics in context |
| OrderTrackingClient.tsx | src/components/order-tracking/OrderTrackingClient.tsx:443 | Legacy reference | Clock | Rendered | Clock | Context review | Normal | Pending | Confirm semantics in context |
| OrderTrackingClient.tsx | src/components/order-tracking/OrderTrackingClient.tsx:455 | Legacy reference | Download | Rendered | Download | Context review | Normal | Pending | Confirm semantics in context |
| OrderTrackingClient.tsx | src/components/order-tracking/OrderTrackingClient.tsx:466 | Legacy reference | Gift | Rendered | Gift | Context review | Normal | Pending | Confirm semantics in context |
| OrderTrackingClient.tsx | src/components/order-tracking/OrderTrackingClient.tsx:510 | Legacy reference | Copy | Rendered | Copy | Context review | Normal | Pending | Confirm semantics in context |
| OrderTrackingClient.tsx | src/components/order-tracking/OrderTrackingClient.tsx:515 | Emoji candidate | 🎁 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| OrderTrackingClient.tsx | src/components/order-tracking/OrderTrackingClient.tsx:523 | Legacy reference | MessageCircle | Rendered | MessageCircle | Context review | Normal | Pending | Confirm semantics in context |
| OrderTrackingClient.tsx | src/components/order-tracking/OrderTrackingClient.tsx:531 | Legacy reference | ExternalLink | Rendered | ExternalLink | Context review | Normal | Pending | Confirm semantics in context |
| OrderTrackingClient.tsx | src/components/order-tracking/OrderTrackingClient.tsx:541 | Legacy reference | AlertCircle | Rendered | AlertCircle | State | Normal | Pending | Confirm semantics in context |
| OrderTrackingClient.tsx | src/components/order-tracking/OrderTrackingClient.tsx:560 | Legacy reference | Clock | Rendered | Clock | Context review | Normal | Pending | Confirm semantics in context |
| OrderTrackingClient.tsx | src/components/order-tracking/OrderTrackingClient.tsx:565 | Emoji candidate | ✅ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| OrderTrackingClient.tsx | src/components/order-tracking/OrderTrackingClient.tsx:565 | Emoji candidate | ✅ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| OrderTrackingClient.tsx | src/components/order-tracking/OrderTrackingClient.tsx:566 | Emoji candidate | ⏱️ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| OrderTrackingClient.tsx | src/components/order-tracking/OrderTrackingClient.tsx:566 | Emoji candidate | ⏱️ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| OrderTrackingClient.tsx | src/components/order-tracking/OrderTrackingClient.tsx:614 | Icon component | Icon | Rendered | Trace source | Context review | Normal | Review | May refer to an inventory entry elsewhere |
| OrderTrackingClient.tsx | src/components/order-tracking/OrderTrackingClient.tsx:628 | Legacy reference | CheckCircle2 | Rendered | CheckCircle2 | Context review | Normal | Pending | Confirm semantics in context |
| OrderTrackingClient.tsx | src/components/order-tracking/OrderTrackingClient.tsx:647 | Legacy reference | Package | Rendered | Package | Context review | Normal | Pending | Confirm semantics in context |
| OrderTrackingClient.tsx | src/components/order-tracking/OrderTrackingClient.tsx:664 | Image reference | /images/placeholders/aihaat-placeholder.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| OrderTrackingClient.tsx | src/components/order-tracking/OrderTrackingClient.tsx:723 | Legacy reference | Clock | Rendered | Clock | Context review | Normal | Pending | Confirm semantics in context |
| OrderTrackingClient.tsx | src/components/order-tracking/OrderTrackingClient.tsx:754 | Legacy reference | Lock | Rendered | Lock | Context review | Normal | Pending | Confirm semantics in context |
| OrderTrackingClient.tsx | src/components/order-tracking/OrderTrackingClient.tsx:774 | Legacy reference | ShieldCheck | Rendered | ShieldCheck | Context review | Normal | Pending | Confirm semantics in context |
| OrderTrackingClient.tsx | src/components/order-tracking/OrderTrackingClient.tsx:776 | Legacy reference | ChevronRight | Rendered | ChevronRight | Context review | Normal | Pending | Confirm semantics in context |
| OrderTrackingClient.tsx | src/components/order-tracking/OrderTrackingClient.tsx:789 | Legacy reference | MessageCircle | Rendered | MessageCircle | Context review | Normal | Pending | Confirm semantics in context |
| OrderTrackingClient.tsx | src/components/order-tracking/OrderTrackingClient.tsx:809 | Legacy reference | MessageCircle | Rendered | MessageCircle | Context review | Normal | Pending | Confirm semantics in context |
| OrderTrackingClient.tsx | src/components/order-tracking/OrderTrackingClient.tsx:811 | Legacy reference | ExternalLink | Rendered | ExternalLink | Context review | Normal | Pending | Confirm semantics in context |
| OrderTrackingClient.tsx | src/components/order-tracking/OrderTrackingClient.tsx:822 | Legacy reference | AlertCircle | Rendered | AlertCircle | State | Normal | Pending | Confirm semantics in context |
| OrderTrackingClient.tsx | src/components/order-tracking/OrderTrackingClient.tsx:842 | Legacy reference | MessageCircle | Rendered | MessageCircle | Context review | Normal | Pending | Confirm semantics in context |
| OrderTrackingClient.tsx | src/components/order-tracking/OrderTrackingClient.tsx:866 | Legacy reference | Sparkles | Rendered | Sparkles | Context review | Normal | Pending | Confirm semantics in context |
| OrderTrackingClient.tsx | src/components/order-tracking/OrderTrackingClient.tsx:880 | Legacy reference | ShieldCheck | Rendered | ShieldCheck | Context review | Normal | Pending | Confirm semantics in context |
| OrderTrackingClient.tsx | src/components/order-tracking/OrderTrackingClient.tsx:894 | Legacy reference | MessageCircle | Rendered | MessageCircle | Context review | Normal | Pending | Confirm semantics in context |
| ProductRequestClient.tsx | src/components/product-request/ProductRequestClient.tsx:8 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| ProductRequestClient.tsx | src/components/product-request/ProductRequestClient.tsx:56 | Emoji candidate | 🤖 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| ProductRequestClient.tsx | src/components/product-request/ProductRequestClient.tsx:57 | Emoji candidate | 💻 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| ProductRequestClient.tsx | src/components/product-request/ProductRequestClient.tsx:58 | Emoji candidate | 🎨 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| ProductRequestClient.tsx | src/components/product-request/ProductRequestClient.tsx:59 | Emoji candidate | 🔑 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| ProductRequestClient.tsx | src/components/product-request/ProductRequestClient.tsx:60 | Emoji candidate | 🛡️ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| ProductRequestClient.tsx | src/components/product-request/ProductRequestClient.tsx:61 | Emoji candidate | ☁️ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| ProductRequestClient.tsx | src/components/product-request/ProductRequestClient.tsx:62 | Emoji candidate | 🎬 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| ProductRequestClient.tsx | src/components/product-request/ProductRequestClient.tsx:63 | Emoji candidate | ✨ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| ProductRequestClient.tsx | src/components/product-request/ProductRequestClient.tsx:92 | Legacy reference | Clock | Source reference | Clock | Context review | Normal | Pending | Confirm semantics in context |
| ProductRequestClient.tsx | src/components/product-request/ProductRequestClient.tsx:101 | Legacy reference | Zap | Source reference | Zap | Context review | Normal | Pending | Confirm semantics in context |
| ProductRequestClient.tsx | src/components/product-request/ProductRequestClient.tsx:110 | Legacy reference | AlertTriangle | Source reference | AlertTriangle | State | Normal | Pending | Confirm semantics in context |
| ProductRequestClient.tsx | src/components/product-request/ProductRequestClient.tsx:293 | Emoji candidate | 🆔 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| ProductRequestClient.tsx | src/components/product-request/ProductRequestClient.tsx:294 | Emoji candidate | 📦 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| ProductRequestClient.tsx | src/components/product-request/ProductRequestClient.tsx:295 | Emoji candidate | 🏷️ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| ProductRequestClient.tsx | src/components/product-request/ProductRequestClient.tsx:296 | Emoji candidate | ⏳ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| ProductRequestClient.tsx | src/components/product-request/ProductRequestClient.tsx:297 | Emoji candidate | 💰 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| ProductRequestClient.tsx | src/components/product-request/ProductRequestClient.tsx:298 | Emoji candidate | ⚡ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| ProductRequestClient.tsx | src/components/product-request/ProductRequestClient.tsx:313 | Legacy reference | Sparkles | Rendered | Sparkles | Context review | Normal | Pending | Confirm semantics in context |
| ProductRequestClient.tsx | src/components/product-request/ProductRequestClient.tsx:361 | Legacy reference | Clock | Rendered | Clock | Context review | Normal | Pending | Confirm semantics in context |
| ProductRequestClient.tsx | src/components/product-request/ProductRequestClient.tsx:371 | Legacy reference | DollarSign | Rendered | DollarSign | Context review | Normal | Pending | Confirm semantics in context |
| ProductRequestClient.tsx | src/components/product-request/ProductRequestClient.tsx:381 | Legacy reference | ShieldCheck | Rendered | ShieldCheck | Context review | Normal | Pending | Confirm semantics in context |
| ProductRequestClient.tsx | src/components/product-request/ProductRequestClient.tsx:391 | Legacy reference | BadgeCheck | Rendered | BadgeCheck | Context review | Normal | Pending | Confirm semantics in context |
| ProductRequestClient.tsx | src/components/product-request/ProductRequestClient.tsx:404 | Legacy reference | CheckCircle2 | Rendered | CheckCircle2 | Context review | Normal | Pending | Confirm semantics in context |
| ProductRequestClient.tsx | src/components/product-request/ProductRequestClient.tsx:451 | Emoji candidate | 🔴 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| ProductRequestClient.tsx | src/components/product-request/ProductRequestClient.tsx:451 | Emoji candidate | 🟡 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| ProductRequestClient.tsx | src/components/product-request/ProductRequestClient.tsx:451 | Emoji candidate | 🟢 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| ProductRequestClient.tsx | src/components/product-request/ProductRequestClient.tsx:471 | Legacy reference | MessageCircle | Rendered | MessageCircle | Context review | Normal | Pending | Confirm semantics in context |
| ProductRequestClient.tsx | src/components/product-request/ProductRequestClient.tsx:480 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| ProductRequestClient.tsx | src/components/product-request/ProductRequestClient.tsx:491 | Legacy reference | ArrowRight | Rendered | ArrowRight | Context review | Normal | Pending | Confirm semantics in context |
| ProductRequestClient.tsx | src/components/product-request/ProductRequestClient.tsx:506 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| ProductRequestClient.tsx | src/components/product-request/ProductRequestClient.tsx:512 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| ProductRequestClient.tsx | src/components/product-request/ProductRequestClient.tsx:518 | Legacy reference | HelpCircle | Rendered | HelpCircle | Context review | Normal | Pending | Confirm semantics in context |
| ProductRequestClient.tsx | src/components/product-request/ProductRequestClient.tsx:559 | Emoji candidate | ✅ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| ProductRequestClient.tsx | src/components/product-request/ProductRequestClient.tsx:561 | Emoji candidate | 🔄 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| ProductRequestClient.tsx | src/components/product-request/ProductRequestClient.tsx:563 | Emoji candidate | ⏳ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| ProductRequestClient.tsx | src/components/product-request/ProductRequestClient.tsx:564 | Emoji candidate | ❌ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| ProductRequestClient.tsx | src/components/product-request/ProductRequestClient.tsx:614 | Legacy reference | MessageCircle | Rendered | MessageCircle | Context review | Normal | Pending | Confirm semantics in context |
| ProductRequestClient.tsx | src/components/product-request/ProductRequestClient.tsx:634 | Legacy reference | Zap | Rendered | Zap | Context review | Normal | Pending | Confirm semantics in context |
| ProductRequestClient.tsx | src/components/product-request/ProductRequestClient.tsx:683 | Legacy reference | AlertCircle | Rendered | AlertCircle | State | Normal | Pending | Confirm semantics in context |
| ProductRequestClient.tsx | src/components/product-request/ProductRequestClient.tsx:840 | Legacy reference | Phone | Rendered | Phone | Context review | Normal | Pending | Confirm semantics in context |
| ProductRequestClient.tsx | src/components/product-request/ProductRequestClient.tsx:879 | Legacy reference | AlertCircle | Rendered | AlertCircle | State | Normal | Pending | Confirm semantics in context |
| ProductRequestClient.tsx | src/components/product-request/ProductRequestClient.tsx:908 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| ProductRequestClient.tsx | src/components/product-request/ProductRequestClient.tsx:913 | Legacy reference | Send | Rendered | Send | Context review | Normal | Pending | Confirm semantics in context |
| ProductRequestClient.tsx | src/components/product-request/ProductRequestClient.tsx:928 | Legacy reference | Layers | Rendered | Layers | Context review | Normal | Pending | Confirm semantics in context |
| ProductRequestClient.tsx | src/components/product-request/ProductRequestClient.tsx:969 | Emoji candidate | 🔴 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| ProductRequestClient.tsx | src/components/product-request/ProductRequestClient.tsx:969 | Emoji candidate | 🟡 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| ProductRequestClient.tsx | src/components/product-request/ProductRequestClient.tsx:969 | Emoji candidate | 🟢 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| ProductRequestClient.tsx | src/components/product-request/ProductRequestClient.tsx:983 | Legacy reference | Phone | Rendered | Phone | Context review | Normal | Pending | Confirm semantics in context |
| ProductRequestClient.tsx | src/components/product-request/ProductRequestClient.tsx:993 | Legacy reference | ShieldCheck | Rendered | ShieldCheck | Context review | Normal | Pending | Confirm semantics in context |
| ProductRequestClient.tsx | src/components/product-request/ProductRequestClient.tsx:999 | Legacy reference | Check | Rendered | Check | Context review | Normal | Pending | Confirm semantics in context |
| ProductRequestClient.tsx | src/components/product-request/ProductRequestClient.tsx:1003 | Legacy reference | Check | Rendered | Check | Context review | Normal | Pending | Confirm semantics in context |
| ProductRequestClient.tsx | src/components/product-request/ProductRequestClient.tsx:1007 | Legacy reference | Check | Rendered | Check | Context review | Normal | Pending | Confirm semantics in context |
| ProductRequestClient.tsx | src/components/product-request/ProductRequestClient.tsx:1022 | Legacy reference | MessageCircle | Rendered | MessageCircle | Context review | Normal | Pending | Confirm semantics in context |
| ProductRequestClient.tsx | src/components/product-request/ProductRequestClient.tsx:1057 | Legacy reference | ChevronDown | Rendered | ChevronDown | Context review | Normal | Pending | Confirm semantics in context |
| ProductDetailClient.tsx | src/components/product/ProductDetailClient.tsx:8 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| ProductDetailClient.tsx | src/components/product/ProductDetailClient.tsx:238 | Image reference | /images/payments/bkash.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| ProductDetailClient.tsx | src/components/product/ProductDetailClient.tsx:239 | Image reference | /images/payments/nagad.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| ProductDetailClient.tsx | src/components/product/ProductDetailClient.tsx:240 | Image reference | /images/payments/rocket.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| ProductDetailClient.tsx | src/components/product/ProductDetailClient.tsx:241 | Image reference | /images/payments/visa.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| ProductDetailClient.tsx | src/components/product/ProductDetailClient.tsx:242 | Image reference | /images/payments/mastercard.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| ProductDetailClient.tsx | src/components/product/ProductDetailClient.tsx:243 | Image reference | /images/payments/sslcommerz.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| ProductDetailClient.tsx | src/components/product/ProductDetailClient.tsx:330 | Legacy reference | Sparkles | Rendered | Sparkles | Context review | Normal | Pending | Confirm semantics in context |
| ProductDetailClient.tsx | src/components/product/ProductDetailClient.tsx:339 | Legacy reference | Flame | Rendered | Flame | Context review | Normal | Pending | Confirm semantics in context |
| ProductDetailClient.tsx | src/components/product/ProductDetailClient.tsx:350 | Legacy reference | ShieldCheck | Rendered | ShieldCheck | Context review | Normal | Pending | Confirm semantics in context |
| ProductDetailClient.tsx | src/components/product/ProductDetailClient.tsx:355 | Legacy reference | BadgeCheck | Rendered | BadgeCheck | Context review | Normal | Pending | Confirm semantics in context |
| ProductDetailClient.tsx | src/components/product/ProductDetailClient.tsx:392 | Emoji candidate | 🔥 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| ProductDetailClient.tsx | src/components/product/ProductDetailClient.tsx:406 | Legacy reference | Star | Rendered | Star | Context review | Normal | Pending | Confirm semantics in context |
| ProductDetailClient.tsx | src/components/product/ProductDetailClient.tsx:459 | Emoji candidate | 🔥 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| ProductDetailClient.tsx | src/components/product/ProductDetailClient.tsx:467 | Legacy reference | Zap | Rendered | Zap | Context review | Normal | Pending | Confirm semantics in context |
| ProductDetailClient.tsx | src/components/product/ProductDetailClient.tsx:497 | Legacy reference | AlertCircle | Rendered | AlertCircle | State | Normal | Pending | Confirm semantics in context |
| ProductDetailClient.tsx | src/components/product/ProductDetailClient.tsx:502 | Emoji candidate | 🔥 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| ProductDetailClient.tsx | src/components/product/ProductDetailClient.tsx:506 | Legacy reference | CheckCircle | Rendered | CheckCircle | Context review | Normal | Pending | Confirm semantics in context |
| ProductDetailClient.tsx | src/components/product/ProductDetailClient.tsx:550 | Legacy reference | Check | Rendered | Check | Context review | Normal | Pending | Confirm semantics in context |
| ProductDetailClient.tsx | src/components/product/ProductDetailClient.tsx:599 | Legacy reference | Minus | Rendered | Minus | Context review | Normal | Pending | Confirm semantics in context |
| ProductDetailClient.tsx | src/components/product/ProductDetailClient.tsx:610 | Legacy reference | Plus | Rendered | Plus | Context review | Normal | Pending | Confirm semantics in context |
| ProductDetailClient.tsx | src/components/product/ProductDetailClient.tsx:621 | Legacy reference | Bell | Rendered | Bell | Context review | Normal | Pending | Confirm semantics in context |
| ProductDetailClient.tsx | src/components/product/ProductDetailClient.tsx:645 | Legacy reference | CheckCircle | Rendered | CheckCircle | Context review | Normal | Pending | Confirm semantics in context |
| ProductDetailClient.tsx | src/components/product/ProductDetailClient.tsx:684 | Legacy reference | Bell | Rendered | Bell | Context review | Normal | Pending | Confirm semantics in context |
| ProductDetailClient.tsx | src/components/product/ProductDetailClient.tsx:692 | Legacy reference | ShieldCheck | Rendered | ShieldCheck | Context review | Normal | Pending | Confirm semantics in context |
| ProductDetailClient.tsx | src/components/product/ProductDetailClient.tsx:713 | Legacy reference | Zap | Rendered | Zap | Context review | Normal | Pending | Confirm semantics in context |
| ProductDetailClient.tsx | src/components/product/ProductDetailClient.tsx:722 | Legacy reference | ShoppingBag | Rendered | ShoppingBag | Context review | Normal | Pending | Confirm semantics in context |
| ProductDetailClient.tsx | src/components/product/ProductDetailClient.tsx:737 | Legacy reference | CheckCircle | Rendered | CheckCircle | Context review | Normal | Pending | Confirm semantics in context |
| ProductDetailClient.tsx | src/components/product/ProductDetailClient.tsx:741 | Legacy reference | Zap | Rendered | Zap | Context review | Normal | Pending | Confirm semantics in context |
| ProductDetailClient.tsx | src/components/product/ProductDetailClient.tsx:745 | Legacy reference | ShieldCheck | Rendered | ShieldCheck | Context review | Normal | Pending | Confirm semantics in context |
| ProductDetailClient.tsx | src/components/product/ProductDetailClient.tsx:749 | Legacy reference | Headphones | Rendered | Headphones | Context review | Normal | Pending | Confirm semantics in context |
| ProductDetailClient.tsx | src/components/product/ProductDetailClient.tsx:762 | Legacy reference | MessageCircle | Rendered | MessageCircle | Context review | Normal | Pending | Confirm semantics in context |
| ProductDetailClient.tsx | src/components/product/ProductDetailClient.tsx:771 | Legacy reference | Share2 | Rendered | Share2 | Context review | Normal | Pending | Confirm semantics in context |
| ProductDetailClient.tsx | src/components/product/ProductDetailClient.tsx:779 | Legacy reference | Copy | Rendered | Copy | Context review | Normal | Pending | Confirm semantics in context |
| ProductDetailClient.tsx | src/components/product/ProductDetailClient.tsx:791 | Legacy reference | Lock | Rendered | Lock | Context review | Normal | Pending | Confirm semantics in context |
| ProductDetailClient.tsx | src/components/product/ProductDetailClient.tsx:875 | Legacy reference | CheckCircle | Rendered | CheckCircle | Context review | Normal | Pending | Confirm semantics in context |
| ProductDetailClient.tsx | src/components/product/ProductDetailClient.tsx:928 | Legacy reference | HelpCircle | Rendered | HelpCircle | Context review | Normal | Pending | Confirm semantics in context |
| ProductDetailClient.tsx | src/components/product/ProductDetailClient.tsx:932 | Legacy reference | ChevronUp | Rendered | ChevronUp | Context review | Normal | Pending | Confirm semantics in context |
| ProductDetailClient.tsx | src/components/product/ProductDetailClient.tsx:934 | Legacy reference | ChevronDown | Rendered | ChevronDown | Context review | Normal | Pending | Confirm semantics in context |
| ProductDetailClient.tsx | src/components/product/ProductDetailClient.tsx:969 | Legacy reference | ShieldCheck | Rendered | ShieldCheck | Context review | Normal | Pending | Confirm semantics in context |
| ProductDetailClient.tsx | src/components/product/ProductDetailClient.tsx:977 | Legacy reference | Zap | Rendered | Zap | Context review | Normal | Pending | Confirm semantics in context |
| ProductDetailClient.tsx | src/components/product/ProductDetailClient.tsx:985 | Legacy reference | Headphones | Rendered | Headphones | Context review | Normal | Pending | Confirm semantics in context |
| ProductDetailClient.tsx | src/components/product/ProductDetailClient.tsx:993 | Legacy reference | RotateCcw | Rendered | RotateCcw | Context review | Normal | Pending | Confirm semantics in context |
| ProductDetailClient.tsx | src/components/product/ProductDetailClient.tsx:1013 | Legacy reference | Star | Rendered | Star | Context review | Normal | Pending | Confirm semantics in context |
| ProductDetailClient.tsx | src/components/product/ProductDetailClient.tsx:1028 | Legacy reference | CheckCircle | Rendered | CheckCircle | Context review | Normal | Pending | Confirm semantics in context |
| ProductDetailClient.tsx | src/components/product/ProductDetailClient.tsx:1036 | Legacy reference | Star | Rendered | Star | Context review | Normal | Pending | Confirm semantics in context |
| ProductDetailClient.tsx | src/components/product/ProductDetailClient.tsx:1070 | Legacy reference | Star | Rendered | Star | Context review | Normal | Pending | Confirm semantics in context |
| ProductDetailClient.tsx | src/components/product/ProductDetailClient.tsx:1135 | Legacy reference | Bell | Rendered | Bell | Context review | Normal | Pending | Confirm semantics in context |
| ProofsClient.tsx | src/components/proofs/ProofsClient.tsx:5 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| ProofsClient.tsx | src/components/proofs/ProofsClient.tsx:354 | Emoji candidate | ⭐ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| ProofsClient.tsx | src/components/proofs/ProofsClient.tsx:354 | Emoji candidate | ⭐ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| ProofsClient.tsx | src/components/proofs/ProofsClient.tsx:354 | Emoji candidate | ⭐ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| ProofsClient.tsx | src/components/proofs/ProofsClient.tsx:354 | Emoji candidate | ⭐ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| ProofsClient.tsx | src/components/proofs/ProofsClient.tsx:354 | Emoji candidate | ⭐ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| ProofsClient.tsx | src/components/proofs/ProofsClient.tsx:356 | Emoji candidate | ⭐ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| ProofsClient.tsx | src/components/proofs/ProofsClient.tsx:356 | Emoji candidate | ⭐ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| ProofsClient.tsx | src/components/proofs/ProofsClient.tsx:356 | Emoji candidate | ⭐ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| ProofsClient.tsx | src/components/proofs/ProofsClient.tsx:356 | Emoji candidate | ⭐ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| ProofsClient.tsx | src/components/proofs/ProofsClient.tsx:358 | Emoji candidate | ⭐ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| ProofsClient.tsx | src/components/proofs/ProofsClient.tsx:358 | Emoji candidate | ⭐ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| ProofsClient.tsx | src/components/proofs/ProofsClient.tsx:358 | Emoji candidate | ⭐ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| ProofsClient.tsx | src/components/proofs/ProofsClient.tsx:360 | Emoji candidate | ⭐ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| ProofsClient.tsx | src/components/proofs/ProofsClient.tsx:360 | Emoji candidate | ⭐ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| ProofsClient.tsx | src/components/proofs/ProofsClient.tsx:362 | Emoji candidate | ⭐ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| ProofsClient.tsx | src/components/proofs/ProofsClient.tsx:389 | Legacy reference | ShieldCheck | Rendered | ShieldCheck | Context review | Normal | Pending | Confirm semantics in context |
| ProofsClient.tsx | src/components/proofs/ProofsClient.tsx:405 | Legacy reference | CheckCircle2 | Rendered | CheckCircle2 | Context review | Normal | Pending | Confirm semantics in context |
| ProofsClient.tsx | src/components/proofs/ProofsClient.tsx:413 | Legacy reference | Clock | Rendered | Clock | Context review | Normal | Pending | Confirm semantics in context |
| ProofsClient.tsx | src/components/proofs/ProofsClient.tsx:421 | Legacy reference | RotateCcw | Rendered | RotateCcw | Context review | Normal | Pending | Confirm semantics in context |
| ProofsClient.tsx | src/components/proofs/ProofsClient.tsx:429 | Legacy reference | Headphones | Rendered | Headphones | Context review | Normal | Pending | Confirm semantics in context |
| ProofsClient.tsx | src/components/proofs/ProofsClient.tsx:446 | Legacy reference | Star | Rendered | Star | Context review | Normal | Pending | Confirm semantics in context |
| ProofsClient.tsx | src/components/proofs/ProofsClient.tsx:481 | Legacy reference | ShieldCheck | Rendered | ShieldCheck | Context review | Normal | Pending | Confirm semantics in context |
| ProofsClient.tsx | src/components/proofs/ProofsClient.tsx:493 | Legacy reference | Star | Rendered | Star | Context review | Normal | Pending | Confirm semantics in context |
| ProofsClient.tsx | src/components/proofs/ProofsClient.tsx:508 | Legacy reference | MessageSquarePlus | Rendered | MessageSquarePlus | Context review | Normal | Pending | Confirm semantics in context |
| ProofsClient.tsx | src/components/proofs/ProofsClient.tsx:529 | Legacy reference | X | Rendered | X | Context review | Normal | Pending | Confirm semantics in context |
| ProofsClient.tsx | src/components/proofs/ProofsClient.tsx:550 | Legacy reference | Star | Rendered | Star | Context review | Normal | Pending | Confirm semantics in context |
| ProofsClient.tsx | src/components/proofs/ProofsClient.tsx:633 | Legacy reference | ShieldCheck | Rendered | ShieldCheck | Context review | Normal | Pending | Confirm semantics in context |
| ProofsClient.tsx | src/components/proofs/ProofsClient.tsx:667 | Legacy reference | Send | Rendered | Send | Context review | Normal | Pending | Confirm semantics in context |
| ProofsClient.tsx | src/components/proofs/ProofsClient.tsx:705 | Legacy reference | Search | Rendered | Search | Context review | Normal | Pending | Confirm semantics in context |
| ProofsClient.tsx | src/components/proofs/ProofsClient.tsx:718 | Legacy reference | X | Rendered | X | Context review | Normal | Pending | Confirm semantics in context |
| ProofsClient.tsx | src/components/proofs/ProofsClient.tsx:766 | Legacy reference | ShieldCheck | Rendered | ShieldCheck | Context review | Normal | Pending | Confirm semantics in context |
| ProofsClient.tsx | src/components/proofs/ProofsClient.tsx:787 | Legacy reference | Maximize2 | Rendered | Maximize2 | Context review | Normal | Pending | Confirm semantics in context |
| ProofsClient.tsx | src/components/proofs/ProofsClient.tsx:815 | Legacy reference | Clock | Rendered | Clock | Context review | Normal | Pending | Confirm semantics in context |
| ProofsClient.tsx | src/components/proofs/ProofsClient.tsx:824 | Legacy reference | ArrowRight | Rendered | ArrowRight | Context review | Normal | Pending | Confirm semantics in context |
| ProofsClient.tsx | src/components/proofs/ProofsClient.tsx:834 | Legacy reference | PackageOpen | Rendered | PackageOpen | Context review | Normal | Pending | Confirm semantics in context |
| ProofsClient.tsx | src/components/proofs/ProofsClient.tsx:872 | Legacy reference | Star | Rendered | Star | Context review | Normal | Pending | Confirm semantics in context |
| ProofsClient.tsx | src/components/proofs/ProofsClient.tsx:879 | Legacy reference | ShieldCheck | Rendered | ShieldCheck | Context review | Normal | Pending | Confirm semantics in context |
| ProofsClient.tsx | src/components/proofs/ProofsClient.tsx:899 | Legacy reference | Star | Rendered | Star | Context review | Normal | Pending | Confirm semantics in context |
| ProofsClient.tsx | src/components/proofs/ProofsClient.tsx:922 | Legacy reference | Filter | Rendered | Filter | Context review | Normal | Pending | Confirm semantics in context |
| ProofsClient.tsx | src/components/proofs/ProofsClient.tsx:945 | Legacy reference | Star | Rendered | Star | Context review | Normal | Pending | Confirm semantics in context |
| ProofsClient.tsx | src/components/proofs/ProofsClient.tsx:980 | Legacy reference | ShieldCheck | Rendered | ShieldCheck | Context review | Normal | Pending | Confirm semantics in context |
| ProofsClient.tsx | src/components/proofs/ProofsClient.tsx:991 | Legacy reference | Star | Rendered | Star | Context review | Normal | Pending | Confirm semantics in context |
| ProofsClient.tsx | src/components/proofs/ProofsClient.tsx:1006 | Emoji candidate | 🛍️ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| ProofsClient.tsx | src/components/proofs/ProofsClient.tsx:1019 | Legacy reference | CheckCircle2 | Rendered | CheckCircle2 | Context review | Normal | Pending | Confirm semantics in context |
| ProofsClient.tsx | src/components/proofs/ProofsClient.tsx:1056 | Legacy reference | ZoomIn | Rendered | ZoomIn | Context review | Normal | Pending | Confirm semantics in context |
| ProofsClient.tsx | src/components/proofs/ProofsClient.tsx:1063 | Legacy reference | ZoomOut | Rendered | ZoomOut | Context review | Normal | Pending | Confirm semantics in context |
| ProofsClient.tsx | src/components/proofs/ProofsClient.tsx:1070 | Legacy reference | RotateCcw | Rendered | RotateCcw | Context review | Normal | Pending | Confirm semantics in context |
| ProofsClient.tsx | src/components/proofs/ProofsClient.tsx:1077 | Legacy reference | X | Rendered | X | Context review | Normal | Pending | Confirm semantics in context |
| ProofsClient.tsx | src/components/proofs/ProofsClient.tsx:1088 | Legacy reference | ChevronLeft | Rendered | ChevronLeft | Context review | Normal | Pending | Confirm semantics in context |
| ProofsClient.tsx | src/components/proofs/ProofsClient.tsx:1097 | Legacy reference | ChevronRight | Rendered | ChevronRight | Context review | Normal | Pending | Confirm semantics in context |
| ProofsClient.tsx | src/components/proofs/ProofsClient.tsx:1114 | Legacy reference | CheckCircle2 | Rendered | CheckCircle2 | Context review | Normal | Pending | Confirm semantics in context |
| ShopClient.tsx | src/components/shop/ShopClient.tsx:5 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| ShopClient.tsx | src/components/shop/ShopClient.tsx:213 | Legacy reference | Sparkles | Rendered | Sparkles | Context review | Normal | Pending | Confirm semantics in context |
| ShopClient.tsx | src/components/shop/ShopClient.tsx:228 | Legacy reference | Search | Rendered | Search | Context review | Normal | Pending | Confirm semantics in context |
| ShopClient.tsx | src/components/shop/ShopClient.tsx:242 | Legacy reference | X | Rendered | X | Context review | Normal | Pending | Confirm semantics in context |
| ShopClient.tsx | src/components/shop/ShopClient.tsx:258 | Legacy reference | SlidersHorizontal | Rendered | SlidersHorizontal | Context review | Normal | Pending | Confirm semantics in context |
| ShopClient.tsx | src/components/shop/ShopClient.tsx:339 | Legacy reference | ChevronDown | Rendered | ChevronDown | Context review | Normal | Pending | Confirm semantics in context |
| ShopClient.tsx | src/components/shop/ShopClient.tsx:354 | Legacy reference | ArrowUpDown | Rendered | ArrowUpDown | Context review | Normal | Pending | Confirm semantics in context |
| ShopClient.tsx | src/components/shop/ShopClient.tsx:434 | Legacy reference | X | Rendered | X | Context review | Normal | Pending | Confirm semantics in context |
| ShopClient.tsx | src/components/shop/ShopClient.tsx:443 | Legacy reference | X | Rendered | X | Context review | Normal | Pending | Confirm semantics in context |
| ShopClient.tsx | src/components/shop/ShopClient.tsx:455 | Legacy reference | X | Rendered | X | Context review | Normal | Pending | Confirm semantics in context |
| ShopClient.tsx | src/components/shop/ShopClient.tsx:464 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| ShopClient.tsx | src/components/shop/ShopClient.tsx:483 | Legacy reference | Search | Rendered | Search | Context review | Normal | Pending | Confirm semantics in context |
| ShopClient.tsx | src/components/shop/ShopClient.tsx:497 | Legacy reference | RefreshCw | Rendered | RefreshCw | Context review | Normal | Pending | Confirm semantics in context |
| BottomSheet.tsx | src/components/ui/BottomSheet.tsx:111 | Inline SVG | SVG | Rendered | Review markup | Context review | Normal | Review | May be a logo or illustration |
| EmptyState.tsx | src/components/ui/EmptyState.tsx:5 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| EmptyState.tsx | src/components/ui/EmptyState.tsx:29 | Legacy reference | Inbox | Rendered | Inbox | Context review | Normal | Pending | Confirm semantics in context |
| MobileDataCard.tsx | src/components/ui/MobileDataCard.tsx:4 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| MobileDataCard.tsx | src/components/ui/MobileDataCard.tsx:103 | Legacy reference | MoreVertical | Rendered | MoreVertical | Context review | Normal | Pending | Confirm semantics in context |
| MobileFilterSheet.tsx | src/components/ui/MobileFilterSheet.tsx:4 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| MobileFilterSheet.tsx | src/components/ui/MobileFilterSheet.tsx:58 | Legacy reference | Search | Rendered | Search | Context review | Normal | Pending | Confirm semantics in context |
| PageHeader.tsx | src/components/ui/PageHeader.tsx:5 | Legacy import | lucide-react | Source reference | — | Context review | High | Evidence | Import declaration |
| PageHeader.tsx | src/components/ui/PageHeader.tsx:35 | Legacy reference | ChevronLeft | Rendered | ChevronLeft | Context review | High | Pending | Confirm semantics in context |
| UnsubscribeClient.tsx | src/components/unsubscribe/UnsubscribeClient.tsx:6 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| UnsubscribeClient.tsx | src/components/unsubscribe/UnsubscribeClient.tsx:44 | Legacy reference | CheckCircle2 | Rendered | CheckCircle2 | Context review | Normal | Pending | Confirm semantics in context |
| UnsubscribeClient.tsx | src/components/unsubscribe/UnsubscribeClient.tsx:52 | Legacy reference | Info | Rendered | Info | Context review | Normal | Pending | Confirm semantics in context |
| UnsubscribeClient.tsx | src/components/unsubscribe/UnsubscribeClient.tsx:64 | Legacy reference | ArrowRight | Rendered | ArrowRight | Context review | Normal | Pending | Confirm semantics in context |
| UnsubscribeClient.tsx | src/components/unsubscribe/UnsubscribeClient.tsx:71 | Legacy reference | Mail | Rendered | Mail | Context review | Normal | Pending | Confirm semantics in context |
| UnsubscribeClient.tsx | src/components/unsubscribe/UnsubscribeClient.tsx:94 | Legacy reference | Loader2 | Rendered | Loader2 | Loop while busy | Normal | Pending | Confirm semantics in context |
| ShareToEarnBanner.tsx | src/components/viral/ShareToEarnBanner.tsx:4 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| ShareToEarnBanner.tsx | src/components/viral/ShareToEarnBanner.tsx:67 | Emoji candidate | 🎉 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| ShareToEarnBanner.tsx | src/components/viral/ShareToEarnBanner.tsx:71 | Emoji candidate | 🔥 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| ShareToEarnBanner.tsx | src/components/viral/ShareToEarnBanner.tsx:148 | Legacy reference | Check | Rendered | Check | Context review | Normal | Pending | Confirm semantics in context |
| ShareToEarnBanner.tsx | src/components/viral/ShareToEarnBanner.tsx:148 | Legacy reference | Gift | Rendered | Gift | Context review | Normal | Pending | Confirm semantics in context |
| ShareToEarnBanner.tsx | src/components/viral/ShareToEarnBanner.tsx:185 | Legacy reference | Check | Rendered | Check | Context review | Normal | Pending | Confirm semantics in context |
| ShareToEarnBanner.tsx | src/components/viral/ShareToEarnBanner.tsx:185 | Legacy reference | Copy | Rendered | Copy | Context review | Normal | Pending | Confirm semantics in context |
| ShareToEarnBanner.tsx | src/components/viral/ShareToEarnBanner.tsx:194 | Legacy reference | Share2 | Rendered | Share2 | Context review | Normal | Pending | Confirm semantics in context |
| ShareToEarnBanner.tsx | src/components/viral/ShareToEarnBanner.tsx:211 | Legacy reference | X | Rendered | X | Context review | Normal | Pending | Confirm semantics in context |
| ShareToEarnBanner.tsx | src/components/viral/ShareToEarnBanner.tsx:216 | Legacy reference | Sparkles | Rendered | Sparkles | Context review | Normal | Pending | Confirm semantics in context |
| ShareToEarnBanner.tsx | src/components/viral/ShareToEarnBanner.tsx:229 | Legacy reference | Flame | Rendered | Flame | Context review | Normal | Pending | Confirm semantics in context |
| ShareToEarnBanner.tsx | src/components/viral/ShareToEarnBanner.tsx:248 | Legacy reference | MessageCircle | Rendered | MessageCircle | Context review | Normal | Pending | Confirm semantics in context |
| ShareToEarnBanner.tsx | src/components/viral/ShareToEarnBanner.tsx:273 | Legacy reference | Copy | Rendered | Copy | Context review | Normal | Pending | Confirm semantics in context |
| ShareToEarnBanner.tsx | src/components/viral/ShareToEarnBanner.tsx:283 | Legacy reference | CheckCircle2 | Rendered | CheckCircle2 | Context review | Normal | Pending | Confirm semantics in context |
| NotificationContext.tsx | src/context/NotificationContext.tsx:69 | Image reference | /images/logo.png | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| NotificationContext.tsx | src/context/NotificationContext.tsx:70 | Image reference | /images/logo.png | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| NotificationContext.tsx | src/context/NotificationContext.tsx:145 | Emoji candidate | 🔔 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| NotificationContext.tsx | src/context/NotificationContext.tsx:155 | Emoji candidate | 🔔 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| NotificationContext.tsx | src/context/NotificationContext.tsx:174 | Emoji candidate | 🎉 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| NotificationContext.tsx | src/context/NotificationContext.tsx:184 | Emoji candidate | 🎉 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| ToastContext.tsx | src/context/ToastContext.tsx:4 | Legacy import | lucide-react | Source reference | — | Context review | Normal | Evidence | Import declaration |
| ToastContext.tsx | src/context/ToastContext.tsx:52 | Legacy reference | CheckCircle2 | Rendered | CheckCircle2 | Context review | Normal | Pending | Confirm semantics in context |
| ToastContext.tsx | src/context/ToastContext.tsx:55 | Legacy reference | AlertCircle | Rendered | AlertCircle | State | Normal | Pending | Confirm semantics in context |
| ToastContext.tsx | src/context/ToastContext.tsx:58 | Legacy reference | Info | Rendered | Info | Context review | Normal | Pending | Confirm semantics in context |
| ToastContext.tsx | src/context/ToastContext.tsx:65 | Legacy reference | X | Rendered | X | Context review | Normal | Pending | Confirm semantics in context |
| partners.ts | src/data/partners.ts:4 | Image reference | /images/partners/openai.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| partners.ts | src/data/partners.ts:5 | Image reference | /images/partners/canva.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| partners.ts | src/data/partners.ts:6 | Image reference | /images/partners/google.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| partners.ts | src/data/partners.ts:7 | Image reference | /images/partners/microsoft.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| partners.ts | src/data/partners.ts:8 | Image reference | /images/partners/nord.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| partners.ts | src/data/partners.ts:9 | Image reference | /images/partners/capcut.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| products.ts | src/data/products.ts:35 | Image reference | /images/products/chatgpt-plus.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| products.ts | src/data/products.ts:76 | Image reference | /images/products/canva-pro.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| products.ts | src/data/products.ts:117 | Image reference | /images/products/capcut-pro.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| products.ts | src/data/products.ts:155 | Image reference | /images/products/gemini-advanced.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| products.ts | src/data/products.ts:191 | Image reference | /images/products/microsoft-365.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| products.ts | src/data/products.ts:229 | Image reference | /images/products/google-one.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| products.ts | src/data/products.ts:269 | Image reference | /images/products/youtube-premium.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| products.ts | src/data/products.ts:306 | Image reference | /images/products/google-play.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| products.ts | src/data/products.ts:342 | Image reference | /images/products/google-workspace.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| products.ts | src/data/products.ts:379 | Image reference | /images/products/nordvpn.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| products.ts | src/data/products.ts:416 | Image reference | /images/products/expressvpn.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| products.ts | src/data/products.ts:452 | Image reference | /images/products/surfshark.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| products.ts | src/data/products.ts:484 | Image reference | /images/products/chatgpt-plus.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| products.ts | src/data/products.ts:520 | Image reference | /images/products/elevenlabs.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| products.ts | src/data/products.ts:557 | Image reference | /images/products/windows-11.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| products.ts | src/data/products.ts:595 | Image reference | /images/products/idm.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| products.ts | src/data/products.ts:631 | Image reference | /images/products/crunchyroll.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| products.ts | src/data/products.ts:667 | Image reference | /images/products/netflix.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| products.ts | src/data/products.ts:707 | Image reference | /images/products/cursor.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| products.ts | src/data/products.ts:745 | Image reference | /images/products/chatgpt-plus.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| products.ts | src/data/products.ts:783 | Image reference | /images/products/telegram-premium.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| products.ts | src/data/products.ts:820 | Image reference | /images/products/discord-nitro.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| proofs.ts | src/data/proofs.ts:13 | Image reference | /images/products/chatgpt-plus.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| proofs.ts | src/data/proofs.ts:25 | Image reference | /images/products/gemini-advanced.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| proofs.ts | src/data/proofs.ts:37 | Image reference | /images/products/chatgpt-plus.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| proofs.ts | src/data/proofs.ts:49 | Image reference | /images/products/chatgpt-plus.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| proofs.ts | src/data/proofs.ts:63 | Image reference | /images/products/canva-pro.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| proofs.ts | src/data/proofs.ts:75 | Image reference | /images/products/youtube-premium.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| proofs.ts | src/data/proofs.ts:87 | Image reference | /images/products/netflix.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| proofs.ts | src/data/proofs.ts:99 | Image reference | /images/products/capcut-pro.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| proofs.ts | src/data/proofs.ts:113 | Image reference | /images/products/windows-11.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| proofs.ts | src/data/proofs.ts:125 | Image reference | /images/products/microsoft-365.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| proofs.ts | src/data/proofs.ts:137 | Image reference | /images/products/idm.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| proofs.ts | src/data/proofs.ts:151 | Image reference | /images/products/nordvpn.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| proofs.ts | src/data/proofs.ts:163 | Image reference | /images/products/expressvpn.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| proofs.ts | src/data/proofs.ts:175 | Image reference | /images/products/surfshark.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| client.ts | src/lib/analytics/client.ts:45 | Emoji candidate | 📊 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| inventory.ts | src/lib/commerce/inventory.ts:496 | Emoji candidate | 🎉 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| inventory.ts | src/lib/commerce/inventory.ts:496 | Emoji candidate | 🆔 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| inventory.ts | src/lib/commerce/inventory.ts:499 | Emoji candidate | 👤 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| inventory.ts | src/lib/commerce/inventory.ts:500 | Emoji candidate | 📦 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| inventory.ts | src/lib/commerce/inventory.ts:501 | Emoji candidate | 🔑 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| inventory.ts | src/lib/commerce/inventory.ts:501 | Emoji candidate | 📊 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| inventory.ts | src/lib/commerce/inventory.ts:503 | Emoji candidate | ⏰ | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| inventory.ts | src/lib/commerce/inventory.ts:704 | Emoji candidate | ⚠️ | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| inventory.ts | src/lib/commerce/inventory.ts:739 | Emoji candidate | ⚠️ | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| inventory.ts | src/lib/commerce/inventory.ts:740 | Emoji candidate | ⏳ | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| products.ts | src/lib/commerce/products.ts:587 | Image reference | /images/placeholders/aihaat-placeholder.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| referrals.ts | src/lib/commerce/referrals.ts:27 | Emoji candidate | 🎁 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| referrals.ts | src/lib/commerce/referrals.ts:39 | Emoji candidate | 💰 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| referrals.ts | src/lib/commerce/referrals.ts:51 | Emoji candidate | 👑 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| referrals.ts | src/lib/commerce/referrals.ts:259 | Emoji candidate | 🎉 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| resolver.ts | src/lib/commerce/resolver.ts:217 | Image reference | /images/placeholders/aihaat-placeholder.svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| stock-waitlist.ts | src/lib/commerce/stock-waitlist.ts:195 | Emoji candidate | 🔔 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| stock-waitlist.ts | src/lib/commerce/stock-waitlist.ts:196 | Emoji candidate | 📦 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| stock-waitlist.ts | src/lib/commerce/stock-waitlist.ts:197 | Emoji candidate | 🏷️ | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| stock-waitlist.ts | src/lib/commerce/stock-waitlist.ts:198 | Emoji candidate | 👥 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| stock-waitlist.ts | src/lib/commerce/stock-waitlist.ts:199 | Emoji candidate | ⚠️ | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| stock-waitlist.ts | src/lib/commerce/stock-waitlist.ts:200 | Emoji candidate | 🕒 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| support.ts | src/lib/commerce/support.ts:162 | Emoji candidate | 🎫 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| support.ts | src/lib/commerce/support.ts:265 | Emoji candidate | 💬 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| support.ts | src/lib/commerce/support.ts:334 | Emoji candidate | ✅ | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| template-engine.ts | src/lib/email-marketing/template-engine.ts:167 | Emoji candidate | ⚡ | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| template-engine.ts | src/lib/email-marketing/template-engine.ts:167 | Emoji candidate | 🛡️ | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| template-engine.ts | src/lib/email-marketing/template-engine.ts:167 | Emoji candidate | 🔒 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| template-engine.ts | src/lib/email-marketing/template-engine.ts:230 | Emoji candidate | 🔥 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| template-engine.ts | src/lib/email-marketing/template-engine.ts:231 | Emoji candidate | 🚀 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| template-engine.ts | src/lib/email-marketing/template-engine.ts:231 | Emoji candidate | 🛒 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| template-engine.ts | src/lib/email-marketing/template-engine.ts:270 | Emoji candidate | ✨ | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| template-engine.ts | src/lib/email-marketing/template-engine.ts:271 | Emoji candidate | 🎉 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| template-engine.ts | src/lib/email-marketing/template-engine.ts:271 | Emoji candidate | 🚀 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| template-engine.ts | src/lib/email-marketing/template-engine.ts:310 | Emoji candidate | ⚡ | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| template-engine.ts | src/lib/email-marketing/template-engine.ts:311 | Emoji candidate | ⏰ | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| template-engine.ts | src/lib/email-marketing/template-engine.ts:311 | Emoji candidate | 🔥 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| template-engine.ts | src/lib/email-marketing/template-engine.ts:311 | Emoji candidate | ⚡ | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| template-engine.ts | src/lib/email-marketing/template-engine.ts:337 | Emoji candidate | 🎁 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| template-engine.ts | src/lib/email-marketing/template-engine.ts:338 | Emoji candidate | 🎁 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| template-engine.ts | src/lib/email-marketing/template-engine.ts:338 | Emoji candidate | ✨ | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| template-engine.ts | src/lib/email-marketing/template-engine.ts:375 | Emoji candidate | 📢 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| template-engine.ts | src/lib/email-marketing/template-engine.ts:376 | Emoji candidate | 🚀 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| template-engine.ts | src/lib/email-marketing/template-engine.ts:376 | Emoji candidate | ⚡ | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| template-engine.ts | src/lib/email-marketing/template-engine.ts:376 | Emoji candidate | 🛡️ | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| template-engine.ts | src/lib/email-marketing/template-engine.ts:376 | Emoji candidate | 👤 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| template-engine.ts | src/lib/email-marketing/template-engine.ts:412 | Emoji candidate | 📰 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| template-engine.ts | src/lib/email-marketing/template-engine.ts:413 | Emoji candidate | 🧠 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| template-engine.ts | src/lib/email-marketing/template-engine.ts:453 | Emoji candidate | 📢 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| template-engine.ts | src/lib/email-marketing/template-engine.ts:454 | Emoji candidate | 📋 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| template-engine.ts | src/lib/email-marketing/template-engine.ts:482 | Emoji candidate | 👋 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| template-engine.ts | src/lib/email-marketing/template-engine.ts:483 | Emoji candidate | 👋 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| template-engine.ts | src/lib/email-marketing/template-engine.ts:483 | Emoji candidate | 🛒 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| template-engine.ts | src/lib/email-marketing/template-engine.ts:517 | Emoji candidate | 🌙 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| template-engine.ts | src/lib/email-marketing/template-engine.ts:518 | Emoji candidate | 🎉 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| template-engine.ts | src/lib/email-marketing/template-engine.ts:518 | Emoji candidate | ✨ | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| template-engine.ts | src/lib/email-marketing/template-engine.ts:518 | Emoji candidate | 🎁 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| email-service.ts | src/lib/email-service.ts:134 | Emoji candidate | 🚀 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| email-service.ts | src/lib/email-service.ts:134 | Emoji candidate | 📬 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| email-service.ts | src/lib/email-service.ts:138 | Emoji candidate | 🏷️ | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| email-service.ts | src/lib/email-service.ts:139 | Emoji candidate | 📤 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| email-service.ts | src/lib/email-service.ts:140 | Emoji candidate | 🆔 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| email-service.ts | src/lib/email-service.ts:141 | Emoji candidate | ⏰ | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| email-service.ts | src/lib/email-service.ts:354 | Emoji candidate | 👋 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| email-service.ts | src/lib/email-service.ts:354 | Emoji candidate | ✨ | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| email-service.ts | src/lib/email-service.ts:354 | Emoji candidate | 🚀 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| email-templates.ts | src/lib/email-templates.ts:307 | Emoji candidate | 💬 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| email-templates.ts | src/lib/email-templates.ts:352 | Emoji candidate | © | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| email-templates.ts | src/lib/email-templates.ts:436 | Emoji candidate | 👋 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| email-templates.ts | src/lib/email-templates.ts:450 | Emoji candidate | 🛡️ | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| email-templates.ts | src/lib/email-templates.ts:475 | Emoji candidate | 🔐 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| email-templates.ts | src/lib/email-templates.ts:491 | Emoji candidate | 🔒 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| email-templates.ts | src/lib/email-templates.ts:504 | Emoji candidate | 📥 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| email-templates.ts | src/lib/email-templates.ts:527 | Emoji candidate | 💡 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| email-templates.ts | src/lib/email-templates.ts:542 | Emoji candidate | 🔑 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| email-templates.ts | src/lib/email-templates.ts:607 | Emoji candidate | 💰 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| email-templates.ts | src/lib/email-templates.ts:656 | Emoji candidate | ⚡ | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| email-templates.ts | src/lib/email-templates.ts:680 | Emoji candidate | 💳 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| email-templates.ts | src/lib/email-templates.ts:766 | Emoji candidate | ⏳ | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| email-templates.ts | src/lib/email-templates.ts:780 | Emoji candidate | 🛡️ | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| email-templates.ts | src/lib/email-templates.ts:848 | Emoji candidate | 👨‍💻 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| email-templates.ts | src/lib/email-templates.ts:864 | Emoji candidate | 🔑 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| email-templates.ts | src/lib/email-templates.ts:880 | Emoji candidate | 📥 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| email-templates.ts | src/lib/email-templates.ts:900 | Emoji candidate | 💡 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| email-templates.ts | src/lib/email-templates.ts:915 | Emoji candidate | 🛡️ | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| email-templates.ts | src/lib/email-templates.ts:1013 | Emoji candidate | ⏱️ | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| email-templates.ts | src/lib/email-templates.ts:1016 | Emoji candidate | 🔒 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| email-templates.ts | src/lib/email-templates.ts:1016 | Emoji candidate | 📅 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| email-templates.ts | src/lib/email-templates.ts:1039 | Emoji candidate | 🌐 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| email-templates.ts | src/lib/email-templates.ts:1044 | Emoji candidate | 💻 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| email-templates.ts | src/lib/email-templates.ts:1117 | Emoji candidate | ⏳ | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| email-templates.ts | src/lib/email-templates.ts:1129 | Emoji candidate | 🎉 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| email-templates.ts | src/lib/email-templates.ts:1196 | Emoji candidate | 👨‍💻 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| email-templates.ts | src/lib/email-templates.ts:1250 | Emoji candidate | 🎫 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| email-templates.ts | src/lib/email-templates.ts:1313 | Emoji candidate | 👨‍💻 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| email-templates.ts | src/lib/email-templates.ts:1355 | Emoji candidate | ✅ | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| email-templates.ts | src/lib/email-templates.ts:1395 | Emoji candidate | 🎉 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| email-templates.ts | src/lib/email-templates.ts:1465 | Emoji candidate | 💸 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| email-templates.ts | src/lib/email-templates.ts:1524 | Emoji candidate | 🌟 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| email-templates.ts | src/lib/email-templates.ts:1588 | Emoji candidate | ⚠️ | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| email-templates.ts | src/lib/email-templates.ts:1590 | Emoji candidate | ⏳ | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| email-templates.ts | src/lib/email-templates.ts:1667 | Emoji candidate | 🎁 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| email-templates.ts | src/lib/email-templates.ts:1668 | Emoji candidate | 🛒 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| email-templates.ts | src/lib/email-templates.ts:1702 | Emoji candidate | 🎉 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| email-templates.ts | src/lib/email-templates.ts:1724 | Emoji candidate | 👋 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| email-templates.ts | src/lib/email-templates.ts:1749 | Emoji candidate | ⚡ | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| email-templates.ts | src/lib/email-templates.ts:1749 | Emoji candidate | 🛡️ | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| email-templates.ts | src/lib/email-templates.ts:1749 | Emoji candidate | 💳 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| email-templates.ts | src/lib/email-templates.ts:1770 | Emoji candidate | 🎁 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| email-templates.ts | src/lib/email-templates.ts:1770 | Emoji candidate | 👉 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| email-templates.ts | src/lib/email-templates.ts:1797 | Emoji candidate | ⭐ | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| email-templates.ts | src/lib/email-templates.ts:1801 | Emoji candidate | ★ | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| email-templates.ts | src/lib/email-templates.ts:1802 | Emoji candidate | ★ | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| email-templates.ts | src/lib/email-templates.ts:1803 | Emoji candidate | ★ | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| email-templates.ts | src/lib/email-templates.ts:1804 | Emoji candidate | ★ | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| email-templates.ts | src/lib/email-templates.ts:1805 | Emoji candidate | ★ | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| email-templates.ts | src/lib/email-templates.ts:1823 | Emoji candidate | ⭐ | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| email-templates.ts | src/lib/email-templates.ts:1863 | Emoji candidate | ✍️ | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| email-templates.ts | src/lib/email-templates.ts:1863 | Emoji candidate | 🛡️ | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| email-templates.ts | src/lib/email-templates.ts:1892 | Emoji candidate | 🎉 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| email-templates.ts | src/lib/email-templates.ts:1899 | Emoji candidate | 🎉 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| email-templates.ts | src/lib/email-templates.ts:1934 | Emoji candidate | ⚡ | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| email-templates.ts | src/lib/email-templates.ts:1952 | Emoji candidate | 👉 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| email-templates.ts | src/lib/email-templates.ts:1978 | Emoji candidate | 🎉 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| gift-cards.ts | src/lib/gifting/gift-cards.ts:148 | Emoji candidate | 💳 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| gift-themes.ts | src/lib/gifting/gift-themes.ts:20 | Emoji candidate | 🌟 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| gift-themes.ts | src/lib/gifting/gift-themes.ts:21 | Emoji candidate | ⚡ | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| gift-themes.ts | src/lib/gifting/gift-themes.ts:32 | Emoji candidate | 🎂 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| gift-themes.ts | src/lib/gifting/gift-themes.ts:33 | Emoji candidate | 🎂 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| gift-themes.ts | src/lib/gifting/gift-themes.ts:44 | Emoji candidate | 🎉 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| gift-themes.ts | src/lib/gifting/gift-themes.ts:45 | Emoji candidate | 🎉 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| gift-themes.ts | src/lib/gifting/gift-themes.ts:56 | Emoji candidate | 💖 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| gift-themes.ts | src/lib/gifting/gift-themes.ts:57 | Emoji candidate | 💖 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| gift-themes.ts | src/lib/gifting/gift-themes.ts:68 | Emoji candidate | 🚀 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| gift-themes.ts | src/lib/gifting/gift-themes.ts:69 | Emoji candidate | 🚀 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| gift-themes.ts | src/lib/gifting/gift-themes.ts:81 | Emoji candidate | 🎂 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| gift-themes.ts | src/lib/gifting/gift-themes.ts:82 | Emoji candidate | 🎂 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| gift-themes.ts | src/lib/gifting/gift-themes.ts:85 | Emoji candidate | 🚀 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| gift-themes.ts | src/lib/gifting/gift-themes.ts:86 | Emoji candidate | 🚀 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| gift-themes.ts | src/lib/gifting/gift-themes.ts:89 | Emoji candidate | 🎉 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| gift-themes.ts | src/lib/gifting/gift-themes.ts:90 | Emoji candidate | 🎉 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| gift-themes.ts | src/lib/gifting/gift-themes.ts:93 | Emoji candidate | 💖 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| gift-themes.ts | src/lib/gifting/gift-themes.ts:94 | Emoji candidate | ❤️ | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| image-compression.ts | src/lib/image-compression.ts:101 | Image reference | .webp | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| coins.ts | src/lib/loyalty/coins.ts:105 | Emoji candidate | 🎉 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| coins.ts | src/lib/loyalty/coins.ts:204 | Emoji candidate | 🎁 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| optimizer.ts | src/lib/media/optimizer.ts:169 | Image reference | original.gif | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| optimizer.ts | src/lib/media/optimizer.ts:179 | Image reference | original.webp | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| optimizer.ts | src/lib/media/optimizer.ts:204 | Image reference | .webp | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| optimizer.ts | src/lib/media/optimizer.ts:226 | Image reference | .webp | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| optimizer.ts | src/lib/media/optimizer.ts:262 | Image reference | /original.webp | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| service.ts | src/lib/notifications/service.ts:335 | Emoji candidate | 🎉 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| service.ts | src/lib/notifications/service.ts:349 | Emoji candidate | 🏆 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| service.ts | src/lib/notifications/service.ts:465 | Emoji candidate | 💸 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| service.ts | src/lib/notifications/service.ts:465 | Emoji candidate | 👤 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| service.ts | src/lib/notifications/service.ts:468 | Emoji candidate | 📧 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| service.ts | src/lib/notifications/service.ts:469 | Emoji candidate | 💰 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| service.ts | src/lib/notifications/service.ts:470 | Emoji candidate | 💳 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| service.ts | src/lib/notifications/service.ts:471 | Emoji candidate | 📱 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| service.ts | src/lib/notifications/service.ts:472 | Emoji candidate | ⏰ | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| service.ts | src/lib/notifications/service.ts:480 | Emoji candidate | ⚠️ | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| service.ts | src/lib/notifications/service.ts:480 | Emoji candidate | 📦 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| service.ts | src/lib/notifications/service.ts:483 | Emoji candidate | 🔢 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| service.ts | src/lib/notifications/service.ts:484 | Emoji candidate | 🏢 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| service.ts | src/lib/notifications/service.ts:485 | Emoji candidate | ⏰ | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| service.ts | src/lib/notifications/service.ts:493 | Emoji candidate | 🚨 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| service.ts | src/lib/notifications/service.ts:493 | Emoji candidate | 🆔 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| service.ts | src/lib/notifications/service.ts:496 | Emoji candidate | 📦 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| service.ts | src/lib/notifications/service.ts:497 | Emoji candidate | 💰 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| service.ts | src/lib/notifications/service.ts:498 | Emoji candidate | 👤 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| service.ts | src/lib/notifications/service.ts:506 | Emoji candidate | ⚠️ | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| service.ts | src/lib/notifications/service.ts:506 | Emoji candidate | 🆔 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| service.ts | src/lib/notifications/service.ts:509 | Emoji candidate | 💰 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| service.ts | src/lib/notifications/service.ts:510 | Emoji candidate | 💵 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| service.ts | src/lib/notifications/service.ts:511 | Emoji candidate | 🔑 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| service.ts | src/lib/notifications/service.ts:519 | Emoji candidate | ❌ | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| service.ts | src/lib/notifications/service.ts:519 | Emoji candidate | 🆔 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| service.ts | src/lib/notifications/service.ts:522 | Emoji candidate | 📦 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| service.ts | src/lib/notifications/service.ts:523 | Emoji candidate | 📝 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| service.ts | src/lib/notifications/service.ts:530 | Emoji candidate | 🔔 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| templates.ts | src/lib/notifications/templates.ts:97 | Emoji candidate | © | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| templates.ts | src/lib/notifications/templates.ts:230 | Emoji candidate | ⏳ | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| templates.ts | src/lib/notifications/templates.ts:234 | Emoji candidate | 🔐 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| html-escape.ts | src/lib/security/html-escape.ts:46 | Emoji candidate | ★ | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| html-escape.ts | src/lib/security/html-escape.ts:138 | Emoji candidate | 🎉 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| html-escape.ts | src/lib/security/html-escape.ts:143 | Emoji candidate | 🚀 | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| seo.ts | src/lib/seo.ts:40 | Image reference | /images/logo.png | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| validate-env.ts | src/lib/validate-env.ts:87 | Emoji candidate | ⚠️ | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| validate-env.ts | src/lib/validate-env.ts:99 | Emoji candidate | ⚠️ | Source reference | Review purpose | Context review | Normal | Review | May be backend data, template, or external copy |
| avatarHelper.ts | src/utils/avatarHelper.ts:117 | Image reference | .svg | Source reference | Review asset | Context review | Normal | Review | May be product artwork, photo, or official mark |
| telegram.ts | src/utils/telegram.ts:75 | Emoji candidate | 🚀 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:75 | Emoji candidate | 🆔 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:78 | Emoji candidate | 👤 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:79 | Emoji candidate | 📞 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:80 | Emoji candidate | 📧 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:81 | Emoji candidate | 📦 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:84 | Emoji candidate | 💰 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:86 | Emoji candidate | 💳 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:87 | Emoji candidate | 📱 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:88 | Emoji candidate | 🔑 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:90 | Emoji candidate | 📝 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:90 | Emoji candidate | ⏰ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:110 | Emoji candidate | 💰 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:110 | Emoji candidate | 👤 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:113 | Emoji candidate | 📞 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:114 | Emoji candidate | 📧 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:115 | Emoji candidate | 💵 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:116 | Emoji candidate | 💳 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:117 | Emoji candidate | 📱 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:118 | Emoji candidate | 🔑 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:119 | Emoji candidate | ⏰ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:156 | Emoji candidate | 👤 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:157 | Emoji candidate | 📱 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:158 | Emoji candidate | 📧 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:160 | Emoji candidate | 📞 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:164 | Emoji candidate | 🔴 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:166 | Emoji candidate | 🟡 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:167 | Emoji candidate | 🟢 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:169 | Emoji candidate | 🔥 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:172 | Emoji candidate | 🆔 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:172 | Emoji candidate | 📦 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:173 | Emoji candidate | 🏷️ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:173 | Emoji candidate | 💰 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:174 | Emoji candidate | ⏳ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:174 | Emoji candidate | ⚡ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:178 | Emoji candidate | 📝 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:178 | Emoji candidate | 📝 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:178 | Emoji candidate | ⏰ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:199 | Emoji candidate | ⚠️ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:199 | Emoji candidate | 🆔 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:202 | Emoji candidate | 📦 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:203 | Emoji candidate | 👤 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:204 | Emoji candidate | ❗ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:205 | Emoji candidate | 📝 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:207 | Emoji candidate | ⏰ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:224 | Emoji candidate | 🚨 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:224 | Emoji candidate | 📦 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:227 | Emoji candidate | ⚠️ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:228 | Emoji candidate | ⏰ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:251 | Emoji candidate | ⚠️ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:251 | Emoji candidate | 🆔 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:254 | Emoji candidate | 👤 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:255 | Emoji candidate | 📦 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:256 | Emoji candidate | 💰 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:257 | Emoji candidate | 📱 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:258 | Emoji candidate | ❓ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:259 | Emoji candidate | 📝 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:280 | Emoji candidate | 📦 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:280 | Emoji candidate | 🏢 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:282 | Emoji candidate | 🔖 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:283 | Emoji candidate | 📦 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:284 | Emoji candidate | ✅ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:285 | Emoji candidate | ⚠️ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:288 | Emoji candidate | 💰 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:304 | Emoji candidate | ⏳ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:304 | Emoji candidate | ❌ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:306 | Emoji candidate | ⚠️ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:307 | Emoji candidate | 👥 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:310 | Emoji candidate | 📝 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:329 | Emoji candidate | 🎟️ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:329 | Emoji candidate | 🆔 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:332 | Emoji candidate | 👤 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:333 | Emoji candidate | 🏷️ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:334 | Emoji candidate | ⚠️ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:336 | Emoji candidate | 🛒 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:336 | Emoji candidate | 📝 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:353 | Emoji candidate | 💬 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:353 | Emoji candidate | 🆔 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:356 | Emoji candidate | 👤 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:358 | Emoji candidate | 🛒 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:358 | Emoji candidate | 📝 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:378 | Emoji candidate | 💸 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:378 | Emoji candidate | 👤 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:381 | Emoji candidate | 📧 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:382 | Emoji candidate | 💰 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:383 | Emoji candidate | 💳 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:384 | Emoji candidate | 📱 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:385 | Emoji candidate | 💵 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:386 | Emoji candidate | ⏰ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:403 | Emoji candidate | 🤝 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:403 | Emoji candidate | 👤 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:406 | Emoji candidate | 📧 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:407 | Emoji candidate | 🔖 | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
| telegram.ts | src/utils/telegram.ts:408 | Emoji candidate | ⏰ | Source reference | Review purpose | Context review | Normal | Review | May be application copy or shared data |
