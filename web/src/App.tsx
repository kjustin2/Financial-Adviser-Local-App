import React, { Suspense } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Layout } from './components/layout/Layout'
import { LoadingSpinner } from './components/common'
import { ErrorBoundary } from './components/common/ErrorBoundary'

// Lazy load pages for better performance
const Dashboard = React.lazy(() => import('./pages/Dashboard').then(module => ({ default: module.Dashboard })))
const Portfolio = React.lazy(() => import('./pages/Portfolio').then(module => ({ default: module.Portfolio })))
const Goals = React.lazy(() => import('./pages/Goals').then(module => ({ default: module.Goals })))
const Analysis = React.lazy(() => import('./pages/Analysis').then(module => ({ default: module.Analysis })))
const Profile = React.lazy(() => import('./pages/Profile').then(module => ({ default: module.Profile })))

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-64">
    <LoadingSpinner size="lg" />
  </div>
)

function App() {
  return (
    <ErrorBoundary>
      <Router basename="/Financial-Adviser-Local-App">
        <Layout>
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/goals" element={<Goals />} />
              <Route path="/analysis" element={<Analysis />} />
              <Route path="/profile" element={<Profile />} />
            </Routes>
          </Suspense>
        </Layout>
      </Router>
    </ErrorBoundary>
  )
}

export default App