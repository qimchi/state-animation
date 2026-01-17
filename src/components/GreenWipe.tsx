import React from 'react';
import { motion } from 'framer-motion';

interface GreenWipeProps {
  progress: number; // 0..1 for fade in/out
  color?: string;
  fadeIn?: boolean;
  fadeOut?: boolean;
}

export const GreenWipe = React.memo<GreenWipeProps>(({
  progress,
  color = '#31CC66',
  fadeIn = true,
  fadeOut = true
}) => {
  // Calculate opacity based on progress
  // If fadeIn: 0 → 1 in first half, then fadeOut: 1 → 0 in second half
  const opacity = React.useMemo(() => {
    if (fadeIn && fadeOut) {
      if (progress < 0.5) {
        // Fade in: 0 → 1
        return progress * 2;
      } else {
        // Fade out: 1 → 0
        return 1 - (progress - 0.5) * 2;
      }
    } else if (fadeIn) {
      return progress;
    } else if (fadeOut) {
      return 1 - progress;
    }
    return 1;
  }, [progress, fadeIn, fadeOut]);

  return (
    <motion.div
      className="green-wipe"
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: color,
        zIndex: 35,
        pointerEvents: 'none',
        opacity
      }}
    />
  );
});

GreenWipe.displayName = 'GreenWipe';
