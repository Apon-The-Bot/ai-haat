# 06 — Responsive Viewport & Overflow Test Matrix

## 1. Target Viewport Standards

| Device Classification | Viewport Width | Target Devices | Critical Layout Focus |
| :--- | :--- | :--- | :--- |
| **Compact Mobile** | `320px` | iPhone SE (1st gen), small Androids | Sticky bottom checkout buttons, variation pills wrap cleanly. |
| **Standard Mobile** | `360px` | Samsung Galaxy S-series | Navigation drawer, price display, OTP modals. |
| **Modern iPhone** | `390px` | iPhone 12/13/14/15/16 Pro | Cart summary card, payment method selector grids. |
| **Large Mobile** | `430px` | iPhone 14/15/16 Pro Max, Plus | Order tracking timeline, digital vault key copy cards. |
| **Tablet Portrait** | `768px` | iPad Mini, iPad 10th Gen | Dual column product split, admin table horizontal responsiveness. |
| **Desktop High-Res** | `1440px` | Laptops & Monitors | Full grid catalog, sidebars, dashboard navigation. |

---

## 2. Horizontal Overflow Invariant
For all public and customer dashboard pages:
$$\text{document.documentElement.scrollWidth} \le \text{window.innerWidth}$$
No unwanted horizontal scrollbars shall appear outside intentional horizontally scrollable sub-components (e.g. variation carousel or data tables).
