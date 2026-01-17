import { useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { DopeLoader } from './DopeLoader';
import './TxSuccessAnimation.css';

type TxAnimPhase = 'idle' | 'fillingPill' | 'loader' | 'checkPop' | 'greenWipe' | 'revealSuccess';

const COLORS = {
  green: '#31CC66',
  orange: '#FE9900',
  pink: '#FEA1CD',
  yellow: '#FECE00',
  bgGreen: '#31CC66',
};

// Color order L->R: Green, Pink, Yellow, Orange
const COLOR_ORDER = [COLORS.green, COLORS.pink, COLORS.yellow, COLORS.orange] as const;


interface TxSuccessAnimationProps {
  onRevealDone: () => void;
  autoStart?: boolean;
}

export interface TxSuccessAnimationRef {
  start: () => void;
}

export const TxSuccessAnimation = forwardRef<TxSuccessAnimationRef, TxSuccessAnimationProps>(
  ({ onRevealDone, autoStart = false }, ref) => {
    const [phase, setPhase] = useState<TxAnimPhase>('idle');

    const start = () => {
      setPhase('fillingPill');
    };

    useImperativeHandle(ref, () => ({
      start,
    }));

    useEffect(() => {
      if (autoStart) {
        setPhase('fillingPill');
      }
    }, [autoStart]);

    useEffect(() => {
      if (phase === 'fillingPill') {
        // After pill fills, show loader
        const timer = setTimeout(() => {
          setPhase('loader');
        }, 880);
        return () => clearTimeout(timer);
      }

      if (phase === 'loader') {
        // Show loader briefly, then quickly switch to checkmark
        const timer = setTimeout(() => {
          setPhase('checkPop');
        }, 300); // Quick 300ms loader
        return () => clearTimeout(timer);
      }

      if (phase === 'checkPop') {
        // Transition to green wipe right as checkmark finishes
        const timer = setTimeout(() => {
          setPhase('greenWipe');
        }, 500);
        return () => clearTimeout(timer);
      }

      if (phase === 'greenWipe') {
        // Green fades in, then fades out to reveal success page
        const timer = setTimeout(() => {
          setPhase('revealSuccess');
        }, 2000);
        return () => clearTimeout(timer);
      }

      if (phase === 'revealSuccess') {
        const timer = setTimeout(() => {
          onRevealDone();
        }, 250);
        return () => clearTimeout(timer);
      }
    }, [phase, onRevealDone]);

    return (
    <div className="tx-animation-container">
      <div className="center-stage">
        {/* DOPE Logo - Idle State */}
        {phase === 'idle' && (
          <img 
            src="/images/dope-Logo-mark.png" 
            alt="DOPE" 
            className="dope-logo"
          />
        )}

        {/* Pill Fill Animation */}
        {phase === 'fillingPill' && (
          <PillFill onDone={() => setPhase('loader')} />
        )}
      </div>

      {/* Loader - appears after pill fill, quickly switches to checkmark */}
      {phase === 'loader' && (
        <DopeLoader visible={true} />
      )}

      {/* Checkmark Pop - quickly appears after loader */}
      {phase === 'checkPop' && (
        <CheckmarkPop />
      )}

      {/* Success Page - Show behind green overlay */}
      {(phase === 'greenWipe' || phase === 'revealSuccess') && (
        <div className="success-page">
          <img 
            src="/images/tx-done.png" 
            alt="Transaction Details"
            className="tx-details-image"
            onError={(e) => {
              // Fallback if image not found
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
            }}
          />
        </div>
      )}

      {/* Green Screen Wipe Overlay - Appears instantly when checkmark finishes, then fades out */}
      {phase === 'checkPop' && (
        <motion.div
          className="green-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1] }}
          transition={{ 
            duration: 0.1,
            delay: 0.4,
            ease: 'linear'
          }}
        />
      )}
      {(phase === 'greenWipe' || phase === 'revealSuccess') && (
        <motion.div
          className="green-overlay"
          initial={{ opacity: 1 }}
          animate={{ 
            opacity: phase === 'greenWipe' ? [1, 0] : 0
          }}
          transition={{ 
            duration: phase === 'greenWipe' ? 0.45 : 0,
            ease: [0.4, 0, 0.2, 1]
          }}
        />
      )}

    </div>
    );
  }
);

// Helper functions for random distribution
function rand(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

function splitInto3(total: number): [number, number, number] {
  // Random positive numbers normalized to sum=total
  const a = rand(0.1, 1);
  const b = rand(0.1, 1);
  const c = rand(0.1, 1);
  const s = a + b + c;
  return [total * (a / s), total * (b / s), total * (c / s)];
}

function makeDynamicFractions(): [number, number, number, number] {
  const smallPct = rand(0.08, 0.15); // ~10% bucket
  const smallIndex = Math.floor(rand(0, 4)); // 0..3

  const remaining = 1 - smallPct;
  const parts = splitInto3(remaining);

  const fracs: [number, number, number, number] = [0, 0, 0, 0];
  fracs[smallIndex] = smallPct;

  let j = 0;
  for (let i = 0; i < 4; i++) {
    if (i === smallIndex) continue;
    fracs[i] = parts[j++];
  }

  return fracs; // sums to 1
}

function PillFill({ onDone }: { onDone: () => void }) {
  const PILL_W = 134.75;
  const PILL_H = 49;
  const R = PILL_H / 2;
  const fillDuration = 0.88; // Fill animation duration
  const overlayFadeDelay = 0.12; // 120ms delay before overlay fades in
  const overlayFadeDuration = 0.08; // 80ms fade duration

  // Generate random initial and target fractions
  const [initialFracs, setInitialFracs] = useState<[number, number, number, number] | null>(null);
  const [targetFracs, setTargetFracs] = useState<[number, number, number, number] | null>(null);

  useEffect(() => {
    // Generate both initial and target distributions
    const init = makeDynamicFractions();
    const target = makeDynamicFractions();
    setInitialFracs(init);
    setTargetFracs(target);
  }, []);

  // Overlay opacity: starts at 0, fades in after delay
  const overlayOpacity = useMotionValue(0);
  
  // Master reveal: 0 → PILL_W (left to right)
  const revealWidth = useMotionValue(0);
  
  // Fill progress: 0 → 1, for morphic segment boundaries
  const progress = useMotionValue(0);

  useEffect(() => {
    if (!initialFracs || !targetFracs) return;

    // Step 1: Fade in overlay after delay
    const fadeControls = animate(overlayOpacity, 1, {
      duration: overlayFadeDuration,
      delay: overlayFadeDelay,
      ease: [0.4, 0.0, 0.2, 1],
    });

    // Step 2: Start reveal and morphic animations simultaneously after overlay fade
    const fillStartTime = overlayFadeDelay + overlayFadeDuration;
    
    // Master reveal: left to right
    const revealControls = animate(revealWidth, PILL_W, {
      duration: fillDuration,
      delay: fillStartTime,
      ease: [0.2, 0, 0.2, 1],
    });

    // Morphic segment boundaries (happens inside already-revealed area)
    const progressControls = animate(progress, 1, {
      duration: fillDuration,
      delay: fillStartTime,
      ease: [0.4, 0.0, 0.2, 1],
      onComplete: () => {
        onDone();
      }
    });

    return () => {
      fadeControls.stop();
      revealControls.stop();
      progressControls.stop();
    };
  }, [overlayOpacity, revealWidth, progress, onDone, initialFracs, targetFracs]);

  // Calculate segment widths: interpolate from initial to target
  const segment0Width = useTransform(progress, (p) => {
    if (!initialFracs || !targetFracs) return 0;
    const width = initialFracs[0] + (targetFracs[0] - initialFracs[0]) * p;
    return PILL_W * width;
  });

  const segment1Width = useTransform(progress, (p) => {
    if (!initialFracs || !targetFracs) return 0;
    const width = initialFracs[1] + (targetFracs[1] - initialFracs[1]) * p;
    return PILL_W * width;
  });

  const segment2Width = useTransform(progress, (p) => {
    if (!initialFracs || !targetFracs) return 0;
    const width = initialFracs[2] + (targetFracs[2] - initialFracs[2]) * p;
    return PILL_W * width;
  });

  const segment3Width = useTransform(progress, (p) => {
    if (!initialFracs || !targetFracs) return 0;
    const width = initialFracs[3] + (targetFracs[3] - initialFracs[3]) * p;
    return PILL_W * width;
  });

  // Calculate x positions (cumulative widths)
  const segment1X = useTransform(progress, (p) => {
    if (!initialFracs || !targetFracs) return 0;
    const width0 = initialFracs[0] + (targetFracs[0] - initialFracs[0]) * p;
    return PILL_W * width0;
  });
  const segment2X = useTransform(progress, (p) => {
    if (!initialFracs || !targetFracs) return 0;
    const width0 = initialFracs[0] + (targetFracs[0] - initialFracs[0]) * p;
    const width1 = initialFracs[1] + (targetFracs[1] - initialFracs[1]) * p;
    return PILL_W * (width0 + width1);
  });
  const segment3X = useTransform(progress, (p) => {
    if (!initialFracs || !targetFracs) return 0;
    const width0 = initialFracs[0] + (targetFracs[0] - initialFracs[0]) * p;
    const width1 = initialFracs[1] + (targetFracs[1] - initialFracs[1]) * p;
    const width2 = initialFracs[2] + (targetFracs[2] - initialFracs[2]) * p;
    return PILL_W * (width0 + width1 + width2);
  });

  return (
    <div className="pill-container">
      <svg width={PILL_W} height={PILL_H} className="pill-svg">
        <defs>
          {/* Pill shape clip */}
          <clipPath id="pillClip">
            <rect x={0} y={0} width={PILL_W} height={PILL_H} rx={R} ry={R} />
          </clipPath>

          {/* Master reveal clip: left to right */}
          <clipPath id="revealClip">
            <motion.rect 
              x={0} 
              y={0} 
              height={PILL_H} 
              style={{ width: revealWidth }} 
            />
          </clipPath>
        </defs>

        {/* Layer 1: White base (always visible) */}
        <rect x={0} y={0} width={PILL_W} height={PILL_H} rx={R} ry={R} fill="#fff" />

        {/* Layer 2: DOPE Logo (behind fill) */}
        <g clipPath="url(#pillClip)">
          <image
            href="/images/dope-Logo-mark.png"
            x={19.303}
            y={(PILL_H - 24.351) / 2}
            width={PILL_W - 19.303 - 18.006}
            height="24.351"
            preserveAspectRatio="xMidYMid meet"
          />
        </g>

        {/* Layer 3: Color fill (clipped to pill AND reveal, on top of logo) */}
        <g clipPath="url(#pillClip)">
          <motion.g 
            clipPath="url(#revealClip)"
            style={{ opacity: overlayOpacity }}
          >
            {/* Green (leftmost) - x0 = 0 */}
            <motion.rect
              x={0}
              y={0}
              height={PILL_H}
              fill={COLOR_ORDER[0]}
              style={{ width: segment0Width }}
            />
            {/* Pink - x1 = w0 */}
            <motion.rect
              x={segment1X}
              y={0}
              height={PILL_H}
              fill={COLOR_ORDER[1]}
              style={{ width: segment1Width }}
            />
            {/* Yellow - x2 = w0 + w1 */}
            <motion.rect
              x={segment2X}
              y={0}
              height={PILL_H}
              fill={COLOR_ORDER[2]}
              style={{ width: segment2Width }}
            />
            {/* Orange (rightmost) - x3 = w0 + w1 + w2 */}
            <motion.rect
              x={segment3X}
              y={0}
              height={PILL_H}
              fill={COLOR_ORDER[3]}
              style={{ width: segment3Width }}
            />
          </motion.g>
        </g>

        {/* Layer 4: Pill stroke (always on top) */}
        <rect
          x={0}
          y={0}
          width={PILL_W}
          height={PILL_H}
          rx={R}
          ry={R}
          fill="transparent"
          stroke="#4D4D4F"
          strokeWidth="0.98"
        />
      </svg>
    </div>
  );
}

function CheckmarkPop() {
  return (
    <motion.div
      className="checkmark-container"
      initial={{ scale: 0, opacity: 0, rotate: 0, x: '-50%', y: '-50%' }}
      animate={{ 
        scale: [0, 1.15, 1, 0],
        opacity: [0, 1, 1, 0],
        rotate: [0, -3, 3, -2, 1, 0, 0],
        x: '-50%',
        y: '-50%'
      }}
      transition={{
        scale: {
          duration: 0.5,
          times: [0, 0.6, 0.8, 1],
          ease: [0.34, 1.56, 0.64, 1]
        },
        rotate: {
          duration: 0.5,
          times: [0, 0.2, 0.4, 0.6, 0.75, 0.9, 1],
          ease: "easeInOut"
        },
        opacity: {
          duration: 0.5,
          times: [0, 0.1, 0.8, 1]
        },
        x: { duration: 0 },
        y: { duration: 0 }
      }}
    >
      <svg width="72" height="72" viewBox="0 0 143 143" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M22.9744 41.4696C23.0817 46.8965 20.1287 54.2324 16.2892 58.0648C12.7264 61.631 10.7251 66.4658 10.7251 71.5068C10.7251 76.5478 12.7264 81.3826 16.2892 84.9488C20.0787 88.724 22.8672 95.2734 22.9744 100.622C23.0745 105.355 24.9264 110.06 28.5371 113.663C31.8684 117.001 36.3248 118.977 41.0353 119.204C46.691 119.49 54.0984 122.779 58.1024 126.783C61.6683 130.344 66.5016 132.344 71.5408 132.344C76.58 132.344 81.4133 130.344 84.9792 126.783C88.9832 122.779 96.3906 119.49 102.046 119.204C106.757 118.977 111.213 117.001 114.544 113.663C118.017 110.195 120.009 105.515 120.1 100.607C120.207 95.2734 122.96 88.7669 126.742 84.9917C130.319 81.4266 132.332 76.5869 132.34 71.5371C132.349 66.4874 130.35 61.6412 126.785 58.0648C122.953 54.2395 119.993 46.8965 120.107 41.4768C120.161 38.9179 119.696 36.3747 118.74 34.0005C117.784 31.6263 116.357 29.4705 114.544 27.663C112.666 25.78 110.413 24.3134 107.931 23.3587C105.448 22.404 102.793 21.9825 100.137 22.1217C95.0321 22.3791 88.59 19.9052 84.9792 16.2873C81.413 12.7245 76.5782 10.7233 71.5372 10.7233C66.4962 10.7233 61.6614 12.7245 58.0952 16.2873C54.4916 19.8981 48.0423 22.3791 42.9372 22.1217C40.2826 21.9836 37.6285 22.4055 35.1476 23.3602C32.6667 24.3149 30.4144 25.7809 28.5371 27.663C26.7259 29.4696 25.2992 31.6243 24.3432 33.9972C23.3872 36.3701 22.9215 38.912 22.9744 41.4696ZM93.2446 47.3755C94.0659 47.8312 94.7893 48.4443 95.3736 49.1797C95.9579 49.915 96.3916 50.7583 96.6499 51.6613C96.9081 52.5643 96.986 53.5094 96.8789 54.4425C96.7719 55.3756 96.4821 56.2785 96.026 57.0995L76.2348 92.7208C75.7221 93.691 74.9931 94.5301 74.1041 95.1733C72.8122 96.108 71.2449 96.584 69.6515 96.5257C68.058 96.4674 66.5297 95.8781 65.3096 94.8515L45.5827 79.0715C44.8494 78.4847 44.2388 77.7591 43.7859 76.9363C43.333 76.1135 43.0466 75.2095 42.943 74.2761C42.8394 73.3426 42.9207 72.3978 43.1823 71.4957C43.4438 70.5936 43.8805 69.7519 44.4673 69.0186C45.0542 68.2853 45.7797 67.6747 46.6025 67.2218C47.4253 66.7689 48.3293 66.4824 49.2628 66.3789C50.1963 66.2753 51.141 66.3566 52.0431 66.6181C52.9452 66.8797 53.7869 67.3163 54.5202 67.9032L67.7692 78.5066L83.5206 50.1497C83.9769 49.3291 84.5904 48.6063 85.3261 48.0228C86.0617 47.4392 86.9051 47.0062 87.808 46.7486C88.711 46.491 89.6559 46.4138 90.5887 46.5214C91.5215 46.6289 92.424 46.9192 93.2446 47.3755Z"
          fill="#31CC66"
        />
      </svg>
    </motion.div>
  );
}
