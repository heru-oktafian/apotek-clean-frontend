/**
 * @module daily-assets/types
 * @description Tipe data untuk modul Laporan Asset (Daily Assets)
 */

/** Satu record asset di tabel */
export interface DailyAsset {
  id: number;
  branchId: string;
  branchName: string;
  assetName: string;
  assetCode: string;
  category: string;
  purchaseDate: string;
  purchasePrice: number;
  currentValue: number;
  depreciation: number;
  condition: 'Baik' | 'Rusak' | 'Hilang';
  createdAt: string;
}

/** Data untuk form tambah/edit asset */
export interface DailyAssetFormData {
  assetName: string;
  assetCode: string;
  category: string;
  purchaseDate: string;
  purchasePrice: number;
  condition: 'Baik' | 'Rusak' | 'Hilang';
}
