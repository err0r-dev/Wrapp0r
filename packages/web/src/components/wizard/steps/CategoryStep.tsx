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
    <CategorySelect
      value={selectedCategory}
      onChange={onCategorySelect}
      customDescription={customDescription}
      onCustomDescriptionChange={onCustomDescriptionChange}
      headers={headers}
    />
  );
}
