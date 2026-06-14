# Lovable Frontend Brief

Base API aktif:

```env
VITE_API_BASE_URL=https://apidev.vimedika.com
```

## Aturan penting

- Frontend only
- Gunakan backend existing `apotek-clean`
- Jangan buat backend baru
- Jangan ubah flow auth menjadi 1 tahap
- Auth wajib 2 tahap: `login` -> `list_branches` -> `set_branch` -> `profile`
- Perhatikan pagination backend, karena tidak semua menu memakai bentuk response yang sama
- `opname` dan `opname-item` bukan prioritas awal
- Return flow jangan dipaksa menjadi CRUD penuh di iterasi pertama

## Fokus awal

1. Login
2. Pilih cabang
3. Layout admin
4. Master data utama
5. Transaksi read-first
6. Report dan export
