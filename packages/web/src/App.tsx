import { useState, useEffect } from 'react';
import { AnimatePresence } from 'framer-motion';
import { ThemeProvider } from '@/components/layout/ThemeProvider';
import { SplashScreen } from '@/components/SplashScreen';
import { Header } from '@/components/layout/Header';
import { HomePage } from '@/pages/HomePage';

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
    <ThemeProvider>
      <AnimatePresence mode="wait">
        {showSplash ? (
          <SplashScreen key="splash" onComplete={() => setShowSplash(false)} />
        ) : (
          <div key="main" className="min-h-screen bg-background text-foreground">
            <Header />
            <main className="container mx-auto px-4 py-8">
              <HomePage />
            </main>
          </div>
        )}
      </AnimatePresence>
    </ThemeProvider>
  );
}

export default App;
