import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent, Button } from '../common'
import { RiskTolerance } from '../../types'

interface RiskAssessmentQuestion {
  id: string
  question: string
  options: Array<{
    value: number
    label: string
  }>
}

interface RiskAssessmentProps {
  onComplete: (riskTolerance: RiskTolerance) => void
  onSkip?: () => void
}

const riskQuestions: RiskAssessmentQuestion[] = [
  {
    id: 'investment_goal',
    question: 'What is your primary investment goal?',
    options: [
      { value: 1, label: 'Preserve capital with minimal risk' },
      { value: 2, label: 'Generate steady income with some growth' },
      { value: 3, label: 'Grow wealth over time with moderate risk' },
      { value: 4, label: 'Maximize growth potential despite higher risk' }
    ]
  },
  {
    id: 'portfolio_decline',
    question: 'If your portfolio declined 20% in a year, what would you do?',
    options: [
      { value: 1, label: 'Sell everything to prevent further losses' },
      { value: 2, label: 'Sell some investments to reduce risk' },
      { value: 3, label: 'Hold steady and wait for recovery' },
      { value: 4, label: 'Buy more while prices are low' }
    ]
  },
  {
    id: 'investment_experience',
    question: 'How would you describe your investment experience?',
    options: [
      { value: 1, label: 'Very limited - I prefer safe options' },
      { value: 2, label: 'Some experience with basic investments' },
      { value: 3, label: 'Comfortable with various investment types' },
      { value: 4, label: 'Extensive experience with complex investments' }
    ]
  },
  {
    id: 'time_horizon',
    question: 'When will you need to access most of this money?',
    options: [
      { value: 1, label: 'Within 1-2 years' },
      { value: 2, label: 'In 3-5 years' },
      { value: 3, label: 'In 6-10 years' },
      { value: 4, label: 'More than 10 years from now' }
    ]
  },
  {
    id: 'volatility_comfort',
    question: 'How comfortable are you with investment volatility?',
    options: [
      { value: 1, label: 'Not comfortable - I prefer stable returns' },
      { value: 2, label: 'Slightly comfortable with minor fluctuations' },
      { value: 3, label: 'Comfortable with moderate ups and downs' },
      { value: 4, label: 'Very comfortable - volatility creates opportunities' }
    ]
  },
  {
    id: 'emergency_fund',
    question: 'Do you have an emergency fund covering 3-6 months of expenses?',
    options: [
      { value: 1, label: 'No, and I might need this money for emergencies' },
      { value: 2, label: 'No, but I have other sources for emergencies' },
      { value: 3, label: 'Yes, I have some emergency savings' },
      { value: 4, label: 'Yes, I have a fully funded emergency fund' }
    ]
  }
]

export const RiskAssessment: React.FC<RiskAssessmentProps> = ({ onComplete, onSkip }) => {
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)

  const handleAnswer = (questionId: string, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }))
  }

  const handleNext = () => {
    if (currentQuestionIndex < riskQuestions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }

  const calculateRiskTolerance = (): RiskTolerance => {
    const totalScore = Object.values(answers).reduce((sum, score) => sum + score, 0)
    const averageScore = totalScore / riskQuestions.length

    if (averageScore <= 2) {
      return RiskTolerance.CONSERVATIVE
    } else if (averageScore <= 3) {
      return RiskTolerance.MODERATE
    } else {
      return RiskTolerance.AGGRESSIVE
    }
  }

  const handleComplete = () => {
    const riskTolerance = calculateRiskTolerance()
    onComplete(riskTolerance)
  }

  const isCurrentQuestionAnswered = () => {
    const currentQuestion = riskQuestions[currentQuestionIndex]
    return answers[currentQuestion.id] !== undefined
  }

  const isLastQuestion = currentQuestionIndex === riskQuestions.length - 1
  const isFirstQuestion = currentQuestionIndex === 0
  const allQuestionsAnswered = riskQuestions.every(q => answers[q.id] !== undefined)

  const currentQuestion = riskQuestions[currentQuestionIndex]

  const getRiskToleranceDescription = (tolerance: RiskTolerance): string => {
    switch (tolerance) {
      case RiskTolerance.CONSERVATIVE:
        return 'Conservative: You prefer stability and are willing to accept lower returns to minimize risk.'
      case RiskTolerance.MODERATE:
        return 'Moderate: You can handle some risk for potentially higher returns while maintaining some stability.'
      case RiskTolerance.AGGRESSIVE:
        return 'Aggressive: You are comfortable with higher risk for the potential of maximum growth.'
    }
  }

  // Show results if all questions are answered
  if (allQuestionsAnswered && currentQuestionIndex === riskQuestions.length) {
    const riskTolerance = calculateRiskTolerance()
    const totalScore = Object.values(answers).reduce((sum, score) => sum + score, 0)
    
    return (
      <Card>
        <CardHeader>
          <CardTitle>Risk Assessment Results</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center space-y-4">
            <div className={`text-2xl font-bold ${
              riskTolerance === RiskTolerance.CONSERVATIVE ? 'text-blue-600' :
              riskTolerance === RiskTolerance.MODERATE ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {riskTolerance.charAt(0) + riskTolerance.slice(1).toLowerCase()} Risk Tolerance
            </div>
            
            <p className="text-gray-600 max-w-md mx-auto">
              {getRiskToleranceDescription(riskTolerance)}
            </p>

            <div className="bg-gray-50 p-4 rounded-lg">
              <p className="text-sm text-gray-600">
                Assessment Score: {totalScore} out of {riskQuestions.length * 4}
              </p>
            </div>

            <div className="flex justify-center space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setCurrentQuestionIndex(0)}
              >
                Retake Assessment
              </Button>
              <Button onClick={handleComplete}>
                Use This Risk Profile
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Risk Assessment</CardTitle>
          {onSkip && (
            <Button variant="ghost" size="sm" onClick={onSkip}>
              Skip Assessment
            </Button>
          )}
        </div>
        <div className="flex items-center space-x-2 mt-2">
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentQuestionIndex + 1) / riskQuestions.length) * 100}%` }}
            />
          </div>
          <span className="text-sm text-gray-600">
            {currentQuestionIndex + 1} of {riskQuestions.length}
          </span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium mb-4">{currentQuestion.question}</h3>
            <div className="space-y-3">
              {currentQuestion.options.map((option) => (
                <label
                  key={option.value}
                  className={`block p-4 border rounded-lg cursor-pointer transition-colors ${
                    answers[currentQuestion.id] === option.value
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name={currentQuestion.id}
                    value={option.value}
                    checked={answers[currentQuestion.id] === option.value}
                    onChange={() => handleAnswer(currentQuestion.id, option.value)}
                    className="sr-only"
                  />
                  <div className="flex items-center">
                    <div className={`w-4 h-4 rounded-full border-2 mr-3 ${
                      answers[currentQuestion.id] === option.value
                        ? 'border-primary-500 bg-primary-500'
                        : 'border-gray-300'
                    }`}>
                      {answers[currentQuestion.id] === option.value && (
                        <div className="w-2 h-2 bg-white rounded-full mx-auto mt-0.5" />
                      )}
                    </div>
                    <span className="text-sm">{option.label}</span>
                  </div>
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-between pt-4 border-t">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={isFirstQuestion}
            >
              Previous
            </Button>
            
            {isLastQuestion ? (
              <Button
                onClick={() => setCurrentQuestionIndex(riskQuestions.length)}
                disabled={!isCurrentQuestionAnswered}
              >
                View Results
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={!isCurrentQuestionAnswered}
              >
                Next
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}