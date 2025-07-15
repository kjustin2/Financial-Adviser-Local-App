import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../components/common'

export const Profile: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Investment Profile</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Set up your investment profile to get personalized recommendations.</p>
        </CardContent>
      </Card>
    </div>
  )
}