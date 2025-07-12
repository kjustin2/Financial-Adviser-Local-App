/**
 * Frontend debugging utilities for error analysis and troubleshooting
 */

import { logger } from './logger'

export interface ErrorReport {
  id: string
  timestamp: string
  error: {
    name: string
    message: string
    stack?: string
  }
  context: {
    component?: string
    action?: string
    userAgent: string
    url: string
    userId?: string
  }
  formData?: Record<string, any>
  apiResponse?: any
  suggestions: string[]
}

export interface ValidationAnalysis {
  field: string
  value: any
  isValid: boolean
  errors: string[]
  suggestions: string[]
}

class DebugUtil {
  private static instance: DebugUtil
  private errorHistory: ErrorReport[] = []
  private readonly maxHistorySize = 50

  static getInstance(): DebugUtil {
    if (!DebugUtil.instance) {
      DebugUtil.instance = new DebugUtil()
    }
    return DebugUtil.instance
  }

  /**
   * Create a comprehensive error report
   */
  createErrorReport(
    error: Error,
    context: {
      component?: string
      action?: string
      userId?: string
    } = {},
    formData?: Record<string, any>,
    apiResponse?: any
  ): ErrorReport {
    const errorId = `FE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    
    const report: ErrorReport = {
      id: errorId,
      timestamp: new Date().toISOString(),
      error: {
        name: error.name,
        message: error.message,
        stack: error.stack
      },
      context: {
        ...context,
        userAgent: navigator.userAgent,
        url: window.location.href
      },
      formData,
      apiResponse,
      suggestions: this.generateSuggestions(error, formData, apiResponse)
    }

    // Add to history
    this.errorHistory.unshift(report)
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory = this.errorHistory.slice(0, this.maxHistorySize)
    }

    // Log the error
    logger.error(
      `Frontend error in ${context.component || 'unknown'}: ${error.message}`,
      context.component || 'Debug',
      {
        errorId,
        action: context.action,
        formData: formData ? Object.keys(formData) : undefined,
        hasApiResponse: !!apiResponse
      },
      error
    )

    return report
  }

  /**
   * Generate suggestions based on error type and context
   */
  private generateSuggestions(
    error: Error,
    formData?: Record<string, any>,
    apiResponse?: any
  ): string[] {
    const suggestions: string[] = []

    // Network/API errors
    if (error.name === 'NetworkError' || error.message.includes('fetch')) {
      suggestions.push('Check network connection')
      suggestions.push('Verify API server is running')
      suggestions.push('Check for CORS issues')
    }

    // Validation errors
    if (error.name === 'ValidationError' || apiResponse?.status === 422) {
      suggestions.push('Check form field validation')
      suggestions.push('Verify required fields are filled')
      suggestions.push('Check field format and length constraints')
    }

    // Authentication errors
    if (apiResponse?.status === 401) {
      suggestions.push('Check authentication token')
      suggestions.push('User may need to log in again')
      suggestions.push('Verify user permissions')
    }

    // Server errors
    if (apiResponse?.status >= 500) {
      suggestions.push('Server error - check backend logs')
      suggestions.push('Try again after a moment')
      suggestions.push('Contact support if problem persists')
    }

    // Form-specific suggestions
    if (formData) {
      const emptyFields = Object.entries(formData)
        .filter(([_, value]) => !value || (typeof value === 'string' && value.trim() === ''))
        .map(([key, _]) => key)

      if (emptyFields.length > 0) {
        suggestions.push(`Fill in required fields: ${emptyFields.join(', ')}`)
      }
    }

    // Generic fallback
    if (suggestions.length === 0) {
      suggestions.push('Check browser console for detailed error information')
      suggestions.push('Try refreshing the page')
      suggestions.push('Clear browser cache if problem persists')
    }

    return suggestions
  }

  /**
   * Analyze form validation state
   */
  analyzeFormValidation(formData: Record<string, any>): ValidationAnalysis[] {
    const analyses: ValidationAnalysis[] = []

    Object.entries(formData).forEach(([field, value]) => {
      const analysis: ValidationAnalysis = {
        field,
        value,
        isValid: true,
        errors: [],
        suggestions: []
      }

      // Email validation
      if (field.toLowerCase().includes('email')) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) {
          analysis.isValid = false
          analysis.errors.push('Invalid email format')
          analysis.suggestions.push('Enter a valid email address (e.g., user@example.com)')
        }
      }

      // Password validation
      if (field.toLowerCase().includes('password')) {
        const issues: string[] = []
        
        if (typeof value === 'string') {
          if (value.length < 8) {
            issues.push('Must be at least 8 characters')
          }
          if (!/[a-z]/.test(value)) {
            issues.push('Must contain lowercase letters')
          }
          if (!/[A-Z]/.test(value)) {
            issues.push('Must contain uppercase letters')
          }
          if (!/\d/.test(value)) {
            issues.push('Must contain numbers')
          }
          if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
            issues.push('Must contain special characters')
          }
        }

        if (issues.length > 0) {
          analysis.isValid = false
          analysis.errors = issues
          analysis.suggestions.push('Use a strong password with mixed case, numbers, and symbols')
        }
      }

      // Name validation
      if (field.toLowerCase().includes('name')) {
        if (!value || (typeof value === 'string' && value.trim().length < 2)) {
          analysis.isValid = false
          analysis.errors.push('Must be at least 2 characters')
          analysis.suggestions.push('Enter a valid name')
        }
      }

      analyses.push(analysis)
    })

    return analyses
  }

  /**
   * Get error history for debugging
   */
  getErrorHistory(): ErrorReport[] {
    return [...this.errorHistory]
  }

  /**
   * Get recent errors (last 10)
   */
  getRecentErrors(): ErrorReport[] {
    return this.errorHistory.slice(0, 10)
  }

  /**
   * Clear error history
   */
  clearErrorHistory(): void {
    this.errorHistory = []
  }

  /**
   * Export error report for support
   */
  exportErrorReport(errorId?: string): string {
    const errors = errorId 
      ? this.errorHistory.filter(e => e.id === errorId)
      : this.getRecentErrors()

    const report = {
      exportTimestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      errors
    }

    return JSON.stringify(report, null, 2)
  }

  /**
   * Check system capabilities and potential issues
   */
  checkSystemHealth(): Record<string, any> {
    const health = {
      timestamp: new Date().toISOString(),
      browser: {
        userAgent: navigator.userAgent,
        cookiesEnabled: navigator.cookieEnabled,
        language: navigator.language,
        onLine: navigator.onLine
      },
      localStorage: {
        available: false,
        error: null as string | null
      },
      sessionStorage: {
        available: false,
        error: null as string | null
      },
      network: {
        onLine: navigator.onLine,
        effectiveType: (navigator as any).connection?.effectiveType || 'unknown'
      },
      performance: {
        timing: performance.timing ? {
          loadTime: performance.timing.loadEventEnd - performance.timing.navigationStart,
          domReady: performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart
        } : null
      }
    }

    // Test localStorage
    try {
      localStorage.setItem('test', 'test')
      localStorage.removeItem('test')
      health.localStorage.available = true
    } catch (error) {
      health.localStorage.error = (error as Error).message
    }

    // Test sessionStorage
    try {
      sessionStorage.setItem('test', 'test')
      sessionStorage.removeItem('test')
      health.sessionStorage.available = true
    } catch (error) {
      health.sessionStorage.error = (error as Error).message
    }

    return health
  }

  /**
   * Analyze API response for common issues
   */
  analyzeApiResponse(response: any, requestData?: any): Record<string, any> {
    const analysis = {
      status: response.status,
      statusText: response.statusText,
      hasError: response.status >= 400,
      errorType: 'none' as string,
      issues: [] as string[],
      suggestions: [] as string[]
    }

    if (response.status >= 500) {
      analysis.errorType = 'server'
      analysis.issues.push('Server error occurred')
      analysis.suggestions.push('Contact support or try again later')
    } else if (response.status >= 400) {
      analysis.errorType = 'client'
      
      if (response.status === 400) {
        analysis.issues.push('Bad request - invalid data sent')
        analysis.suggestions.push('Check form data format and validation')
      } else if (response.status === 401) {
        analysis.issues.push('Authentication required')
        analysis.suggestions.push('Log in or refresh authentication token')
      } else if (response.status === 403) {
        analysis.issues.push('Access forbidden')
        analysis.suggestions.push('Check user permissions')
      } else if (response.status === 404) {
        analysis.issues.push('Resource not found')
        analysis.suggestions.push('Check API endpoint URL')
      } else if (response.status === 422) {
        analysis.issues.push('Validation error')
        analysis.suggestions.push('Check field validation and requirements')
      } else if (response.status === 429) {
        analysis.issues.push('Rate limit exceeded')
        analysis.suggestions.push('Wait a moment before trying again')
      }
    }

    return analysis
  }
}

// Export singleton instance
export const debugUtil = DebugUtil.getInstance()

// Development-only debug helpers
export const devDebug = {
  /**
   * Log component render with props
   */
  logRender: (componentName: string, props?: Record<string, any>) => {
    if (import.meta.env.DEV) {
      console.group(`🔄 ${componentName} render`)
      if (props) {
        console.log('Props:', props)
      }
      console.groupEnd()
    }
  },

  /**
   * Log form submission
   */
  logFormSubmit: (formName: string, data: Record<string, any>) => {
    if (import.meta.env.DEV) {
      console.group(`📝 ${formName} submit`)
      console.log('Data:', data)
      console.log('Validation:', debugUtil.analyzeFormValidation(data))
      console.groupEnd()
    }
  },

  /**
   * Log API call
   */
  logApiCall: (method: string, url: string, data?: any) => {
    if (import.meta.env.DEV) {
      console.group(`🌐 API ${method} ${url}`)
      if (data) {
        console.log('Request data:', data)
      }
      console.groupEnd()
    }
  },

  /**
   * Show system health in console
   */
  showSystemHealth: () => {
    if (import.meta.env.DEV) {
      console.group('🔍 System Health Check')
      console.log(debugUtil.checkSystemHealth())
      console.groupEnd()
    }
  }
}