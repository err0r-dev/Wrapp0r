import { ChevronLeft, ChevronRight, Sparkles, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface WizardNavigationProps {
  currentStep: number;
  totalSteps: number;
  canGoNext: boolean;
  isGenerating?: boolean;
  onBack: () => void;
  onNext: () => void;
  onGenerate: () => void;
}

export function WizardNavigation({
  currentStep,
  totalSteps,
  canGoNext,
  isGenerating = false,
  onBack,
  onNext,
  onGenerate,
}: WizardNavigationProps) {
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === totalSteps - 1;

  return (
    <div className="flex items-center justify-between pt-6">
      {/* Back button - hidden on first step but keeps space */}
      <div className={cn('transition-opacity', isFirstStep ? 'opacity-0 pointer-events-none' : '')}>
        <Button
          variant="ghost"
          onClick={onBack}
          disabled={isFirstStep || isGenerating}
          className="gap-1"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </Button>
      </div>

      {/* Next / Generate button */}
      {isLastStep ? (
        <Button
          onClick={onGenerate}
          disabled={!canGoNext || isGenerating}
          size="lg"
          className="gap-2"
        >
          {isGenerating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate wrapped
            </>
          )}
        </Button>
      ) : (
        <Button
          onClick={onNext}
          disabled={!canGoNext}
          className="gap-1"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      )}
    </div>
  );
}
