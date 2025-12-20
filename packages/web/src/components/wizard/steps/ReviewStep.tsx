import { AlertTriangle, FileSpreadsheet, Tag, MessageSquare, Clock, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { DATA_CATEGORIES, type DataCategory } from '@wrapp0r/shared';
import type { ParsedFile } from '@/components/upload/FileDropzone';

interface ReviewStepProps {
  selectedFile: ParsedFile | null;
  selectedCategory: DataCategory | null;
  customDescription: string;
  hasApiKey: boolean;
  onOpenSettings: () => void;
}

export function ReviewStep({
  selectedFile,
  selectedCategory,
  customDescription,
  hasApiKey,
  onOpenSettings,
}: ReviewStepProps) {
  const categoryLabel = DATA_CATEGORIES.find(c => c.id === selectedCategory)?.label ?? 'Unknown';
  const rowCount = selectedFile?.totalRows ?? 0;

  // Estimate generation time based on data size
  const estimatedSeconds = Math.max(15, Math.min(60, Math.ceil(rowCount / 100) * 5));
  const estimatedTime = estimatedSeconds < 60
    ? `~${estimatedSeconds} seconds`
    : `~${Math.ceil(estimatedSeconds / 60)} minute${Math.ceil(estimatedSeconds / 60) > 1 ? 's' : ''}`;

  return (
    <div className="space-y-4">
      {/* API Key Warning */}
      {!hasApiKey && (
        <div className="flex items-start gap-3 rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
          <AlertTriangle className="h-5 w-5 shrink-0 text-amber-500 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm font-medium text-amber-700 dark:text-amber-400">
              API key required
            </p>
            <p className="mt-1 text-sm text-amber-600 dark:text-amber-500">
              Add your OpenAI API key in settings to generate your wrapped.
            </p>
            <Button
              variant="outline"
              size="sm"
              onClick={onOpenSettings}
              className="mt-3 gap-2 border-amber-500/30 text-amber-700 hover:bg-amber-500/10 dark:text-amber-400"
            >
              <Settings className="h-4 w-4" />
              Open settings
            </Button>
          </div>
        </div>
      )}

      {/* Summary Card */}
      <div className="rounded-lg border bg-card p-4">
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Summary</h3>

        <div className="space-y-3">
          {/* File */}
          <div className="flex items-start gap-3">
            <FileSpreadsheet className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{selectedFile?.name ?? 'No file'}</p>
              <p className="text-xs text-muted-foreground">
                {rowCount} row{rowCount !== 1 ? 's' : ''} of data
              </p>
            </div>
          </div>

          {/* Category */}
          <div className="flex items-start gap-3">
            <Tag className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{categoryLabel}</p>
              <p className="text-xs text-muted-foreground">Category</p>
            </div>
          </div>

          {/* Description (if provided) */}
          {customDescription && (
            <div className="flex items-start gap-3">
              <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{customDescription}</p>
                <p className="text-xs text-muted-foreground">Description</p>
              </div>
            </div>
          )}

          {/* Estimated Time */}
          <div className="flex items-start gap-3">
            <Clock className="h-4 w-4 shrink-0 text-muted-foreground mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium">{estimatedTime}</p>
              <p className="text-xs text-muted-foreground">Estimated generation time</p>
            </div>
          </div>
        </div>
      </div>

      {/* What happens next */}
      <p className="text-center text-xs text-muted-foreground">
        We'll analyse your data and create a personalised wrapped experience
      </p>
    </div>
  );
}
