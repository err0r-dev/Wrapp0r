import { useMemo } from 'react';
import { Activity, Music, UtensilsCrossed, DollarSign, Briefcase, FileSpreadsheet, Film, Gamepad2, Sparkles, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { DATA_CATEGORIES, type DataCategory } from '@wrapp0r/shared';
import { detectCategory, getCategoryMismatchWarning, type CategoryDetectionResult } from '@/lib/category-detector';

const ICON_MAP = {
  Activity,
  Music,
  UtensilsCrossed,
  DollarSign,
  Briefcase,
  Film,
  Gamepad2,
  FileSpreadsheet,
} as const;

interface CategorySelectProps {
  value: DataCategory | null;
  onChange: (category: DataCategory) => void;
  customDescription: string;
  onCustomDescriptionChange: (description: string) => void;
  disabled?: boolean;
  /** Headers from the uploaded file for category detection */
  headers?: string[];
}

export function CategorySelect({
  value,
  onChange,
  customDescription,
  onCustomDescriptionChange,
  disabled,
  headers,
}: CategorySelectProps) {
  // Detect category from headers
  const detection: CategoryDetectionResult | null = useMemo(() => {
    if (!headers || headers.length === 0) return null;
    return detectCategory(headers);
  }, [headers]);

  // Get mismatch warning
  const mismatchWarning = useMemo(() => {
    if (!detection || !value || detection.category === 'other') return null;
    return getCategoryMismatchWarning(detection.category, value, detection.matches);
  }, [detection, value]);

  return (
    <div className="space-y-3">
      {/* Auto-detected suggestion */}
      {detection && detection.category !== 'other' && detection.confidence >= 30 && (
        <div className="flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 p-2 text-sm">
          <Sparkles className="h-4 w-4 shrink-0 text-primary" />
          <div className="flex-1">
            <span className="text-muted-foreground">Detected: </span>
            <button
              type="button"
              onClick={() => onChange(detection.category)}
              className="font-medium text-primary hover:underline"
              disabled={disabled}
            >
              {DATA_CATEGORIES.find(c => c.id === detection.category)?.label}
            </button>
            <span className="ml-1 text-xs text-muted-foreground">
              ({detection.confidence}% confidence)
            </span>
          </div>
        </div>
      )}

      {/* Mismatch warning */}
      {mismatchWarning && (
        <div className="flex items-start gap-2 rounded-lg border border-amber-500/30 bg-amber-500/10 p-2 text-sm">
          <AlertTriangle className="h-4 w-4 shrink-0 text-amber-500 mt-0.5" />
          <div className="flex-1 text-amber-700 dark:text-amber-400">
            {mismatchWarning}
          </div>
        </div>
      )}

      <div
        className="grid grid-cols-2 gap-2"
        role="radiogroup"
        aria-label="Select data category"
      >
        {DATA_CATEGORIES.map((category) => {
          const Icon = ICON_MAP[category.icon as keyof typeof ICON_MAP];
          const isSelected = value === category.id;
          const isDetected = detection?.category === category.id && detection.confidence >= 30;
          const isMismatch = isSelected && mismatchWarning;

          return (
            <button
              key={category.id}
              type="button"
              role="radio"
              aria-checked={isSelected}
              disabled={disabled}
              onClick={() => onChange(category.id)}
              className={cn(
                'relative flex flex-col items-center gap-1 rounded-lg border p-3 text-center transition-all',
                'disabled:cursor-not-allowed disabled:opacity-50',
                // Hover states - amber for non-detected items when AI has detected a category
                !isDetected && detection && detection.category !== 'other' && detection.confidence >= 30
                  ? 'hover:border-amber-500/50 hover:bg-amber-500/5'
                  : 'hover:border-primary/50 hover:bg-primary/5',
                isSelected
                  ? isMismatch
                    ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/20'
                    : 'border-primary bg-primary/10 ring-2 ring-primary/20'
                  : isDetected
                    ? 'border-primary/40 bg-primary/5'
                    : 'border-muted'
              )}
            >
              {/* Detected badge - always show when AI detected this category */}
              {isDetected && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] text-primary-foreground">
                  <Sparkles className="h-2.5 w-2.5" />
                </span>
              )}
              <Icon className={cn('h-5 w-5', isSelected ? (isMismatch ? 'text-amber-600 dark:text-amber-500' : 'text-primary') : isDetected ? 'text-primary/70' : 'text-muted-foreground')} />
              <span className={cn('text-xs font-medium text-center leading-tight', isSelected ? (isMismatch ? 'text-amber-600 dark:text-amber-500' : 'text-primary') : isDetected ? 'text-primary/70' : '')}>
                {category.label}
              </span>
            </button>
          );
        })}
      </div>

      {value && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            {DATA_CATEGORIES.find((c) => c.id === value)?.examples}
          </p>
          <Input
            placeholder="Optional: Describe your data (e.g., 'My 2024 running data from Strava')"
            value={customDescription}
            onChange={(e) => onCustomDescriptionChange(e.target.value)}
            className="text-sm"
          />
        </div>
      )}
    </div>
  );
}
