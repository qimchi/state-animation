import React, { useMemo } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';

interface DopePillFillProps {
  progress: number; // 0..1 for left-to-right reveal
  morphSeed?: number;
  smallPctRange?: [number, number];
  colors?: string[];
  width?: number;
  height?: number;
  opacity?: number;
}

// Helper functions for random distribution
function seededRandom(seed: number) {
  let value = seed;
  return () => {
    value = (value * 9301 + 49297) % 233280;
    return value / 233280;
  };
}

function rand(min: number, max: number, rng: () => number): number {
  return min + rng() * (max - min);
}

function splitInto3(total: number, rng: () => number): [number, number, number] {
  const a = rand(0.1, 1, rng);
  const b = rand(0.1, 1, rng);
  const c = rand(0.1, 1, rng);
  const s = a + b + c;
  return [total * (a / s), total * (b / s), total * (c / s)];
}

function makeDynamicFractions(
  smallPctRange: [number, number],
  rng: () => number
): [number, number, number, number] {
  const smallPct = rand(smallPctRange[0], smallPctRange[1], rng);
  const smallIndex = Math.floor(rng() * 4);

  const remaining = 1 - smallPct;
  const parts = splitInto3(remaining, rng);

  const fracs: [number, number, number, number] = [0, 0, 0, 0];
  fracs[smallIndex] = smallPct;

  let j = 0;
  for (let i = 0; i < 4; i++) {
    if (i === smallIndex) continue;
    fracs[i] = parts[j++];
  }

  return fracs;
}

export const DopePillFill = React.memo<DopePillFillProps>(({
  progress,
  morphSeed = Math.random() * 1000,
  smallPctRange = [0.08, 0.15],
  colors = ['#31CC66', '#FEA1CD', '#FECE00', '#FE9900'], // Green, Pink, Yellow, Orange
  width = 134.75,
  height = 49,
  opacity = 1
}) => {
  const R = height / 2;

  // Generate initial and target fractions (memoized)
  const { initialFracs, targetFracs } = useMemo(() => {
    const rng = seededRandom(morphSeed);
    const init = makeDynamicFractions(smallPctRange, rng);
    const target = makeDynamicFractions(smallPctRange, rng);
    return { initialFracs: init, targetFracs: target };
  }, [morphSeed, smallPctRange]);

  // Reveal width: 0 → width (driven by progress)
  const revealWidth = useMotionValue(width * progress);

  // Morphic progress: 0 → 1 (for segment boundaries, same as progress)
  const morphProgress = useMotionValue(progress);

  // Update both when progress prop changes
  React.useEffect(() => {
    revealWidth.set(width * progress);
    morphProgress.set(progress);
  }, [progress, width, revealWidth, morphProgress]);

  // Calculate segment widths: interpolate from initial to target
  const segment0Width = useTransform(morphProgress, (p) => {
    const w = initialFracs[0] + (targetFracs[0] - initialFracs[0]) * p;
    return width * w;
  });

  const segment1Width = useTransform(morphProgress, (p) => {
    const w = initialFracs[1] + (targetFracs[1] - initialFracs[1]) * p;
    return width * w;
  });

  const segment2Width = useTransform(morphProgress, (p) => {
    const w = initialFracs[2] + (targetFracs[2] - initialFracs[2]) * p;
    return width * w;
  });

  const segment3Width = useTransform(morphProgress, (p) => {
    const w = initialFracs[3] + (targetFracs[3] - initialFracs[3]) * p;
    return width * w;
  });

  // Calculate x positions (cumulative widths)
  const segment1X = useTransform(morphProgress, (p) => {
    const width0 = initialFracs[0] + (targetFracs[0] - initialFracs[0]) * p;
    return width * width0;
  });

  const segment2X = useTransform(morphProgress, (p) => {
    const width0 = initialFracs[0] + (targetFracs[0] - initialFracs[0]) * p;
    const width1 = initialFracs[1] + (targetFracs[1] - initialFracs[1]) * p;
    return width * (width0 + width1);
  });

  const segment3X = useTransform(morphProgress, (p) => {
    const width0 = initialFracs[0] + (targetFracs[0] - initialFracs[0]) * p;
    const width1 = initialFracs[1] + (targetFracs[1] - initialFracs[1]) * p;
    const width2 = initialFracs[2] + (targetFracs[2] - initialFracs[2]) * p;
    return width * (width0 + width1 + width2);
  });

  return (
    <svg width={width} height={height} className="dope-pill-fill">
      <defs>
        <clipPath id="pillClip">
          <rect x={0} y={0} width={width} height={height} rx={R} ry={R} />
        </clipPath>
        <clipPath id="revealClip">
          <motion.rect 
            x={0} 
            y={0} 
            height={height} 
            style={{ width: revealWidth }} 
          />
        </clipPath>
      </defs>

      <g clipPath="url(#pillClip)">
        <motion.g 
          clipPath="url(#revealClip)"
          style={{ opacity }}
        >
          {/* Green (leftmost) */}
          <motion.rect
            x={0}
            y={0}
            height={height}
            fill={colors[0]}
            style={{ width: segment0Width }}
          />
          {/* Pink */}
          <motion.rect
            x={segment1X}
            y={0}
            height={height}
            fill={colors[1]}
            style={{ width: segment1Width }}
          />
          {/* Yellow */}
          <motion.rect
            x={segment2X}
            y={0}
            height={height}
            fill={colors[2]}
            style={{ width: segment2Width }}
          />
          {/* Orange (rightmost) */}
          <motion.rect
            x={segment3X}
            y={0}
            height={height}
            fill={colors[3]}
            style={{ width: segment3Width }}
          />
        </motion.g>
      </g>
    </svg>
  );
});

DopePillFill.displayName = 'DopePillFill';
