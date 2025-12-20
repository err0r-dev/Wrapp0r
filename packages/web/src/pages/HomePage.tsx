import { useState, useMemo, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useSettings, useWrappedGeneration } from '@/hooks';
import { detectCategory } from '@/lib/category-detector';
import { LoadingOverlay } from '@/components/LoadingOverlay';
import { WrappedViewer } from '@/components/wrapped/WrappedViewer';
import { ErrorMessage } from '@/components/ErrorMessage';
import { WizardContainer } from '@/components/wizard';
import { SettingsModal } from '@/components/SettingsModal';
import { useSplash } from '@/App';
import type { DataCategory, WrappedExperience } from '@wrapp0r/shared';
import type { ParsedFile } from '@/components/upload/FileDropzone';

export function HomePage() {
  const { hasApiKey, settings } = useSettings();
  const { setShowSplash } = useSplash();
  const [file, setFile] = useState<ParsedFile | null>(null);
  const [fileData, setFileData] = useState<ArrayBuffer | null>(null);
  const [category, setCategory] = useState<DataCategory | null>(null);
  const [customDescription, setCustomDescription] = useState('');
  const [wrappedResult, setWrappedResult] = useState<WrappedExperience | null>(null);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const {
    isGenerating,
    progress,
    error,
    validationWarnings,
    generate,
    reset,
    clearError,
  } = useWrappedGeneration({
    apiKey: settings.apiKey || '',
    model: settings.model,
  });

  // Extract all unique headers from the file for category detection
  const allHeaders = useMemo(() => {
    if (!file) return [];
    const headers = new Set<string>();
    for (const sheet of file.sheets) {
      for (const header of sheet.headers) {
        headers.add(header);
      }
    }
    return Array.from(headers);
  }, [file]);

  // Auto-select category when detected with high confidence
  useEffect(() => {
    if (allHeaders.length > 0 && !category) {
      const detection = detectCategory(allHeaders);
      if (detection.confidence >= 50 && detection.category !== 'other') {
        setCategory(detection.category);
      }
    }
  }, [allHeaders, category]);

  const handleFileSelect = useCallback((parsedFile: ParsedFile | null, data: ArrayBuffer | null) => {
    setFile(parsedFile);
    setFileData(data);
    // Reset category when file changes so auto-detection can run again
    setCategory(null);
  }, []);

  const handleCategorySelect = useCallback((newCategory: DataCategory) => {
    setCategory(newCategory);
  }, []);

  const handleCustomDescriptionChange = useCallback((description: string) => {
    setCustomDescription(description);
  }, []);

  const handleGenerate = useCallback(async () => {
    if (!file || !fileData || !category) return;

    try {
      const result = await generate({
        file,
        fileData,
        category,
        customDescription: customDescription || undefined,
      });
      setWrappedResult(result);
    } catch {
      // Error is handled by the hook and stored in state
    }
  }, [file, fileData, category, customDescription, generate]);

  const handleCloseViewer = useCallback(() => {
    setWrappedResult(null);
    setFile(null);
    setFileData(null);
    setCategory(null);
    setCustomDescription('');
    reset();
    setShowSplash(true);
  }, [reset, setShowSplash]);

  const handleRetry = useCallback(() => {
    clearError();
    handleGenerate();
  }, [clearError, handleGenerate]);

  const handleOpenSettings = useCallback(() => {
    setSettingsOpen(true);
  }, []);

  return (
    <div className="mx-auto max-w-2xl">
      {/* Hero Section - Simplified */}
      <motion.div
        className="mb-8 text-center"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-3xl">
          Transform Your Data Into
          <span className="block text-primary">Something Beautiful</span>
        </h1>
      </motion.div>

      {/* Wizard */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        <WizardContainer
          selectedFile={file}
          onFileSelect={handleFileSelect}
          selectedCategory={category}
          onCategorySelect={handleCategorySelect}
          customDescription={customDescription}
          onCustomDescriptionChange={handleCustomDescriptionChange}
          hasApiKey={hasApiKey}
          onOpenSettings={handleOpenSettings}
          isGenerating={isGenerating}
          onGenerate={handleGenerate}
        />
      </motion.div>

      {/* Settings Modal */}
      <SettingsModal open={settingsOpen} onOpenChange={setSettingsOpen} />

      {/* Error message */}
      {error && (
        <ErrorMessage
          error={error}
          onDismiss={clearError}
          onRetry={handleRetry}
          variant="toast"
        />
      )}

      {/* Loading overlay */}
      <LoadingOverlay
        isVisible={isGenerating}
        stage={progress?.stage === 'complete' ? 'finalizing' : progress?.stage}
        progress={progress?.progress ?? 0}
        message={progress?.message}
      />

      {/* Wrapped viewer */}
      {wrappedResult && (
        <WrappedViewer
          wrapped={wrappedResult}
          onClose={handleCloseViewer}
          enableAudio={true}
          enableVideoExport={true}
          validationWarnings={validationWarnings}
        />
      )}
    </div>
  );
}
