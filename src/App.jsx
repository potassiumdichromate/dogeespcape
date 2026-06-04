import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { WalletConnectProvider as DogeOSConnectProvider } from '@dogeos/dogeos-sdk';
import { WalletProvider, useWallet } from './context/WalletContext';
import { GameProvider } from './context/GameContext';
import { ThemeProvider } from './context/ThemeContext';
import LandingPage from './pages/LandingPage';
import Home from './pages/Home';
import GamePage from './pages/GamePage';
import ProfilePage from './pages/ProfilePage';
import LeaderboardPage from './pages/LeaderboardPage';
import MarketPage from './pages/MarketPage';
import OGDashboard from './pages/OGDashboard';

const dogeOSClientId = import.meta.env.VITE_DOGEOS_CLIENT_ID || 'YOUR_DOGEOS_CLIENT_ID';

const dogeOSConnectors = [
  {
    id: 'dogeescape-mydoge',
    name: 'MyDoge Wallet',
    dogecoin: {
      namespace: 'doge',
    },
    icon: '/images/mydoge-assets/Square_Logo.png',
    iconBackground: '#f0b429',
    downloadUrls: {
      chrome: 'https://v3.mydoge.com/',
      browserExtension: 'https://v3.mydoge.com/',
      qrCode: 'https://v3.mydoge.com/',
    },
  },
];

const dogeOSConfig = {
  clientId: dogeOSClientId,
  connectors: dogeOSConnectors,
  metadata: {
    name: 'Doge Escape',
    description: 'Race, collect, and trade in the Doge Escape game world.',
    url: typeof window !== 'undefined' ? window.location.origin : 'https://dogeescape.xyz',
    icons: ['/images/Icon-Logo.png'],
  },
  theme: {
    defaultTheme: 'dark',
    themes: {
      dark: {
        colors: {
          primary: {
            DEFAULT: '#f0b429',
            foreground: '#120d08',
          },
          background: '#0f0c08',
          foreground: '#f8f1df',
          content1: '#17100b',
          content2: '#21170f',
          content3: '#2b1f15',
          content4: '#3a2a1c',
          divider: '#5a4328',
          focus: '#f0b429',
          default: {
            DEFAULT: '#2b1f15',
            foreground: '#f8f1df',
          },
        },
      },
      light: {
        colors: {
          primary: {
            DEFAULT: '#f0b429',
            foreground: '#120d08',
          },
        },
      },
    },
  },
};

if (dogeOSClientId === 'YOUR_DOGEOS_CLIENT_ID') {
  console.warn('Set VITE_DOGEOS_CLIENT_ID to your approved DogeOS SDK client ID.');
}

const InitialLoadingScreenDismissal = () => {
  useEffect(() => {
    const dismissLoadingScreen = () => {
      const loadingScreen = document.getElementById('loading-screen');

      if (!loadingScreen) {
        return;
      }

      loadingScreen.style.opacity = '0';
      loadingScreen.style.transition = 'opacity 0.35s ease-out';
      window.setTimeout(() => loadingScreen.remove(), 400);
    };

    const frameId = window.requestAnimationFrame(dismissLoadingScreen);

    return () => window.cancelAnimationFrame(frameId);
  }, []);

  return null;
};

// Protected Route wrapper
const ProtectedRoute = ({ children }) => {
  const { isConnected, isInitializing } = useWallet();
  const location = useLocation();

  if (isInitializing) {
    return null; // Don't redirect while checking connection
  }

  if (!isConnected) {
    return <Navigate to="/" replace state={{ returnTo: location.pathname }} />;
  }

  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route
        path="/Home"
        element={
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        }
      />
      <Route
        path="/market"
        element={
          <ProtectedRoute>
            <MarketPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/play"
        element={
          <ProtectedRoute>
            <GamePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/leaderboard"
        element={
          <ProtectedRoute>
            <LeaderboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/og-dashboard"
        element={
          <ProtectedRoute>
            <OGDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
}

function App() {
  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <ThemeProvider>
        <InitialLoadingScreenDismissal />
        <DogeOSConnectProvider config={dogeOSConfig}>
          <WalletProvider>
            <GameProvider>
              <div className="min-h-screen">
                <AppRoutes />
              </div>
            </GameProvider>
          </WalletProvider>
        </DogeOSConnectProvider>
      </ThemeProvider>
    </Router>
  );
}

export default App;
