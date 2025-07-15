import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../components/common'

export const Analysis: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Portfolio Analysis</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Investment Analysis</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Add holdings to your portfolio to see detailed analysis and recommendations.</p>
        </CardContent>
      </Card>
    </div>
  )
}