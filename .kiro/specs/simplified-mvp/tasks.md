# Implementation Plan

- [x] 1. Clean up package.json and remove unnecessary dependencies


  - Remove Playwright and E2E testing dependencies (@playwright/test, @axe-core/playwright)
  - Remove complex testing utilities and accessibility testing packages
  - Remove unused development dependencies and scripts
  - Update scripts to remove E2E testing commands
  - _Requirements: 5.1_

- [x] 2. Remove complex testing infrastructure and files


  - Delete entire web/e2e/ directory and all Playwright test files
  - Delete playwright.config.ts configuration file
  - Remove accessibility testing files and complex test utilities
  - Keep only basic Vitest setup for unit tests
  - _Requirements: 5.1_

- [x] 3. Simplify type definitions for MVP data models


  - Create SimpleUserProfile interface with basic fields only
  - Create SimpleGoal interface for basic goal tracking
  - Create SimpleRecommendation interface for basic recommendations
  - Remove complex type definitions and enums not needed for MVP
  - _Requirements: 1.2, 2.2, 3.2, 4.1_

- [x] 4. Create simplified Zustand stores


  - Implement simplified profileStore with basic profile management
  - Implement simplified goalsStore for basic goal CRUD operations
  - Implement simplified recommendationsStore with basic recommendation logic
  - Remove complex stores and state management not needed for MVP
  - _Requirements: 1.2, 2.2, 3.2, 4.1_

- [x] 5. Simplify database service for basic data persistence



  - Update database.ts to handle simplified data models
  - Remove complex database operations and migrations
  - Implement basic CRUD operations for profile, goals, and recommendations
  - Add simple error handling for database operations
  - _Requirements: 1.2, 2.2, 3.2_

- [x] 6. Create simplified common UI components



  - Implement basic Button component with minimal variants
  - Implement basic Card component for layout
  - Implement basic Input and Select components for forms
  - Remove complex UI components not needed for MVP
  - _Requirements: 5.4_

- [x] 7. Create simplified layout components


  - Implement simple Header component with basic navigation
  - Remove complex sidebar, breadcrumbs, and navigation guards
  - Create basic Layout wrapper for pages
  - Implement simple responsive design with Tailwind
  - _Requirements: 5.4_

- [x] 8. Implement simplified onboarding page


  - Create single-step onboarding form with basic profile fields
  - Implement form validation for required fields
  - Add form submission to create user profile
  - Remove complex wizard and multi-step onboarding process
  - _Requirements: 1.1, 1.2, 1.3_

- [x] 9. Simplify dashboard page for MVP


  - Display basic financial health summary with 3-4 key metrics
  - Show active goals overview with simple progress indicators
  - Display top 3 basic recommendations
  - Remove complex portfolio metrics and advanced analytics
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 10. Create simplified profile page


  - Implement basic profile editing form
  - Add simple financial health inputs (savings, expenses, debt)
  - Implement basic risk tolerance assessment
  - Remove complex profile management features
  - _Requirements: 2.1, 2.2, 2.3_

- [x] 11. Implement simplified goals page



  - Create form to add basic financial goals (emergency, retirement, purchase)
  - Implement goal editing and deletion functionality
  - Add basic progress tracking with simple progress bars
  - Remove complex goal management and analytics
  - _Requirements: 3.1, 3.2, 3.3_

- [x] 12. Create basic recommendation engine


  - Implement simple rule-based recommendation generation
  - Create 5-10 predefined recommendation templates
  - Add basic personalization based on user profile data
  - Remove complex financial calculations and advanced recommendation logic
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 13. Simplify App.tsx and routing


  - Update routing to use simplified page components
  - Remove complex navigation guards and protection logic
  - Implement basic route handling for onboarding flow
  - Remove lazy loading and complex routing features
  - _Requirements: 1.4, 5.4_

- [x] 14. Remove unused files and directories



  - Delete complex component directories (analysis/, portfolio/, complex onboarding/)
  - Remove advanced services and utilities not needed for MVP
  - Delete unused page components and complex features
  - Clean up import statements and remove dead code
  - _Requirements: 5.1_

- [x] 15. Update utility functions for MVP


  - Keep only basic calculation functions needed for MVP
  - Simplify formatters for currency and date display
  - Remove complex validation and advanced utility functions
  - Add basic form validation utilities
  - _Requirements: 2.3, 4.4_

- [x] 16. Create basic unit tests for core functionality


  - Write unit tests for simplified stores and data operations
  - Test basic calculation and validation functions
  - Test core business logic for recommendations
  - Remove complex testing scenarios and focus on essential functionality
  - _Requirements: 1.2, 2.2, 3.2, 4.1_

- [x] 17. Update main.tsx and index.css for simplified styling


  - Ensure basic Tailwind CSS setup works correctly
  - Remove complex CSS customizations and theme configurations
  - Add basic responsive design styles
  - Test application startup and basic styling
  - _Requirements: 5.4_

- [x] 18. Test and validate MVP functionality



  - Manually test complete user flow from onboarding to dashboard
  - Verify data persistence works correctly with IndexedDB
  - Test basic goal creation and recommendation generation
  - Ensure responsive design works on different screen sizes
  - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 3.1, 3.2, 3.3, 4.1, 4.2, 4.3, 5.1, 5.2, 5.3, 5.4_