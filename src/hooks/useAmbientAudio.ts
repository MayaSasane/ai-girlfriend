import { useEffect, useRef, useState } from 'react';

interface AmbientAudioOptions {
  enabled?: boolean;
  volume?: number;
  fadeInDuration?: number;
}

export const useAmbientAudio = (options: AmbientAudioOptions = {}) => {
  const {
    enabled = true,
    volume = 0.3,
    fadeInDuration = 3000
  } = options;

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    if (!enabled) return;

    // Create ambient audio using Web Audio API for better control
    const createAmbientAudio = () => {
      if (typeof window === 'undefined') return;

      try {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        // Create a simple ambient drone using oscillators
        const createOscillator = (frequency: number, gain: number) => {
          const oscillator = audioContext.createOscillator();
          const gainNode = audioContext.createGain();
          
          oscillator.type = 'sine';
          oscillator.frequency.setValueAtTime(frequency, audioContext.currentTime);
          
          gainNode.gain.setValueAtTime(0, audioContext.currentTime);
          gainNode.gain.linearRampToValueAtTime(gain * volume, audioContext.currentTime + fadeInDuration / 1000);
          
          oscillator.connect(gainNode);
          gainNode.connect(audioContext.destination);
          
          return { oscillator, gainNode };
        };

        // Create multiple layers for rich ambient sound
        const layers = [
          createOscillator(60, 0.1),   // Deep bass
          createOscillator(120, 0.08), // Low mid
          createOscillator(200, 0.05), // Mid
          createOscillator(400, 0.03), // High mid
        ];

        layers.forEach(({ oscillator }) => {
          oscillator.start();
        });

        setIsPlaying(true);
        setIsLoaded(true);

        // Cleanup function
        return () => {
          layers.forEach(({ oscillator, gainNode }) => {
            gainNode.gain.linearRampToValueAtTime(0, audioContext.currentTime + 1);
            setTimeout(() => {
              oscillator.stop();
              oscillator.disconnect();
              gainNode.disconnect();
            }, 1000);
          });
          setIsPlaying(false);
        };
      } catch (error) {
        console.log('Ambient audio not supported or failed to initialize');
        setIsLoaded(false);
      }
    };

    const cleanup = createAmbientAudio();
    return cleanup;
  }, [enabled, volume, fadeInDuration]);

  const toggle = () => {
    // This would toggle the ambient audio on/off
    setIsPlaying(!isPlaying);
  };

  const setVolumeLevel = (newVolume: number) => {
    // This would adjust the volume
  };

  return {
    isPlaying,
    isLoaded,
    toggle,
    setVolume: setVolumeLevel
  };
};