# Dashboard Mobile UX & Auth Validation

| Field | Value |
|---|---|
| **Tanggal PR** | 2026-06-29 |
| **Status** | Digabung ke `main` |
| **Commit terkait** | `81bf43f`, `790b652` |
| **PR body source** | `PR_DESCRIPTION.md` (root, sekarang sudah dihapus) |

## Tujuan

Merapikan pengalaman mobile di dashboard (FAB refresh + drawer bottom-bar) dan memperketat alur auth supaya halaman yang dilindungi token (protected pages) benar-benar menunggu validasi token sebelum di-render.

## Latar belakang

Setelah login + pemilihan cabang, user bisa langsung masuk ke halaman manapun yang dilindungi token. Tanpa validasi eksplisit, ada risiko content flicker atau akses prematur ke halaman. Selain itu, FAB refresh di dashboard bentrok dengan menu drawer mobile (Pharma P.O.S) saat drawer dibuka — perlu dipisah logic visibility-nya per halaman.

## Perubahan

### UX mobile dashboard

- **Pengaman drawer**: event `mobile-bottom-bar-toggle` hanya dipancarkan di halaman dashboard.
- **FAB auto-hide**: tombol `dashboard-refresh-fab` otomatis sembunyi ketika menu drawer Pharma P.O.S terbuka.
- **Class CSS baru**: `.dashboard-refresh-fab--hidden` (transisi halus).

### Auth & token validation

- **Hook baru** `useTokenValidation()` — validasi token sebelum render halaman protected.
- **`src/features/auth/api.ts`** lebih fleksibel terhadap struktur response `/api/login` dan `/api/set_branch`.
- **`preBranchToken`** di-clear setelah branch dipilih.
- **Profile dimuat dulu** sebelum navigasi lanjut (menghindari race condition saat user masuk ke halaman pertama).

## File yang terlibat

| File | Perubahan |
|---|---|
| `src/components/layout/mobile-bottom-bar.tsx` | Event toggle hanya emit di dashboard |
| `src/features/auth/api.ts` | Response parsing untuk `/api/login` & `/api/set_branch` |
| `src/features/auth/hooks/useTokenValidation.ts` | Hook baru (created) |
| `src/features/auth/pages/branch-selection-page.tsx` | `preBranchToken` cleared, profile dimuat sebelum navigasi |
| `src/features/dashboard/pages/dashboard-page.tsx` | FAB hide saat drawer open |
| `src/index.css` | Class `dashboard-refresh-fab--hidden` |
| `DEVELOPMENT_LOG.md` | Entry dokumentasi perubahan |

## Verifikasi

- Build via `npm run build` lulus tanpa error.
- Drawer bottom-bar hanya aktif di route dashboard.
- FAB refresh otomatis sembunyi ketika drawer Pharma P.O.S terbuka di mobile.
- Halaman protected menunggu `useTokenValidation()` sebelum render — tidak ada lagi flicker konten kosong.
