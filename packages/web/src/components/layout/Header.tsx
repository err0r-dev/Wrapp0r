import { useState } from 'react';
import { Settings, Moon, Sun, HelpCircle, Upload, Sparkles, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme } from './ThemeProvider';
import { SettingsModal } from '@/components/SettingsModal';
import { useSplash } from '@/App';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const { setShowSplash } = useSplash();

  const ThemeIcon = theme === 'light' ? Sun : Moon;

  return (
    <>
      {/* Skip link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:z-50 focus:top-4 focus:left-4 focus:px-4 focus:py-2 focus:bg-primary focus:text-primary-foreground focus:rounded-md"
      >
        Skip to main content
      </a>

      <header className="sticky top-0 z-40 w-full border-b border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/5 backdrop-blur-xl">
        <div className="container flex h-14 items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowSplash(true)}
              className="flex items-center gap-2 hover:opacity-80 transition-opacity"
              aria-label="Return to welcome screen"
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
                W
              </div>
              <span className="text-lg font-semibold">Wrapp0r</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setHelpOpen(true)}
              title="How to use"
            >
              <HelpCircle className="h-5 w-5" />
              <span className="sr-only">How to use</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              <ThemeIcon className="h-5 w-5" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSettingsOpen(true)}
              title="Settings"
            >
              <Settings className="h-5 w-5" />
              <span className="sr-only">Settings</span>
            </Button>
          </div>
        </div>
      </header>

      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />

      {/* Help Dialog */}
      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent className="sm:max-w-md" onClose={() => setHelpOpen(false)}>
          <DialogHeader>
            <DialogTitle>How to use Wrapp0r</DialogTitle>
            <DialogDescription>
              Create your personalised wrapped in 3 simple steps
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Upload className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium">1. Upload your data</p>
                <p className="text-sm text-muted-foreground">
                  Drop any Excel, CSV, or JSON file with your data
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium">2. Generate</p>
                <p className="text-sm text-muted-foreground">
                  AI analyses your data and creates personalised slides
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Video className="h-4 w-4" />
              </div>
              <div>
                <p className="font-medium">3. Export</p>
                <p className="text-sm text-muted-foreground">
                  Download your wrapped as an MP4 video to share
                </p>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
