import { axe, toHaveNoViolations } from 'jest-axe'
import { RenderResult } from '@testing-library/react'

// Extend expect with jest-axe matchers
expect.extend(toHaveNoViolations)

// Helper function to test accessibility
export const testAccessibility = async (container: HTMLElement) => {
  const results = await axe(container)
  expect(results).toHaveNoViolations()
}

// Helper to test keyboard navigation
export const testKeyboardNavigation = async (renderResult: RenderResult) => {
  const { container } = renderResult
  
  // Get all focusable elements
  const focusableElements = container.querySelectorAll(
    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
  )
  
  // Test that all focusable elements can receive focus
  focusableElements.forEach((element) => {
    (element as HTMLElement).focus()
    expect(document.activeElement).toBe(element)
  })
}

// Helper to test ARIA labels and roles
export const testAriaLabels = (container: HTMLElement) => {
  // Check that interactive elements have accessible names
  const interactiveElements = container.querySelectorAll(
    'button, [role="button"], input, select, textarea, a'
  )
  
  interactiveElements.forEach((element) => {
    const hasAccessibleName = 
      element.getAttribute('aria-label') ||
      element.getAttribute('aria-labelledby') ||
      element.textContent?.trim() ||
      element.getAttribute('title')
    
    expect(hasAccessibleName).toBeTruthy()
  })
}

// Helper to test color contrast (basic check)
export const testColorContrast = (container: HTMLElement) => {
  // This is a basic implementation - in a real app you might use a more sophisticated tool
  const textElements = container.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div')
  
  textElements.forEach((element) => {
    const styles = window.getComputedStyle(element)
    const color = styles.color
    // const backgroundColor = styles.backgroundColor
    
    // Basic check that text isn't transparent
    expect(color).not.toBe('transparent')
    expect(color).not.toBe('rgba(0, 0, 0, 0)')
  })
}