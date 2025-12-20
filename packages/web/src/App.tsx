import { useState, createContext, useContext } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { SettingsProvider } from '@/hooks';
import { SplashScreen } from '@/components/SplashScreen';
import { Header } from '@/components/layout/Header';
import { HomePage } from '@/pages/HomePage';
import { GuidePage } from '@/pages/GuidePage';

// Context to control splash screen visibility from anywhere
interface SplashContextType {
  showSplash: boolean;
  setShowSplash: (show: boolean) => void;
}

const SplashContext = createContext<SplashContextType | null>(null);

export function useSplash() {
  const ctx = useContext(SplashContext);
  if (!ctx) throw new Error('useSplash must be used within SplashContext.Provider');
  return ctx;
}

function AppContent() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/guide" element={<GuidePage />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  const [showSplash, setShowSplash] = useState(true);

  return (
    <BrowserRouter>
      <ThemeProvider>
        <SettingsProvider>
          <SplashContext.Provider value={{ showSplash, setShowSplash }}>
            <AnimatePresence mode="wait">
              {showSplash ? (
                <SplashScreen key="splash" onContinue={() => setShowSplash(false)} />
              ) : (
                <AppContent key="main" />
              )}
            </AnimatePresence>
          </SplashContext.Provider>
        </SettingsProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
