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
  firstName: string
  lastName: string
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
      const response = await apiService.post('/api/v1/auth/login', {
        username: email, // FastAPI OAuth2PasswordRequestForm expects 'username'
        password: password
      }, { skipAuth: true })

      const { access_token, user: userData } = response
      
      setToken(access_token)
      setUser(userData)
      
      localStorage.setItem('access_token', access_token)
      localStorage.setItem('user', JSON.stringify(userData))
      
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
      const response = await apiService.post('/api/v1/auth/register', userData, { 
        skipAuth: true 
      })

      const { access_token, user: newUser } = response
      
      setToken(access_token)
      setUser(newUser)
      
      localStorage.setItem('access_token', access_token)
      localStorage.setItem('user', JSON.stringify(newUser))
      
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