# Branch Selection Screen Reference

## Tujuan

Halaman pilih cabang menjadi langkah kedua setelah login awal berhasil. Halaman ini harus mempertahankan rasa visual dari aplikasi desktop lama, tetapi mengikuti flow auth backend `apotek-clean` yang aktif.

Base API:

```env
VITE_API_BASE_URL=https://apidev.vimedika.com
```

## Peran dalam flow auth

Urutan auth yang benar:

1. `POST /api/login`
2. `GET /api/list_branches`
3. jika branch > 1, tampilkan halaman pilih cabang
4. `POST /api/set_branch`
5. `GET /api/profile`
6. masuk dashboard

Jika hanya ada 1 branch:
- halaman ini boleh dilewati
- frontend bisa langsung auto-set branch

## Referensi visual lama

Ciri utama screenshot lama:

- Layout split 2 kolom, konsisten dengan halaman login
- Kolom kiri putih dengan ilustrasi area bangunan/lokasi
- Kolom kanan hijau sebagai action panel
- Headline besar: `Pilih Cabang Apotek`
- Ada subteks instruksi singkat
- Daftar cabang ditampilkan sebagai kartu putih di atas panel hijau
- Setiap kartu branch menampilkan:
  - nama cabang
  - informasi pendukung seperti SIA / SIPA / nomor telepon
  - ikon toko/apotek di sisi kiri

## Struktur layout yang harus dipertahankan

### Kolom kiri

Fungsi:
- menjaga konsistensi visual dengan login
- memberi konteks lokasi/cabang

Elemen:
- branding/logo ringan di atas
- ilustrasi lokasi/bangunan/apotek
- background putih atau sangat terang
- spacing lega

### Kolom kanan

Fungsi:
- area pemilihan branch aktif

Elemen:
- judul: `Pilih Cabang Apotek`
- subjudul instruksi
- list card branch
- state selected branch
- loading state saat set branch

## Komponen frontend yang perlu dibuat

- `AuthSplitLayout`
- `BranchSelectionPage`
- `BranchCard`
- `BranchCardList`
- `BranchSelectionHeader`
- `BranchSelectionSkeleton`

## Perilaku halaman

Input ke halaman ini:
- `preBranchToken` dari hasil login
- hasil `GET /api/list_branches`

Perilaku utama:
- tampilkan semua cabang yang tersedia untuk user
- klik kartu cabang akan memicu pemilihan branch
- saat user klik salah satu branch:
  - tampilkan loading state pada card atau panel
  - panggil `POST /api/set_branch`
- jika sukses:
  - simpan `activeToken`
  - simpan `activeBranch`
  - panggil `GET /api/profile`
  - redirect ke dashboard

## Mapping ke backend aktif

### Ambil daftar cabang

Request:
- `GET /api/list_branches`
- header `Authorization: Bearer <preBranchToken>`

Expected result:
- array daftar branch yang bisa dipilih user

Frontend harus siap menampilkan field minimal:
- `branch_id` atau `id`
- nama cabang
- informasi pendukung bila tersedia

### Set branch aktif

Request:
- `POST /api/set_branch`
- header `Authorization: Bearer <preBranchToken>`
- body:

```json
{
  "branch_id": "..."
}
```

Expected result:
- token final (`activeToken`)

### Ambil profile setelah branch aktif

Request:
- `GET /api/profile`
- header `Authorization: Bearer <activeToken>`

## UX flow yang diinginkan

1. User selesai login
2. Frontend ambil daftar branch
3. Jika lebih dari satu branch, user diarahkan ke `/select-branch`
4. Halaman menampilkan daftar kartu branch
5. User klik salah satu kartu
6. UI menampilkan selected/loading state
7. Frontend panggil `POST /api/set_branch`
8. Jika berhasil:
   - simpan token final
   - fetch profile
   - masuk ke dashboard
9. Jika gagal:
   - tampilkan error message yang rapi
   - tetap di halaman pilih cabang

## State yang harus ada

- loading daftar branch
- daftar branch kosong
- satu branch auto-skip
- multi branch pilih manual
- submitting set branch
- error set branch

## Empty state / edge case

Jika `GET /api/list_branches` mengembalikan kosong:
- tampilkan pesan ramah bahwa tidak ada cabang yang tersedia untuk akun ini
- tampilkan tombol kembali / logout
- jangan memaksa user masuk dashboard

Jika token login awal hilang/invalid:
- redirect kembali ke login

## Catatan desain web baru

Arah desain:
- tetap konsisten dengan login screen
- gunakan split layout yang sama
- branch card boleh dibuat lebih modern
- card yang hover/selected boleh diberi accent hijau lebih terang
- boleh ada arrow icon atau check indicator di card aktif

## Responsive notes

### Desktop
- dua kolom
- list branch berada di panel kanan

### Mobile
- satu kolom
- ilustrasi bisa diperkecil
- branch cards menjadi stack vertical penuh

## Copy awal yang direkomendasikan

Judul:
- `Pilih Cabang Apotek`

Subjudul:
- `Silakan pilih cabang apotek yang ingin Anda gunakan untuk melanjutkan.`

Error fallback:
- `Gagal memilih cabang. Silakan coba lagi.`
- `Tidak ada cabang yang tersedia untuk akun ini.`

## Catatan implementasi repo

Halaman ini nanti akan menjadi fondasi untuk:
- `src/features/auth/pages/BranchSelectionPage.tsx`
- `src/features/auth/components/BranchCard.tsx`
- `src/features/auth/components/BranchCardList.tsx`
- `src/lib/auth/*`
- `src/lib/api/*`
