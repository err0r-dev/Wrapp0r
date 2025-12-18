import { useCallback, useEffect, useRef, useState } from 'react';
import type { MusicMood } from '@wrapp0r/shared';
import { getTrackForMood, type AudioTrack } from '@/lib/audio-tracks';

interface UseAudioPlayerOptions {
  mood?: MusicMood;
  autoPlay?: boolean;
  loop?: boolean;
  volume?: number;
  fadeInDuration?: number;
  fadeOutDuration?: number;
}

interface UseAudioPlayerReturn {
  isPlaying: boolean;
  isMuted: boolean;
  isLoading: boolean;
  hasError: boolean;
  canAutoplay: boolean;
  currentTrack: AudioTrack | null;
  volume: number;
  play: () => Promise<void>;
  pause: () => void;
  toggle: () => void;
  mute: () => void;
  unmute: () => void;
  toggleMute: () => void;
  setVolume: (volume: number) => void;
  fadeIn: (duration?: number) => void;
  fadeOut: (duration?: number) => void;
  changeMood: (mood: MusicMood) => void;
}

export function useAudioPlayer({
  mood,
  autoPlay = false,
  loop = true,
  volume: initialVolume = 0.5,
  fadeInDuration = 1000,
  fadeOutDuration = 500,
}: UseAudioPlayerOptions = {}): UseAudioPlayerReturn {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [canAutoplay, setCanAutoplay] = useState(true);
  const [volume, setVolumeState] = useState(initialVolume);
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(
    mood ? getTrackForMood(mood) : null
  );

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio();
    audio.loop = loop;
    audio.volume = initialVolume;
    audioRef.current = audio;

    // Event listeners
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => setIsPlaying(false);
    const handleError = () => {
      setHasError(true);
      setIsLoading(false);
    };
    const handleCanPlay = () => {
      setIsLoading(false);
      setHasError(false);
    };
    const handleLoadStart = () => setIsLoading(true);

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('loadstart', handleLoadStart);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('loadstart', handleLoadStart);
      audio.pause();
      audio.src = '';
    };
  }, [loop, initialVolume]);

  // Update track when mood changes
  useEffect(() => {
    if (mood) {
      const track = getTrackForMood(mood);
      setCurrentTrack(track);

      if (audioRef.current) {
        const wasPlaying = isPlaying;
        audioRef.current.src = track.src;

        if (wasPlaying || autoPlay) {
          audioRef.current.play().catch(() => {
            setCanAutoplay(false);
          });
        }
      }
    }
  }, [mood, autoPlay, isPlaying]);

  const play = useCallback(async () => {
    if (!audioRef.current || !currentTrack) return;

    try {
      // Ensure source is set
      if (!audioRef.current.src || audioRef.current.src !== currentTrack.src) {
        audioRef.current.src = currentTrack.src;
      }

      await audioRef.current.play();
      setCanAutoplay(true);
    } catch (error) {
      // Autoplay was prevented
      setCanAutoplay(false);
      console.warn('Audio autoplay prevented:', error);
    }
  }, [currentTrack]);

  const pause = useCallback(() => {
    audioRef.current?.pause();
  }, []);

  const toggle = useCallback(() => {
    if (isPlaying) {
      pause();
    } else {
      play();
    }
  }, [isPlaying, play, pause]);

  const mute = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.muted = true;
      setIsMuted(true);
    }
  }, []);

  const unmute = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.muted = false;
      setIsMuted(false);
    }
  }, []);

  const toggleMute = useCallback(() => {
    if (isMuted) {
      unmute();
    } else {
      mute();
    }
  }, [isMuted, mute, unmute]);

  const setVolume = useCallback((newVolume: number) => {
    const clampedVolume = Math.max(0, Math.min(1, newVolume));
    setVolumeState(clampedVolume);
    if (audioRef.current) {
      audioRef.current.volume = clampedVolume;
    }
  }, []);

  const fadeIn = useCallback(
    (duration = fadeInDuration) => {
      if (!audioRef.current) return;

      // Clear any existing fade
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }

      const startVolume = 0;
      const targetVolume = volume;
      const steps = 20;
      const stepDuration = duration / steps;
      const volumeStep = (targetVolume - startVolume) / steps;

      audioRef.current.volume = startVolume;

      let currentStep = 0;
      fadeIntervalRef.current = setInterval(() => {
        currentStep++;
        if (audioRef.current) {
          audioRef.current.volume = Math.min(
            startVolume + volumeStep * currentStep,
            targetVolume
          );
        }

        if (currentStep >= steps) {
          if (fadeIntervalRef.current) {
            clearInterval(fadeIntervalRef.current);
          }
        }
      }, stepDuration);
    },
    [volume, fadeInDuration]
  );

  const fadeOut = useCallback(
    (duration = fadeOutDuration) => {
      if (!audioRef.current) return;

      // Clear any existing fade
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }

      const startVolume = audioRef.current.volume;
      const targetVolume = 0;
      const steps = 20;
      const stepDuration = duration / steps;
      const volumeStep = (startVolume - targetVolume) / steps;

      let currentStep = 0;
      fadeIntervalRef.current = setInterval(() => {
        currentStep++;
        if (audioRef.current) {
          audioRef.current.volume = Math.max(
            startVolume - volumeStep * currentStep,
            targetVolume
          );
        }

        if (currentStep >= steps) {
          if (fadeIntervalRef.current) {
            clearInterval(fadeIntervalRef.current);
          }
          pause();
          // Restore volume for next play
          if (audioRef.current) {
            audioRef.current.volume = volume;
          }
        }
      }, stepDuration);
    },
    [pause, volume, fadeOutDuration]
  );

  const changeMood = useCallback(
    (newMood: MusicMood) => {
      const track = getTrackForMood(newMood);
      setCurrentTrack(track);

      if (audioRef.current) {
        const wasPlaying = isPlaying;

        // Fade out, change track, fade in
        if (wasPlaying) {
          fadeOut(300);
          setTimeout(() => {
            if (audioRef.current) {
              audioRef.current.src = track.src;
              audioRef.current.play().then(() => {
                fadeIn(300);
              });
            }
          }, 350);
        } else {
          audioRef.current.src = track.src;
        }
      }
    },
    [isPlaying, fadeOut, fadeIn]
  );

  // Cleanup fade interval on unmount
  useEffect(() => {
    return () => {
      if (fadeIntervalRef.current) {
        clearInterval(fadeIntervalRef.current);
      }
    };
  }, []);

  return {
    isPlaying,
    isMuted,
    isLoading,
    hasError,
    canAutoplay,
    currentTrack,
    volume,
    play,
    pause,
    toggle,
    mute,
    unmute,
    toggleMute,
    setVolume,
    fadeIn,
    fadeOut,
    changeMood,
  };
}
