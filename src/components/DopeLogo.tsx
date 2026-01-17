import React from 'react';

interface DopeLogoProps {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  imagePath?: string;
}

export const DopeLogo = React.memo<DopeLogoProps>(({
  width = 134.75,
  height = 49,
  x = 19.303,
  y,
  imagePath = '/images/dope-Logo-mark.png'
}) => {
  const logoHeight = 24.351;
  const logoY = y !== undefined ? y : (height - logoHeight) / 2;
  const logoWidth = width - x - 18.006;

  return (
    <image
      href={imagePath}
      x={x}
      y={logoY}
      width={logoWidth}
      height={logoHeight}
      preserveAspectRatio="xMidYMid meet"
    />
  );
});

DopeLogo.displayName = 'DopeLogo';
