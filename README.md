# Financial Advisor Web Application

A privacy-focused web-based personal financial advisor for individual investors. This modern React application helps you manage your investment portfolio, track financial goals, and receive personalized investment recommendations - all while keeping your data secure and local to your browser.

## 🎯 Features

- **Personal Financial Profile**: Set up your investment experience, risk tolerance, and financial goals
- **Portfolio Management**: Track your holdings, calculate performance, and analyze asset allocation
- **Smart Recommendations**: Get personalized investment advice based on your profile and portfolio
- **Goal Tracking**: Set and monitor progress toward financial objectives like retirement, home purchase, or emergency funds
- **Privacy-First**: All data stored locally in your browser with IndexedDB - no cloud dependencies
- **Modern Web Interface**: Beautiful, responsive design that works on desktop and mobile

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Modern web browser (Chrome, Firefox, Safari, Edge)

### Installation & Development

```bash
# Clone the repository
git clone https://github.com/your-username/Financial-Adviser-Local-App.git
cd Financial-Adviser-Local-App/web

# Install dependencies
npm install

# Start development server
npm run dev

# Open your browser to http://localhost:5173
```

### Production Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to GitHub Pages (automated via GitHub Actions)
```

## 📱 Using the Application

### First Time Setup

1. **Open the application** in your web browser
2. **Create your profile** - Set up your investment experience and risk tolerance
3. **Complete risk assessment** - Answer a few questions to determine your investment profile
4. **Add your holdings** - Input your current investments and watch your portfolio come to life
5. **Set financial goals** - Define what you're saving for and track your progress
6. **Get recommendations** - Receive personalized advice based on your unique situation

### Key Features

#### 📊 **Dashboard**
- Portfolio overview with key metrics
- Recent activity and quick actions
- Goal progress at a glance
- Personalized insights

#### 💰 **Portfolio Management**
- Add, edit, and remove holdings
- Real-time portfolio calculations
- Performance tracking and analytics
- Asset allocation visualization

#### 🎯 **Goals Tracking**
- Create financial goals with target amounts and dates
- Visual progress tracking
- Required savings calculations
- Goal completion milestones

#### 📈 **Analysis & Recommendations**
- Portfolio risk assessment
- Diversification analysis
- Personalized investment recommendations
- Action items and priority scoring

#### 👤 **Profile Management**
- Update investment experience level
- Modify risk tolerance
- Track changes over time
- Privacy-focused local storage

## 🏗️ Architecture

Built with modern web technologies:

- **React 18**: Modern React with hooks and functional components
- **TypeScript**: Full type safety and better developer experience
- **Vite**: Fast build tool and development server
- **Tailwind CSS**: Utility-first styling framework
- **IndexedDB**: Local browser storage via Dexie.js
- **Zustand**: Lightweight state management with persistence

### Project Structure
```
web/
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── common/          # Base components (Button, Modal, etc.)
│   │   ├── portfolio/       # Portfolio-specific components
│   │   ├── profile/         # Profile and risk assessment
│   │   ├── goals/          # Goal management components
│   │   ├── analysis/       # Analytics and recommendations
│   │   └── layout/         # Layout and navigation
│   ├── pages/              # Main application pages
│   ├── services/           # Business logic and data services
│   ├── stores/             # Zustand state management
│   ├── types/              # TypeScript definitions
│   ├── utils/              # Helper functions and calculations
│   └── test/               # Test files and setup
├── public/                 # Static assets
├── package.json           # Dependencies and scripts
├── vite.config.ts         # Vite configuration
├── tailwind.config.js     # Tailwind CSS configuration
└── tsconfig.json          # TypeScript configuration
```

## 🔒 Security & Privacy

- **Local-Only**: All data stays in your browser
- **No Network Calls**: No external API dependencies or data transmission
- **IndexedDB Storage**: Secure browser-native database
- **No Account Required**: No registration, login, or personal information collection
- **Privacy by Design**: No telemetry, tracking, or analytics

## 🧪 Testing

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Type checking
npx tsc --noEmit

# Linting
npm run lint
```

### Test Coverage

The application includes comprehensive testing with updated dependencies:

- **Unit Tests**: Component and service testing with @testing-library/jest-dom
- **Integration Tests**: Complete user workflow testing with fake-indexeddb
- **Type Safety**: Full TypeScript coverage with updated ESLint support
- **Business Logic**: Portfolio calculations and analytics validation
- **CI/CD Integration**: Automated testing in GitHub Actions workflow

## 🚀 Deployment

The application is configured for automatic deployment to GitHub Pages:

### Automatic Deployment

1. **Push to main branch** - Triggers GitHub Actions workflow
2. **Tests run automatically** - Ensures code quality
3. **Build and deploy** - Automatic deployment to GitHub Pages
4. **Live at**: `https://your-username.github.io/Financial-Adviser-Local-App/`

### Manual Deployment

```bash
# Build for production
npm run build

# Deploy the dist/ folder to your hosting provider
```

## 📊 Example Usage

### Portfolio Analysis
- **Total Value**: $125,750.00
- **Total Gain/Loss**: +$12,450.00 (+11.0%)
- **Asset Allocation**: 70% Stocks, 20% Bonds, 10% Cash
- **Risk Score**: Moderate (6/10)

### Goal Tracking
- **Emergency Fund**: 75% complete ($15,000 of $20,000)
- **House Down Payment**: 45% complete ($22,500 of $50,000)
- **Retirement**: On track (15% of income saved)

### Recommendations
- **High Priority**: Increase international diversification
- **Medium Priority**: Consider adding bond allocation
- **Low Priority**: Rebalance quarterly

## 🛠️ Development

### Setup Development Environment

```bash
# Clone and setup
git clone https://github.com/your-username/Financial-Adviser-Local-App.git
cd Financial-Adviser-Local-App/web
npm install

# Start development
npm run dev

# Run tests
npm test

# Build for production
npm run build
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm test` - Run test suite
- `npm run lint` - Run ESLint
- `npm run type-check` - TypeScript type checking

## 🎓 Key Calculations

The application implements sophisticated financial calculations:

- **Portfolio Performance**: Real-time gain/loss calculations
- **Risk Assessment**: Multi-factor risk scoring
- **Goal Progress**: Time-based savings projections
- **Compound Growth**: Future value calculations
- **Asset Allocation**: Diversification analysis
- **Retirement Planning**: 4% withdrawal rule and savings rate optimization

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch
3. Run tests and ensure they pass
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Live Demo**: Visit the deployed application
- **Issues**: Report bugs or request features on GitHub
- **Documentation**: Check the code comments and TypeScript definitions

---

**Built with ❤️ for individual investors who want to take control of their financial future while maintaining privacy and security in a modern web interface.**