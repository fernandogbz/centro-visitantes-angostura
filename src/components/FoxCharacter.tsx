import React from 'react';
import './FoxCharacter.css';

export type FoxAction = 'idle' | 'walk';

interface FoxCharacterProps {
  action: FoxAction;
  size?: number;
  speed?: number;
  className?: string;
}

export const FoxCharacter: React.FC<FoxCharacterProps> = ({
  action,
  size = 100,
  speed = 0.8,
  className = '',
}) => {
  const dynamicStyles = {
    '--fox-size': `${size}px`,
    '--anim-duration': `${speed}s`,
  } as React.CSSProperties;

  return (
    <div
      className={`fox-sprite ${action} ${className}`}
      style={dynamicStyles}
      role="img"
      aria-label={`Zorro animado haciendo: ${action}`}
    />
  );
};
