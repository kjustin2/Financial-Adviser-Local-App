import React from 'react'
import { Card, CardHeader, CardTitle, CardContent, Button } from '../common'
import { formatSecurityType } from '../../utils/formatters'
import { RiskTolerance } from '../../types'
import type { UserProfile } from '../../types'

interface ProfileSummaryProps {
  profile: UserProfile
  onEdit?: () => void
}

export const ProfileSummary: React.FC<ProfileSummaryProps> = ({ profile, onEdit }) => {
  const formatRiskTolerance = (riskTolerance: string) => {
    return riskTolerance.charAt(0).toUpperCase() + riskTolerance.slice(1).toLowerCase()
  }

  const formatTimeHorizon = (timeHorizon: string) => {
    return timeHorizon.replace(/_/g, '-').toLowerCase()
  }

  const formatExperienceLevel = (experienceLevel: string) => {
    return experienceLevel.charAt(0).toUpperCase() + experienceLevel.slice(1).toLowerCase()
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Investment Profile</CardTitle>
          {onEdit && (
            <Button variant="outline" size="sm" onClick={onEdit}>
              Edit Profile
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Basic Information</h4>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-gray-600">Name:</span>
                <span className="ml-2 text-sm font-medium">{profile.name}</span>
              </div>
              <div>
                <span className="text-sm text-gray-600">Age:</span>
                <span className="ml-2 text-sm font-medium">{profile.age} years old</span>
              </div>
              <div>
                <span className="text-sm text-gray-600">Income Range:</span>
                <span className="ml-2 text-sm font-medium">{profile.incomeRange}</span>
              </div>
            </div>
          </div>

          {/* Investment Profile */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Investment Profile</h4>
            <div className="space-y-2">
              <div>
                <span className="text-sm text-gray-600">Experience Level:</span>
                <span className="ml-2 text-sm font-medium">{formatExperienceLevel(profile.experienceLevel)}</span>
              </div>
              <div>
                <span className="text-sm text-gray-600">Risk Tolerance:</span>
                <span className={`ml-2 text-sm font-medium ${
                  profile.riskTolerance === RiskTolerance.CONSERVATIVE ? 'text-blue-600' :
                  profile.riskTolerance === RiskTolerance.MODERATE ? 'text-yellow-600' :
                  'text-red-600'
                }`}>
                  {formatRiskTolerance(profile.riskTolerance)}
                </span>
              </div>
              <div>
                <span className="text-sm text-gray-600">Time Horizon:</span>
                <span className="ml-2 text-sm font-medium">{formatTimeHorizon(profile.timeHorizon)}</span>
              </div>
            </div>
          </div>

          {/* Financial Goals */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Financial Goals</h4>
            <div className="flex flex-wrap gap-2">
              {profile.financialGoals.map((goal, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800"
                >
                  {goal}
                </span>
              ))}
            </div>
          </div>

          {/* Major Purchases */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900">Planned Major Purchases</h4>
            {profile.majorPurchases.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {profile.majorPurchases.map((purchase, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                  >
                    {formatSecurityType(purchase)}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">No major purchases planned</p>
            )}
          </div>
        </div>

        {/* Profile Insights */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Profile Insights</h4>
          <div className="text-sm text-gray-600 space-y-1">
            <p>
              Based on your {formatRiskTolerance(profile.riskTolerance)} risk tolerance and {formatTimeHorizon(profile.timeHorizon)} time horizon, 
              you're well-positioned for {profile.riskTolerance === RiskTolerance.AGGRESSIVE ? 'growth-focused' : 
              profile.riskTolerance === RiskTolerance.CONSERVATIVE ? 'stability-focused' : 'balanced'} investing.
            </p>
            {profile.age < 30 && (
              <p>Your young age gives you a significant advantage in long-term wealth building through compound growth.</p>
            )}
            {profile.age > 50 && profile.riskTolerance === RiskTolerance.AGGRESSIVE && (
              <p>Consider gradually shifting to a more conservative approach as you near retirement.</p>
            )}
          </div>
        </div>

        {/* Profile Created */}
        <div className="mt-4 text-xs text-gray-500">
          Profile created on {new Date(profile.createdAt).toLocaleDateString()}
          {profile.updatedAt !== profile.createdAt && (
            <span> • Last updated {new Date(profile.updatedAt).toLocaleDateString()}</span>
          )}
        </div>
      </CardContent>
    </Card>
  )
}