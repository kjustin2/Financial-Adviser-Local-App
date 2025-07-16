import React from 'react'
import { Button, Card, CardContent } from '../common'
import { Shield, TrendingUp, Target, Lock } from 'lucide-react'

export interface WelcomeScreenProps {
  onStartOnboarding: () => void
}

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({ onStartOnboarding }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-secondary-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            Welcome to Your Personal
            <span className="text-primary-600 block">Financial Advisor</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Get personalized investment recommendations tailored to your goals, risk tolerance, 
            and financial situation. All your data stays private and secure in your browser.
          </p>
          <Button 
            size="lg" 
            onClick={onStartOnboarding}
            className="text-lg px-8 py-4 h-auto"
          >
            Get Started - Create Your Profile
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          <Card className="text-center p-6">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Target className="w-6 h-6 text-primary-600" />
            </div>
            <h2 className="font-semibold text-gray-900 mb-2">Personalized Goals</h2>
            <CardContent className="text-gray-600">
              Set and track your financial objectives with tailored recommendations
            </CardContent>
          </Card>

          <Card className="text-center p-6">
            <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <TrendingUp className="w-6 h-6 text-secondary-600" />
            </div>
            <h2 className="font-semibold text-gray-900 mb-2">Smart Analysis</h2>
            <CardContent className="text-gray-600">
              Advanced portfolio analysis and performance tracking
            </CardContent>
          </Card>

          <Card className="text-center p-6">
            <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Shield className="w-6 h-6 text-primary-600" />
            </div>
            <h2 className="font-semibold text-gray-900 mb-2">Risk Management</h2>
            <CardContent className="text-gray-600">
              Recommendations based on your personal risk tolerance
            </CardContent>
          </Card>

          <Card className="text-center p-6">
            <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center mx-auto mb-4">
              <Lock className="w-6 h-6 text-secondary-600" />
            </div>
            <h2 className="font-semibold text-gray-900 mb-2">Privacy First</h2>
            <CardContent className="text-gray-600">
              All data stored locally in your browser - no cloud storage
            </CardContent>
          </Card>
        </div>

        {/* Privacy Assurance */}
        <Card className="bg-gray-50 border-gray-200">
          <CardContent className="text-center p-8">
            <Lock className="w-8 h-8 text-gray-600 mx-auto mb-4" />
            <h2 className="text-lg font-semibold text-gray-900 mb-2">
              Your Privacy is Our Priority
            </h2>
            <p className="text-gray-600 mb-4">
              No account required. No data transmission. No cloud storage. 
              Everything stays private and secure in your browser.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-gray-500">
              <span className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                Local Storage Only
              </span>
              <span className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                No Registration
              </span>
              <span className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                No Data Sharing
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Call to Action */}
        <div className="text-center mt-8">
          <p className="text-gray-600 mb-4">
            Ready to take control of your financial future?
          </p>
          <Button 
            size="lg" 
            onClick={onStartOnboarding}
            className="text-lg px-8 py-4 h-auto"
          >
            Start Your Financial Journey
          </Button>
        </div>
      </div>
    </div>
  )
}