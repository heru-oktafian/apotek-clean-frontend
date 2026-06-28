# apotek-clean-frontend

Frontend web untuk backend `apotek-clean`.

## Base API

```env
VITE_API_BASE_URL=https://apidev.vimedika.com
```

## Tujuan awal

- Menjadi frontend web baru untuk backend `apotek-clean`
- Mengadaptasi flow dan UX dari aplikasi desktop lama
- Tetap mengikuti kontrak API aktif, termasuk auth 2 tahap dan paging per menu

## Langkah berikutnya

1. Kumpulkan screenshot aplikasi desktop lama per halaman
2. Petakan tiap halaman ke endpoint backend aktif
3. Bangun auth flow 2 tahap
4. Bangun layout admin dan modul inti bertahap

## Struktur awal

- `docs/ui-reference/` untuk screenshot dan mapping UI lama
- `docs/api-mapping/` untuk catatan halaman ke endpoint

## Menjalankan project

```bash
npm install
npm run dev
```
