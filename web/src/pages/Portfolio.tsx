import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '../components/common'

export const Portfolio: React.FC = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">Portfolio</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Your Holdings</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No holdings yet. Add your first investment to get started.</p>
        </CardContent>
      </Card>
    </div>
  )
}