const configuredApiUrl = import.meta.env.VITE_API_BASE_URL?.trim()

if (import.meta.env.PROD && !configuredApiUrl) {
  throw new Error('VITE_API_BASE_URL must be set to the deployed backend API URL.')
}

export const API_BASE_URL = configuredApiUrl || 'http://localhost:8000/api'
