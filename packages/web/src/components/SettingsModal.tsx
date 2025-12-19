import { useState, useEffect } from 'react';
import { Eye, EyeOff, Trash2, AlertTriangle, Clock, Zap, Brain, Music, ChevronDown, Sparkles } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useSettings } from '@/hooks/useSettings';
import { MODEL_CONFIG, type OpenAIModel } from '@wrapp0r/shared';

interface SettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Group models by type
const STANDARD_MODELS: OpenAIModel[] = ['gpt-4o', 'gpt-4o-mini'];
const REASONING_MODELS: OpenAIModel[] = ['o1-mini', 'o1', 'o1-pro'];

export function SettingsModal({ open, onOpenChange }: SettingsModalProps) {
  const { settings, setApiKey, setPixabayApiKey, setModel, clearSettings, hasApiKey } = useSettings();
  const [localApiKey, setLocalApiKey] = useState('');
  const [localPixabayKey, setLocalPixabayKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [showPixabayKey, setShowPixabayKey] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [openAIExpanded, setOpenAIExpanded] = useState(true);
  const [musicExpanded, setMusicExpanded] = useState(true);

  useEffect(() => {
    if (open) {
      setLocalApiKey(settings.apiKey || '');
      setLocalPixabayKey(settings.pixabayApiKey || '');
      setShowApiKey(false);
      setShowPixabayKey(false);
      setShowClearConfirm(false);
    }
  }, [open, settings.apiKey, settings.pixabayApiKey]);

  const handleSave = () => {
    setApiKey(localApiKey || undefined);
    setPixabayApiKey(localPixabayKey || undefined);
    onOpenChange(false);
  };

  const handleClear = () => {
    clearSettings();
    setLocalApiKey('');
    setLocalPixabayKey('');
    setShowClearConfirm(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent onClose={() => onOpenChange(false)} className="sm:max-w-md max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
          <DialogDescription>
            Configure your API keys and preferences. All settings are stored locally.
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-2">
          {/* OpenAI Section */}
          <div className="rounded-lg border border-border overflow-hidden">
            <button
              type="button"
              onClick={() => setOpenAIExpanded(!openAIExpanded)}
              className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
                  <Sparkles className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <h3 className="font-medium">OpenAI</h3>
                  <p className="text-xs text-muted-foreground">AI model and API key</p>
                </div>
              </div>
              <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${openAIExpanded ? 'rotate-180' : ''}`} />
            </button>

            {openAIExpanded && (
              <div className="border-t border-border p-4 space-y-4">
                {/* OpenAI API Key */}
                <div className="space-y-2">
                  <Label htmlFor="apiKey">API Key</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <Input
                        id="apiKey"
                        type={showApiKey ? 'text' : 'password'}
                        value={localApiKey}
                        onChange={(e) => setLocalApiKey(e.target.value)}
                        placeholder="sk-..."
                        className="pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowApiKey(!showApiKey)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Required for AI generation.{' '}
                    <a
                      href="https://platform.openai.com/api-keys"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline"
                    >
                      Get an API key
                    </a>
                  </p>
                </div>

                {/* Model Selection */}
                <div className="space-y-3">
                  <Label>AI Model</Label>

                  {/* Standard Models Group */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Zap className="h-3.5 w-3.5" />
                      <span>Standard Models</span>
                    </div>
                    <div className="grid gap-2">
                      {STANDARD_MODELS.map((model) => {
                        const config = MODEL_CONFIG[model];
                        return (
                          <button
                            key={model}
                            type="button"
                            onClick={() => setModel(model)}
                            className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
                              settings.model === model
                                ? 'border-primary bg-primary/10'
                                : 'border-border hover:border-primary/50 hover:bg-muted/50'
                            }`}
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{config.displayName}</span>
                                {config.tier === 'recommended' && (
                                  <span className="rounded-full bg-primary/20 px-2 py-0.5 text-xs text-primary">
                                    Recommended
                                  </span>
                                )}
                                {config.tier === 'budget' && (
                                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                    Budget
                                  </span>
                                )}
                              </div>
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                {config.description}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Reasoning Models Group */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Brain className="h-3.5 w-3.5" />
                      <span>Reasoning Models</span>
                      <span className="rounded-full bg-muted px-2 py-0.5 text-xs">
                        Slower
                      </span>
                    </div>
                    <div className="grid gap-2">
                      {REASONING_MODELS.map((model) => {
                        const config = MODEL_CONFIG[model];
                        return (
                          <button
                            key={model}
                            type="button"
                            onClick={() => setModel(model)}
                            className={`flex items-start gap-3 rounded-lg border p-3 text-left transition-colors ${
                              settings.model === model
                                ? 'border-primary bg-primary/10'
                                : 'border-border hover:border-primary/50 hover:bg-muted/50'
                            }`}
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="font-medium">{config.displayName}</span>
                                {config.tier === 'standard' && (
                                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                                    Standard
                                  </span>
                                )}
                                {config.tier === 'advanced' && (
                                  <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-xs text-purple-600 dark:text-purple-400">
                                    Advanced
                                  </span>
                                )}
                                {config.tier === 'premium' && (
                                  <span className="rounded-full bg-amber-500/20 px-2 py-0.5 text-xs text-amber-600 dark:text-amber-400">
                                    Premium
                                  </span>
                                )}
                              </div>
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                {config.description}
                              </p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Warning for o1-pro */}
                  {settings.model === 'o1-pro' && (
                    <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-3">
                      <Clock className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
                      <div className="text-sm">
                        <p className="font-medium text-amber-600 dark:text-amber-400">
                          Premium Model Selected
                        </p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          o1-pro is significantly more expensive and slower. Best for complex analysis.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Music Section */}
          <div className="rounded-lg border border-border overflow-hidden">
            <button
              type="button"
              onClick={() => setMusicExpanded(!musicExpanded)}
              className="flex w-full items-center justify-between p-4 text-left hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-500/10">
                  <Music className="h-4 w-4 text-purple-500" />
                </div>
                <div>
                  <h3 className="font-medium">Background Music</h3>
                  <p className="text-xs text-muted-foreground">Jamendo API (optional)</p>
                </div>
              </div>
              <ChevronDown className={`h-5 w-5 text-muted-foreground transition-transform duration-200 ${musicExpanded ? 'rotate-180' : ''}`} />
            </button>

            {musicExpanded && (
              <div className="border-t border-border p-4 space-y-2">
                <Label htmlFor="pixabayKey">Client ID</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Input
                      id="pixabayKey"
                      type={showPixabayKey ? 'text' : 'password'}
                      value={localPixabayKey}
                      onChange={(e) => setLocalPixabayKey(e.target.value)}
                      placeholder="Enter Jamendo client ID..."
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPixabayKey(!showPixabayKey)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      {showPixabayKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Enables dynamic background music.{' '}
                  <a
                    href="https://developer.jamendo.com/v3.0"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Get a free client ID
                  </a>
                  {' '}(free for non-commercial use)
                </p>
              </div>
            )}
          </div>

          {/* Clear Data */}
          {hasApiKey && (
            <div className="space-y-2 rounded-lg border border-destructive/20 bg-destructive/5 p-4">
              <div className="flex items-center gap-2 text-destructive">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">Danger Zone</span>
              </div>
              {showClearConfirm ? (
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Are you sure? This will clear all API keys and settings.
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={handleClear}
                    >
                      Yes, clear all
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowClearConfirm(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowClearConfirm(true)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Clear all settings
                </Button>
              )}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Settings</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
