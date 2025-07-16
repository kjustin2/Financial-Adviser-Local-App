import { db } from './database'
import type {
  UserProfile,
  CreateUserProfileData,
  UpdateUserProfileData,
  Holding,
  CreateHoldingData,
  UpdateHoldingData,
  Goal,
  CreateGoalData,
  UpdateGoalData,
  Recommendation,
  CreateRecommendationData,
  UpdateRecommendationData,
  AppSettings,
  StorageQuota
} from '../types'

export class StorageService {
  // Profile methods
  async createProfile(data: CreateUserProfileData): Promise<UserProfile> {
    const profile = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date()
    } as UserProfile
    
    await db.profiles.add(profile)
    return profile
  }

  async getProfile(): Promise<UserProfile | null> {
    const profiles = await db.profiles.toArray()
    return profiles.length > 0 ? profiles[0] : null
  }

  async updateProfile(data: UpdateUserProfileData): Promise<UserProfile> {
    const updatedData = {
      ...data,
      updatedAt: new Date()
    }
    
    await db.profiles.update(data.id, updatedData)
    const profile = await db.profiles.get(data.id)
    if (!profile) {
      throw new Error('Profile not found')
    }
    return profile
  }

  async deleteProfile(id: string): Promise<void> {
    await db.profiles.delete(id)
  }

  // Holdings methods
  async createHolding(data: CreateHoldingData): Promise<Holding> {
    const holding = {
      ...data,
      id: crypto.randomUUID(),
      lastUpdated: new Date()
    } as Holding
    
    await db.holdings.add(holding)
    return holding
  }

  async getHoldings(): Promise<Holding[]> {
    return await db.holdings.orderBy('symbol').toArray()
  }

  async getHolding(id: string): Promise<Holding | null> {
    return await db.holdings.get(id) || null
  }

  async updateHolding(data: UpdateHoldingData): Promise<Holding> {
    const updatedData = {
      ...data,
      lastUpdated: new Date()
    }
    
    await db.holdings.update(data.id, updatedData)
    const holding = await db.holdings.get(data.id)
    if (!holding) {
      throw new Error('Holding not found')
    }
    return holding
  }

  async deleteHolding(id: string): Promise<void> {
    await db.holdings.delete(id)
  }

  async deleteAllHoldings(): Promise<void> {
    await db.holdings.clear()
  }

  // Goals methods
  async createGoal(data: CreateGoalData): Promise<Goal> {
    const goal = {
      ...data,
      id: crypto.randomUUID(),
      currentAmount: data.currentAmount || 0,
      createdAt: new Date(),
      updatedAt: new Date()
    } as Goal
    
    await db.goals.add(goal)
    return goal
  }

  async getGoals(): Promise<Goal[]> {
    return await db.goals.orderBy('targetDate').toArray()
  }

  async getGoal(id: string): Promise<Goal | null> {
    return await db.goals.get(id) || null
  }

  async updateGoal(data: UpdateGoalData): Promise<Goal> {
    const updatedData = {
      ...data,
      updatedAt: new Date()
    }
    
    await db.goals.update(data.id, updatedData)
    const goal = await db.goals.get(data.id)
    if (!goal) {
      throw new Error('Goal not found')
    }
    return goal
  }

  async deleteGoal(id: string): Promise<void> {
    await db.goals.delete(id)
  }

  // Recommendations methods
  async createRecommendation(data: CreateRecommendationData): Promise<Recommendation> {
    const recommendation: Recommendation = {
      ...data,
      id: crypto.randomUUID(),
      userId: 'default-user', // TODO: Get from auth context
      rationale: data.reasoning,
      actionItems: data.actionItems.map((item, index) => ({
        id: `action-${crypto.randomUUID()}-${index}`,
        description: item,
        completed: false
      })),
      expectedImpact: {},
      implementationDifficulty: 'easy',
      status: 'pending',
      createdAt: new Date(),
      updatedAt: new Date(),
      reasoning: data.reasoning,
      implemented: false
    }
    
    await db.recommendations.add(recommendation)
    return recommendation
  }

  async getRecommendations(): Promise<Recommendation[]> {
    return await db.recommendations.orderBy('createdAt').reverse().toArray()
  }

  async getRecommendation(id: string): Promise<Recommendation | null> {
    return await db.recommendations.get(id) || null
  }

  async updateRecommendation(data: UpdateRecommendationData): Promise<Recommendation> {
    await db.recommendations.update(data.id, data)
    const recommendation = await db.recommendations.get(data.id)
    if (!recommendation) {
      throw new Error('Recommendation not found')
    }
    return recommendation
  }

  async markRecommendationImplemented(id: string): Promise<Recommendation> {
    const updateData = {
      implemented: true,
      implementedAt: new Date()
    }
    
    await db.recommendations.update(id, updateData)
    const recommendation = await db.recommendations.get(id)
    if (!recommendation) {
      throw new Error('Recommendation not found')
    }
    return recommendation
  }

  async deleteRecommendation(id: string): Promise<void> {
    await db.recommendations.delete(id)
  }

  async clearRecommendations(): Promise<void> {
    await db.recommendations.clear()
  }

  // Settings methods
  async getSettings(): Promise<AppSettings> {
    const settings = await db.settings.toArray()
    return settings.length > 0 ? settings[0] : this.getDefaultSettings()
  }

  async updateSettings(settings: Partial<AppSettings>): Promise<AppSettings> {
    const existing = await this.getSettings()
    const updated = { ...existing, ...settings }
    
    await db.settings.clear()
    await db.settings.add({ ...updated, id: 1 } as AppSettings & { id: number })
    
    return updated
  }

  private getDefaultSettings(): AppSettings {
    return {
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
  }

  // Utility methods
  async getStorageQuota(): Promise<StorageQuota> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate()
      return {
        usage: estimate.usage || 0,
        quota: estimate.quota || 0,
        available: (estimate.quota || 0) - (estimate.usage || 0)
      }
    }
    
    return {
      usage: 0,
      quota: 0,
      available: 0
    }
  }

  async clearAllData(): Promise<void> {
    await Promise.all([
      db.profiles.clear(),
      db.holdings.clear(),
      db.goals.clear(),
      db.recommendations.clear(),
      db.settings.clear()
    ])
  }

  async exportData(): Promise<string> {
    const [profiles, holdings, goals, recommendations, settings] = await Promise.all([
      db.profiles.toArray(),
      db.holdings.toArray(),
      db.goals.toArray(),
      db.recommendations.toArray(),
      this.getSettings()
    ])

    const exportData = {
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      data: {
        profiles,
        holdings,
        goals,
        recommendations,
        settings
      }
    }

    return JSON.stringify(exportData, null, 2)
  }

  async importData(jsonData: string): Promise<void> {
    try {
      const data = JSON.parse(jsonData)
      
      if (!data.data) {
        throw new Error('Invalid import format')
      }

      // Clear existing data
      await this.clearAllData()

      // Import data
      if (data.data.profiles?.length) {
        await db.profiles.bulkAdd(data.data.profiles)
      }
      if (data.data.holdings?.length) {
        await db.holdings.bulkAdd(data.data.holdings)
      }
      if (data.data.goals?.length) {
        await db.goals.bulkAdd(data.data.goals)
      }
      if (data.data.recommendations?.length) {
        await db.recommendations.bulkAdd(data.data.recommendations)
      }
      if (data.data.settings) {
        await this.updateSettings(data.data.settings)
      }
    } catch (error) {
      throw new Error(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }
}

export const storageService = new StorageService()