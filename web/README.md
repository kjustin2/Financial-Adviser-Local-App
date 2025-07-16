# Financial Advisor Web Application

A modern, client-side web application for personal financial management and portfolio analysis.

## Features

- **Portfolio Management**: Track your investments and holdings
- **Financial Goals**: Set and monitor progress toward financial objectives
- **Investment Analysis**: Get detailed portfolio analytics and risk metrics
- **Personalized Recommendations**: Receive AI-powered investment advice
- **Local Storage**: All data is stored locally using IndexedDB for privacy

## Technology Stack

- **Frontend**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **State Management**: Zustand
- **Data Storage**: IndexedDB (via Dexie.js)
- **Validation**: Zod
- **Testing**: Vitest with @testing-library/jest-dom and fake-indexeddb
- **Code Quality**: ESLint with TypeScript support (v8.0+)
- **Deployment**: GitHub Pages with automated CI/CD

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm

### Installation

1. Clone the repository
2. Navigate to the web directory:
   ```bash
   cd web
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Start the development server:
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run test` - Run tests
- `npm run lint` - Run ESLint

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── common/         # Generic components (Button, Modal, etc.)
│   ├── layout/         # Layout components
│   ├── portfolio/      # Portfolio-specific components
│   ├── goals/          # Goal management components
│   └── profile/        # User profile components
├── pages/              # Page components
├── services/           # Business logic and API services
├── stores/             # Zustand state stores
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── test/               # Test files
```

## Data Models

The application uses the following core data models:

- **UserProfile**: Personal information and investment preferences
- **Holding**: Individual investment positions
- **Goal**: Financial objectives with target amounts and dates
- **Recommendation**: Personalized investment advice

## Privacy & Security

- All data is stored locally in your browser
- No external APIs or data transmission
- No user accounts or authentication required
- Data can be exported/imported for backup

## Browser Compatibility

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Run the test suite
6. Submit a pull request

## License

This project is licensed under the MIT License.