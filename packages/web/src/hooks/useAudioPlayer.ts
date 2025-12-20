import { useCallback, useEffect, useRef, useState } from 'react';
import type { MusicMood } from '@wrapp0r/shared';
import { getTrackForMood, type AudioTrack, AUDIO_ENABLED } from '@/lib/audio-tracks';
import { fetchMusicTrack, fetchNewTrack } from '@/lib/music-service';

interface UseAudioPlayerOptions {
  mood?: MusicMood;
  autoPlay?: boolean;
  loop?: boolean;
  volume?: number;
  fadeInDuration?: number;
  fadeOutDuration?: number;
  pixabayApiKey?: string;
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
  skipTrack: () => Promise<void>;
}

export function useAudioPlayer({
  mood,
  autoPlay = false,
  loop = true,
  volume: initialVolume = 0.5,
  fadeInDuration = 1000,
  fadeOutDuration = 500,
  pixabayApiKey,
}: UseAudioPlayerOptions = {}): UseAudioPlayerReturn {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const fadeIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const trackLoadedRef = useRef(false);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [canAutoplay, setCanAutoplay] = useState(true);
  const [volume, setVolumeState] = useState(initialVolume);
  const [currentTrack, setCurrentTrack] = useState<AudioTrack | null>(null);
  const [currentTrackId, setCurrentTrackId] = useState<number | undefined>(undefined);

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

  // Load track when mood changes - try Pixabay API first, then fall back to static
  useEffect(() => {
    if (!mood || !AUDIO_ENABLED) return;

    // Prevent duplicate loading
    if (trackLoadedRef.current) return;
    trackLoadedRef.current = true;

    const loadTrack = async () => {
      setIsLoading(true);
      setHasError(false);

      try {
        // Try Pixabay API if key is provided
        if (pixabayApiKey) {
          const pixabayTrack = await fetchMusicTrack(mood, pixabayApiKey);

          if (pixabayTrack) {
            const track: AudioTrack = {
              id: `pixabay-${mood}`,
              name: `${mood.charAt(0).toUpperCase() + mood.slice(1)} Track`,
              mood,
              src: pixabayTrack.url,
              originalUrl: pixabayTrack.originalUrl,
              duration: pixabayTrack.duration,
              artist: pixabayTrack.artist,
            };
            setCurrentTrack(track);
            setIsLoading(false);

            if (audioRef.current) {
              audioRef.current.src = track.src;
              if (autoPlay) {
                audioRef.current.play().catch(() => {
                  setCanAutoplay(false);
                });
              }
            }
            return;
          }
        }

        // Fall back to static track (will likely fail without files)
        const fallbackTrack = getTrackForMood(mood);
        setCurrentTrack(fallbackTrack);
        setIsLoading(false);

        if (audioRef.current) {
          audioRef.current.src = fallbackTrack.src;
          if (autoPlay) {
            audioRef.current.play().catch(() => {
              setCanAutoplay(false);
            });
          }
        }
      } catch (error) {
        console.error('Failed to load audio track:', error);
        setHasError(true);
        setIsLoading(false);
      }
    };

    loadTrack();

    // Reset on unmount to allow reloading
    return () => {
      trackLoadedRef.current = false;
    };
  }, [mood, pixabayApiKey, autoPlay]);

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
    async (newMood: MusicMood) => {
      setIsLoading(true);

      try {
        let track: AudioTrack;

        // Try Pixabay API if key is provided
        if (pixabayApiKey) {
          const pixabayTrack = await fetchMusicTrack(newMood, pixabayApiKey);
          if (pixabayTrack) {
            track = {
              id: `pixabay-${newMood}`,
              name: `${newMood.charAt(0).toUpperCase() + newMood.slice(1)} Track`,
              mood: newMood,
              src: pixabayTrack.url,
              originalUrl: pixabayTrack.originalUrl,
              duration: pixabayTrack.duration,
              artist: pixabayTrack.artist,
            };
          } else {
            track = getTrackForMood(newMood);
          }
        } else {
          track = getTrackForMood(newMood);
        }

        setCurrentTrack(track);
        setIsLoading(false);

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
      } catch (error) {
        console.error('Failed to change mood:', error);
        setIsLoading(false);
      }
    },
    [isPlaying, fadeOut, fadeIn, pixabayApiKey]
  );

  const skipTrack = useCallback(async () => {
    if (!mood || !pixabayApiKey) {
      console.warn('Cannot skip track: missing mood or API key');
      return;
    }

    setIsLoading(true);

    try {
      const newTrackData = await fetchNewTrack(mood, pixabayApiKey);

      if (!newTrackData) {
        console.warn('No new track available');
        setIsLoading(false);
        return;
      }

      const track: AudioTrack = {
        id: `jamendo-${newTrackData.id}`,
        name: `${mood.charAt(0).toUpperCase() + mood.slice(1)} Track`,
        mood,
        src: newTrackData.url,
        originalUrl: newTrackData.originalUrl,
        duration: newTrackData.duration,
        artist: newTrackData.artist,
      };

      setCurrentTrackId(newTrackData.id);

      // Smooth transition: fade out, change track, fade in
      if (audioRef.current) {
        const wasPlaying = isPlaying;

        if (wasPlaying) {
          fadeOut(300);
          setTimeout(() => {
            if (audioRef.current) {
              audioRef.current.src = track.src;
              setCurrentTrack(track);
              audioRef.current.play().then(() => {
                fadeIn(300);
              }).catch(() => {
                setCanAutoplay(false);
              });
            }
            setIsLoading(false);
          }, 350);
        } else {
          audioRef.current.src = track.src;
          setCurrentTrack(track);
          setIsLoading(false);
        }
      } else {
        setCurrentTrack(track);
        setIsLoading(false);
      }
    } catch (error) {
      console.error('Failed to skip track:', error);
      setIsLoading(false);
    }
  }, [mood, pixabayApiKey, isPlaying, fadeOut, fadeIn]);

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
    skipTrack,
  };
}
