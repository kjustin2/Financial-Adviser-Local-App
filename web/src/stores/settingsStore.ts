import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { storageService } from '../services/storage'
import type { AppSettings } from '../types'

interface SettingsState {
  settings: AppSettings
  isLoading: boolean
  error: string | null
}

interface SettingsActions {
  loadSettings: () => Promise<void>
  updateSettings: (settings: Partial<AppSettings>) => Promise<void>
  resetSettings: () => Promise<void>
  clearError: () => void
}

const defaultSettings: AppSettings = {
  theme: 'system',
  currency: 'USD',
  dateFormat: 'MM/dd/yyyy',
  autoRefreshInterval: 300000,
  privacyMode: false,
  notifications: {
    goalReminders: true,
    portfolioAlerts: true,
    recommendationUpdates: true
  }
}

export const useSettingsStore = create<SettingsState & SettingsActions>()(
  persist(
    (set, _get) => ({
      // State
      settings: defaultSettings,
      isLoading: false,
      error: null,

      // Actions
      loadSettings: async () => {
        set({ isLoading: true, error: null })
        try {
          const settings = await storageService.getSettings()
          set({ settings, isLoading: false })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to load settings',
            isLoading: false 
          })
        }
      },

      updateSettings: async (newSettings: Partial<AppSettings>) => {
        set({ isLoading: true, error: null })
        try {
          const updatedSettings = await storageService.updateSettings(newSettings)
          set({ settings: updatedSettings, isLoading: false })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to update settings',
            isLoading: false 
          })
          throw error
        }
      },

      resetSettings: async () => {
        set({ isLoading: true, error: null })
        try {
          const resetSettings = await storageService.updateSettings(defaultSettings)
          set({ settings: resetSettings, isLoading: false })
        } catch (error) {
          set({ 
            error: error instanceof Error ? error.message : 'Failed to reset settings',
            isLoading: false 
          })
          throw error
        }
      },

      clearError: () => set({ error: null })
    }),
    {
      name: 'settings-storage',
      partialize: (state) => ({ settings: state.settings })
    }
  )
)