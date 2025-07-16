import Dexie, { Table } from 'dexie'
import type { UserProfile, Holding, Goal, Recommendation, AppSettings } from '../types'

export class FinancialAdvisorDB extends Dexie {
  profiles!: Table<UserProfile>
  holdings!: Table<Holding>
  goals!: Table<Goal>
  recommendations!: Table<Recommendation>
  settings!: Table<AppSettings & { id: number }>

  constructor() {
    super('FinancialAdvisorDB')
    
    this.version(1).stores({
      profiles: '++id, name, experienceLevel, riskTolerance, createdAt',
      holdings: '++id, symbol, securityType, purchaseDate, lastUpdated',
      goals: '++id, name, category, targetDate, priority, createdAt',
      recommendations: '++id, type, priority, implemented, createdAt',
      settings: '++id'
    })

    this.profiles.hook('creating', function (_, obj) {
      obj.id = crypto.randomUUID()
      obj.createdAt = new Date()
      obj.updatedAt = new Date()
    })

    this.profiles.hook('updating', function (modifications) {
      (modifications as Record<string, unknown>).updatedAt = new Date()
    })

    this.holdings.hook('creating', function (_, obj) {
      obj.id = crypto.randomUUID()
      obj.lastUpdated = new Date()
    })

    this.holdings.hook('updating', function (modifications) {
      (modifications as Record<string, unknown>).lastUpdated = new Date()
    })

    this.goals.hook('creating', function (_, obj) {
      obj.id = crypto.randomUUID()
      obj.createdAt = new Date()
      obj.updatedAt = new Date()
    })

    this.goals.hook('updating', function (modifications) {
      (modifications as Record<string, unknown>).updatedAt = new Date()
    })

    this.recommendations.hook('creating', function (_, obj) {
      obj.id = crypto.randomUUID()
      obj.createdAt = new Date()
    })
  }
}

export const db = new FinancialAdvisorDB()