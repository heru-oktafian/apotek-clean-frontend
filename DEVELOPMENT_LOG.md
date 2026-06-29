# Development Log - Apotek Clean Frontend

## Ringkasan Proyek
Aplikasi React + TypeScript + Vite untuk POS Apotek dengan fokus pada UI responsif, caching efisien, dan header yang informatif.

---

## Perubahan Teknis (Kronologi)

### 1. Header Breadcrumb & Responsivitas
**Tanggal**: Session Ini  
**File Utama**:
- `src/components/layout/dashboard-topbar.tsx`
- `src/index.css`

**Perubahan**:
- Menambahkan breadcrumb dinamis ke header: `Ziida Farma → Dashboard`
- Mengubah separator dari `>>` menjadi `→` (panah Unicode)
- Teks breadcrumb diambil dari `location.pathname` dengan mapping ke label menu yang user-friendly
- Menambahkan `@media (max-width: 720px)` agar header responsif di mobile
- Tombol `Profile/Logout` berubah jadi ikon saja di mobile dengan teks tersembunyi

**Logika**:
```
Tujuan: Memberikan konteks visual kepada user tentang halaman mana yang sedang dibuka
- Header menampilkan: [Branch Name] → [Page Title]
- Page Title dipetakan dari URL pathname
- Mobile: tombol menjadi ikon agar tidak ada tabrakan layout
```

**Dampak**:
- User lebih mudah mengetahui di mana mereka berada dalam aplikasi
- Layout header tidak lagi bertabrakan di layar kecil
- UX mobile lebih clean dan ringan

---

### 2. Menu Caching dengan SessionStorage
**Tanggal**: Session Ini  
**File Utama**:
- `src/features/menu/hooks/useMenu.ts` (baru/diubah)
- `src/components/layout/app-sidebar.tsx`
- `src/components/layout/mobile-bottom-bar.tsx`

**Perubahan**:
- Implementasi caching dua level:
  1. **sessionStorage**: Menyimpan `menu-cache` JSON dengan struktur `{ [token]: [navGroups] }`
  2. **Promise cache**: `menuPromiseCache` untuk menghindari race condition saat multiple component mount
- Refactor `AppSidebar` dan `MobileBottomBar` untuk memakai `useMenu(activeToken)` hook yang shared
- Menghapus fetch API langsung yang terjadi di setiap komponen

**Logika**:
```
Flow caching:
1. Saat pertama kali mount, cek apakah menu sudah ada di sessionStorage untuk token tersebut
2. Jika ada, langsung gunakan (instant)
3. Jika tidak ada, fetch dari API dan cache ke sessionStorage
4. Jika fetch sedang berjalan (Promise cache), tunggu hingga selesai (hindari double request)
5. Saat logout, cache dihapus untuk sesi bersih

Keuntungan:
- Fetch menu hanya 1x per token
- Navigasi antar halaman TIDAK memicu refetch
- Mobile drawer juga pakai cache yang sama
- Cache otomatis hilang saat window/tab ditutup (sessionStorage)
```

**Dampak**:
- Performa lebih baik: navigasi antar halaman tidak ada delay API
- Bandwidth lebih efisien: tidak ada request berulang
- UX lebih smooth saat pindah-pindah halaman

---

### 3. Logout Clear Cache
**Tanggal**: Session Ini  
**File Utama**:
- `src/features/menu/hooks/useMenu.ts`
- `src/features/auth/auth-context.tsx`

**Perubahan**:
- Menambahkan function `clearMenuCache()` di `useMenu.ts`
- Function ini menghapus:
  - `sessionStorage.getItem(MENU_CACHE_KEY)`
  - Semua entry di `menuPromiseCache`
- Memanggil `clearMenuCache()` dari `logout()` di `AuthProvider`

**Logika**:
```
Alasan:
- Saat logout, semua state user harus dibersihkan
- Token baru akan berbeda, jadi cache menu lama tidak relevan
- Memastikan privacy: data menu user A tidak tersisa untuk user B
- Sesi baru akan fetch menu fresh dari API dengan token baru

Implementasi:
- `clearMenuCache()` di-export dan di-import ke auth-context
- Dipanggil sebelum state auth di-reset ke null
```

**Dampak**:
- Security: Cache tidak leak ke user lain
- Consistency: Setiap login baru pasti fetch menu terbaru
- Clean state: Tidak ada data orphan di sessionStorage

---

### 4. Mobile Header Responsif & Icon Buttons
**Tanggal**: Session Ini  
**File Utama**:
- `src/components/layout/dashboard-topbar.tsx`
- `src/index.css`

**Perubahan**:
- Import ikon dari `lucide-react`: `LogOut`, `User`
- Tambah wrapper class `dashboard-topbar__action-button` pada tombol
- CSS media query untuk `max-width: 720px`:
  - Tombol bisa flex-wrap ke baris baru
  - Padding dikecilkan dari `0.375rem 0.75rem` menjadi `0.4rem 0.5rem`
  - Teks tombol di-`display: none` (hanya ikon terlihat)

**Logika**:
```
Responsive Design:
- Desktop (>720px): Tombol berteks + ikon, horizontal layout
- Mobile (<720px): Tombol hanya ikon, compact

CSS Tricks:
- Mempertahankan struktur HTML yang sama (tidak perlu conditional render)
- Hanya CSS yang handle visibility teks
- Accessibility tetap OK (aria-label bisa ditambah nanti jika perlu)
```

**Dampak**:
- Header tidak overcrowded di mobile
- Tetap fungsional dengan area klik yang cukup
- Consistency dengan design system yang clean

---

### 5. Token Validation Sebelum Render Protected Pages
**Tanggal**: Session Ini  
**File Utama**:
- `src/features/auth/hooks/useTokenValidation.ts` (baru)
- `src/app/router.tsx` (updated)
- `src/features/auth/auth-context.tsx`

**Perubahan**:
- Membuat hook `useTokenValidation()` yang:
  1. Validasi token dengan API call ke `/api/profile` saat komponen mount
  2. Jika token valid, set `isValid = true` dan simpan profile ke context
  3. Jika token expired/invalid (401, error), trigger `logout()` dan redirect ke login
  4. Selama validasi pending, tampilkan loading state
- Update `ProtectedRoute` di router untuk menggunakan hook ini
- Cek token validation sebelum render child routes

**Logika**:
```
Flow Validasi Token:
1. User masuk ke protected route (/dashboard, /sale-pos, dll)
2. ProtectedRoute check: ada activeToken?
3. Jika ada, jalankan useTokenValidation hook
4. Hook kirim GET /api/profile dengan Bearer token
5. Jika respond 200 OK:
   - Token valid ✓
   - Parse profile data & update context
   - Render protected page
6. Jika respond 401 / error:
   - Token expired / invalid ✗
   - Call logout() untuk clear session
   - Redirect ke /login
7. Selama request pending: tampilkan "Validating session..."

Security Benefits:
- Mencegah render page dengan token invalid/expired
- Jika token sudah kadaluarsa di server, user di-kick ke login
- Profile data selalu fresh dari server
- Logout bersih dari state + cache
```

**Dampak**:
- Security: Token checked sebelum render, bukan after mounting
- UX: User tidak akan melihat page lalu di-redirect (redirect happens di loading state)
- Consistency: Profile di context always fresh dari server
- Scalable: Hook bisa dipakai di berbagai route guards

**Error Handling**:
- Jika API unreachable (network error): catch error → logout → redirect login
- Jika token 401: logout → redirect login
- Jika profile incomplete: logout → redirect login

---

## File Penting & Logika Komposisi

### Auth & Session Management
| File | Fungsi | Catatan |
|------|--------|---------|
| `src/features/auth/auth-context.tsx` | Manage auth state & logout | Panggil `clearMenuCache()` saat logout |
| `src/features/auth/hooks/useTokenValidation.ts` | Validasi token sebelum render | Hook yang check token ke `/api/profile` |
| `src/lib/auth/storage.ts` | Persist auth ke localStorage | Token & branch disimpan di sini |
| `src/app/router.tsx` | Route definitions & guards | ProtectedRoute check token validation |

### Menu & Navigation
| File | Fungsi | Catatan |
|------|--------|---------|
| `src/features/menu/hooks/useMenu.ts` | Hook shared untuk fetch & cache menu | 2-level cache: sessionStorage + Promise |
| `src/features/menu/api/menu-api.ts` | API call ke `/api/menus` | Dipanggil hanya 1x per token |
| `src/components/layout/app-sidebar.tsx` | Sidebar desktop | Memakai `useMenu()` |
| `src/components/layout/mobile-bottom-bar.tsx` | Bottom nav mobile | Memakai `useMenu()` dengan fallback DOM |

### Layout & Styling
| File | Fungsi | Catatan |
|------|--------|---------|
| `src/components/layout/dashboard-topbar.tsx` | Header dengan breadcrumb | Breadcrumb dari pathname mapping |
| `src/index.css` | Global styles + responsive | Media query 720px breakpoint |

### Dashboard
| File | Fungsi | Catatan |
|------|--------|---------|
| `src/features/dashboard/pages/dashboard-page.tsx` | Halaman utama dashboard | Memakai `useDashboard()` hook |
| `src/features/dashboard/hooks/useDashboard.ts` | Hook untuk fetch 9 endpoint parallel | Promise.allSettled untuk error handling |
| `src/features/dashboard/api/dashboard-api.ts` | 9 fungsi API untuk dashboard | 8 endpoints report + 1 untuk list transaksi |

---

## Endpoint API yang Dipakai

### Dashboard Endpoints
```
1. GET /api/dashboard/daily-profit-report
   → Omset + Profit hari ini

2. GET /api/dashboard/weekly-profit-report
   → Profit minggu ini

3. GET /api/dashboard/monthly-profit-report
   → Profit bulan ini + data untuk grafik bulanan

4. GET /api/dashboard/neared-report
   → Produk yang akan expired

5. GET /api/dashboard/top-selling-report
   → Produk fast moving (terlaris)

6. GET /api/dashboard/least-selling-report
   → Produk slow moving (jarang terjual)

7. GET /api/purchases?page=1&per_page=5
   → List 5 pembelian terakhir

8. GET /api/sales?page=1&per_page=5
   → List 5 penjualan terakhir
```

### Menu Endpoint
```
GET /api/menus
  → Fetch menu roles & items
  → Dikache di sessionStorage per token
  → Dibersihkan saat logout
```

### Auth Endpoints
```
POST /api/login
  → Login dengan username & password
  → Return token

GET /api/list_branches
  → Fetch list cabang untuk user

POST /api/set_branch
  → Set cabang aktif & return token cabang

GET /api/profile
  → Fetch profile user dengan token saat ini
  → Dipakai untuk validasi token di protected routes
  → Jika token expired/invalid → return 401
```

---

## Catatan Teknis & Lanjutan

### Responsivitas Mobile
- Breakpoint utama: `720px` (landscape mobile / small tablet)
- Header wrapper jadi flex-wrap, headline & actions jadi 100% width
- Font size dikecilkan: `1.25rem` → `1.1rem`
- Tombol & gap diperkecil untuk hemat ruang

### Cache Strategy
- **SessionStorage** lebih baik dari LocalStorage untuk menu karena:
  - Otomatis clear saat window/tab ditutup
  - Tidak persistent across sessions (lebih aman)
  - Per-token caching built-in
- **Promise Cache** mencegah race condition saat multiple mount

### Error Handling
- Dashboard: Gunakan `Promise.allSettled` agar error di 1 endpoint tidak block yang lain
- Menu: Jika fetch gagal, fallback ke DOM scraping (mobile-bottom-bar)

### Future Improvements
- [ ] Tambah infinity scroll di dashboard tables
- [ ] Implement skeleton loading state
- [ ] Add automatic menu refresh interval (e.g., 5 menit)
- [ ] Breadcrumb click navigation ke parent menu
- [ ] Toast notification untuk cache events

---

## Decision Log

| Topik | Pilihan | Alasan |
|-------|---------|--------|
| Separator breadcrumb | `→` (panah) vs `>>` | Panah lebih modern & tidak ambiguous |
| Cache level | SessionStorage vs LocalStorage | SessionStorage auto-clear lebih aman |
| Tombol mobile | Icon-only vs text | Icon-only lebih compact & clean |
| Breakpoint mobile | 720px | Cukup untuk landscape mobile + small tablet |
| Hook pattern | Single `useMenu()` vs duplikasi fetch | Single hook untuk DRY & consistency |
| Token validation | Check di ProtectedRoute vs lazy check | ProtectedRoute better: block render early, no page flicker |
| Token validation API | `/api/profile` vs custom endpoint | Profile endpoint: dual purpose (validate + get data) |
| Loading state | "Validating session..." text | Simple & user-friendly, tidak bikin confusion |

---

**Last Updated**: 2026-06-29 - Token Validation Implementation  
**Status**: In Progress  
**Next Phase**: Mulai implementasi feature halaman individual (Products, Transactions, dll)
