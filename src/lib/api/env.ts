export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://apidev.vimedika.com'

export function buildApiUrl(path: string) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE_URL}${normalizedPath}`
}
