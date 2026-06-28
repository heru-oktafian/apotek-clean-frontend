export function formatNumber(value: number, decimals = 0): string {
  if (value === null || value === undefined) return '0';
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}