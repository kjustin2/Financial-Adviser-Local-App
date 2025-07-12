import React, { createContext, useContext, useState, useEffect } from 'react'
import { apiService } from '@/services/api'
import { logger } from '@/utils/logger'

interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  fullName: string
}

interface AuthContextType {
  user: User | null
  token: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  register: (userData: RegisterData) => Promise<void>
  loading: boolean
  isAuthenticated: boolean
}

interface RegisterData {
  email: string
  password: string
  first_name: string
  last_name: string
  investment_experience?: string
  risk_tolerance?: string
  investment_style?: string
  financial_goals?: string[]
  net_worth_range?: string
  time_horizon?: string
  portfolio_complexity?: string
  phone?: string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for existing token on mount
    const savedToken = localStorage.getItem('access_token')
    const savedUser = localStorage.getItem('user')
    
    if (savedToken && savedUser) {
      try {
        setToken(savedToken)
        setUser(JSON.parse(savedUser))
      } catch (error) {
        logger.error('Failed to parse saved user data', 'Auth', {}, error as Error)
        localStorage.removeItem('access_token')
        localStorage.removeItem('user')
      }
    }
    
    setLoading(false)
  }, [])

  const login = async (email: string, password: string) => {
    try {
      setLoading(true)
      const response = await apiService.post('/api/v1/auth/login/json', {
        email: email,
        password: password
      }, { skipAuth: true })

      const { access_token, user: userData } = response
      
      // Transform backend response to match frontend interface
      const transformedUser = {
        id: userData.id.toString(),
        email: userData.email,
        firstName: userData.first_name,
        lastName: userData.last_name,
        fullName: `${userData.first_name} ${userData.last_name}`
      }
      
      setToken(access_token)
      setUser(transformedUser)
      
      localStorage.setItem('access_token', access_token)
      localStorage.setItem('user', JSON.stringify(transformedUser))
      
      logger.userAction('User login successful', 'Auth', { userId: userData.id })
    } catch (error) {
      logger.error('Login failed', 'Auth', {}, error as Error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('access_token')
    localStorage.removeItem('user')
    
    logger.userAction('User logout', 'Auth')
  }

  const register = async (userData: RegisterData) => {
    try {
      setLoading(true)
      
      // Pass the data directly as it already matches backend expectations
      const backendData = userData
      
      const response = await apiService.post('/api/v1/auth/register', backendData, { 
        skipAuth: true 
      })

      const { access_token, user: newUser } = response
      
      // Transform backend response to match frontend interface
      const transformedUser = {
        id: newUser.id.toString(),
        email: newUser.email,
        firstName: newUser.first_name,
        lastName: newUser.last_name,
        fullName: `${newUser.first_name} ${newUser.last_name}`
      }
      
      setToken(access_token)
      setUser(transformedUser)
      
      localStorage.setItem('access_token', access_token)
      localStorage.setItem('user', JSON.stringify(transformedUser))
      
      logger.userAction('User registration successful', 'Auth', { userId: newUser.id })
    } catch (error) {
      logger.error('Registration failed', 'Auth', {}, error as Error)
      throw error
    } finally {
      setLoading(false)
    }
  }

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    register,
    loading,
    isAuthenticated: !!user && !!token
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}