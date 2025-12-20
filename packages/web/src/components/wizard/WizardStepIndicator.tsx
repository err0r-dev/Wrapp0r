import { cn } from '@/lib/utils';

interface WizardStepIndicatorProps {
  currentStep: number;
  totalSteps: number;
}

export function WizardStepIndicator({ currentStep, totalSteps }: WizardStepIndicatorProps) {
  return (
    <div className="flex items-center justify-center gap-2" role="tablist" aria-label="Progress">
      {Array.from({ length: totalSteps }, (_, index) => {
        const isCompleted = index < currentStep;
        const isCurrent = index === currentStep;

        return (
          <div
            key={index}
            role="tab"
            aria-selected={isCurrent}
            aria-label={`Step ${index + 1}${isCompleted ? ' (completed)' : isCurrent ? ' (current)' : ''}`}
            className={cn(
              'h-2 w-2 rounded-full transition-all duration-200',
              isCompleted
                ? 'bg-primary'
                : isCurrent
                  ? 'bg-primary ring-2 ring-primary/30 ring-offset-2 ring-offset-background'
                  : 'bg-muted-foreground/30'
            )}
          />
        );
      })}
    </div>
  );
}
