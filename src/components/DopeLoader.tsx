import React from 'react';
import { motion } from 'framer-motion';

interface DopeLoaderProps {
  visible: boolean;
  size?: number;
  color?: string;
  strokeWidth?: number;
}

export const DopeLoader = React.memo<DopeLoaderProps>(({
  visible,
  size = 48,
  color = '#4D4D4F',
  strokeWidth = 3
}) => {
  return (
    <motion.div
      className="dope-loader"
      initial={{ scale: 0, opacity: 0, x: '-50%', y: '-50%' }}
      animate={visible ? {
        scale: 1,
        opacity: 1,
        x: '-50%',
        y: '-50%'
      } : {
        scale: 0,
        opacity: 0,
        x: '-50%',
        y: '-50%'
      }}
      transition={{
        duration: 0.2,
        ease: [0.34, 1.56, 0.64, 1]
      }}
      style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        zIndex: 15,
        transformOrigin: 'center center',
        width: size,
        height: size,
        pointerEvents: 'none'
      }}
    >
      <svg width={size} height={size} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <motion.circle
          cx="24"
          cy="24"
          r="20"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray="125.6"
          strokeDashoffset="31.4"
          fill="none"
          animate={visible ? {
            rotate: 360
          } : {
            rotate: 0
          }}
          transition={{
            rotate: {
              duration: 1,
              repeat: Infinity,
              ease: "linear"
            }
          }}
          style={{
            transformOrigin: 'center center'
          }}
        />
      </svg>
    </motion.div>
  );
});

DopeLoader.displayName = 'DopeLoader';
