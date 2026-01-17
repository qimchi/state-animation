import React from 'react';

interface DopePillFrameProps {
  width?: number;
  height?: number;
  strokeColor?: string;
  strokeWidth?: number;
  fillColor?: string;
  children?: React.ReactNode;
}

export const DopePillFrame = React.memo<DopePillFrameProps>(({
  width = 134.75,
  height = 49,
  strokeColor = '#4D4D4F',
  strokeWidth = 0.98,
  fillColor = '#fff',
  children
}) => {
  const R = height / 2;

  return (
    <svg width={width} height={height} className="dope-pill-frame">
      <defs>
        <clipPath id="pillClip">
          <rect x={0} y={0} width={width} height={height} rx={R} ry={R} />
        </clipPath>
      </defs>

      {/* White base */}
      <rect 
        x={0} 
        y={0} 
        width={width} 
        height={height} 
        rx={R} 
        ry={R} 
        fill={fillColor} 
      />

      {/* Optional children (logo, etc.) */}
      {children && (
        <g clipPath="url(#pillClip)">
          {children}
        </g>
      )}

      {/* Pill stroke (always on top) */}
      <rect
        x={0}
        y={0}
        width={width}
        height={height}
        rx={R}
        ry={R}
        fill="transparent"
        stroke={strokeColor}
        strokeWidth={strokeWidth}
      />
    </svg>
  );
});

DopePillFrame.displayName = 'DopePillFrame';
