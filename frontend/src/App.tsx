import { Routes, Route } from 'react-router-dom'
import { AuthProvider } from '@/contexts/AuthContext'
import { AuthGuard } from '@/components/auth/AuthGuard'
import { Layout } from '@/components/layout/Layout'
import { Dashboard } from '@/pages/Dashboard'
import { PortfolioList } from '@/pages/portfolios/PortfolioList'
import { ProfileSettings } from '@/pages/settings/ProfileSettings'
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
                  <Route path="/recommendations" element={<div>Recommendations (Coming Soon)</div>} />
                  <Route path="/reports" element={<div>Reports (Coming Soon)</div>} />
                  <Route path="/settings" element={<ProfileSettings />} />
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