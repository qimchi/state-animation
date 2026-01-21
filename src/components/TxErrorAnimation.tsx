import { useEffect, useState, useImperativeHandle, forwardRef, useCallback } from 'react';
import { motion, useMotionValue, useTransform, animate } from 'framer-motion';
import { CircularLoader, LoaderToIcon } from './CircularLoader';
import './TxErrorAnimation.css';

type TxAnimPhase = 'idle' | 'fillingPill' | 'loaderSpinning' | 'loaderFilling' | 'xPop' | 'redWipe' | 'revealError';

const COLORS = {
  green: '#31CC66',
  orange: '#FE9900',
  pink: '#FEA1CD',
  yellow: '#FECE00',
  red: '#FF3B30',
};

const COLOR_ORDER = [COLORS.green, COLORS.pink, COLORS.yellow, COLORS.orange] as const;

interface TxErrorAnimationProps {
  onRevealDone: () => void;
  autoStart?: boolean;
}

export interface TxErrorAnimationRef {
  start: () => void;
}

export const TxErrorAnimation = forwardRef<TxErrorAnimationRef, TxErrorAnimationProps>(
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

    const handleLoaderFillComplete = useCallback(() => {
      setPhase('xPop');
    }, []);

    useEffect(() => {
      if (phase === 'fillingPill') {
        const timer = setTimeout(() => {
          setPhase('loaderSpinning');
        }, 880);
        return () => clearTimeout(timer);
      }

      if (phase === 'loaderSpinning') {
        const timer = setTimeout(() => {
          setPhase('loaderFilling');
        }, 400);
        return () => clearTimeout(timer);
      }

      if (phase === 'xPop') {
        const timer = setTimeout(() => {
          setPhase('redWipe');
        }, 500);
        return () => clearTimeout(timer);
      }

      if (phase === 'redWipe') {
        const timer = setTimeout(() => {
          setPhase('revealError');
        }, 2000);
        return () => clearTimeout(timer);
      }

      if (phase === 'revealError') {
        const timer = setTimeout(() => {
          onRevealDone();
        }, 250);
        return () => clearTimeout(timer);
      }
    }, [phase, onRevealDone]);

    return (
    <div className="tx-error-animation-container">
      <div className="center-stage">
        {phase === 'idle' && (
          <img src="/images/dope-Logo-mark.png" alt="DOPE" className="dope-logo" />
        )}
        {phase === 'fillingPill' && (
          <PillFill onDone={() => setPhase('loaderSpinning')} />
        )}
      </div>

      {(phase === 'loaderSpinning' || phase === 'loaderFilling') && (
        <CircularLoader
          state={phase === 'loaderSpinning' ? 'spinning' : 'filling'}
          targetColor={COLORS.red}
          onFillComplete={handleLoaderFillComplete}
        />
      )}

      {phase === 'xPop' && (
        <LoaderToIcon targetState="error" />
      )}

      {(phase === 'redWipe' || phase === 'revealError') && (
        <div className="error-page">
          <div className="error-content">
            <div className="error-icon">
              <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="32" cy="32" r="32" fill="#FF3B30" fillOpacity="0.1"/>
                <path d="M32 18C32.5523 18 33 18.4477 33 19V35C33 35.5523 32.5523 36 32 36C31.4477 36 31 35.5523 31 35V19C31 18.4477 31.4477 18 32 18Z" fill="#FF3B30" strokeWidth="2" />
                <circle cx="32" cy="42" r="2" fill="#FF3B30"/>
              </svg>
            </div>
            <h2 className="error-title">Something went wrong</h2>
            <p className="error-message">Don't worry, it's not your fault. We couldn't complete your transaction. Please try again.</p>
            <button className="error-retry-btn">Try Again</button>
          </div>
        </div>
      )}

      {phase === 'xPop' && (
        <motion.div
          className="red-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: [0, 1] }}
          transition={{ duration: 0.1, delay: 0.4, ease: 'linear' }}
        />
      )}
      {(phase === 'redWipe' || phase === 'revealError') && (
        <motion.div
          className="red-overlay"
          initial={{ opacity: 1 }}
          animate={{ opacity: phase === 'redWipe' ? [1, 0] : 0 }}
          transition={{ duration: phase === 'redWipe' ? 0.45 : 0, ease: [0.4, 0, 0.2, 1] }}
        />
      )}
    </div>
    );
  }
);

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

  const [initialFracs, setInitialFracs] = useState<[number, number, number, number] | null>(null);
  const [targetFracs, setTargetFracs] = useState<[number, number, number, number] | null>(null);

  useEffect(() => {
    setInitialFracs(makeDynamicFractions());
    setTargetFracs(makeDynamicFractions());
  }, []);

  const overlayOpacity = useMotionValue(0);
  const revealWidth = useMotionValue(0);
  const progress = useMotionValue(0);

  useEffect(() => {
    if (!initialFracs || !targetFracs) return;

    const fadeControls = animate(overlayOpacity, 1, {
      duration: overlayFadeDuration, delay: overlayFadeDelay, ease: [0.4, 0.0, 0.2, 1],
    });
    const fillStartTime = overlayFadeDelay + overlayFadeDuration;
    const revealControls = animate(revealWidth, PILL_W, {
      duration: fillDuration, delay: fillStartTime, ease: [0.2, 0, 0.2, 1],
    });
    const progressControls = animate(progress, 1, {
      duration: fillDuration, delay: fillStartTime, ease: [0.4, 0.0, 0.2, 1],
      onComplete: () => onDone()
    });

    return () => { fadeControls.stop(); revealControls.stop(); progressControls.stop(); };
  }, [overlayOpacity, revealWidth, progress, onDone, initialFracs, targetFracs]);

  const segment0Width = useTransform(progress, (p) => !initialFracs || !targetFracs ? 0 : PILL_W * (initialFracs[0] + (targetFracs[0] - initialFracs[0]) * p));
  const segment1Width = useTransform(progress, (p) => !initialFracs || !targetFracs ? 0 : PILL_W * (initialFracs[1] + (targetFracs[1] - initialFracs[1]) * p));
  const segment2Width = useTransform(progress, (p) => !initialFracs || !targetFracs ? 0 : PILL_W * (initialFracs[2] + (targetFracs[2] - initialFracs[2]) * p));
  const segment3Width = useTransform(progress, (p) => !initialFracs || !targetFracs ? 0 : PILL_W * (initialFracs[3] + (targetFracs[3] - initialFracs[3]) * p));
  const segment1X = useTransform(progress, (p) => !initialFracs || !targetFracs ? 0 : PILL_W * (initialFracs[0] + (targetFracs[0] - initialFracs[0]) * p));
  const segment2X = useTransform(progress, (p) => { if (!initialFracs || !targetFracs) return 0; const w0 = initialFracs[0] + (targetFracs[0] - initialFracs[0]) * p; const w1 = initialFracs[1] + (targetFracs[1] - initialFracs[1]) * p; return PILL_W * (w0 + w1); });
  const segment3X = useTransform(progress, (p) => { if (!initialFracs || !targetFracs) return 0; const w0 = initialFracs[0] + (targetFracs[0] - initialFracs[0]) * p; const w1 = initialFracs[1] + (targetFracs[1] - initialFracs[1]) * p; const w2 = initialFracs[2] + (targetFracs[2] - initialFracs[2]) * p; return PILL_W * (w0 + w1 + w2); });

  return (
    <div className="pill-container">
      <svg width={PILL_W} height={PILL_H} className="pill-svg">
        <defs>
          <clipPath id="errorPillClip"><rect x={0} y={0} width={PILL_W} height={PILL_H} rx={R} ry={R} /></clipPath>
          <clipPath id="errorRevealClip"><motion.rect x={0} y={0} height={PILL_H} style={{ width: revealWidth }} /></clipPath>
        </defs>
        <rect x={0} y={0} width={PILL_W} height={PILL_H} rx={R} ry={R} fill="#fff" />
        <g clipPath="url(#errorPillClip)">
          <image href="/images/dope-Logo-mark.png" x={19.303} y={(PILL_H - 24.351) / 2} width={PILL_W - 19.303 - 18.006} height="24.351" preserveAspectRatio="xMidYMid meet" />
        </g>
        <g clipPath="url(#errorPillClip)">
          <motion.g clipPath="url(#errorRevealClip)" style={{ opacity: overlayOpacity }}>
            <motion.rect x={0} y={0} height={PILL_H} fill={COLOR_ORDER[0]} style={{ width: segment0Width }} />
            <motion.rect x={segment1X} y={0} height={PILL_H} fill={COLOR_ORDER[1]} style={{ width: segment1Width }} />
            <motion.rect x={segment2X} y={0} height={PILL_H} fill={COLOR_ORDER[2]} style={{ width: segment2Width }} />
            <motion.rect x={segment3X} y={0} height={PILL_H} fill={COLOR_ORDER[3]} style={{ width: segment3Width }} />
          </motion.g>
        </g>
        <rect x={0} y={0} width={PILL_W} height={PILL_H} rx={R} ry={R} fill="transparent" stroke="#4D4D4F" strokeWidth="0.98" />
      </svg>
    </div>
  );
}
