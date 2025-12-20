import { Lightbulb } from 'lucide-react';
import { CategorySelect } from '@/components/upload/CategorySelect';
import type { DataCategory } from '@wrapp0r/shared';

interface CategoryStepProps {
  selectedCategory: DataCategory | null;
  onCategorySelect: (category: DataCategory) => void;
  customDescription: string;
  onCustomDescriptionChange: (description: string) => void;
  headers?: string[];
}

export function CategoryStep({
  selectedCategory,
  onCategorySelect,
  customDescription,
  onCustomDescriptionChange,
  headers,
}: CategoryStepProps) {
  return (
    <div className="space-y-4">
      {/* Helper text */}
      <div className="flex items-start gap-2 text-sm text-muted-foreground">
        <Lightbulb className="h-4 w-4 shrink-0 mt-0.5" />
        <p>
          Selecting the right category helps AI create more relevant insights and choose
          the perfect theme for your wrapped.
        </p>
      </div>

      <CategorySelect
        value={selectedCategory}
        onChange={onCategorySelect}
        customDescription={customDescription}
        onCustomDescriptionChange={onCustomDescriptionChange}
        headers={headers}
      />
    </div>
  );
}
