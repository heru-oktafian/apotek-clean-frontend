# DEVLOG — Apotek Frontend

## 2026-07-14

### Sidebar Navigation Fix
**Problem:** Sidebar kosong, semua menu item undefined. Root cause: API `/api/menus` return `MenuRole[]` (`group_menu/title/url`) tapi sidebar expect `NavGroup[]` (`id/label/icon/items`).

**Solution:**
- `useMenu.ts`: added `transformMenuRolesToNavGroups()` to map API → sidebar structure
- Added `GROUP_ICON_MAP` and `ITEM_ICON_MAP` (Lucide icons per group & item)
- Added `deriveRoute(groupMenu, title)` for centralized URL derivation
- Added `formatGroupLabel()` for Indonesian label formatting

**Route derivation mapping:**
| group_menu | title | route |
|---|---|---|
| masters | produk | /master/products |
| masters | kategori | /master/product-categories |
| masters | supplier | /master/suppliers |
| masters | pelanggan | /master/customers |
| masters | satuan | /master/satuan |
| masters | konversi satuan | /master/unit-conversions |
| masters | member categories | /membership/member-categories |
| masters | members | /membership/members |
| transaksi | pembelian | /transactions/purchases |
| transaksi | penjualan | /transactions/sales |
| transaksi | retur pembelian | /transactions/buy-returns |
| transaksi | retur penjualan | /transactions/sale-returns |
| transaksi | pos | /transactions/pos |
| transaksi | first stock | /transactions/first-stocks |
| transaksi | stock opname | /transactions/stock-opnames |
| transaksi | pengeluaran | /transactions/expenses |
| transaksi | pemasukan lain | /transactions/another-incomes |
| finance | jurnal umum | /finance/general-journals |
| finance | buku besar | /finance/ledgers |
| finance | neraca saldo | /finance/trial-balances |
| finance | laba rugi | /finance/profit-loss |
| laporan | * | /reports/* |
| user_manage | users | /system/users |
| membership | members | /membership/members |
| membership | kategori member | /membership/member-categories |

### Field Mapping Fixes

**`useCategories.ts`** — Kategori Produk page
- API: `product_category_id`, `product_category_name`
- Type: `id`, `nama`
- Fix: map API fields to type in `loadCategories()`

**`useMembers.ts`** — Membership >> Members page
- `fetchMembers('')` → `fetchMembers(activeToken)` — token empty = 401, data never loads
- Fixed columns: removed `email` & `joinDate` (not in API), added `address` & `points`
- Added token guard + useAuth

**`useMemberCategories.ts`** — Membership >> Kategori Member page
- Already had `normalizeMemberCategory()` and `useAuth` — confirmed working

### Token Validation Fix
**Problem:** Token invalid/expired tidak redirect ke login — dashboard tetap terlihat.

**Root cause:** `useTokenValidation` baris 51-53 — stub code `setIsValid(true)` selalu return valid.

**Fix:** Ganti stub dengan `getProfile(activeToken)` → call `/api/profile`. Kalau 401/error → clear token → ProtectedRoute redirect ke `/login`.

### NotFoundPage — Halaman 404
**Feature:** Halaman 404 yang elegan, pharmacy green theme.
- Component: `src/components/common/not-found-page.tsx`
- Tombol "Kembali" + "Ke Dashboard"
- CSS background decoration, gradient badge, responsive
- Catch-all route `path="*"` di router.tsx lempar ke `NotFoundPage`

### Reusable Components Status
**Done:**
- `Table<T>` — generic, all pages use it
- `Pagination` — all pages use it
- `ActionToolbar` — all pages use it
- `ListSearchBar` — all pages use it
- `Modal`, `Button`, `Input`, `Select`, `Badge`, `FormField`, `Toast` — UI primitives

**Decision:** STOP here. Pattern repetition is acceptable — each page has different columns/logic. No over-engineering.

---

## 2026-07-10

### Dashboard Widgets
Wired all 9 dashboard endpoints:
- `GET /api/report/daily-profit` — omset + profit today
- `GET /api/report/weekly-profit` — profit this week
- `GET /api/report/monthly-profit` — profit this month
- `GET /api/report/monthly-profit-chart` — monthly trend chart
- `GET /api/report/near-expired-products` — near expired alert
- `GET /api/report/top-selling-products` — fast moving items
- `GET /api/report/least-selling-products` — slow moving items
- `GET /api/products/total-products` — total product count
- `GET /api/transaction/pending` — pending transaction count

### Page Routing (27 screens reference)
Login → Set Branch → Dashboard → Master Data → Transaksi → Laporan → Pengaturan

### Git Commits
- `NotFoundPage` (2026-07-14): feat(404): elegant NotFoundPage + catch-all route
- `TokenValidation` (2026-07-14): fix(auth): validate token via /api/profile, redirect on 401
- `d01d61b` (2026-07-14): fix(sidebar): transform API MenuRole[] to NavGroup[], fix field mapping
- `1c71e85`: refactor(api): standardize all API & types files with JSDoc, Payload interfaces
- `032230a`: refactor: unify UI pattern across 8 pages
- `a3bcb17`: refactor: unify list-page CSS across all pages and components

---

## Design Constraints — LOCKED 🔒
Login, select-branch, dashboard pages styling = FINAL. **DO NOT TOUCH.**
Only touch API/TypeScript code. NEVER touch CSS or layout of these pages.

### CRITICAL — NO CSS TOUCHING
Abi almost quit the project because CSS changes broke dashboard layout repeatedly.
- Dashboard: BROKEN from dark→light theme attempt (2026-06-27)
- Lesson: ONLY touch API/TypeScript code. NEVER touch CSS or layout.
- If something breaks → `git checkout -- .` immediately

---

## Stack
- Frontend: React + Vite + Tailwind + Lucide Icons + React Router
- API: `https://apidev.vimedika.com`
- Service: `front-apotek` (systemd, port 9009)
- Access: `aptdev.vimedika.com:9009`
