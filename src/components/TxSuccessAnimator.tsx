import React, { useState, useEffect, useImperativeHandle, forwardRef } from 'react';
import { useMotionValue, animate, useMotionValueEvent } from 'framer-motion';
import { DopePillFrame } from './DopePillFrame';
import { DopeLogo } from './DopeLogo';
import { DopePillFill } from './DopePillFill';
import { DopeCheckPop } from './DopeCheckPop';
import { GreenWipe } from './GreenWipe';

export type TxAnimPhase =
  | 'idle'
  | 'pillFilling'
  | 'checkPop'
  | 'greenWipe'
  | 'done';

interface TxSuccessAnimatorProps {
  autoStart?: boolean;
  onDone?: () => void;
  durations?: {
    pill?: number;
    check?: number;
    wipe?: number;
    overlayFade?: number;
    overlayFadeDelay?: number;
  };
  pillWidth?: number;
  pillHeight?: number;
  showLogo?: boolean;
  showCheck?: boolean;
  showGreenWipe?: boolean;
  showSuccessPage?: boolean;
  successPageContent?: React.ReactNode;
}

export interface TxSuccessAnimatorRef {
  start: () => Promise<void>;
  reset: () => void;
  phase: TxAnimPhase;
}

export const TxSuccessAnimator = forwardRef<TxSuccessAnimatorRef, TxSuccessAnimatorProps>(
  ({
    autoStart = false,
    onDone,
    durations = {},
    pillWidth = 134.75,
    pillHeight = 49,
    showLogo = true,
    showCheck = true,
    showGreenWipe = true,
    showSuccessPage = true,
    successPageContent
  }, ref) => {
    const [phase, setPhase] = useState<TxAnimPhase>('idle');
    
    const {
      pill: pillDuration = 0.88,
      check: checkDuration = 0.5,
      wipe: wipeDuration = 0.45,
      overlayFade: overlayFadeDuration = 0.08,
      overlayFadeDelay: overlayFadeDelay = 0.12
    } = durations;

    // Animation values
    const overlayOpacity = useMotionValue(0);
    const pillProgress = useMotionValue(0);
    const greenWipeProgress = useMotionValue(0);
    
    // Local state for reactive updates
    const [pillProgressState, setPillProgressState] = useState(0);
    const [overlayOpacityState, setOverlayOpacityState] = useState(0);
    const [greenWipeProgressState, setGreenWipeProgressState] = useState(0);
    
    // Sync motion values to state for reactivity
    useMotionValueEvent(pillProgress, 'change', (latest) => {
      setPillProgressState(latest);
    });
    
    useMotionValueEvent(overlayOpacity, 'change', (latest) => {
      setOverlayOpacityState(latest);
    });
    
    useMotionValueEvent(greenWipeProgress, 'change', (latest) => {
      setGreenWipeProgressState(latest);
    });

    const start = React.useCallback(async (): Promise<void> => {
      return new Promise((resolve) => {
        setPhase('pillFilling');

        // Step 1: Fade in overlay
        const fadeControls = animate(overlayOpacity, 1, {
          duration: overlayFadeDuration,
          delay: overlayFadeDelay,
          ease: [0.4, 0.0, 0.2, 1],
        });

        // Step 2: Start pill fill animation
        const fillStartTime = overlayFadeDelay + overlayFadeDuration;
        const pillControls = animate(pillProgress, 1, {
          duration: pillDuration,
          delay: fillStartTime,
          ease: [0.2, 0, 0.2, 1],
          onComplete: () => {
            if (showCheck) {
              setPhase('checkPop');
              // After check animation, go to green wipe
              setTimeout(() => {
                if (showGreenWipe) {
                  setPhase('greenWipe');
                  // Animate green wipe
                  animate(greenWipeProgress, 1, {
                    duration: wipeDuration,
                    ease: [0.4, 0, 0.2, 1],
                    onComplete: () => {
                      setPhase('done');
                      if (onDone) onDone();
                      resolve();
                    }
                  });
                } else {
                  setPhase('done');
                  if (onDone) onDone();
                  resolve();
                }
              }, checkDuration * 1000);
            } else if (showGreenWipe) {
              setPhase('greenWipe');
              animate(greenWipeProgress, 1, {
                duration: wipeDuration,
                ease: [0.4, 0, 0.2, 1],
                onComplete: () => {
                  setPhase('done');
                  if (onDone) onDone();
                  resolve();
                }
              });
            } else {
              setPhase('done');
              if (onDone) onDone();
              resolve();
            }
          }
        });

        // Cleanup function
        return () => {
          fadeControls.stop();
          pillControls.stop();
        };
      });
    }, [
      overlayOpacity,
      pillProgress,
      greenWipeProgress,
      overlayFadeDuration,
      overlayFadeDelay,
      pillDuration,
      checkDuration,
      wipeDuration,
      showCheck,
      showGreenWipe,
      onDone
    ]);

    const reset = React.useCallback(() => {
      setPhase('idle');
      overlayOpacity.set(0);
      pillProgress.set(0);
      greenWipeProgress.set(0);
    }, [overlayOpacity, pillProgress, greenWipeProgress]);

    useImperativeHandle(ref, () => ({
      start,
      reset,
      phase
    }), [start, reset, phase]);

    useEffect(() => {
      if (autoStart) {
        start();
      }
    }, [autoStart, start]);

    // Check for prefers-reduced-motion (can be used for future accessibility features)
    // const prefersReducedMotion = typeof window !== 'undefined' && 
    //   window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    return (
      <div className="tx-success-animator" style={{ position: 'relative', width: '100%', height: '100%' }}>
        {/* Center stage for pill */}
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 10
        }}>
          {phase === 'idle' && showLogo && (
            <DopePillFrame width={pillWidth} height={pillHeight}>
              <DopeLogo width={pillWidth} height={pillHeight} />
            </DopePillFrame>
          )}

          {phase === 'pillFilling' && (
            <div style={{ position: 'relative' }}>
              <DopePillFrame width={pillWidth} height={pillHeight}>
                {showLogo && <DopeLogo width={pillWidth} height={pillHeight} />}
              </DopePillFrame>
              <div style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
                <DopePillFill
                  progress={pillProgressState}
                  width={pillWidth}
                  height={pillHeight}
                  opacity={overlayOpacityState}
                />
              </div>
            </div>
          )}
        </div>

        {/* Checkmark */}
        {showCheck && phase === 'checkPop' && (
          <DopeCheckPop
            visible={true}
            onComplete={() => {
              // Check animation complete
            }}
          />
        )}

        {/* Green wipe */}
        {showGreenWipe && (phase === 'greenWipe' || phase === 'done') && (
          <GreenWipe
            progress={greenWipeProgressState}
            fadeIn={phase === 'greenWipe'}
            fadeOut={phase === 'greenWipe'}
          />
        )}

        {/* Success page */}
        {showSuccessPage && (phase === 'greenWipe' || phase === 'done') && (
          <div className="success-page" style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: '#FFFFFF',
            zIndex: 30,
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'center',
            overflowY: 'auto'
          }}>
            {successPageContent || (
              <img 
                src="/images/tx-done.png" 
                alt="Transaction Details"
                style={{ width: '100%', height: 'auto' }}
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.style.display = 'none';
                }}
              />
            )}
          </div>
        )}
      </div>
    );
  }
);

TxSuccessAnimator.displayName = 'TxSuccessAnimator';
