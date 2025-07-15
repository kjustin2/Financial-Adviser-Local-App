import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../components/common'

export const Goals: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Financial Goals</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Goals</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No goals set yet. Create your first financial goal to start tracking your progress.</p>
        </CardContent>
      </Card>
    </div>
  )
}