import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { Menu, X, TrendingUp } from 'lucide-react'
import { cn } from '../../utils/cn'

interface LayoutProps {
  children: React.ReactNode
  showNavigation?: boolean
}

const navigationItems = [
  { path: '/', label: 'Dashboard', icon: '📊' },
  { path: '/portfolio', label: 'Portfolio', icon: '💼' },
  { path: '/goals', label: 'Goals', icon: '🎯' },
  { path: '/analysis', label: 'Analysis', icon: '📈' },
  { path: '/profile', label: 'Profile', icon: '👤' }
]

export const Layout: React.FC<LayoutProps> = ({ children, showNavigation = true }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const location = useLocation()

  const isActivePath = (path: string) => {
    return location.pathname === path
  }

  if (!showNavigation) {
    return (
      <div className="min-h-screen bg-gray-50">
        {children}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center space-x-2">
              <TrendingUp className="w-6 h-6 text-primary-600" />
              <h1 className="text-xl font-semibold text-gray-900">
                Financial Advisor
              </h1>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'px-3 py-2 rounded-md text-sm font-medium transition-colors',
                    isActivePath(item.path)
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  )}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </nav>

            {/* Mobile menu button */}
            <button
              type="button"
              className="md:hidden inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              {isMobileMenuOpen ? (
                <X className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Menu className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 bg-white border-t border-gray-200">
              {navigationItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'block px-3 py-2 rounded-md text-base font-medium transition-colors',
                    isActivePath(item.path)
                      ? 'bg-primary-100 text-primary-700'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100'
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <span className="mr-2">{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}