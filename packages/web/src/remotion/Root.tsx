import React from 'react';
import { Composition, registerRoot } from 'remotion';
import '../styles/globals.css';
import { WrappedComposition, calculateTotalDuration } from './WrappedComposition';
import type { WrappedExperience } from '@wrapp0r/shared';

// Default props for the composition (will be overridden at render time)
const defaultWrapped: WrappedExperience = {
  title: 'Preview',
  theme: {
    primary: '#6366f1',
    secondary: '#8b5cf6',
    accent: '#f59e0b',
    background: '#0f172a',
    text: '#f8fafc',
  },
  musicMood: 'energetic',
  slides: [
    {
      id: 'preview-1',
      type: 'title',
      content: {
        headline: 'Preview',
        subtitle: 'Loading...',
      },
      duration: 3000,
      animation: 'fadeIn',
      background: {
        type: 'gradient',
        value: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
      },
    },
  ],
  metadata: {
    generatedAt: new Date().toISOString(),
    dataType: 'Preview',
  },
};

const FPS = 30;
const DEFAULT_DURATION_FRAMES = calculateTotalDuration(defaultWrapped, FPS);

// Wrapper component to satisfy Remotion's typing
const WrappedCompositionWrapper: React.FC<{
  wrapped?: WrappedExperience;
  includeAudio?: boolean;
  audioSrc?: string;
}> = ({ wrapped = defaultWrapped, includeAudio = false, audioSrc }) => {
  return <WrappedComposition wrapped={wrapped} includeAudio={includeAudio} audioSrc={audioSrc} />;
};

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="WrappedVideo"
        component={WrappedCompositionWrapper}
        durationInFrames={DEFAULT_DURATION_FRAMES}
        fps={FPS}
        width={1280}
        height={720}
        defaultProps={{
          wrapped: defaultWrapped,
          includeAudio: false,
          audioSrc: undefined,
        }}
      />
    </>
  );
};

// Register for Remotion CLI bundling
registerRoot(RemotionRoot);
