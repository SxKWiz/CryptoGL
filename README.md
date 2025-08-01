# Chart Glance

A modern financial dashboard for viewing interactive TradingView charts with AI-powered analysis. Built with Next.js, React, and GenKit AI.

## ✨ Features

### Core Features
- **Interactive TradingView Charts**: Display real-time charts for stocks and cryptocurrencies
- **Ticker Selection**: Choose from popular stocks/crypto or manually enter any ticker
- **Multiple Timeframes**: Support for 1m, 5m, 15m, 1H, 4H, 1D, 1W intervals
- **AI Analysis**: Get comprehensive technical, fundamental, and sentiment analysis powered by Google's Gemini AI
- **Recent Selections**: Automatically remembers your recent ticker selections

### Advanced Features
- **Watchlist**: Save and manage your favorite tickers
- **Portfolio Tracking**: Track your holdings with quantity and average price
- **Export Analysis**: Download AI analysis as text or JSON files
- **Theme Toggle**: Switch between light, dark, and system themes
- **Responsive Design**: Optimized for desktop and mobile devices

### Design & UX
- **Trust-Inspiring Design**: Deep blue (#3F51B5) primary color for financial trust
- **Clean Interface**: Light gray (#F5F5F5) background to minimize distraction
- **Interactive Elements**: Teal (#009688) accent color for call-to-action buttons
- **Modern Typography**: Inter font for clean and professional appearance
- **Subtle Transitions**: Smooth animations when loading charts and switching views

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Google AI API Key (for AI analysis features)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chart-glance
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   
   Edit `.env.local` and add your Google AI API key:
   ```env
   GOOGLE_API_KEY=your_google_ai_api_key_here
   ```
   
   Get your API key from: https://makersuite.google.com/app/apikey

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:9002` to see the application.

### Building for Production

```bash
npm run build
npm start
```

## 🛠️ Technology Stack

- **Framework**: Next.js 15.3.3 with App Router
- **UI Components**: Radix UI primitives with custom styling
- **Styling**: Tailwind CSS with custom theme
- **AI Integration**: GenKit with Google Gemini 2.5 Flash
- **Charts**: TradingView widget integration
- **State Management**: React hooks with localStorage persistence
- **Icons**: Lucide React
- **Forms**: React Hook Form with Zod validation

## 📱 Usage

### Basic Usage
1. **Select a Ticker**: Use the ticker selector to choose a stock or crypto symbol
2. **Choose Timeframe**: Pick your preferred chart interval (1m to 1W)
3. **View Chart**: Interactive TradingView chart loads automatically
4. **Get AI Analysis**: Click "Analyze with AI" for comprehensive market insights

### Managing Your Watchlist
1. **Add to Watchlist**: Click the star button next to any ticker
2. **View Watchlist**: See your saved tickers in the sidebar
3. **Quick Navigation**: Click on any watchlist item to view its chart

### Portfolio Tracking
1. **Add Position**: Click "Add" in the Portfolio section
2. **Enter Details**: Specify ticker, quantity, and average price
3. **Track Value**: View total portfolio value and individual positions
4. **Manage Holdings**: Edit or remove positions as needed

### Exporting Analysis
1. **Generate Analysis**: Run AI analysis on any ticker
2. **Export Options**: Choose from text, JSON, or copy to clipboard
3. **Save Reports**: Download analysis reports for record keeping

## 🎨 Customization

### Theme Configuration
The app uses a custom theme based on the blueprint style guidelines:
- Primary: Deep blue (#3F51B5)
- Background: Light gray (#F5F5F5) 
- Accent: Teal (#009688)

Theme colors can be customized in `src/app/globals.css`.

### Adding New Features
The codebase is modular and extensible:
- Components are in `src/components/`
- AI flows are in `src/ai/flows/`
- Custom hooks are in `src/hooks/`

## 🔧 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `GOOGLE_API_KEY` | Google AI API key for GenKit | Yes |
| `NEXT_PUBLIC_APP_NAME` | Application name | No |
| `NEXT_PUBLIC_APP_DESCRIPTION` | App description | No |

## 📝 Scripts

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - Run TypeScript type checking
- `npm run genkit:dev` - Start GenKit development server
- `npm run genkit:watch` - Start GenKit in watch mode

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## ⚠️ Disclaimer

This application is for informational purposes only and should not be considered financial advice. Always do your own research before making investment decisions.

## 🙏 Acknowledgments

- TradingView for chart data and widgets
- Google AI for powering the analysis features
- Radix UI for accessible component primitives
- The React and Next.js communities
