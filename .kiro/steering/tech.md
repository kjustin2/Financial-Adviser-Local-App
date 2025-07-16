# Technology Stack & Build System

## Frontend Stack

- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Full type safety with strict configuration
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first styling with custom color palette
- **React Router DOM**: Client-side routing

## State & Data Management

- **Zustand**: Lightweight state management with persistence
- **IndexedDB**: Local browser storage via Dexie.js
- **Zod**: Runtime type validation and schema validation

## Development Tools

- **ESLint**: Code linting with TypeScript support (v8.0+)
- **Vitest**: Testing framework with jsdom environment
- **@testing-library/jest-dom**: Testing utilities
- **fake-indexeddb**: IndexedDB mocking for tests

## Common Commands

```bash
# Development
npm run dev          # Start development server (http://localhost:5173)
npm run build        # Build for production
npm run preview      # Preview production build

# Testing & Quality
npm test             # Run test suite
npm run test:watch   # Run tests in watch mode
npm run lint         # Run ESLint
npx tsc --noEmit     # Type checking only

# Working Directory
cd web               # All commands run from web/ directory
```

## Build Configuration

- **Base Path**: `/Financial-Adviser-Local-App/` for GitHub Pages
- **Output**: `dist/` directory with sourcemaps
- **Code Splitting**: Vendor, storage, utils, state, and UI chunks
- **TypeScript**: ES2020 target with strict mode enabled