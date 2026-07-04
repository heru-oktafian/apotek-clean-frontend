# Development Log - Apotek Clean Frontend

## Ringkasan Proyek
Aplikasi React + TypeScript + Vite untuk POS Apotek dengan fokus pada UI responsif, caching efisien, dan header yang informatif.

---

## Perubahan Teknis (Kronologi)

### 0. Penyesuaian UI Master Kategori Berdasarkan Response Endpoint
**Tanggal**: 2026-07-01
**File Utama**:
- `src/pages/CategoriesPage.tsx`
- `src/pages/SuppliersPage.tsx`
- `src/pages/MemberCategoriesPage.tsx`

**Perubahan**:
- Menyesuaikan kolom tabel dan form modal dengan struktur response endpoint untuk kategori produk, supplier, dan member.
- Menampilkan field yang relevan dari response endpoint: nama kategori, rate poin member, dan branch ID (jika ada) sesuai kebutuhan UI.
- Menyembunyikan kolom dan field `branch_id` dari tampilan tabel dan modal karena nilainya tidak bisa diubah oleh user.

**Dampak**:
- UI lebih konsisten dengan data yang diterima dari backend.
- User hanya melihat field yang relevan dan dapat diolah.

---

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

### 7. Perbaikan Layout Card Dashboard "Omset & Profit Minggu Ini"
**Tanggal**: Session Ini
**File Utama**:
- `src/features/dashboard/pages/dashboard-page.tsx`
- `src/index.css`

**Perubahan**:
- Mengubah struktur grid pada `weekly-profit-card__body` agar area chart dan info tidak saling memotong
- Memperbesar wrapper chart menjadi `150px` dan memastikan `ResponsiveContainer` punya dimensi pasti
- Menambahkan style `svg` dan `.recharts-wrapper` untuk memastikan Recharts mengisi penuh container
- Memperbaiki `weekly-profit-card__chart-wrapper` menjadi `display: flex` dan `overflow: visible`

**Logika**:
```
Tujuan: Menghindari chart terpotong dan icon/info tidak menumpuk.
- Chart wrapper harus punya ukuran tetap agar Recharts bisa generate SVG.
- Grid harus membagi space dengan `minmax(180px, auto)` untuk chart dan `minmax(0,1fr)` untuk info.
- `ResponsiveContainer` menggunakan dimensi angka agar render stabil.
```

**Dampak**:
- Card dashboard tampil lebih rapih dan proporsional
- Chart sekarang tergenerate normal dan tidak terpotong
- Informasi `Omset`, `Profit`, `HPP` tetap jelas terbaca

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

---

### 8. Perbaikan Tombol Tambah Kategori & CRUD Endpoint
**Tanggal**: 2026-07-02
**File Utama**:
- `src/pages/CategoriesPage.tsx`
- `src/pages/MemberCategoriesPage.tsx`
- `src/pages/SuppliersPage.tsx`

**Perubahan**:
- Menambahkan `type="button"` pada tombol toolbar (`Tambah +`, `Refresh`, `Download Excel`, `Download PDF`) untuk mencegah aksi form submit tidak sengaja.
- Mengimplementasikan pemanggilan API backend untuk operasi CRUD kategori:
  - `POST` untuk menambahkan kategori baru
  - `PUT` untuk mengubah kategori
  - `DELETE` untuk menghapus kategori
- Memastikan setelah operasi berhasil, daftar kategori direfresh ulang dari endpoint.

**Dampak**:
- Tombol `Tambah +` hanya dieksekusi sekali ketika diklik.
- Update/hapus/penambahan kategori kini dikirim ke backend, bukan hanya ke state lokal.
- UI menjadi lebih konsisten dengan alur data backend.


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

### 6. Standarisasi Template Halaman List Master & Transaksional
**Tanggal**: Session Ini  
**File Utama**:
- `src/features/units/pages/units-page.tsx`
- `src/index.css`

**Perubahan**:
- Menetapkan layout halaman Master Satuan sebagai template tampilan standar untuk daftar master dan halaman transaksional.
- Struktur UI konsisten dimulai dari:
  - search box dengan input dan tombol Cari
  - tombol Refresh
  - toolbar aksi utama (Tambah)
  - tombol download Excel / PDF
  - tabel data dengan aksi baris Edit / Hapus
  - pagination di bawah tabel
- Menyederhanakan jarak dan ukuran elemen sehingga tampilan list lebih compact dan mudah dipindah-pakai.

**Logika**:
```
Standarisasi Tampilan List:
1. Search + refresh di atas sebagai filter cepat
2. Action toolbar di tengah sebagai entry point utama
3. Tabel data menempel tepat di bawah toolbar
4. Pagination berada di bawah tabel dengan jarak minimal
5. Modal edit/hapus menjaga konsistensi dialog
```

**Dampak**:
- Halaman daftar lain dapat digembangkan dengan pola UI yang sama
- UX jadi lebih konsisten saat berpindah antar halaman master/transaksi
- Implementasi UI baru akan lebih cepat karena sudah ada template standar

---

### 6. Proteksi Mobile FAB Dashboard
**Tanggal**: Session Ini
**File Utama**:
- `src/features/dashboard/pages/dashboard-page.tsx`
- `src/components/layout/mobile-bottom-bar.tsx`
- `src/index.css`

**Perubahan**:
- Menambahkan listener `mobile-bottom-bar-toggle` di `DashboardPage`
- Menyembunyikan floating refresh button di dashboard saat `Pharma P.O.S` menu terbuka
- Menambahkan kelas CSS `dashboard-refresh-fab--hidden` dengan `display: none !important`
- Menambahkan proteksi di `MobileBottomBar` agar event toggle hanya dikirim saat path dashboard aktif

**Logika**:
```
Tujuan: Floating button hanya ada di dashboard, dan tidak mengganggu drawer menu mobile.
- `MobileBottomBar` tetap kirim event toggle hanya saat halaman dashboard aktif
- `DashboardPage` listen event ini dan sembunyikan FAB saat drawer terbuka
- Jika pindah halaman lain, event tidak dikirim dan FAB tidak di-manage di halaman lain
```

**Dampak**:
- UX mobile dashboard lebih bersih saat menu lengkap dibuka
- Tidak ada side effect pada halaman lain karena event toggle scoped ke dashboard
- Styling FAB tetap kuat karena menggunakan `!important` pada kelas hidden

---

### 9. Perbaikan Fitur Master → Konversi Satuan (Unit Conversions)
**Tanggal**: 2026-07-03
**File Utama**:
- `src/features/unit-conversions/pages/unit-conversions-page.tsx`
- `src/features/unit-conversions/hooks/useUnitConversions.ts`
- `src/features/unit-conversions/api/unit-conversions-api.ts`
- `src/components/ui/Modal.tsx`
- `src/components/layout/app-sidebar.tsx`
- `src/components/layout/mobile-bottom-bar.tsx`

**Perubahan & Perbaikan**:
- Normalisasi respons combo produk dan satuan agar tolerant terhadap berbagai shape dari backend (`array`, `{data:[]}`, `{items:[]}`, nested `product`/`unit` objects).
- Perbaikan parsing dan normalisasi ID/label untuk produk dan satuan; filter entry tanpa nama agar option combobox tidak kosong.
- Ubah handling select di form: simpan nilai sebagai `string`, gunakan placeholder `""`, dan kirim payload sesuai spesifikasi backend: `product_id`, `init_id`, `final_id`, `value_conv`.
- Modal diperbaiki (`overflow-visible`, z-index) dan pointer events dihentikan pada container agar native select dropdown dapat dipilih tanpa menutup modal.
- Normalisasi data pada `useUnitConversions` sehingga tabel selalu menerima field yang konsisten (`product_id`, `product_name`, `from_unit_id`, `from_unit_name`, `to_unit_id`, `to_unit_name`, `conversion_value`).
- Normalisasi item saat membuka edit modal: resolve id/name dari berbagai field yang mungkin dikembalikan backend sehingga combobox edit menampilkan nilai yang benar.

---

### 10. Perbaikan Dashboard Tren Bulanan (Omset + Profit)
**Tanggal**: 2026-07-04
**File Utama**:
- `src/features/dashboard/api/dashboard-api.ts`
- `src/features/dashboard/hooks/useDashboard.ts`
- `src/features/dashboard/pages/dashboard-page.tsx`

**Perubahan & Perbaikan**:
- Memperbaiki rendering chart tren bulanan agar data dipakai dari `monthlyChart` atau fallback `monthlyProfit.data`.
- Menambahkan normalisasi field `report_date`, `total_sales`, `profit_estimate` dalam fetch chart.
- Memastikan `LineChart` menggunakan `effectiveChartData` yang sudah ter-normalisasi.
- Menambahkan fallback UI dan debug log supaya jika data belum tersedia, pengguna mendapat informasi jelas.

**Logika**:
```
1. `fetchMonthlyChart` sekarang mendukung respon API nested `data` dan field `total_sales` / `profit_estimate`.
2. `useDashboard` akan membuat `monthlyChart` dari `monthlyProfit.data` jika endpoint chart kosong.
3. `DashboardPage` menggunakan `effectiveChartData` untuk render garis Omset dan Profit.
4. Jika data tetap kosong, tampilkan pesan fallback dengan jumlah item data.
```

**Dampak**:
- Chart bulanan kembali muncul ketika API memberikan data `monthlyProfit.data`.
- UI tidak lagi kehilangan diagram jika route dashboard memuat data dalam struktur respons yang sedikit berbeda.
- Debugging menjadi lebih mudah melalui pesan fallback yang informative.
- Normalisasi mapping menu label untuk konsistensi ikon di sidebar dan mobile bottom bar.
- Menambahkan debug logging (console.debug / console.warn) sementara untuk membantu verifikasi response; debug dihapus/dinonaktifkan di UI setelah verifikasi.

**Dampak**:
- Form Tambah / Edit konversi sekarang menampilkan combo dan selection bekerja.
- Payload yang dikirim sesuai contoh API backend (menggunakan `init_id` / `final_id` dengan ID string seperti `UNT...`).
- Tabel menampilkan nama produk dan nama satuan jika data tersedia dari respon backend; jika masih ada row kosong, kemungkinan shape respons berbeda dan akan ditangani setelah melihat contoh raw payload row.

**Catatan Pengujian**:
- Jalankan dev server (`npm run dev`), navigasi ke `Master → Konversi Satuan`.
- Buka modal Tambah untuk memastikan combobox memuat dan dapat memilih opsi; klik Tambah untuk menyimpan.
- Jika server menolak (contoh: ID tidak ditemukan di cabang), periksa pesan error dari backend dan kirim payload yang dikirim (log `UnitConversions: submit body`).

---

Entry ini merekam serangkaian perbaikan yang dilakukan untuk memastikan fitur `Konversi Satuan` bekerja konsisten dengan pola fitur lain di aplikasi.

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

---

### 10. Supplier Feature — Complete CRUD Implementation
**Tanggal**: 2026-07-03
**File Utama**:
- `src/features/suppliers/` (new folder dengan 5 files)
- `src/app/router.tsx` (updated)
- `src/index.css` (updated)

**Perubahan**:

1. **New Files Created**:
   - `src/features/suppliers/types/suppliers.ts` — Supplier interface & API types
   - `src/features/suppliers/types/supplier-categories.ts` — Category types
   - `src/features/suppliers/api/suppliers-api.ts` — API functions (CRUD + categories)
   - `src/features/suppliers/hooks/useSuppliers.ts` — Custom hook untuk data state & loading
   - `src/features/suppliers/pages/suppliers-page.tsx` — Full UI component (~450 lines)

2. **Type Definitions**:
   - `Supplier`: id, name, phone, address, supplier_category, supplier_category_id, pic (optional)
   - `SupplierFormData`: name, phone, address, supplier_category_id, pic
   - `SupplierCategory`: id, nama, branchId (optional)

3. **API Layer** (`suppliers-api.ts`):
   - `fetchSuppliers(token, {page, search})` — GET /api/suppliers
   - `createSupplier(token, body)` — POST /api/suppliers
   - `updateSupplier(token, id, body)` — PUT /api/suppliers/{id}
   - `deleteSupplier(token, id)` — DELETE /api/suppliers/{id}
   - `fetchSupplierCategories(token, {})` — GET /api/supplier-categories-combo

4. **Custom Hook** (`useSuppliers.ts`):
   - State: suppliers[], total, page, perPage, isLoading
   - `loadSuppliers(page, search)` — Fetch dengan pagination & search
   - Auto-load on token change via useEffect
   - Selesaikan "need refresh" issue yang ada di awal

5. **UI Component** (`suppliers-page.tsx`):
   - Search box dengan minimum 3 karakter sebelum trigger
   - Tombol Refresh
   - Tabel 7 kolom: No, ID, Nama, Nomor Telepon, Alamat, Kategori Supplier, PIC, Aksi
   - Modal Add/Edit dengan 5 fields (tanpa labels, alamat pakai textarea)
   - Modal Delete confirmation
   - Pagination dengan prev/next buttons
   - Form validation
   - Integrated dengan supplier categories dropdown

6. **Router Update**:
   - Import SuppliersPage
   - Tambah route: `<Route path="/master/suppliers" element={<SuppliersPage />} />`

7. **CSS Updates** (`src/index.css`):
   - ~300 lines `.suppliers-page__*` classes
   - BEM naming pattern sesuai `.members-page__*`
   - Responsive design dengan media query 768px

**Key Features**:
- ✅ Auto-load data saat halaman dibuka
- ✅ Search dengan 3+ karakter minimum
- ✅ Pagination (5 items per page)
- ✅ Add supplier dengan validasi form
- ✅ Edit supplier (pre-populate semua field termasuk PIC)
- ✅ Delete supplier dengan confirmation
- ✅ Category dropdown auto-load dengan multiple API response format handling
- ✅ Toast notifications untuk success/error
- ✅ Form validation feedback

**API Response Format Handling**:
```javascript
// Support multiple category response formats:
1. Direct array: [{ id, nama }, ...]
2. Wrapped object: { data: [{ id, nama }, ...] }
3. Field name normalization: 
   - id / supplier_category_id / supplierCategoryId
   - nama / name / supplier_category_name
```

**Fixes Applied**:
- Fixed missing `supplier_category_id` in response parsing
- Fixed `pic` vs `contact_person` field mismatch
- Fixed category dropdown showing empty (multiple response format handling)
- Fixed text-field PIC not connecting to data (nullish coalescing `??` instead of `||`)
- Converted form select values to string for proper controlled component behavior
- Changed Alamat field from Input to textarea (3 rows, non-resizable)
- Removed all labels dari form fields

**Dampak**:
- ✅ Supplier feature 100% complete dengan parity ke Members feature
- ✅ Data integrity dengan proper type definitions
- ✅ Robust API handling dengan fallback formats
- ✅ Consistent UI/UX dengan rest of application
- ✅ Reusable pattern untuk future CRUD features

**Testing**:
- Search: Works dengan 3+ chars minimum
- Pagination: Prev/next buttons navigate correctly
- Add: Modal opens, form validates, saves to API
- Edit: Data pre-populates including PIC field
- Delete: Confirmation modal, removes from table
- Categories: Dropdown populates correctly
- Responsive: Works on mobile/tablet

**Decision Log**:
| Aspek | Pilihan | Alasan |
|-------|---------|--------|
| Field name | `pic` vs `contact_person` | Match API response structure |
| Category load | Flexible response format | Handle API variations robustly |
| Alamat widget | textarea vs input | Better for longer addresses |
| Form labels | Remove all | Cleaner UI per request |
| Validation | Required fields only | name, phone, address, category |
| PIC required | No (optional) | Matches API design |

---

**Last Updated**: 2026-07-03 - Supplier Feature Complete
**Status**: In Progress
**Next Phase**: Complete remaining Master features (Products, Categories, Units, etc)

---

### 8. Dashboard — Table alignment & scroll limit
**Tanggal**: 2026-06-29
**File Utama**:
- `src/index.css`
- `src/features/dashboard/pages/dashboard-page.tsx`

**Perubahan**:
- Membuat kolom "Produk" pada tabel dashboard rata kiri dengan menambahkan:
  - `.data-table td:first-child { text-align: left; }`
- Membatasi tinggi ketiga kartu bawah dashboard (Fast Moving / Slow Moving / Near Expired) ke ~20 baris dan mengaktifkan scroll di dalamnya:
  - `.tables-grid--3 .table-card { display:flex; flex-direction:column; }`
  - `.tables-grid--3 .table-card .table-wrapper { overflow-y:auto; max-height: calc(2rem * 20); }`

**Logika**:
```
Tujuan: Menjaga konsistensi visual dashboard dan mencegah kartu membesar tak terkendali saat data panjang.
- Nama produk lebih mudah dibaca jika rata kiri.
- Batas tinggi + scroll menjaga layout tetap konsisten di halaman utama.
```

**Dampak**:
- Kolom "Produk" pada kartu Fast Moving / Slow Moving / Near Expired sekarang rata kiri.
- Ketiga kartu memiliki tinggi maksimum yang konsisten; jika data lebih banyak akan muncul scrollbar vertikal di dalam card.

**Verifikasi**:
- Jalankan dev server: `npm run dev` lalu buka `/dashboard` untuk cek alignment dan scroll.

**Notes**: Jika ukuran baris (`2rem`) terasa kurang presisi di beberapa device, nilai `max-height` dapat disesuaikan.

---

### 9. Menu — Reorder dan hapus submenu User dari Setting
**Tanggal**: 2026-06-29
**File Utama**:
- `src/features/menu/hooks/useMenu.ts`

**Perubahan**:
- Mengurutkan grup menu yang ditampilkan oleh endpoint `/api/menus` sesuai urutan yang diminta:
  1. Dashboard
  2. Transaksi
  3. Finance
  4. Laporan
  5. Master
  6. Membership
  7. User Manage
- Menghapus grup `Setting` jika grup tersebut berisi submenu `User`/`Users`.

**Logika**:
```
Setelah data menu dari API dikelompokkan, lakukan post-processing:
- Jika ada grup `setting` yang memiliki item `user`/`users`, buang seluruh grup `setting`.
- Susun ulang grup sesuai `desiredOrder` dengan matching fleksibel (mis. "master" dan "masters").
- Sisakan grup lain yang tidak disebutkan tetap muncul setelah daftar utama.
```

**Dampak**:
- Menu di sidebar akan tampil dalam urutan yang konsisten dan sesuai permintaan.
- Grup Setting yang hanya berfungsi sebagai container untuk submenu User akan dihapus dari tampilan.

**Verifikasi**:
- Jalankan dev server dan buka sidebar untuk memastikan urutan dan penghapusan berlaku.

---

### 2026-06-30 — Dashboard: ProfitByUser card, parser, and styling
**Files changed (high-level)**:
- `src/features/dashboard/api/dashboard-api.ts` — parser for `/api/dashboard/profit-today-by-user`
- `src/features/dashboard/pages/dashboard-page.tsx` — new `ProfitByUserCard`, stat card layout adjustments
- `src/features/dashboard/hooks/useDashboard.ts` — hook wiring to fetch new endpoint
- `src/index.css` — styles for profit card, stat cards, and global title sizing

**Summary of changes**:
- Implemented robust parser for `profit-today-by-user` to handle both top-level `qty_transactions`/`abv_transactions` and per-item fields. Computes fallback totals and weighted ABV when top-level not present.
- Added `ProfitByUserCard` displaying per-user contribution with progress bars; left chart area and right info panel. Tuned layout to final 53% / 45% / 2% spacing.
- Reduced info panel font size and formatted ABV as currency (`Rp.`) where available.
- Reworked `StatCard` for `Omset Hari Ini` and `Profit Hari Ini` into top-heading style: title centered on top, icon + value centered and inline, value font increased (~1.5x) and prefixed with `Rp.`.
- Unified header/title styling across cards using `stat-card__label` for consistent uppercase, muted coloring.
- Fixed build-time TypeScript parse errors, improved localized number parsing, and restarted dev server to validate changes.

**Notes / Next steps**:
- Verified UI locally (Vite dev server). If CI or remote push requires credentials, ensure SSH or token is configured.
- If further formatting needed (spacing / font sizes), adjust `src/index.css` entries under `.stat-card` and `.profit-by-user-card`.

---

### 11. Unit Conversions Feature — Complete CRUD Implementation
**Tanggal**: 2026-07-03
**File Utama**:
- `src/features/unit-conversions/` (new folder dengan 5 files)
- `src/app/router.tsx` (updated)
- `src/index.css` (updated)

**Perubahan**:

1. **New Files Created**:
   - `src/features/unit-conversions/types/unit-conversions.ts` — UnitConversion interface & API types
   - `src/features/unit-conversions/api/unit-conversions-api.ts` — API functions (CRUD + combos)
   - `src/features/unit-conversions/hooks/useUnitConversions.ts` — Custom hook untuk data state & loading
   - `src/features/unit-conversions/pages/unit-conversions-page.tsx` — Full UI component (~480 lines)

2. **Type Definitions**:
   - `UnitConversion`: id, product_id, product_name, from_unit_id, from_unit_name, to_unit_id, to_unit_name, conversion_value
   - `ProductCombo`: id, nama/name
   - `UnitCombo`: id, nama/name

3. **API Layer** (`unit-conversions-api.ts`):
   - `fetchUnitConversions(token, {page, search})` — GET /api/unit-conversions
   - `createUnitConversion(token, body)` — POST /api/unit-conversions
   - `updateUnitConversion(token, id, body)` — PUT /api/unit-conversions/{id}
   - `deleteUnitConversion(token, id)` — DELETE /api/unit-conversions/{id}
   - `fetchProductsCombo(token, {search})` — GET /api/conversion-products-combo
   - `fetchUnitsCombo(token, {search})` — GET /api/units-combo

4. **Custom Hook** (`useUnitConversions.ts`):
   - State: unitConversions[], total, page, perPage, isLoading, error
   - `loadUnitConversions(page, search)` — Fetch dengan pagination & search
   - Auto-load on token change via useEffect
   - Flexible response parser mendukung berbagai format pagination backend

5. **UI Component** (`unit-conversions-page.tsx`):
   - Search box dengan minimum 3 karakter sebelum trigger
   - Tombol Refresh dengan animasi spin saat loading
   - Tabel 6 kolom: No, Produk, Satuan Asal, Satuan Tujuan, Konversi, Aksi
   - Modal Add/Edit dengan 4 fields (Produk combobox, Satuan Asal combobox, Satuan Tujuan combobox, Nilai Konversi input)
   - Modal Delete confirmation
   - Pagination dengan prev/next buttons
   - Form validation (produk wajib, satuan asal & tujuan wajib dan berbeda, nilai konversi > 0)
   - Combobox products dan units di-load paralel saat halaman dibuka
   - Normalisasi field name response combo (id/nama vs id/name)

6. **Router Update**:
   - Import UnitConversionsPage
   - Ganti route placeholder menjadi route aktif: `<Route path="/master/unit-conversions" element={<UnitConversionsPage />} />`

7. **CSS Updates** (`src/index.css`):
   - ~290 lines `.unit-conversions-page__*` classes
   - BEM naming pattern
   - Responsive design dengan media query 768px

**Key Features**:
- ✅ Auto-load data saat halaman dibuka
- ✅ Search dengan 3+ chars minimum
- ✅ Pagination (10 items per page)
- ✅ Add conversion dengan validasi form
- ✅ Edit conversion (pre-populate semua field termasuk combo dropdowns)
- ✅ Delete conversion dengan confirmation
- ✅ Product & unit dropdown auto-load dengan multiple API response format handling
- ✅ Toast notifications untuk success/error
- ✅ Form validation feedback dengan inline error messages
- ✅ Validasi satuan asal dan tujuan harus berbeda
- ✅ Tombol toolbar menggunakan `type="button"` mencegah form submit tidak sengaja

**API Response Format Handling**:
```javascript
// Support multiple response formats:
1. Direct array: [{ id, nama }, ...]
2. Wrapped object: { data: [{ id, nama }, ...] }
3. Field name normalization: 
   - id
   - nama / name
```

**Fixes Applied**:
- Fixed toolbar buttons menggunakan `type="button"` untuk mencegah accidental form submit
- Added validasi satuan asal != satuan tujuan
- Added input number untuk conversion_value dengan step="any"
- Added parallel fetch untuk products dan units combo dengan Promise.allSettled

**Dampak**:
- ✅ Unit Conversions feature 100% complete dengan parity ke Suppliers feature
- ✅ Data integrity dengan proper type definitions
- ✅ Robust API handling dengan fallback formats
- ✅ Consistent UI/UX dengan rest of application
- ✅ Reusable pattern untuk future CRUD features

**Decision Log**:
| Aspek | Pilihan | Alasan |
|-------|---------|--------|
| Validation | Different from/to units | Prevent invalid conversion like 1 unit to same unit |
| Search threshold | 3+ chars | Match existing pattern in suppliers/units |
| Per page | 10 items | Balance between density and readability |
| Combo field names | Flexible normalization | Handle API variations robustly |
| Parallel combo load | Promise.allSettled | Faster page load with graceful degradation |

---

**Last Updated**: 2026-07-03 - Unit Conversions Feature Complete
**Status**: In Progress
**Next Phase**: Complete remaining Master features (Products, Categories, etc)

