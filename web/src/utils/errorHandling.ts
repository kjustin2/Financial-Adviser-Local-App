// Error types for better error handling
export enum ErrorType {
  NETWORK = 'NETWORK',
  VALIDATION = 'VALIDATION',
  STORAGE = 'STORAGE',
  AUTHENTICATION = 'AUTHENTICATION',
  PERMISSION = 'PERMISSION',
  UNKNOWN = 'UNKNOWN'
}

export interface AppError extends Error {
  type: ErrorType
  code?: string
  details?: any
  recoverable?: boolean
  cause?: Error
}

// Create typed errors
export const createAppError = (
  type: ErrorType,
  message: string,
  options?: {
    code?: string
    details?: any
    recoverable?: boolean
    cause?: Error
  }
): AppError => {
  const error = new Error(message) as AppError
  error.type = type
  error.code = options?.code
  error.details = options?.details
  error.recoverable = options?.recoverable ?? true
  
  if (options?.cause) {
    error.cause = options.cause
  }
  
  return error
}

// Error classification helpers
export const isNetworkError = (error: any): boolean => {
  return error?.type === ErrorType.NETWORK || 
         error?.message?.includes('fetch') ||
         error?.message?.includes('network') ||
         error?.code === 'NETWORK_ERROR'
}

export const isValidationError = (error: any): boolean => {
  return error?.type === ErrorType.VALIDATION ||
         error?.name === 'ZodError' ||
         error?.message?.includes('validation')
}

export const isStorageError = (error: any): boolean => {
  return error?.type === ErrorType.STORAGE ||
         error?.message?.includes('IndexedDB') ||
         error?.message?.includes('storage') ||
         error?.name === 'QuotaExceededError'
}

export const isRecoverableError = (error: any): boolean => {
  return error?.recoverable !== false && 
         !error?.message?.includes('fatal') &&
         error?.type !== ErrorType.PERMISSION
}

// Error recovery strategies
export const getErrorRecoveryActions = (error: any) => {
  const actions: Array<{ label: string; action: () => void; primary?: boolean }> = []

  if (isNetworkError(error)) {
    actions.push({
      label: 'Retry',
      action: () => window.location.reload(),
      primary: true
    })
    actions.push({
      label: 'Check Connection',
      action: () => {
        if (navigator.onLine) {
          alert('Your internet connection appears to be working. The issue may be temporary.')
        } else {
          alert('You appear to be offline. Please check your internet connection.')
        }
      }
    })
  }

  if (isStorageError(error)) {
    actions.push({
      label: 'Clear Data',
      action: () => {
        if (confirm('This will clear all your local data. Are you sure?')) {
          localStorage.clear()
          if ('indexedDB' in window) {
            indexedDB.deleteDatabase('financial-advisor-db')
          }
          window.location.reload()
        }
      }
    })
    actions.push({
      label: 'Check Storage',
      action: () => {
        navigator.storage?.estimate().then(estimate => {
          const used = estimate.usage || 0
          const quota = estimate.quota || 0
          const usedMB = Math.round(used / 1024 / 1024)
          const quotaMB = Math.round(quota / 1024 / 1024)
          alert(`Storage used: ${usedMB}MB of ${quotaMB}MB available`)
        })
      }
    })
  }

  if (isValidationError(error)) {
    actions.push({
      label: 'Go Back',
      action: () => window.history.back(),
      primary: true
    })
  }

  // Default actions
  if (actions.length === 0) {
    actions.push({
      label: 'Refresh Page',
      action: () => window.location.reload(),
      primary: true
    })
  }

  actions.push({
    label: 'Report Issue',
    action: () => {
      const errorReport = {
        message: error?.message || 'Unknown error',
        type: error?.type || 'UNKNOWN',
        stack: error?.stack,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString()
      }
      
      // In a real app, this would send to an error reporting service
      console.error('Error Report:', errorReport)
      
      // For now, copy to clipboard
      navigator.clipboard?.writeText(JSON.stringify(errorReport, null, 2))
        .then(() => alert('Error details copied to clipboard'))
        .catch(() => alert('Error details logged to console'))
    }
  })

  return actions
}

// User-friendly error messages
export const getUserFriendlyErrorMessage = (error: any): { title: string; message: string } => {
  if (isNetworkError(error)) {
    return {
      title: 'Connection Problem',
      message: 'Unable to connect to the service. Please check your internet connection and try again.'
    }
  }

  if (isStorageError(error)) {
    return {
      title: 'Storage Issue',
      message: 'There was a problem saving your data. Your device may be running low on storage space.'
    }
  }

  if (isValidationError(error)) {
    return {
      title: 'Invalid Data',
      message: 'The information provided is not valid. Please check your input and try again.'
    }
  }

  if (error?.type === ErrorType.AUTHENTICATION) {
    return {
      title: 'Authentication Required',
      message: 'You need to be signed in to access this feature.'
    }
  }

  if (error?.type === ErrorType.PERMISSION) {
    return {
      title: 'Permission Denied',
      message: 'You don\'t have permission to perform this action.'
    }
  }

  return {
    title: 'Something Went Wrong',
    message: error?.message || 'An unexpected error occurred. Please try again.'
  }
}

// Async error wrapper
export const withErrorHandling = async <T>(
  operation: () => Promise<T>,
  errorContext?: string
): Promise<T> => {
  try {
    return await operation()
  } catch (error) {
    console.error(`Error in ${errorContext || 'operation'}:`, error)
    
    // Enhance error with context
    if (error instanceof Error) {
      const appError = error as AppError
      if (!appError.type) {
        appError.type = ErrorType.UNKNOWN
      }
      if (errorContext && !appError.details) {
        appError.details = { context: errorContext }
      }
    }
    
    throw error
  }
}

// IndexedDB error handling
export const handleIndexedDBError = (error: any, operation: string) => {
  console.error(`IndexedDB error during ${operation}:`, error)
  
  if (error.name === 'QuotaExceededError') {
    throw createAppError(
      ErrorType.STORAGE,
      'Storage quota exceeded. Please free up some space.',
      { code: 'QUOTA_EXCEEDED', recoverable: true }
    )
  }
  
  if (error.name === 'VersionError') {
    throw createAppError(
      ErrorType.STORAGE,
      'Database version conflict. Please refresh the page.',
      { code: 'VERSION_ERROR', recoverable: true }
    )
  }
  
  throw createAppError(
    ErrorType.STORAGE,
    `Database operation failed: ${error.message}`,
    { code: 'DB_ERROR', cause: error }
  )
}

// Validation error handling
export const handleValidationError = (error: any, fieldName?: string) => {
  console.error('Validation error:', error)
  
  const message = fieldName 
    ? `Invalid ${fieldName}: ${error.message}`
    : `Validation failed: ${error.message}`
  
  throw createAppError(
    ErrorType.VALIDATION,
    message,
    { code: 'VALIDATION_ERROR', details: { field: fieldName }, cause: error }
  )
}

// Global error handler setup
export const setupGlobalErrorHandling = () => {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    console.error('Unhandled promise rejection:', event.reason)
    
    // Prevent the default browser error handling
    event.preventDefault()
    
    // You could show a toast notification here
    // toast.error('An unexpected error occurred', 'Please try refreshing the page')
  })

  // Handle JavaScript errors
  window.addEventListener('error', (event) => {
    console.error('Global error:', event.error)
    
    // Log error details
    const errorInfo = {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
      error: event.error
    }
    
    console.error('Error details:', errorInfo)
  })
}