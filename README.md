# 🩺 apotek-clean-frontend

Frontend React + TypeScript untuk backend `apotek-clean` — aplikasi Point-of-Sale (POS) untuk apotek.

Ringkasan: implementasi UI admin & master data dengan pendekatan feature-first, routing React Router, dan komponen UI ringan.

---

## 🔧 Quick Start

1. Install dependencies

```bash
npm install
```

2. Jalankan development server

```bash
npm run dev
```

3. Build production

```bash
npm run build
```

Environment (example):

```env
VITE_API_BASE_URL=https://apidev.vimedika.com
```

---

## 🚀 Status & Progress (2026-07-06)

- ✅ Routing dasar dan layout dashboard
- ✅ Sistem breadcrumb dinamis pada header (`Ziida Farma → ...`)
- ✅ Fitur `User Manage`:
	- ✅ Halaman list users (`/system/users`) with search, pagination
	- ✅ User detail view (`/system/users/:userId`) with branch access table
	- ✅ Edit form (`/system/users/:userId/edit`) — CRUD (dummy API)
	- ✅ Tombol aksi (Kembali, Update, Tambah Akses Branch) — konsisten styling
- ✅ Dummy API untuk users & branch-access (lokal, in-memory)
- ✅ Banyak perbaikan UI kecil: buttons, table variants, header, grid align

Work in progress / next:
- Add real backend integration for user creation & branch access
- Modal for adding branch access (dropdown + add flow)
- Validation & nicer form UX (client-side)

---

## ✨ Highlights / Design Choices

- Feature-based folder structure under `src/features/*`.
- Small set of reusable UI components in `src/components/ui` (Button, Input, Table, Modal, Toast).
- Dummy API stubs in `src/features/users/api/users-api.ts` to allow UI work without backend.
- Styling uses utility classes and a small global CSS (`src/index.css`) with some shared tokens (e.g. `--accent`).

---

## 🛠 Developer Notes

- Routes of interest:
	- `/system/users` — users list ([file](src/features/users/pages/users-page.tsx))
	- `/system/users/:userId` — user detail ([file](src/features/users/pages/user-edit-page.tsx))
	- `/system/users/:userId/edit` — edit form ([file](src/features/users/pages/user-edit-form-page.tsx))
- Dummy API: `src/features/users/api/users-api.ts`
- Table component: `src/components/ui/Table.tsx` (supports `className` to remove wrapper border)

---

## ✅ Contributing / Development Workflow

- Fork / clone the repo
- Create a feature branch: `git checkout -b feat/your-change`
- Implement, run `npm run dev`, ensure build passes with `npm run build`
- Commit & push, open PR with screenshots or animated GIFs for visual changes

---

## 📎 Contacts

- Repo maintained in this workspace — push/pull access via configured remote.

---

_Catatan_: README ini diupdate otomatis sesuai progres frontend per 2026-07-06. Untuk penjelasan teknis lebih lanjut lihat `DEVELOPMENT_LOG.md`.

