import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Sparkles, Wand2, BarChart3, Palette, Music } from 'lucide-react';
import { Progress } from '@/components/ui/progress';

export type GenerationStage =
  | 'preparing'
  | 'analyzing'
  | 'generating'
  | 'designing'
  | 'finalizing';

interface LoadingOverlayProps {
  isVisible: boolean;
  stage?: GenerationStage;
  progress?: number;
  message?: string;
}

const stageConfig: Record<
  GenerationStage,
  { icon: typeof Loader2; label: string; description: string }
> = {
  preparing: {
    icon: Loader2,
    label: 'Preparing',
    description: 'Getting your data ready...',
  },
  analyzing: {
    icon: BarChart3,
    label: 'Analyzing',
    description: 'Finding patterns in your data...',
  },
  generating: {
    icon: Wand2,
    label: 'Generating',
    description: 'Creating insights and stories...',
  },
  designing: {
    icon: Palette,
    label: 'Designing',
    description: 'Crafting beautiful visuals...',
  },
  finalizing: {
    icon: Music,
    label: 'Finalizing',
    description: 'Adding the finishing touches...',
  },
};

export function LoadingOverlay({
  isVisible,
  stage = 'preparing',
  progress = 0,
  message,
}: LoadingOverlayProps) {
  const config = stageConfig[stage];
  const Icon = config.icon;

  return createPortal(
    <AnimatePresence>
      {isVisible && (
        <motion.div
          className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col items-center gap-8 px-4 text-center">
            {/* Animated icon */}
            <motion.div
              className="relative"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, type: 'spring' }}
            >
              {/* Outer glow ring */}
              <motion.div
                className="absolute inset-0 rounded-full bg-primary/20 blur-xl"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.5, 0.8, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                }}
              />

              {/* Icon container */}
              <motion.div
                className="relative flex h-24 w-24 items-center justify-center rounded-full bg-primary/10 md:h-32 md:w-32"
                animate={{ rotate: stage === 'preparing' ? 360 : 0 }}
                transition={{
                  duration: 2,
                  repeat: stage === 'preparing' ? Infinity : 0,
                  ease: 'linear',
                }}
              >
                <Icon
                  className={`h-12 w-12 text-primary md:h-16 md:w-16 ${
                    stage === 'preparing' ? '' : 'animate-pulse'
                  }`}
                />
              </motion.div>

              {/* Floating sparkles */}
              {stage === 'generating' && (
                <>
                  {[...Array(3)].map((_, i) => (
                    <motion.div
                      key={i}
                      className="absolute"
                      initial={{ opacity: 0, scale: 0 }}
                      animate={{
                        opacity: [0, 1, 0],
                        scale: [0.5, 1, 0.5],
                        x: [0, (i - 1) * 40],
                        y: [0, -30 - i * 10],
                      }}
                      transition={{
                        duration: 1.5,
                        repeat: Infinity,
                        delay: i * 0.3,
                      }}
                    >
                      <Sparkles className="h-4 w-4 text-primary" />
                    </motion.div>
                  ))}
                </>
              )}
            </motion.div>

            {/* Stage label */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-2"
            >
              <h3 className="text-xl font-semibold md:text-2xl">{config.label}</h3>
              <p className="text-sm text-muted-foreground md:text-base">
                {message || config.description}
              </p>
            </motion.div>

            {/* Progress bar */}
            <motion.div
              className="w-full max-w-xs"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Progress value={progress} className="h-2" />
              <p className="mt-2 text-xs text-muted-foreground">
                {Math.round(progress)}% complete
              </p>
            </motion.div>

            {/* Stage indicators */}
            <motion.div
              className="flex items-center gap-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              {Object.keys(stageConfig).map((s, index) => {
                const stageIndex = Object.keys(stageConfig).indexOf(stage);
                const isActive = index === stageIndex;
                const isComplete = index < stageIndex;

                return (
                  <motion.div
                    key={s}
                    className={`h-2 w-2 rounded-full transition-colors ${
                      isComplete
                        ? 'bg-primary'
                        : isActive
                          ? 'bg-primary animate-pulse'
                          : 'bg-muted'
                    }`}
                    animate={isActive ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 1, repeat: Infinity }}
                  />
                );
              })}
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}
