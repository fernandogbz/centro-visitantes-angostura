import React from 'react';
import { FoxCharacter } from './FoxCharacter';
import './AnimatedFox.css';

export const AnimatedFox: React.FC = () => {
  return (
    <div className="animated-fox-container">
      <FoxCharacter 
        action="walk" 
        size={80} 
        speed={0.5}
        className="walking-fox"
      />
    </div>
  );
};
