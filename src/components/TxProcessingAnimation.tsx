import { useEffect, useState, useImperativeHandle, forwardRef } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { DopeHourglass } from './DopeHourglass';
import './TxSuccessAnimation.css';

type TxProcessingPhase = 'idle' | 'fillingPill' | 'hourglassPop' | 'revealProcessing';

interface TxProcessingAnimationProps {
  onRevealDone: () => void;
  autoStart?: boolean;
}

export interface TxProcessingAnimationRef {
  start: () => void;
}

export const TxProcessingAnimation = forwardRef<TxProcessingAnimationRef, TxProcessingAnimationProps>(
  ({ onRevealDone, autoStart = false }, ref) => {
    const [phase, setPhase] = useState<TxProcessingPhase>('idle');

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
        // After pill fills, go directly to hourglass
        const timer = setTimeout(() => {
          setPhase('hourglassPop');
        }, 880);
        return () => clearTimeout(timer);
      }

      if (phase === 'hourglassPop') {
        // Show hourglass with blinking dots for a bit before transitioning
        const timer = setTimeout(() => {
          setPhase('revealProcessing');
        }, 2500); // 2.5 seconds to see the blinking animation
        return () => clearTimeout(timer);
      }

      if (phase === 'revealProcessing') {
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
            <PillFill onDone={() => setPhase('hourglassPop')} />
          )}
        </div>

        {/* Hourglass Pop - appears after pill fill */}
        {phase === 'hourglassPop' && (
          <DopeHourglass visible={true} />
        )}

        {/* Processing Page - Show after hourglass */}
        {(phase === 'revealProcessing') && (
          <div className="success-page">
            <img 
              src="/images/tx-proc.png" 
              alt="Transaction Processing"
              className="tx-details-image"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
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
  const a = rand(0.1, 1);
  const b = rand(0.1, 1);
  const c = rand(0.1, 1);
  const s = a + b + c;
  return [total * (a / s), total * (b / s), total * (c / s)];
}

function makeDynamicFractions(): [number, number, number, number] {
  const smallPct = rand(0.08, 0.15);
  const smallIndex = Math.floor(rand(0, 4));

  const remaining = 1 - smallPct;
  const parts = splitInto3(remaining);

  const fracs: [number, number, number, number] = [0, 0, 0, 0];
  fracs[smallIndex] = smallPct;

  let j = 0;
  for (let i = 0; i < 4; i++) {
    if (i === smallIndex) continue;
    fracs[i] = parts[j++];
  }

  return fracs;
}

function PillFill({ onDone }: { onDone: () => void }) {
  const PILL_W = 134.75;
  const PILL_H = 49;
  const R = PILL_H / 2;
  const fillDuration = 0.88;
  const overlayFadeDelay = 0.12;
  const overlayFadeDuration = 0.08;

  const COLORS = {
    green: '#31CC66',
    orange: '#FE9900',
    pink: '#FEA1CD',
    yellow: '#FECE00',
  };

  const COLOR_ORDER = [COLORS.green, COLORS.pink, COLORS.yellow, COLORS.orange] as const;

  const [initialFracs, setInitialFracs] = useState<[number, number, number, number] | null>(null);
  const [targetFracs, setTargetFracs] = useState<[number, number, number, number] | null>(null);

  useEffect(() => {
    const init = makeDynamicFractions();
    const target = makeDynamicFractions();
    setInitialFracs(init);
    setTargetFracs(target);
  }, []);

  const overlayOpacity = useMotionValue(0);
  const revealWidth = useMotionValue(0);
  const progress = useMotionValue(0);

  useEffect(() => {
    if (!initialFracs || !targetFracs) return;

    const fadeControls = animate(overlayOpacity, 1, {
      duration: overlayFadeDuration,
      delay: overlayFadeDelay,
      ease: [0.4, 0.0, 0.2, 1],
    });

    const fillStartTime = overlayFadeDelay + overlayFadeDuration;
    
    const revealControls = animate(revealWidth, PILL_W, {
      duration: fillDuration,
      delay: fillStartTime,
      ease: [0.2, 0, 0.2, 1],
    });

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
          <clipPath id="pillClipProcessing">
            <rect x={0} y={0} width={PILL_W} height={PILL_H} rx={R} ry={R} />
          </clipPath>
          <clipPath id="revealClipProcessing">
            <motion.rect 
              x={0} 
              y={0} 
              height={PILL_H} 
              style={{ width: revealWidth }} 
            />
          </clipPath>
        </defs>

        <rect x={0} y={0} width={PILL_W} height={PILL_H} rx={R} ry={R} fill="#fff" />

        <g clipPath="url(#pillClipProcessing)">
          <image
            href="/images/dope-Logo-mark.png"
            x={19.303}
            y={(PILL_H - 24.351) / 2}
            width={PILL_W - 19.303 - 18.006}
            height="24.351"
            preserveAspectRatio="xMidYMid meet"
          />
        </g>

        <g clipPath="url(#pillClipProcessing)">
          <motion.g 
            clipPath="url(#revealClipProcessing)"
            style={{ opacity: overlayOpacity }}
          >
            <motion.rect
              x={0}
              y={0}
              height={PILL_H}
              fill={COLOR_ORDER[0]}
              style={{ width: segment0Width }}
            />
            <motion.rect
              x={segment1X}
              y={0}
              height={PILL_H}
              fill={COLOR_ORDER[1]}
              style={{ width: segment1Width }}
            />
            <motion.rect
              x={segment2X}
              y={0}
              height={PILL_H}
              fill={COLOR_ORDER[2]}
              style={{ width: segment2Width }}
            />
            <motion.rect
              x={segment3X}
              y={0}
              height={PILL_H}
              fill={COLOR_ORDER[3]}
              style={{ width: segment3Width }}
            />
          </motion.g>
        </g>

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
