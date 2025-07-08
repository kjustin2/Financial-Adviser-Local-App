import { Routes, Route } from 'react-router-dom'
import { Layout } from '@/components/layout/Layout'
import { Dashboard } from '@/pages/Dashboard'
import { PortfolioList } from '@/pages/portfolios/PortfolioList'
import { GoalList } from '@/pages/goals/GoalList'

function App() {
  return (
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
  )
}

export default App