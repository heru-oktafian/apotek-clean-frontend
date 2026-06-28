# Dashboard Screen Reference

Dokumen ini menggabungkan mapping dashboard desktop lama ke frontend web baru secara bertahap, dari bagian atas sampai bawah.

Base API:

```env
VITE_API_BASE_URL=https://apidev.vimedika.com
```

## Tujuan halaman

Dashboard harus menjadi halaman ringkas yang cepat dibaca setelah user berhasil:

1. login
2. memilih cabang
3. mendapatkan token final branch-aware

Dashboard berfungsi sebagai:
- ringkasan performa harian
- ringkasan omzet dan profit
- gambaran tren periodik
- area overview sebelum user masuk ke modul transaksi atau laporan detail

---

## Bagian atas dashboard

Berdasarkan screenshot bagian paling atas, area ini terdiri dari beberapa lapisan penting.

### 1. Sidebar kiri

Karakter utama:
- background hijau solid
- branding `Ziida` di bagian atas
- item menu vertikal
- item aktif: `Dashboard`
- grouping teks seperti `APLIKASI & HALAMAN`

Menu yang terlihat:
- Dashboard
- Masters
- Transaksi
- Audit & Finance
- Laporan
- Membership
- User Manage

Catatan web baru:
- sidebar sebaiknya tetap mempertahankan nuansa hijau dan hirarki menu yang jelas
- boleh dimodernisasi dengan icon set yang lebih rapi
- item aktif tetap diberi highlight terang
- setiap grup utama bisa dibuat expandable bila nanti menu bertambah banyak

Komponen yang dibutuhkan:
- `AppSidebar`
- `SidebarBrand`
- `SidebarNavSection`
- `SidebarNavItem`

### 2. Header topbar kanan atas

Elemen yang terlihat:
- judul cabang aktif: `Apotek Ziida Farma`
- tombol icon kecil di kanan atas, kemungkinan:
  - refresh / sync
  - status / notifications / theme
  - profile avatar

Catatan implementasi:
- nama cabang aktif harus diambil dari state branch aktif setelah `set_branch`
- avatar user bisa diambil dari profile atau fallback initial nama user
- icon kanan atas boleh dimodernisasi, tetapi fungsi utamanya dipertahankan:
  - refresh dashboard
  - toggle theme opsional
  - akses profile / logout

Komponen yang dibutuhkan:
- `DashboardTopbar`
- `BranchTitle`
- `TopbarActions`
- `UserAvatarMenu`

### 3. Grafik tren utama

Visual utama:
- grafik line besar melebar horizontal
- sumbu X menampilkan tanggal harian dalam sebulan (`1` sampai `31`)
- ada dua garis:
  - garis hitam / gelap = kemungkinan omzet
  - garis hijau = kemungkinan profit

Makna UX:
- ini adalah visual utama dashboard
- harus menjadi komponen pertama yang dilihat user setelah login
- berguna untuk melihat tren naik turun performa harian

Interpretasi data yang paling masuk akal:
- series 1 = omzet harian
- series 2 = profit harian
- periodenya bulanan berjalan

Catatan implementasi web baru:
- gunakan line chart modern
- pertahankan 2 series utama
- sediakan legend yang jelas
- tambahkan tooltip per tanggal
- tambahkan loading skeleton chart
- jika data kosong, tampilkan empty state dengan copy yang ramah

Kebutuhan filter yang disarankan:
- bulan aktif
- mungkin branch aktif hanya sebagai display karena branch ditentukan oleh token

Potensi mapping API:
- gunakan endpoint dashboard/report existing yang bisa menyuplai ringkasan harian
- jika endpoint dashboard saat ini belum mengirim data dalam format chart ideal, frontend boleh membuat adapter dari response backend
- jangan ubah backend hanya demi bentuk chart

Komponen yang dibutuhkan:
- `PerformanceTrendChart`
- `DashboardChartCard`
- `ChartLegend`
- `ChartTooltip`

### 4. Summary cards harian

Di bawah chart terlihat 2 kartu besar horizontal:

#### Card 1
- nilai besar: `Rp 705.000`
- label: `Omset hari ini`

#### Card 2
- nilai besar: `Rp 218.927`
- label: `Profit hari ini`

Makna UX:
- ini KPI paling penting
- harus bisa dibaca dalam 1-2 detik
- tampil di atas fold, tepat setelah grafik utama

Catatan implementasi:
- gunakan card KPI modern
- format rupiah harus konsisten
- nilai besar, label kecil
- state loading pakai skeleton
- state error jangan merusak layout

Komponen yang dibutuhkan:
- `KpiCard`
- `CurrencyMetric`

### 5. Ringkasan mingguan / komposisi profit vs HPP

Di bawah summary cards terlihat area kiri bawah yang berisi:
- judul: `Omset & Profit minggu ini`
- donut chart / pie chart
- legend `Profit` dan `HPP`
- persentase pembagian visual

Interpretasi:
- chart ini menunjukkan distribusi komponen hasil usaha minggu ini
- besar kemungkinan membandingkan `profit` vs `HPP`

Catatan implementasi web baru:
- pertahankan ide donut chart
- tampilkan legend warna yang jelas
- tampilkan persentase dan angka nominal jika tersedia
- gunakan tooltip pada hover

Komponen yang dibutuhkan:
- `WeeklyCompositionChart`
- `DonutLegend`

### 6. Kartu profit harian tambahan

Di tengah bawah terlihat card putih-hijau dengan nilai:
- `Rp 218.927`
- label: `Total profit hari ini`

Catatan:
- secara bisnis ini terlihat overlap dengan card profit hari ini di atas
- untuk web baru, boleh dipertahankan dulu demi familiaritas user lama
- nanti bisa diputuskan apakah ini tetap dipakai atau digabung agar tidak repetitif

Rekomendasi:
- tandai sebagai `candidate for consolidation`
- jangan dihapus dulu pada fase desain awal

### 7. Panel ranking / kontribusi user

Di kanan bawah terlihat panel berisi progress bar, contoh:
- `Vita Fauzi. M` → 98%
- `Fanny` → 1%
- ada keterangan tambahan seperti:
  - `Trans: 41`
  - `ABV : Rp 17.195`

Interpretasi:
- ini kemungkinan ranking kontribusi kasir / user terhadap transaksi atau omzet
- metrik bisa berupa persentase kontribusi, jumlah transaksi, dan average basket value

Catatan implementasi web baru:
- gunakan list ranking card dengan progress bars
- tampilkan nama user, persen kontribusi, jumlah transaksi, dan ABV bila tersedia
- kalau datanya belum tersedia dari endpoint dashboard saat ini, buat komponen siap pakai dengan adapter data

Komponen yang dibutuhkan:
- `CashierContributionCard`
- `ContributionProgressRow`

---

## Susunan layout bagian atas yang direkomendasikan untuk web baru

1. Sidebar kiri tetap permanen pada desktop
2. Topbar horizontal di content area
3. Hero chart besar penuh di row pertama
4. Dua KPI card pada row kedua
5. Tiga panel row ketiga:
   - donut chart mingguan
   - total profit hari ini
   - ranking kontribusi user

---

## Mapping state frontend untuk bagian atas dashboard

State minimum yang perlu ada:
- `dashboardSummary`
- `dailySales`
- `dailyProfit`
- `monthlyTrend`
- `weeklyComposition`
- `cashierContribution`
- `isLoadingDashboard`
- `dashboardError`
- `activeBranch`
- `currentProfile`

---

## Catatan API untuk fase implementasi

Karena dashboard lama bersifat agregat, frontend baru harus siap menghadapi salah satu dari dua kondisi:

### Kondisi A
Backend sudah punya endpoint dashboard yang cukup lengkap
- frontend tinggal mapping ke card/chart

### Kondisi B
Backend dashboard belum ideal atau data tersebar
- frontend membuat adapter dari beberapa endpoint report/dashboard yang sudah ada
- backend tidak perlu diubah dulu pada fase desain

Prinsip:
- utamakan non-breaking
- jangan mengarang endpoint baru
- jangan ubah kontrak backend hanya untuk visualisasi

---

## Catatan kualitas desain web baru

Versi web baru boleh lebih modern dari desktop lama, tetapi tetap harus:
- familiar
- hijau sebagai warna dominan brand
- data-first
- cepat dipindai
- cocok untuk layar admin desktop

Rekomendasi visual:
- gunakan card radius modern
- chart card putih di atas background netral terang
- sidebar hijau tetap dipertahankan
- spacing diperluas dibanding desktop lama
- tipografi heading diperjelas

---

## Bagian bawah dashboard

Berdasarkan dua screenshot lanjutan, bagian bawah dashboard meneruskan komposisi panel yang sebelumnya sudah mulai terlihat di bagian atas, lalu diikuti tabel-tabel insight stok dan pergerakan produk.

### 8. Rekap panel lanjutan di row menengah

Pada potongan bawah pertama, terlihat kelanjutan row menengah yang berisi:

- donut chart `Omset & Profit minggu ini`
- card `Total profit hari ini`
- panel kontribusi user/kasir

Artinya, row menengah dashboard sebaiknya diperlakukan sebagai satu blok 3 kolom:

1. `WeeklyCompositionChart`
2. `DailyProfitSummaryCard`
3. `CashierContributionCard`

Untuk versi web baru:
- tiga panel ini sebaiknya tetap berada dalam satu grid row di desktop
- pada tablet/mobile boleh stack vertikal
- tinggi card perlu diseimbangkan agar visual rapi

### 9. Tabel Fast Moving

Terlihat tabel dengan judul:
- `Fast Moving`

Kolom yang terlihat:
- `Kode Barang`
- `Nama Barang`
- `Terjual`

Makna bisnis:
- daftar produk dengan penjualan/pergerakan tertinggi
- berfungsi sebagai insight cepat untuk barang yang paling laku

Karakter UI:
- card/table putih dengan header hijau
- tombol/ikon kecil download di pojok kanan atas section
- menampilkan sekitar 10 item teratas

Catatan implementasi web baru:
- jadikan sebagai dashboard insight table, bukan halaman master data penuh
- tampilkan maksimum top-N rows agar dashboard tetap ringan
- sediakan tombol `Lihat Semua` opsional bila nanti ada halaman detail khusus
- angka `terjual` harus rata kanan atau jelas terbaca

Komponen yang dibutuhkan:
- `FastMovingTableCard`
- `InsightTableCard`
- `DownloadSectionAction`

### 10. Tabel Slow Moving

Di samping Fast Moving terlihat tabel:
- `Slow Moving`

Kolom yang terlihat:
- `Kode Barang`
- `Nama Barang`
- `Terjual`

Makna bisnis:
- daftar produk dengan pergerakan rendah atau tidak terjual
- berguna untuk keputusan restock, stok mati, dan evaluasi inventaris

Catatan implementasi web baru:
- pola UI dibuat kembar dengan Fast Moving
- bedakan hanya pada data source, judul, dan mungkin accent kecil
- sebaiknya tetap dalam satu row desktop 2 kolom dengan Fast Moving

Komponen yang dibutuhkan:
- `SlowMovingTableCard`
- atau generic `ProductMovementTableCard` dengan props mode `fast` / `slow`

### 11. Tabel Near Expired

Pada screenshot paling bawah terlihat section besar:
- `Near Expired`

Kolom yang terlihat:
- `Kode Barang`
- `Nama Barang`
- `Stock`
- `Unit`
- `Tgl. Expired`

Makna bisnis:
- daftar barang yang mendekati masa kedaluwarsa
- ini insight operasional yang sangat penting
- kemungkinan dipakai untuk tindak lanjut pembelian, promo, retur, atau pengelolaan stok

Karakter UI:
- full-width table
- header hijau konsisten
- ikon download di pojok kanan atas
- data lebih panjang daripada tabel Fast/Slow Moving

Catatan implementasi web baru:
- jadikan satu card/table penuh lebar konten
- sediakan sorting visual atau default urut tanggal expired terdekat
- format tanggal harus mudah dibaca
- stock dan unit perlu diposisikan konsisten
- kalau memungkinkan, beri indikator visual halus untuk barang yang sangat dekat expired

Komponen yang dibutuhkan:
- `NearExpiredTableCard`
- `ExpiryDateCell`
- `StockUnitCell`

### 12. Struktur layout dashboard utuh yang direkomendasikan

Dari seluruh screenshot yang sudah dikirim, susunan dashboard web baru yang paling masuk akal adalah:

#### Row 1
- line chart tren bulanan penuh lebar

#### Row 2
- KPI `Omset hari ini`
- KPI `Profit hari ini`

#### Row 3
- donut chart mingguan
- total profit harian
- kontribusi user/kasir

#### Row 4
- Fast Moving table
- Slow Moving table

#### Row 5
- Near Expired table full width

### 13. Catatan interaksi dan aksi dashboard

Dari screenshot tampak ada ikon download pada beberapa section tabel.

Untuk web baru, tindakan yang disarankan:
- setiap section insight boleh punya action kecil di kanan atas:
  - export CSV/XLSX jika backend mendukung
  - atau `Lihat detail` bila export belum tersedia
- jangan memaksa semua tombol download aktif jika backend belum punya endpoint export spesifik
- kalau backend belum punya export khusus dashboard insight, tombol dapat sementara diubah menjadi:
  - `Lihat detail`
  - `Buka laporan`

### 14. Kandidat mapping data dashboard ke backend

Walau screenshot dashboard lama kaya secara visual, frontend baru harus siap bahwa backend aktif mungkin belum menyediakan satu endpoint dashboard yang menampung semuanya sekaligus.

Maka strategi frontend yang direkomendasikan:

- buat `dashboard adapter layer`
- izinkan satu halaman dashboard mengambil data dari beberapa sumber bila perlu
- kelompokkan data menjadi:
  - `trend data`
  - `daily summary`
  - `weekly composition`
  - `cashier contribution`
  - `fast moving items`
  - `slow moving items`
  - `near expired items`

Prinsip tetap:
- jangan mengarang endpoint baru
- jangan mengubah backend hanya demi layout
- frontend yang menyesuaikan melalui adapter

### 15. State frontend tambahan yang perlu disiapkan

Selain state dashboard bagian atas, tambahkan state berikut:

- `fastMovingItems`
- `slowMovingItems`
- `nearExpiredItems`
- `isLoadingFastMoving`
- `isLoadingSlowMoving`
- `isLoadingNearExpired`
- `dashboardSectionErrors`

Akan lebih baik bila error per section bisa terisolasi.
Contoh:
- chart gagal load, tapi tabel near expired tetap tampil
- fast moving kosong, tapi KPI tetap tampil

### 16. Catatan UX penting

Dashboard ini secara alami panjang ke bawah, jadi untuk versi web baru:

- tetap buat section hierarchy yang jelas
- beri jarak antar card/section cukup lega
- gunakan heading section yang kuat
- gunakan sticky sidebar pada desktop
- pertimbangkan sticky topbar ringan
- jangan membuat tabel terlalu padat tanpa whitespace

### 17. Status pemetaan dashboard

Saat ini, dari screenshot yang sudah dikirim:

- Bagian atas: sudah dipetakan
- Bagian menengah: sudah dipetakan
- Bagian bawah: sudah dipetakan

Dengan ini dashboard lama sudah cukup terpetakan sebagai dasar untuk mulai implementasi UI web baru.

---

## Status dokumen

- Bagian atas: sudah dipetakan
- Bagian tengah: sudah dipetakan
- Bagian bawah: sudah dipetakan
- Dashboard keseluruhan: cukup siap dijadikan acuan implementasi awal
