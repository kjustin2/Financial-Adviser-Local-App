import React from 'react'
import { Input } from '../../common'
import { useOnboardingStore } from '../../../stores/onboardingStore'
import { DollarSign, PiggyBank, Shield, CreditCard } from 'lucide-react'

export const CurrentSituationStep: React.FC = () => {
  const { stepData, updateStepData, errors, clearError } = useOnboardingStore()

  const handleExistingInvestmentsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value)
    updateStepData({ existingInvestments: isNaN(value) ? 0 : value })
    if (!isNaN(value) && value >= 0) {
      clearError('existingInvestments')
    }
  }

  const handleMonthlySavingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value)
    updateStepData({ monthlySavings: isNaN(value) ? 0 : value })
    if (!isNaN(value) && value >= 0) {
      clearError('monthlySavings')
    }
  }

  const handleEmergencyFundChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value)
    updateStepData({ emergencyFund: isNaN(value) ? 0 : value })
  }

  const handleCurrentDebtChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value)
    updateStepData({ currentDebt: isNaN(value) ? 0 : value })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const existingInvestments = stepData.existingInvestments || 0
  const monthlySavings = stepData.monthlySavings || 0
  const emergencyFund = stepData.emergencyFund || 0
  const currentDebt = stepData.currentDebt || 0

  // Calculate some helpful metrics
  const annualSavings = monthlySavings * 12
  const emergencyFundMonths = monthlySavings > 0 ? emergencyFund / monthlySavings : 0

  return (
    <div className="space-y-8">
      {/* Existing Investments */}
      <div>
        <label htmlFor="existingInvestments" className="flex items-center text-sm font-medium text-gray-700 mb-2">
          <DollarSign className="w-4 h-4 mr-2 text-primary-600" />
          Current Investment Value *
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
          <Input
            id="existingInvestments"
            type="number"
            min="0"
            step="100"
            value={existingInvestments || ''}
            onChange={handleExistingInvestmentsChange}
            placeholder="0"
            className="pl-8"
            error={errors.existingInvestments}
            aria-describedby={errors.existingInvestments ? 'investments-error' : 'investments-help'}
          />
        </div>
        {errors.existingInvestments && (
          <p id="investments-error" className="mt-1 text-sm text-red-600">
            {errors.existingInvestments}
          </p>
        )}
        <p id="investments-help" className="mt-1 text-sm text-gray-500">
          Total value of your current investments (stocks, bonds, ETFs, etc.). Enter 0 if you're just starting.
        </p>
      </div>

      {/* Monthly Savings */}
      <div>
        <label htmlFor="monthlySavings" className="flex items-center text-sm font-medium text-gray-700 mb-2">
          <PiggyBank className="w-4 h-4 mr-2 text-secondary-600" />
          Monthly Savings Amount *
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
          <Input
            id="monthlySavings"
            type="number"
            min="0"
            step="50"
            value={monthlySavings || ''}
            onChange={handleMonthlySavingsChange}
            placeholder="0"
            className="pl-8"
            error={errors.monthlySavings}
            aria-describedby={errors.monthlySavings ? 'savings-error' : 'savings-help'}
          />
        </div>
        {errors.monthlySavings && (
          <p id="savings-error" className="mt-1 text-sm text-red-600">
            {errors.monthlySavings}
          </p>
        )}
        <p id="savings-help" className="mt-1 text-sm text-gray-500">
          How much can you typically save and invest each month?
        </p>
        {monthlySavings > 0 && (
          <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm text-green-800">
              💡 That's <strong>{formatCurrency(annualSavings)}</strong> per year in savings!
            </p>
          </div>
        )}
      </div>

      {/* Emergency Fund */}
      <div>
        <label htmlFor="emergencyFund" className="flex items-center text-sm font-medium text-gray-700 mb-2">
          <Shield className="w-4 h-4 mr-2 text-blue-600" />
          Emergency Fund Amount
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
          <Input
            id="emergencyFund"
            type="number"
            min="0"
            step="100"
            value={emergencyFund || ''}
            onChange={handleEmergencyFundChange}
            placeholder="0"
            className="pl-8"
            aria-describedby="emergency-help"
          />
        </div>
        <p id="emergency-help" className="mt-1 text-sm text-gray-500">
          Money set aside for unexpected expenses (separate from investments)
        </p>
        {emergencyFund > 0 && monthlySavings > 0 && (
          <div className={`mt-2 p-3 border rounded-md ${
            emergencyFundMonths >= 6 
              ? 'bg-green-50 border-green-200' 
              : emergencyFundMonths >= 3 
                ? 'bg-yellow-50 border-yellow-200'
                : 'bg-red-50 border-red-200'
          }`}>
            <p className={`text-sm ${
              emergencyFundMonths >= 6 
                ? 'text-green-800' 
                : emergencyFundMonths >= 3 
                  ? 'text-yellow-800'
                  : 'text-red-800'
            }`}>
              {emergencyFundMonths >= 6 
                ? '✅ Great! You have ' 
                : emergencyFundMonths >= 3 
                  ? '⚠️ You have '
                  : '⚠️ Consider building up your emergency fund. You have '
              }
              <strong>{emergencyFundMonths.toFixed(1)} months</strong> of expenses covered.
              {emergencyFundMonths < 6 && ' Experts recommend 3-6 months of expenses.'}
            </p>
          </div>
        )}
      </div>

      {/* Current Debt */}
      <div>
        <label htmlFor="currentDebt" className="flex items-center text-sm font-medium text-gray-700 mb-2">
          <CreditCard className="w-4 h-4 mr-2 text-red-600" />
          High-Interest Debt (Optional)
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
          <Input
            id="currentDebt"
            type="number"
            min="0"
            step="100"
            value={currentDebt || ''}
            onChange={handleCurrentDebtChange}
            placeholder="0"
            className="pl-8"
            aria-describedby="debt-help"
          />
        </div>
        <p id="debt-help" className="mt-1 text-sm text-gray-500">
          Credit card debt, personal loans, or other high-interest debt (exclude mortgage)
        </p>
        {currentDebt > 0 && (
          <div className="mt-2 p-3 bg-orange-50 border border-orange-200 rounded-md">
            <p className="text-sm text-orange-800">
              💡 Consider prioritizing high-interest debt payoff before investing. 
              We'll factor this into your recommendations.
            </p>
          </div>
        )}
      </div>

      {/* Summary */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Financial Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Current Investments:</span>
            <span className="font-medium">{formatCurrency(existingInvestments)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Monthly Savings:</span>
            <span className="font-medium">{formatCurrency(monthlySavings)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Emergency Fund:</span>
            <span className="font-medium">{formatCurrency(emergencyFund)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">High-Interest Debt:</span>
            <span className="font-medium">{formatCurrency(currentDebt)}</span>
          </div>
        </div>
        {monthlySavings > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Annual Savings Potential:</span>
              <span className="font-semibold text-primary-600">{formatCurrency(annualSavings)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}