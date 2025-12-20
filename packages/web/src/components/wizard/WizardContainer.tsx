import { useState, useCallback, useMemo } from 'react';
import { AnimatePresence } from 'framer-motion';
import type { DataCategory } from '@wrapp0r/shared';
import type { ParsedFile } from '@/components/upload/FileDropzone';
import { WizardStepIndicator } from './WizardStepIndicator';
import { WizardNavigation } from './WizardNavigation';
import { WizardStep } from './WizardStep';
import { UploadStep } from './steps/UploadStep';
import { CategoryStep } from './steps/CategoryStep';
import { ReviewStep } from './steps/ReviewStep';

const TOTAL_STEPS = 3;

interface WizardContainerProps {
  // File state
  selectedFile: ParsedFile | null;
  onFileSelect: (file: ParsedFile | null, fileData: ArrayBuffer | null) => void;

  // Category state
  selectedCategory: DataCategory | null;
  onCategorySelect: (category: DataCategory) => void;
  customDescription: string;
  onCustomDescriptionChange: (description: string) => void;

  // Settings
  hasApiKey: boolean;
  onOpenSettings: () => void;

  // Generation
  isGenerating: boolean;
  onGenerate: () => void;
}

export function WizardContainer({
  selectedFile,
  onFileSelect,
  selectedCategory,
  onCategorySelect,
  customDescription,
  onCustomDescriptionChange,
  hasApiKey,
  onOpenSettings,
  isGenerating,
  onGenerate,
}: WizardContainerProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [direction, setDirection] = useState<'forward' | 'backward'>('forward');

  // Get headers from file for category detection
  const headers = useMemo(() => {
    if (!selectedFile?.sheets) return undefined;
    const allHeaders = new Set<string>();
    for (const sheet of selectedFile.sheets) {
      for (const header of sheet.headers) {
        allHeaders.add(header);
      }
    }
    return allHeaders.size > 0 ? Array.from(allHeaders) : undefined;
  }, [selectedFile]);

  // Validation for each step
  const canProceedFromStep = useCallback((step: number): boolean => {
    switch (step) {
      case 0: // Upload step - need a file
        return selectedFile !== null;
      case 1: // Category step - need a category
        return selectedCategory !== null;
      case 2: // Review step - need API key to generate
        return hasApiKey;
      default:
        return false;
    }
  }, [selectedFile, selectedCategory, hasApiKey]);

  const handleNext = useCallback(() => {
    if (currentStep < TOTAL_STEPS - 1 && canProceedFromStep(currentStep)) {
      setDirection('forward');
      setCurrentStep(prev => prev + 1);
    }
  }, [currentStep, canProceedFromStep]);

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      setDirection('backward');
      setCurrentStep(prev => prev - 1);
    }
  }, [currentStep]);

  // Step titles and subtitles
  const getStepInfo = (step: number) => {
    switch (step) {
      case 0:
        return {
          title: 'Upload your data',
          subtitle: undefined,
        };
      case 1:
        return {
          title: 'What kind of data is this?',
          subtitle: selectedFile?.name ?? undefined,
        };
      case 2:
        return {
          title: 'Ready to generate',
          subtitle: undefined,
        };
      default:
        return { title: '', subtitle: undefined };
    }
  };

  const stepInfo = getStepInfo(currentStep);

  // Render current step content
  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <UploadStep
            selectedFile={selectedFile}
            onFileSelect={onFileSelect}
          />
        );
      case 1:
        return (
          <CategoryStep
            selectedCategory={selectedCategory}
            onCategorySelect={onCategorySelect}
            customDescription={customDescription}
            onCustomDescriptionChange={onCustomDescriptionChange}
            headers={headers}
          />
        );
      case 2:
        return (
          <ReviewStep
            selectedFile={selectedFile}
            selectedCategory={selectedCategory}
            customDescription={customDescription}
            hasApiKey={hasApiKey}
            onOpenSettings={onOpenSettings}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-col">
      {/* Step indicator */}
      <div className="mb-8">
        <WizardStepIndicator currentStep={currentStep} totalSteps={TOTAL_STEPS} />
      </div>

      {/* Step content with animation */}
      <div className="min-h-[300px] relative overflow-hidden">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <WizardStep
            key={currentStep}
            title={stepInfo.title}
            subtitle={stepInfo.subtitle}
            direction={direction}
          >
            {renderStepContent()}
          </WizardStep>
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <WizardNavigation
        currentStep={currentStep}
        totalSteps={TOTAL_STEPS}
        canGoNext={canProceedFromStep(currentStep)}
        isGenerating={isGenerating}
        onBack={handleBack}
        onNext={handleNext}
        onGenerate={onGenerate}
      />
    </div>
  );
}
