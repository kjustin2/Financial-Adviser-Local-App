import { describe, it, expect } from 'vitest'
import {
  formatCurrency,
  formatPercentage,
  formatNumber,
  formatDate,
  formatCompactCurrency
} from '../utils/formatters'

describe('Formatters', () => {
  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      expect(formatCurrency(1234)).toBe('$1,234')
      expect(formatCurrency(0)).toBe('$0')
      expect(formatCurrency(1234.56)).toBe('$1,235') // Rounds to nearest dollar
    })

    it('should handle negative amounts', () => {
      expect(formatCurrency(-500)).toBe('-$500')
    })

    it('should handle large amounts', () => {
      expect(formatCurrency(1000000)).toBe('$1,000,000')
    })
  })

  describe('formatPercentage', () => {
    it('should format percentages correctly', () => {
      expect(formatPercentage(25.5)).toBe('25.5%')
      expect(formatPercentage(100)).toBe('100.0%')
      expect(formatPercentage(0)).toBe('0.0%')
    })

    it('should respect decimal places', () => {
      expect(formatPercentage(25.567, 2)).toBe('25.57%')
      expect(formatPercentage(25.567, 0)).toBe('26%')
    })

    it('should handle negative percentages', () => {
      expect(formatPercentage(-5.5)).toBe('-5.5%')
    })
  })

  describe('formatNumber', () => {
    it('should format numbers with commas', () => {
      expect(formatNumber(1234)).toBe('1,234')
      expect(formatNumber(1000000)).toBe('1,000,000')
      expect(formatNumber(0)).toBe('0')
    })

    it('should handle decimal numbers', () => {
      expect(formatNumber(1234.56)).toBe('1,234.56')
    })
  })

  describe('formatDate', () => {
    it('should format dates correctly', () => {
      const date = new Date('2024-12-25')
      const formatted = formatDate(date)
      expect(formatted).toMatch(/12\/25\/2024/)
    })

    it('should handle string dates', () => {
      const formatted = formatDate('2024-01-15')
      expect(formatted).toMatch(/1\/15\/2024/)
    })
  })

  describe('formatCompactCurrency', () => {
    it('should format large amounts compactly', () => {
      expect(formatCompactCurrency(1500000)).toBe('$1.5M')
      expect(formatCompactCurrency(2500)).toBe('$2.5K')
      expect(formatCompactCurrency(500)).toBe('$500')
    })

    it('should handle edge cases', () => {
      expect(formatCompactCurrency(1000)).toBe('$1.0K')
      expect(formatCompactCurrency(1000000)).toBe('$1.0M')
      expect(formatCompactCurrency(0)).toBe('$0')
    })
  })
})