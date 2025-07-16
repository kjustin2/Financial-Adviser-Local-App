import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { Layout } from './components/simple/Layout'
import { SimpleDashboard } from './pages/SimpleDashboard'
import { SimpleGoals } from './pages/SimpleGoals'
import { SimpleProfile } from './pages/SimpleProfile'
import { SimpleOnboarding } from './pages/SimpleOnboarding'
import { SimpleRecommendations } from './pages/SimpleRecommendations'
import { useSimpleProfileStore } from './stores/simpleProfileStore'

function App() {
  const { profile } = useSimpleProfileStore()

  return (
    <Router basename="/Financial-Adviser-Local-App">
      <Routes>
        {/* Onboarding route - no profile required */}
        <Route 
          path="/onboarding" 
          element={
            profile ? <Navigate to="/" replace /> : <SimpleOnboarding />
          } 
        />
        
        {/* Protected routes - require profile */}
        <Route 
          path="/" 
          element={
            profile ? (
              <Layout>
                <SimpleDashboard />
              </Layout>
            ) : (
              <Navigate to="/onboarding" replace />
            )
          } 
        />
        <Route 
          path="/goals" 
          element={
            profile ? (
              <Layout>
                <SimpleGoals />
              </Layout>
            ) : (
              <Navigate to="/onboarding" replace />
            )
          } 
        />
        <Route 
          path="/recommendations" 
          element={
            profile ? (
              <Layout>
                <SimpleRecommendations />
              </Layout>
            ) : (
              <Navigate to="/onboarding" replace />
            )
          } 
        />
        <Route 
          path="/profile" 
          element={
            profile ? (
              <Layout>
                <SimpleProfile />
              </Layout>
            ) : (
              <Navigate to="/onboarding" replace />
            )
          } 
        />
        
        {/* Catch-all route */}
        <Route 
          path="*" 
          element={<Navigate to={profile ? "/" : "/onboarding"} replace />}
        />
      </Routes>
    </Router>
  )
}

export default App