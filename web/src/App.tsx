import React, { Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { LoadingSpinner, NavigationGuard } from './components/common'
import { ErrorBoundary } from './components/common/ErrorBoundary'

// Lazy load pages for better performance
const Dashboard = React.lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })))
const Portfolio = React.lazy(() => import('./pages/Portfolio').then(module => ({ default: module.Portfolio })))
const Goals = React.lazy(() => import('./pages/Goals').then(module => ({ default: module.Goals })))
const Analysis = React.lazy(() => import('./pages/Analysis').then(module => ({ default: module.Analysis })))
const Profile = React.lazy(() => import('./pages/Profile').then(module => ({ default: module.Profile })))
const Onboarding = React.lazy(() => import('./pages/Onboarding').then(module => ({ default: module.Onboarding })))

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-64">
    <LoadingSpinner size="lg" />
  </div>
)

// Protected route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <NavigationGuard requiresProfile={true}>
    <Layout>
      {children}
    </Layout>
  </NavigationGuard>
)

function App() {
  return (
    <ErrorBoundary>
      <Router basename="/Financial-Adviser-Local-App">
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Onboarding route - no profile required */}
            <Route 
              path="/onboarding" 
              element={
                <NavigationGuard requiresProfile={false}>
                  <Onboarding />
                </NavigationGuard>
              } 
            />
            
            {/* Protected routes - require profile */}
            <Route 
              path="/" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/portfolio" 
              element={
                <ProtectedRoute>
                  <Portfolio />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/goals" 
              element={
                <ProtectedRoute>
                  <Goals />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/analysis" 
              element={
                <ProtectedRoute>
                  <Analysis />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/profile" 
              element={
                <ProtectedRoute>
                  <Profile />
                </ProtectedRoute>
              } 
            />
            
            {/* Catch-all route - redirect to dashboard or onboarding */}
            <Route 
              path="*" 
              element={
                <NavigationGuard requiresProfile={true} redirectTo="/onboarding">
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                </NavigationGuard>
              } 
            />
          </Routes>
        </Suspense>
      </Router>
    </ErrorBoundary>
  )
}

export default App