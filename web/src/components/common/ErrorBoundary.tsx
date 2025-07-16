import React from 'react'
import { Button } from './Button'
import { Card, CardContent, CardHeader, CardTitle } from './Card'
import { getUserFriendlyErrorMessage, getErrorRecoveryActions, isRecoverableError } from '../../utils/errorHandling'
import { AlertTriangle, RefreshCw } from 'lucide-react'

interface ErrorBoundaryState {
  hasError: boolean
  error?: Error
}

interface ErrorBoundaryProps {
  children: React.ReactNode
  fallback?: React.ComponentType<{ error?: Error; resetError: () => void }>
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
  }

  resetError = () => {
    this.setState({ hasError: false, error: undefined })
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        const FallbackComponent = this.props.fallback
        return <FallbackComponent error={this.state.error} resetError={this.resetError} />
      }

      return <DefaultErrorFallback error={this.state.error} resetError={this.resetError} />
    }

    return this.props.children
  }
}

interface ErrorFallbackProps {
  error?: Error
  resetError: () => void
}

const DefaultErrorFallback: React.FC<ErrorFallbackProps> = ({ error, resetError }) => {
  const { title, message } = getUserFriendlyErrorMessage(error)
  const recoveryActions = getErrorRecoveryActions(error)
  const recoverable = isRecoverableError(error)

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-gray-50">
      <Card className="w-full max-w-lg">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <AlertTriangle className="h-6 w-6 text-red-600" />
          </div>
          <CardTitle className="text-xl font-semibold text-gray-900">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <p className="text-center text-gray-600">
            {message}
          </p>

          {recoverable && (
            <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
              <div className="flex">
                <RefreshCw className="h-5 w-5 text-blue-400 mt-0.5" />
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Don't worry, this can usually be fixed
                  </h3>
                  <p className="mt-1 text-sm text-blue-700">
                    Try one of the recovery options below, or refresh the page to start over.
                  </p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <details className="text-sm text-gray-500 bg-gray-50 rounded-md p-3">
              <summary className="cursor-pointer font-medium hover:text-gray-700">
                Technical Details
              </summary>
              <div className="mt-2 space-y-2">
                <div>
                  <strong>Error:</strong> {error.message}
                </div>
                {error.stack && (
                  <div>
                    <strong>Stack Trace:</strong>
                    <pre className="mt-1 text-xs whitespace-pre-wrap break-words bg-white p-2 rounded border">
                      {error.stack}
                    </pre>
                  </div>
                )}
              </div>
            </details>
          )}

          <div className="space-y-3">
            {/* Primary recovery actions */}
            <div className="flex flex-wrap gap-2 justify-center">
              {recoverable && (
                <Button onClick={resetError} variant="primary" className="flex items-center">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Try Again
                </Button>
              )}
              {recoveryActions
                .filter(action => action.primary)
                .map((action, index) => (
                  <Button
                    key={index}
                    onClick={action.action}
                    variant={action.primary ? "primary" : "outline"}
                  >
                    {action.label}
                  </Button>
                ))}
            </div>

            {/* Secondary recovery actions */}
            {recoveryActions.filter(action => !action.primary).length > 0 && (
              <details className="text-center">
                <summary className="cursor-pointer text-sm text-gray-600 hover:text-gray-800">
                  More Options
                </summary>
                <div className="mt-3 flex flex-wrap gap-2 justify-center">
                  {recoveryActions
                    .filter(action => !action.primary)
                    .map((action, index) => (
                      <Button
                        key={index}
                        onClick={action.action}
                        variant="ghost"
                        size="sm"
                      >
                        {action.label}
                      </Button>
                    ))}
                </div>
              </details>
            )}
          </div>

          <div className="text-center text-xs text-gray-500">
            If this problem persists, please contact support with the technical details above.
          </div>
        </CardContent>
      </Card>
    </div>
  )
}