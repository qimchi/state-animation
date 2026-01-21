import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import './CircularLoader.css';

export type LoaderState = 'spinning' | 'filling' | 'complete';

interface CircularLoaderProps {
  state: LoaderState;
  targetColor: string;
  onFillComplete?: () => void;
}

export function CircularLoader({ state, targetColor, onFillComplete }: CircularLoaderProps) {
  const [fillComplete, setFillComplete] = useState(false);

  useEffect(() => {
    if (state === 'filling') {
      // Wait for fill animation to complete
      const timer = setTimeout(() => {
        setFillComplete(true);
        onFillComplete?.();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [state, onFillComplete]);

  return (
    <div className="circular-loader-wrapper">
      <motion.div
        className="loader-ring"
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          scale: { duration: 0.25, ease: [0.34, 1.56, 0.64, 1] },
          opacity: { duration: 0.15 }
        }}
        style={{
          borderColor: state === 'filling' || fillComplete ? targetColor : '#4D4D4F',
        }}
        data-state={state}
      />
    </div>
  );
}

interface LoaderToIconProps {
  targetState: 'success' | 'error' | 'processing';
  onComplete?: () => void;
}

const STATE_COLORS = {
  success: '#31CC66',
  error: '#FF3B30',
  processing: '#9E9E9E',
};

export function LoaderToIcon({ targetState, onComplete }: LoaderToIconProps) {
  const color = STATE_COLORS[targetState];

  return (
    <motion.div
      className="loader-icon-wrapper"
      initial={{ scale: 0.6, opacity: 1 }}
      animate={{
        scale: [0.6, 1.15, 1, 0],
        opacity: [1, 1, 1, 0],
        rotate: [0, -3, 3, -2, 1, 0, 0],
      }}
      transition={{
        scale: {
          duration: 0.5,
          times: [0, 0.5, 0.7, 1],
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
        }
      }}
      onAnimationComplete={onComplete}
    >
      <svg width="72" height="72" viewBox="0 0 143 143" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M22.9744 41.4696C23.0817 46.8965 20.1287 54.2324 16.2892 58.0648C12.7264 61.631 10.7251 66.4658 10.7251 71.5068C10.7251 76.5478 12.7264 81.3826 16.2892 84.9488C20.0787 88.724 22.8672 95.2734 22.9744 100.622C23.0745 105.355 24.9264 110.06 28.5371 113.663C31.8684 117.001 36.3248 118.977 41.0353 119.204C46.691 119.49 54.0984 122.779 58.1024 126.783C61.6683 130.344 66.5016 132.344 71.5408 132.344C76.58 132.344 81.4133 130.344 84.9792 126.783C88.9832 122.779 96.3906 119.49 102.046 119.204C106.757 118.977 111.213 117.001 114.544 113.663C118.017 110.195 120.009 105.515 120.1 100.607C120.207 95.2734 122.96 88.7669 126.742 84.9917C130.319 81.4266 132.332 76.5869 132.34 71.5371C132.349 66.4874 130.35 61.6412 126.785 58.0648C122.953 54.2395 119.993 46.8965 120.107 41.4768C120.161 38.9179 119.696 36.3747 118.74 34.0005C117.784 31.6263 116.357 29.4705 114.544 27.663C112.666 25.78 110.413 24.3134 107.931 23.3587C105.448 22.404 102.793 21.9825 100.137 22.1217C95.0321 22.3791 88.59 19.9052 84.9792 16.2873C81.413 12.7245 76.5782 10.7233 71.5372 10.7233C66.4962 10.7233 61.6614 12.7245 58.0952 16.2873C54.4916 19.8981 48.0423 22.3791 42.9372 22.1217C40.2826 21.9836 37.6285 22.4055 35.1476 23.3602C32.6667 24.3149 30.4144 25.7809 28.5371 27.663C26.7259 29.4696 25.2992 31.6243 24.3432 33.9972C23.3872 36.3701 22.9215 38.912 22.9744 41.4696Z"
          fill={color}
        />

        {targetState === 'success' && (
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M93.2446 47.3755C94.0659 47.8312 94.7893 48.4443 95.3736 49.1797C95.9579 49.915 96.3916 50.7583 96.6499 51.6613C96.9081 52.5643 96.986 53.5094 96.8789 54.4425C96.7719 55.3756 96.4821 56.2785 96.026 57.0995L76.2348 92.7208C75.7221 93.691 74.9931 94.5301 74.1041 95.1733C72.8122 96.108 71.2449 96.584 69.6515 96.5257C68.058 96.4674 66.5297 95.8781 65.3096 94.8515L45.5827 79.0715C44.8494 78.4847 44.2388 77.7591 43.7859 76.9363C43.333 76.1135 43.0466 75.2095 42.943 74.2761C42.8394 73.3426 42.9207 72.3978 43.1823 71.4957C43.4438 70.5936 43.8805 69.7519 44.4673 69.0186C45.0542 68.2853 45.7797 67.6747 46.6025 67.2218C47.4253 66.7689 48.3293 66.4824 49.2628 66.3789C50.1963 66.2753 51.141 66.3566 52.0431 66.6181C52.9452 66.8797 53.7869 67.3163 54.5202 67.9032L67.7692 78.5066L83.5206 50.1497C83.9769 49.3291 84.5904 48.6063 85.3261 48.0228C86.0617 47.4392 86.9051 47.0062 87.808 46.7486C88.711 46.491 89.6559 46.4138 90.5887 46.5214C91.5215 46.6289 92.424 46.9192 93.2446 47.3755Z"
            fill="white"
          />
        )}

        {targetState === 'error' && (
          <path
            d="M52 52L92 92M92 52L52 92"
            stroke="white"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {targetState === 'processing' && (
          <>
            <path d="M55 45H88V55C88 62 80 71.5 71.5 71.5C63 71.5 55 62 55 55V45Z" fill="white" />
            <path d="M55 98H88V88C88 81 80 71.5 71.5 71.5C63 71.5 55 81 55 88V98Z" fill="white" />
            <rect x="53" y="42" width="37" height="6" rx="2" fill="white"/>
            <rect x="53" y="95" width="37" height="6" rx="2" fill="white"/>
          </>
        )}
      </svg>
    </motion.div>
  );
}
