/**
 * Frontend logging utility
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: string;
  data?: any;
  error?: Error;
  url?: string;
  userAgent?: string;
  userId?: string;
}

class Logger {
  private isDevelopment: boolean;
  private maxLogEntries: number = 1000;
  private logBuffer: LogEntry[] = [];
  
  constructor() {
    this.isDevelopment = import.meta.env.MODE === 'development';
    this.setupErrorHandlers();
  }

  private setupErrorHandlers() {
    // Global error handler
    window.addEventListener('error', (event) => {
      this.error('Unhandled JavaScript error', {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error
      });
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.error('Unhandled promise rejection', {
        reason: event.reason,
        promise: event.promise
      });
    });

    // React error boundary fallback
    window.addEventListener('react-error', (event: any) => {
      this.error('React error boundary triggered', {
        componentStack: event.detail?.componentStack,
        errorBoundary: event.detail?.errorBoundary,
        error: event.detail?.error
      });
    });
  }

  private createLogEntry(
    level: LogLevel,
    message: string,
    context?: string,
    data?: any,
    error?: Error
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
      data,
      error,
      url: window.location.href,
      userAgent: navigator.userAgent,
      userId: this.getCurrentUserId()
    };
  }

  private getCurrentUserId(): string | undefined {
    // Get user ID from localStorage or session storage
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user).id : undefined;
    } catch {
      return undefined;
    }
  }

  private addToBuffer(entry: LogEntry) {
    this.logBuffer.push(entry);
    
    // Keep buffer size manageable
    if (this.logBuffer.length > this.maxLogEntries) {
      this.logBuffer = this.logBuffer.slice(-this.maxLogEntries);
    }
  }

  private formatMessage(entry: LogEntry): string {
    const prefix = `[${entry.timestamp}] ${entry.level.toUpperCase()}`;
    const context = entry.context ? ` [${entry.context}]` : '';
    return `${prefix}${context}: ${entry.message}`;
  }

  private consoleLog(entry: LogEntry) {
    if (!this.isDevelopment) return;

    const message = this.formatMessage(entry);
    const consoleMethod = console[entry.level] || console.log;
    
    if (entry.data || entry.error) {
      consoleMethod(message, entry.data || entry.error);
    } else {
      consoleMethod(message);
    }
  }

  debug(message: string, context?: string, data?: any) {
    const entry = this.createLogEntry('debug', message, context, data);
    this.addToBuffer(entry);
    this.consoleLog(entry);
  }

  info(message: string, context?: string, data?: any) {
    const entry = this.createLogEntry('info', message, context, data);
    this.addToBuffer(entry);
    this.consoleLog(entry);
  }

  warn(message: string, context?: string, data?: any) {
    const entry = this.createLogEntry('warn', message, context, data);
    this.addToBuffer(entry);
    this.consoleLog(entry);
  }

  error(message: string, context?: string, data?: any, error?: Error) {
    const entry = this.createLogEntry('error', message, context, data, error);
    this.addToBuffer(entry);
    this.consoleLog(entry);
    
    // Send critical errors to backend in production
    if (!this.isDevelopment) {
      this.sendErrorToBackend(entry);
    }
  }

  private async sendErrorToBackend(entry: LogEntry) {
    try {
      await fetch('/api/v1/logs/error', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timestamp: entry.timestamp,
          level: entry.level,
          message: entry.message,
          context: entry.context,
          data: entry.data,
          error: entry.error ? {
            name: entry.error.name,
            message: entry.error.message,
            stack: entry.error.stack
          } : undefined,
          url: entry.url,
          userAgent: entry.userAgent,
          userId: entry.userId
        })
      });
    } catch (err) {
      console.error('Failed to send error to backend:', err);
    }
  }

  // Performance logging
  performance(operation: string, startTime: number, context?: string, data?: any) {
    const duration = performance.now() - startTime;
    const message = `${operation} completed in ${duration.toFixed(2)}ms`;
    
    if (duration > 1000) {
      this.warn(message, context, data);
    } else {
      this.debug(message, context, data);
    }
  }

  // API request logging
  apiRequest(method: string, url: string, data?: any) {
    this.debug(`API Request: ${method} ${url}`, 'API', data);
  }

  apiResponse(method: string, url: string, status: number, duration: number, data?: any) {
    const message = `API Response: ${method} ${url} - ${status} (${duration}ms)`;
    
    if (status >= 400) {
      this.error(message, 'API', data);
    } else if (duration > 2000) {
      this.warn(message, 'API', data);
    } else {
      this.debug(message, 'API', data);
    }
  }

  // User action logging
  userAction(action: string, context?: string, data?: any) {
    this.info(`User Action: ${action}`, context, data);
  }

  // Navigation logging
  navigation(from: string, to: string, data?: any) {
    this.info(`Navigation: ${from} → ${to}`, 'Navigation', data);
  }

  // Get logs for debugging
  getLogs(level?: LogLevel, limit?: number): LogEntry[] {
    let logs = this.logBuffer;
    
    if (level) {
      logs = logs.filter(entry => entry.level === level);
    }
    
    if (limit) {
      logs = logs.slice(-limit);
    }
    
    return logs;
  }

  // Clear logs
  clearLogs() {
    this.logBuffer = [];
  }

  // Export logs for debugging
  exportLogs(): string {
    return JSON.stringify(this.logBuffer, null, 2);
  }
}

// Create singleton instance
export const logger = new Logger();

// React Error Boundary logging helper
export const logReactError = (error: Error, errorInfo: any) => {
  logger.error('React Error Boundary', 'React', {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack
    },
    errorInfo
  });
};

// Hook for logging component lifecycle
export const useLogger = (componentName: string) => {
  const componentLogger = {
    mount: (data?: any) => logger.debug(`${componentName} mounted`, 'Component', data),
    unmount: (data?: any) => logger.debug(`${componentName} unmounted`, 'Component', data),
    update: (data?: any) => logger.debug(`${componentName} updated`, 'Component', data),
    error: (error: Error, data?: any) => logger.error(`${componentName} error`, 'Component', data, error),
    action: (action: string, data?: any) => logger.info(`${componentName}: ${action}`, 'Component', data)
  };
  
  return componentLogger;
};

// Performance monitoring hook
export const usePerformance = (operationName: string) => {
  const startTime = performance.now();
  
  return {
    end: (data?: any) => {
      logger.performance(operationName, startTime, 'Performance', data);
    }
  };
};

export default logger;