import { describe, it, expect, beforeEach } from 'vitest'
import { useSimpleProfileStore } from '../stores/simpleProfileStore'
import { useSimpleGoalsStore } from '../stores/simpleGoalsStore'
import { useSimpleRecommendationsStore } from '../stores/simpleRecommendationsStore'

// Mock crypto.randomUUID for consistent testing
Object.defineProperty(global, 'crypto', {
  value: {
    randomUUID: () => 'test-uuid-123'
  }
})

describe('Store Tests', () => {
  describe('SimpleProfileStore', () => {
    beforeEach(() => {
      // Reset store state
      useSimpleProfileStore.getState().clearProfile()
    })

    it('should create a profile', async () => {
      const store = useSimpleProfileStore.getState()
      
      const profileData = {
        name: 'John Doe',
        age: 30,
        monthlyIncome: 5000,
        monthlySavings: 1000,
        monthlyExpenses: 3000,
        riskTolerance: 'medium' as const
      }

      await store.createProfile(profileData)
      
      const profile = store.getProfile()
      expect(profile).toBeTruthy()
      expect(profile?.name).toBe('John Doe')
      expect(profile?.age).toBe(30)
      expect(profile?.riskTolerance).toBe('medium')
    })

    it('should update a profile', async () => {
      const store = useSimpleProfileStore.getState()
      
      // Create initial profile
      await store.createProfile({
        name: 'John Doe',
        age: 30,
        monthlyIncome: 5000,
        monthlySavings: 1000,
        monthlyExpenses: 3000,
        riskTolerance: 'medium' as const
      })

      // Update profile
      await store.updateProfile({ age: 31, monthlySavings: 1200 })
      
      const profile = store.getProfile()
      expect(profile?.age).toBe(31)
      expect(profile?.monthlySavings).toBe(1200)
      expect(profile?.name).toBe('John Doe') // Should remain unchanged
    })
  })

  describe('SimpleGoalsStore', () => {
    beforeEach(() => {
      // Reset store state
      useSimpleGoalsStore.setState({ goals: [] })
    })

    it('should add a goal', async () => {
      const store = useSimpleGoalsStore.getState()
      const userId = 'test-user-123'
      
      const goalData = {
        type: 'emergency' as const,
        name: 'Emergency Fund',
        targetAmount: 10000,
        currentAmount: 2000,
        targetDate: new Date('2025-12-31'),
        monthlyContribution: 500
      }

      await store.addGoal(userId, goalData)
      
      const goals = store.getGoalsByUser(userId)
      expect(goals).toHaveLength(1)
      expect(goals[0].name).toBe('Emergency Fund')
      expect(goals[0].targetAmount).toBe(10000)
    })

    it('should update goal progress', async () => {
      const store = useSimpleGoalsStore.getState()
      const userId = 'test-user-123'
      
      // Add a goal first
      await store.addGoal(userId, {
        type: 'emergency' as const,
        name: 'Emergency Fund',
        targetAmount: 10000,
        currentAmount: 2000,
        targetDate: new Date('2025-12-31'),
        monthlyContribution: 500
      })

      const goals = store.getGoalsByUser(userId)
      const goalId = goals[0].id

      // Update progress
      await store.updateGoalProgress(goalId, 3000)
      
      const updatedGoals = store.getGoalsByUser(userId)
      expect(updatedGoals[0].currentAmount).toBe(3000)
    })

    it('should delete a goal', async () => {
      const store = useSimpleGoalsStore.getState()
      const userId = 'test-user-123'
      
      // Add a goal first
      await store.addGoal(userId, {
        type: 'emergency' as const,
        name: 'Emergency Fund',
        targetAmount: 10000,
        targetDate: new Date('2025-12-31'),
        monthlyContribution: 500
      })

      const goals = store.getGoalsByUser(userId)
      expect(goals).toHaveLength(1)

      // Delete the goal
      await store.deleteGoal(goals[0].id)
      
      const remainingGoals = store.getGoalsByUser(userId)
      expect(remainingGoals).toHaveLength(0)
    })
  })

  describe('SimpleRecommendationsStore', () => {
    beforeEach(() => {
      // Reset store state
      useSimpleRecommendationsStore.setState({ recommendations: [] })
    })

    it('should generate recommendations based on profile', async () => {
      const store = useSimpleRecommendationsStore.getState()
      
      const profile = {
        id: 'test-user-123',
        name: 'John Doe',
        age: 30,
        monthlyIncome: 3000,
        monthlySavings: 200, // Low savings rate
        monthlyExpenses: 2500,
        currentDebt: 15000, // High debt
        emergencyFund: 500, // Low emergency fund
        riskTolerance: 'medium' as const,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      await store.generateRecommendations(profile, [])
      
      const recommendations = store.getRecommendationsByUser(profile.id)
      expect(recommendations.length).toBeGreaterThan(0)
      
      // Should have high priority recommendations for emergency fund and debt
      const highPriorityRecs = recommendations.filter(r => r.priority === 'high')
      expect(highPriorityRecs.length).toBeGreaterThan(0)
    })

    it('should dismiss recommendations', async () => {
      const store = useSimpleRecommendationsStore.getState()
      
      const profile = {
        id: 'test-user-123',
        name: 'John Doe',
        age: 30,
        monthlyIncome: 3000,
        monthlySavings: 200,
        monthlyExpenses: 2500,
        currentDebt: 15000,
        emergencyFund: 500,
        riskTolerance: 'medium' as const,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      await store.generateRecommendations(profile, [])
      
      const initialRecs = store.getRecommendationsByUser(profile.id)
      expect(initialRecs.length).toBeGreaterThan(0)

      // Dismiss first recommendation
      store.dismissRecommendation(initialRecs[0].id)
      
      const remainingRecs = store.getRecommendationsByUser(profile.id)
      expect(remainingRecs.length).toBe(initialRecs.length - 1)
    })
  })
})