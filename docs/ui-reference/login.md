# Login Screen Reference

## Tujuan

Halaman login web baru harus terasa familiar dengan aplikasi desktop lama, tetapi tetap mengikuti auth flow backend `apotek-clean` yang aktif.

Base API:

```env
VITE_API_BASE_URL=https://apidev.vimedika.com
```

## Referensi visual lama

Karakter utama dari screenshot login lama:

- Layout split 2 kolom
- Sisi kiri: area ilustrasi dan ucapan selamat datang
- Sisi kanan: panel login berwarna hijau solid
- Nuansa visual: ramah, bersih, klinis/apotek, dominan hijau
- Form sederhana, fokus hanya pada username dan password

## Struktur layout yang harus dipertahankan

### Kolom kiri

Fungsi:
- branding
- emotional welcome area
- visual identity aplikasi

Elemen:
- teks sambutan seperti: `Selamat datang di Ziida! 👋`
- ilustrasi tenaga medis / apotek
- background terang atau putih
- spacing lega

### Kolom kanan

Fungsi:
- area aksi login

Elemen:
- judul besar: `Sign In`
- subjudul kecil: ajakan masuk ke akun
- input username
- input password
- tombol show/hide password
- tombol submit `Masuk`
- teks versi kecil di bawah tombol

## Komponen frontend yang perlu dibuat

- `AuthSplitLayout`
- `LoginForm`
- `PasswordField`
- `SubmitButton`
- `AuthFooterVersion`
- `AuthIllustrationPanel`

## Perilaku form

Field:
- username
- password

Validasi minimum:
- username wajib diisi
- password wajib diisi

State yang harus ada:
- idle
- submitting
- login error
- success lanjut ke pemilihan cabang / auto set branch

## Mapping ke backend aktif

Login hanya tahap pertama dari auth.

### Step 1

Request:
- `POST /api/login`

Body:

```json
{
  "username": "...",
  "password": "..."
}
```

Expected result:
- dapat `preBranchToken`

### Step 2

Request:
- `GET /api/list_branches`
- header `Authorization: Bearer <preBranchToken>`

Jika branch hanya 1:
- langsung panggil `POST /api/set_branch`

Jika branch lebih dari 1:
- redirect ke halaman pilih cabang

### Step 3

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
- dapat `activeToken`

### Step 4

Request:
- `GET /api/profile`
- header `Authorization: Bearer <activeToken>`

## UX flow yang diinginkan untuk halaman login

1. User membuka `/login`
2. User isi username dan password
3. Klik tombol `Masuk`
4. Tombol berubah loading state
5. Jika login gagal:
   - tampilkan error message yang rapi
   - jangan reset field username
6. Jika login sukses:
   - simpan `preBranchToken`
   - fetch branch list
7. Jika branch tunggal:
   - auto set branch
   - fetch profile
   - masuk dashboard
8. Jika branch lebih dari satu:
   - arahkan ke halaman pilih cabang

## Catatan desain web baru

Versi web baru boleh lebih modern, tetapi tetap familiar.

Arah desain:
- pertahankan split layout kiri-kanan
- pertahankan nuansa hijau sebagai primary brand color
- boleh pakai card/form modern di sisi kanan
- boleh pakai ilustrasi baru selama mood tetap mirip aplikasi lama
- tipografi boleh dimodernisasi
- mobile version boleh berubah menjadi single-column stack

## Catatan implementasi responsive

### Desktop
- 2 kolom
- kiri 50 persen, kanan 50 persen atau 55/45

### Tablet
- bisa tetap split dengan proporsi lebih sempit

### Mobile
- ubah jadi satu kolom
- panel ilustrasi pindah ke atas atau disederhanakan
- form tetap jadi fokus utama

## Copy awal yang direkomendasikan

Judul:
- `Sign In`

Subjudul:
- `Masuk ke akun Anda untuk melanjutkan.`

Label field:
- `Username`
- `Kata sandi`

CTA:
- `Masuk`

## Catatan implementasi repo

Halaman ini nanti akan menjadi fondasi untuk:
- `src/features/auth/pages/LoginPage.tsx`
- `src/features/auth/components/LoginForm.tsx`
- `src/features/auth/components/AuthSplitLayout.tsx`
- `src/lib/auth/*`
- `src/lib/api/*`
