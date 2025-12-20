import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { SettingsProvider } from '@/hooks';
import { SplashScreen } from '@/components/SplashScreen';
import { Header } from '@/components/layout/Header';
import { HomePage } from '@/pages/HomePage';
import { GuidePage } from '@/pages/GuidePage';

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

  useEffect(() => {
    // Show splash screen for 2.5 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <BrowserRouter>
      <ThemeProvider>
        <SettingsProvider>
          <AnimatePresence mode="wait">
            {showSplash ? (
              <SplashScreen key="splash" onComplete={() => setShowSplash(false)} />
            ) : (
              <AppContent key="main" />
            )}
          </AnimatePresence>
        </SettingsProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
