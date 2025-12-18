import { Activity, Music, UtensilsCrossed, DollarSign, Briefcase, FileSpreadsheet } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { DATA_CATEGORIES, type DataCategory } from '@wrapp0r/shared';

const ICON_MAP = {
  Activity,
  Music,
  UtensilsCrossed,
  DollarSign,
  Briefcase,
  FileSpreadsheet,
} as const;

interface CategorySelectProps {
  value: DataCategory | null;
  onChange: (category: DataCategory) => void;
  customDescription: string;
  onCustomDescriptionChange: (description: string) => void;
  disabled?: boolean;
}

export function CategorySelect({
  value,
  onChange,
  customDescription,
  onCustomDescriptionChange,
  disabled,
}: CategorySelectProps) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        {DATA_CATEGORIES.map((category) => {
          const Icon = ICON_MAP[category.icon as keyof typeof ICON_MAP];
          const isSelected = value === category.id;

          return (
            <button
              key={category.id}
              type="button"
              disabled={disabled}
              onClick={() => onChange(category.id)}
              className={cn(
                'flex flex-col items-center gap-1 rounded-lg border p-3 text-center transition-all',
                'hover:border-primary/50 hover:bg-primary/5',
                'disabled:cursor-not-allowed disabled:opacity-50',
                isSelected
                  ? 'border-primary bg-primary/10 ring-2 ring-primary/20'
                  : 'border-muted'
              )}
            >
              <Icon className={cn('h-5 w-5', isSelected ? 'text-primary' : 'text-muted-foreground')} />
              <span className={cn('text-xs font-medium', isSelected && 'text-primary')}>
                {category.label.split(' ')[0]}
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
            placeholder="Optional: Add more context about your data..."
            value={customDescription}
            onChange={(e) => onCustomDescriptionChange(e.target.value)}
            className="text-sm"
          />
        </div>
      )}
    </div>
  );
}
