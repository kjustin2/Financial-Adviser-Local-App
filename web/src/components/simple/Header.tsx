import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { clsx } from 'clsx'
import { TrendingUp, User, Target, Lightbulb } from 'lucide-react'

export const Header: React.FC = () => {
  const location = useLocation()

  const navigation = [
    { name: 'Dashboard', href: '/', icon: TrendingUp },
    { name: 'Goals', href: '/goals', icon: Target },
    { name: 'Recommendations', href: '/recommendations', icon: Lightbulb },
    { name: 'Profile', href: '/profile', icon: User },
  ]

  return (
    <header className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-blue-600" />
            <span className="ml-2 text-xl font-bold text-gray-900">
              Financial Advisor
            </span>
          </div>

          {/* Navigation */}
          <nav className="flex space-x-8">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = location.pathname === item.href
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={clsx(
                    'inline-flex items-center px-1 pt-1 text-sm font-medium border-b-2 transition-colors',
                    isActive
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  )}
                >
                  <Icon className="h-4 w-4 mr-2" />
                  {item.name}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>
    </header>
  )
}