export * from './enums'
export * from './profile'
export * from './portfolio'
export * from './goals'
export * from './recommendations'

export interface AppSettings {
  theme: 'light' | 'dark' | 'system'
  currency: string
  dateFormat: string
  autoRefreshInterval: number
  privacyMode: boolean
  notifications: {
    goalReminders: boolean
    portfolioAlerts: boolean
    recommendationUpdates: boolean
  }
}

export interface StorageQuota {
  usage: number
  quota: number
  available: number
}

export interface AppError {
  code: string
  message: string
  details?: Record<string, unknown>
  timestamp: Date
}