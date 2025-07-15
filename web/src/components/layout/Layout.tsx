import React from 'react'

interface LayoutProps {
  children: React.ReactNode
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900">
              Financial Advisor
            </h1>
            <nav className="flex space-x-8">
              <a href="/" className="text-gray-700 hover:text-gray-900">Dashboard</a>
              <a href="/portfolio" className="text-gray-700 hover:text-gray-900">Portfolio</a>
              <a href="/goals" className="text-gray-700 hover:text-gray-900">Goals</a>
              <a href="/analysis" className="text-gray-700 hover:text-gray-900">Analysis</a>
              <a href="/profile" className="text-gray-700 hover:text-gray-900">Profile</a>
            </nav>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}