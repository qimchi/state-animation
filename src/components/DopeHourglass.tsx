import React from 'react';
import { motion } from 'framer-motion';

interface DopeHourglassProps {
  visible: boolean;
  size?: number;
  color?: string;
  onComplete?: () => void;
}

export const DopeHourglass = React.memo<DopeHourglassProps>(({
  visible,
  size = 32,
  color = '#4D4D4F'
}) => {
  if (!visible) return null;

  return (
    <div
      className="dope-hourglass"
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 20,
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
        pointerEvents: 'none'
      }}
    >
      <svg width={size} height={size} viewBox="0 0 256 256" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="256" height="256" fill="none"/>
        <path 
          d="M224,128A96,96,0,0,1,62.11,197.82a8,8,0,1,1,11-11.64A80,80,0,1,0,71.43,71.43C67.9,75,64.58,78.51,61.35,82L77.66,98.34A8,8,0,0,1,72,112H32a8,8,0,0,1-8-8V64a8,8,0,0,1,13.66-5.66L50,70.7c3.22-3.49,6.54-7,10.06-10.55A96,96,0,0,1,224,128ZM128,72a8,8,0,0,0-8,8v48a8,8,0,0,0,3.88,6.86l40,24a8,8,0,1,0,8.24-13.72L136,123.47V80A8,8,0,0,0,128,72Z"
          fill={color}
        />
      </svg>
      <span
        style={{
          color: color,
          fontSize: '14px',
          fontWeight: 500,
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          whiteSpace: 'nowrap',
          display: 'inline-flex',
          alignItems: 'center'
        }}
      >
        Processing
        <span style={{ display: 'inline-flex', gap: '2px', marginLeft: '2px' }}>
          <motion.span
            animate={{
              opacity: [1, 0.3, 1],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              times: [0, 0.5, 1],
              ease: "easeInOut"
            }}
          >
            .
          </motion.span>
          <motion.span
            animate={{
              opacity: [1, 0.3, 1],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: 0.2,
              times: [0, 0.5, 1],
              ease: "easeInOut"
            }}
          >
            .
          </motion.span>
          <motion.span
            animate={{
              opacity: [1, 0.3, 1],
            }}
            transition={{
              duration: 1.2,
              repeat: Infinity,
              delay: 0.4,
              times: [0, 0.5, 1],
              ease: "easeInOut"
            }}
          >
            .
          </motion.span>
        </span>
      </span>
    </div>
  );
});

DopeHourglass.displayName = 'DopeHourglass';
