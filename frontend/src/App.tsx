import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { Layout } from '@/components/layout/Layout'
import { Dashboard } from '@/pages/Dashboard'
import { PortfolioList } from '@/pages/portfolios/PortfolioList'
import { GoalList } from '@/pages/goals/GoalList'
import { LoginPage } from '@/pages/auth/LoginPage'
import { RegisterPage } from '@/pages/auth/RegisterPage'
import ErrorBoundary from '@/components/ErrorBoundary'

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Protected routes */}
          <Route path="/*" element={
            <AuthGuard>
              <Layout>
                <Routes>
                  <Route path="/" element={<Dashboard />} />
                  <Route path="/portfolios" element={<PortfolioList />} />
                  <Route path="/goals" element={<GoalList />} />
                  <Route path="/market" element={<div>Market Data (Coming Soon)</div>} />
                  <Route path="/reports" element={<div>Reports (Coming Soon)</div>} />
                  <Route path="/settings" element={<div>Settings (Coming Soon)</div>} />
                </Routes>
              </Layout>
            </AuthGuard>
          } />
        </Routes>
      </AuthProvider>
    </ErrorBoundary>
  )
}

export default App