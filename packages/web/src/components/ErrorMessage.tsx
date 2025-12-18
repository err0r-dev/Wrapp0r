import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle, X, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ApiError {
  code: string;
  message: string;
  details?: string;
  retryable?: boolean;
}

interface ErrorMessageProps {
  error: ApiError | Error | string | null;
  onDismiss?: () => void;
  onRetry?: () => void;
  variant?: 'inline' | 'toast' | 'banner';
  className?: string;
}

// Common error messages with user-friendly text
const ERROR_MESSAGES: Record<string, { title: string; description: string }> = {
  INVALID_API_KEY: {
    title: 'Invalid API Key',
    description: 'Please check your OpenAI API key in settings.',
  },
  RATE_LIMIT: {
    title: 'Rate Limited',
    description: 'Too many requests. Please wait a moment and try again.',
  },
  NETWORK_ERROR: {
    title: 'Connection Error',
    description: 'Unable to connect to the server. Check your internet connection.',
  },
  TIMEOUT: {
    title: 'Request Timeout',
    description: 'The request took too long. Please try again.',
  },
  INVALID_DATA: {
    title: 'Invalid Data',
    description: 'The uploaded file could not be processed. Please check the format.',
  },
  SERVER_ERROR: {
    title: 'Server Error',
    description: 'Something went wrong on our end. Please try again later.',
  },
  PARSE_ERROR: {
    title: 'Processing Error',
    description: 'Unable to process the AI response. Please try again.',
  },
};

function getErrorInfo(error: ApiError | Error | string): { title: string; description: string; retryable: boolean } {
  if (typeof error === 'string') {
    return {
      title: 'Error',
      description: error,
      retryable: true,
    };
  }

  if ('code' in error && error.code in ERROR_MESSAGES) {
    return {
      ...ERROR_MESSAGES[error.code],
      retryable: error.retryable ?? true,
    };
  }

  return {
    title: 'Error',
    description: error.message || 'An unexpected error occurred.',
    retryable: true,
  };
}

export function ErrorMessage({
  error,
  onDismiss,
  onRetry,
  variant = 'inline',
  className = '',
}: ErrorMessageProps) {
  if (!error) return null;

  const { title, description, retryable } = getErrorInfo(error);

  if (variant === 'toast') {
    return (
      <AnimatePresence>
        <motion.div
          className={`fixed bottom-4 right-4 z-50 flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-4 shadow-lg backdrop-blur-sm ${className}`}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
        >
          <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
          <div className="flex-1">
            <p className="font-medium text-destructive">{title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            {retryable && onRetry && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRetry}
                className="mt-2 h-7 gap-1 px-2 text-xs"
              >
                <RefreshCw className="h-3 w-3" />
                Retry
              </Button>
            )}
          </div>
          {onDismiss && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onDismiss}
              className="h-6 w-6 shrink-0"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </motion.div>
      </AnimatePresence>
    );
  }

  if (variant === 'banner') {
    return (
      <AnimatePresence>
        <motion.div
          className={`flex items-center justify-between gap-4 border-b border-destructive/20 bg-destructive/10 px-4 py-3 ${className}`}
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
        >
          <div className="flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <div>
              <span className="font-medium text-destructive">{title}:</span>{' '}
              <span className="text-sm text-muted-foreground">{description}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {retryable && onRetry && (
              <Button variant="ghost" size="sm" onClick={onRetry} className="gap-1">
                <RefreshCw className="h-3 w-3" />
                Retry
              </Button>
            )}
            {onDismiss && (
              <Button variant="ghost" size="icon" onClick={onDismiss} className="h-8 w-8">
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  // Inline variant (default)
  return (
    <motion.div
      className={`flex items-start gap-3 rounded-lg border border-destructive/20 bg-destructive/10 p-4 ${className}`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <AlertCircle className="h-5 w-5 shrink-0 text-destructive" />
      <div className="flex-1">
        <p className="font-medium text-destructive">{title}</p>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="flex items-center gap-2">
        {retryable && onRetry && (
          <Button variant="ghost" size="sm" onClick={onRetry} className="gap-1">
            <RefreshCw className="h-3 w-3" />
            Retry
          </Button>
        )}
        {onDismiss && (
          <Button variant="ghost" size="icon" onClick={onDismiss} className="h-8 w-8">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </motion.div>
  );
}

// Helper to convert various error types to ApiError
export function toApiError(error: unknown): ApiError {
  if (error instanceof Error) {
    // Check for common error patterns
    if (error.message.includes('401') || error.message.includes('Unauthorized')) {
      return { code: 'INVALID_API_KEY', message: error.message, retryable: false };
    }
    if (error.message.includes('429') || error.message.includes('rate limit')) {
      return { code: 'RATE_LIMIT', message: error.message, retryable: true };
    }
    if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
      return { code: 'TIMEOUT', message: error.message, retryable: true };
    }
    if (error.message.includes('network') || error.message.includes('ECONNREFUSED')) {
      return { code: 'NETWORK_ERROR', message: error.message, retryable: true };
    }
    if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
      return { code: 'SERVER_ERROR', message: error.message, retryable: true };
    }

    return { code: 'UNKNOWN', message: error.message, retryable: true };
  }

  if (typeof error === 'string') {
    return { code: 'UNKNOWN', message: error, retryable: true };
  }

  return { code: 'UNKNOWN', message: 'An unexpected error occurred', retryable: true };
}
