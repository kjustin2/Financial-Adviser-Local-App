import { z } from 'zod'

// Basic Info Step Validation
export const basicInfoSchema = z.object({
  name: z.string()
    .min(1, 'Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s'-]+$/, 'Name can only contain letters, spaces, hyphens, and apostrophes'),
  
  age: z.number()
    .min(18, 'Must be at least 18 years old')
    .max(120, 'Please enter a valid age')
    .int('Age must be a whole number'),
  
  incomeRange: z.string()
    .min(1, 'Please select your income range')
})

// Experience & Risk Step Validation
export const experienceRiskSchema = z.object({
  experienceLevel: z.enum(['beginner', 'intermediate', 'advanced'], {
    errorMap: () => ({ message: 'Please select your investment experience level' })
  }),
  
  riskTolerance: z.enum(['conservative', 'moderate', 'aggressive'], {
    errorMap: () => ({ message: 'Please select your risk tolerance' })
  }),
  
  investmentKnowledge: z.array(z.string()).optional()
})

// Goals & Timeline Step Validation
export const goalsTimelineSchema = z.object({
  primaryGoals: z.array(z.string())
    .min(1, 'Please select at least one financial goal')
    .max(8, 'Please select no more than 8 goals'),
  
  timeHorizon: z.enum(['short_term', 'medium_term', 'long_term'], {
    errorMap: () => ({ message: 'Please select your investment time horizon' })
  }),
  
  targetRetirementAge: z.number()
    .min(50, 'Retirement age must be at least 50')
    .max(80, 'Retirement age must be 80 or less')
    .int('Retirement age must be a whole number')
    .optional(),
  
  specificGoalAmounts: z.record(z.string(), z.number().min(0, 'Goal amounts must be positive')).optional()
})

// Current Situation Step Validation
export const currentSituationSchema = z.object({
  existingInvestments: z.number()
    .min(0, 'Investment amount cannot be negative')
    .max(100000000, 'Please enter a reasonable investment amount'),
  
  monthlySavings: z.number()
    .min(0, 'Monthly savings cannot be negative')
    .max(1000000, 'Please enter a reasonable monthly savings amount'),
  
  emergencyFund: z.number()
    .min(0, 'Emergency fund amount cannot be negative')
    .max(10000000, 'Please enter a reasonable emergency fund amount')
    .optional(),
  
  currentDebt: z.number()
    .min(0, 'Debt amount cannot be negative')
    .max(10000000, 'Please enter a reasonable debt amount')
    .optional()
})

// Complete Profile Validation (all steps combined)
export const completeProfileSchema = z.object({
  ...basicInfoSchema.shape,
  ...experienceRiskSchema.shape,
  ...goalsTimelineSchema.shape,
  ...currentSituationSchema.shape
})

// Validation helper functions
export const validateStep = (step: number, data: any) => {
  try {
    switch (step) {
      case 1:
        basicInfoSchema.parse(data)
        return { isValid: true, errors: {} }
      case 2:
        experienceRiskSchema.parse(data)
        return { isValid: true, errors: {} }
      case 3:
        goalsTimelineSchema.parse(data)
        return { isValid: true, errors: {} }
      case 4:
        currentSituationSchema.parse(data)
        return { isValid: true, errors: {} }
      default:
        return { isValid: false, errors: { general: 'Invalid step' } }
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {}
      error.errors.forEach((err) => {
        const path = err.path.join('.')
        errors[path] = err.message
      })
      return { isValid: false, errors }
    }
    return { isValid: false, errors: { general: 'Validation error' } }
  }
}

export const validateCompleteProfile = (data: any) => {
  try {
    completeProfileSchema.parse(data)
    return { isValid: true, errors: {} }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {}
      error.errors.forEach((err) => {
        const path = err.path.join('.')
        errors[path] = err.message
      })
      return { isValid: false, errors }
    }
    return { isValid: false, errors: { general: 'Validation error' } }
  }
}

// Field-level validation helpers
export const validateField = (fieldName: string, value: any, schema: z.ZodSchema) => {
  try {
    schema.parse({ [fieldName]: value })
    return null // No error
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldError = error.errors.find(err => err.path.includes(fieldName))
      return fieldError?.message || 'Invalid value'
    }
    return 'Validation error'
  }
}

// Real-time validation for individual fields
export const validateName = (name: string) => 
  validateField('name', name, z.object({ name: basicInfoSchema.shape.name }))

export const validateAge = (age: number) => 
  validateField('age', age, z.object({ age: basicInfoSchema.shape.age }))

export const validateIncomeRange = (incomeRange: string) => 
  validateField('incomeRange', incomeRange, z.object({ incomeRange: basicInfoSchema.shape.incomeRange }))

export const validateExperienceLevel = (experienceLevel: string) => 
  validateField('experienceLevel', experienceLevel, z.object({ experienceLevel: experienceRiskSchema.shape.experienceLevel }))

export const validateRiskTolerance = (riskTolerance: string) => 
  validateField('riskTolerance', riskTolerance, z.object({ riskTolerance: experienceRiskSchema.shape.riskTolerance }))

export const validatePrimaryGoals = (primaryGoals: string[]) => 
  validateField('primaryGoals', primaryGoals, z.object({ primaryGoals: goalsTimelineSchema.shape.primaryGoals }))

export const validateTimeHorizon = (timeHorizon: string) => 
  validateField('timeHorizon', timeHorizon, z.object({ timeHorizon: goalsTimelineSchema.shape.timeHorizon }))

export const validateExistingInvestments = (existingInvestments: number) => 
  validateField('existingInvestments', existingInvestments, z.object({ existingInvestments: currentSituationSchema.shape.existingInvestments }))

export const validateMonthlySavings = (monthlySavings: number) => 
  validateField('monthlySavings', monthlySavings, z.object({ monthlySavings: currentSituationSchema.shape.monthlySavings }))

// Data sanitization helpers
export const sanitizeNumericInput = (value: string): number => {
  const cleaned = value.replace(/[^0-9.-]/g, '')
  const parsed = parseFloat(cleaned)
  return isNaN(parsed) ? 0 : parsed
}

export const sanitizeStringInput = (value: string): string => {
  return value.trim().replace(/\s+/g, ' ')
}

export const sanitizeNameInput = (value: string): string => {
  return value.trim()
    .replace(/[^a-zA-Z\s'-]/g, '')
    .replace(/\s+/g, ' ')
    .substring(0, 100)
}