import { describe, it, expect } from 'vitest'
import {
  validateProfile,
  validateGoal,
  sanitizeNumericInput,
  sanitizeStringInput,
  isValidEmail,
  isValidNumber
} from '../utils/validation'

describe('Validation Utils', () => {
  describe('validateProfile', () => {
    it('should validate a correct profile', () => {
      const validProfile = {
        name: 'John Doe',
        age: 30,
        monthlyIncome: 5000,
        monthlySavings: 1000,
        monthlyExpenses: 3000,
        currentDebt: 10000,
        emergencyFund: 5000,
        riskTolerance: 'medium' as const
      }

      const result = validateProfile(validProfile)
      expect(result.isValid).toBe(true)
      expect(Object.keys(result.errors)).toHaveLength(0)
    })

    it('should reject profile with invalid name', () => {
      const invalidProfile = {
        name: '',
        age: 30,
        monthlyIncome: 5000,
        monthlySavings: 1000,
        monthlyExpenses: 3000,
        riskTolerance: 'medium' as const
      }

      const result = validateProfile(invalidProfile)
      expect(result.isValid).toBe(false)
      expect(result.errors.name).toBeDefined()
    })

    it('should reject profile with invalid age', () => {
      const invalidProfile = {
        name: 'John Doe',
        age: 15, // Too young
        monthlyIncome: 5000,
        monthlySavings: 1000,
        monthlyExpenses: 3000,
        riskTolerance: 'medium' as const
      }

      const result = validateProfile(invalidProfile)
      expect(result.isValid).toBe(false)
      expect(result.errors.age).toBeDefined()
    })

    it('should reject profile with negative financial values', () => {
      const invalidProfile = {
        name: 'John Doe',
        age: 30,
        monthlyIncome: -1000, // Negative income
        monthlySavings: 1000,
        monthlyExpenses: 3000,
        riskTolerance: 'medium' as const
      }

      const result = validateProfile(invalidProfile)
      expect(result.isValid).toBe(false)
      expect(result.errors.monthlyIncome).toBeDefined()
    })
  })

  describe('validateGoal', () => {
    it('should validate a correct goal', () => {
      const validGoal = {
        name: 'Emergency Fund',
        type: 'emergency' as const,
        targetAmount: 10000,
        currentAmount: 2000,
        targetDate: new Date('2025-12-31'),
        monthlyContribution: 500
      }

      const result = validateGoal(validGoal)
      expect(result.isValid).toBe(true)
      expect(Object.keys(result.errors)).toHaveLength(0)
    })

    it('should reject goal with empty name', () => {
      const invalidGoal = {
        name: '',
        type: 'emergency' as const,
        targetAmount: 10000,
        targetDate: new Date('2025-12-31'),
        monthlyContribution: 500
      }

      const result = validateGoal(invalidGoal)
      expect(result.isValid).toBe(false)
      expect(result.errors.name).toBeDefined()
    })

    it('should reject goal with zero target amount', () => {
      const invalidGoal = {
        name: 'Emergency Fund',
        type: 'emergency' as const,
        targetAmount: 0,
        targetDate: new Date('2025-12-31'),
        monthlyContribution: 500
      }

      const result = validateGoal(invalidGoal)
      expect(result.isValid).toBe(false)
      expect(result.errors.targetAmount).toBeDefined()
    })
  })

  describe('sanitizeNumericInput', () => {
    it('should extract numbers from strings', () => {
      expect(sanitizeNumericInput('$1,234.56')).toBe(1234.56)
      expect(sanitizeNumericInput('1000')).toBe(1000)
      expect(sanitizeNumericInput('abc123def')).toBe(123)
    })

    it('should return 0 for non-numeric strings', () => {
      expect(sanitizeNumericInput('abc')).toBe(0)
      expect(sanitizeNumericInput('')).toBe(0)
    })

    it('should handle negative numbers', () => {
      expect(sanitizeNumericInput('-500')).toBe(-500)
    })
  })

  describe('sanitizeStringInput', () => {
    it('should trim and normalize whitespace', () => {
      expect(sanitizeStringInput('  hello   world  ')).toBe('hello world')
      expect(sanitizeStringInput('test')).toBe('test')
    })

    it('should handle empty strings', () => {
      expect(sanitizeStringInput('')).toBe('')
      expect(sanitizeStringInput('   ')).toBe('')
    })
  })

  describe('isValidEmail', () => {
    it('should validate correct email addresses', () => {
      expect(isValidEmail('test@example.com')).toBe(true)
      expect(isValidEmail('user.name@domain.co.uk')).toBe(true)
    })

    it('should reject invalid email addresses', () => {
      expect(isValidEmail('invalid-email')).toBe(false)
      expect(isValidEmail('test@')).toBe(false)
      expect(isValidEmail('@example.com')).toBe(false)
    })
  })

  describe('isValidNumber', () => {
    it('should validate positive numbers', () => {
      expect(isValidNumber(123)).toBe(true)
      expect(isValidNumber(0)).toBe(true)
      expect(isValidNumber(123.45)).toBe(true)
    })

    it('should reject invalid numbers', () => {
      expect(isValidNumber(-1)).toBe(false)
      expect(isValidNumber(NaN)).toBe(false)
      expect(isValidNumber(Infinity)).toBe(false)
      expect(isValidNumber('abc')).toBe(false)
    })
  })
})