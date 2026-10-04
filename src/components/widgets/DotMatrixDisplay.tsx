'use client';

import React from 'react';

// 5x7 Dot-matrix font map for Nothing OS style typography
const CHAR_MAP: Record<string, number[][]> = {
  '0': [
    [0,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,1,1],
    [1,0,1,0,1],
    [1,1,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,0],
  ],
  '1': [
    [0,0,1,0,0],
    [0,1,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,0,1,0,0],
    [0,1,1,1,0],
  ],
  '2': [
    [0,1,1,1,0],
    [1,0,0,0,1],
    [0,0,0,0,1],
    [0,0,1,1,0],
    [0,1,0,0,0],
    [1,0,0,0,0],
    [1,1,1,1,1],
  ],
  '3': [
    [1,1,1,1,0],
    [0,0,0,0,1],
    [0,0,0,0,1],
    [0,1,1,1,0],
    [0,0,0,0,1],
    [0,0,0,0,1],
    [1,1,1,1,0],
  ],
  '4': [
    [0,0,0,1,0],
    [0,0,1,1,0],
    [0,1,0,1,0],
    [1,0,0,1,0],
    [1,1,1,1,1],
    [0,0,0,1,0],
    [0,0,0,1,0],
  ],
  '5': [
    [1,1,1,1,1],
    [1,0,0,0,0],
    [1,1,1,1,0],
    [0,0,0,0,1],
    [0,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,0],
  ],
  '6': [
    [0,0,1,1,0],
    [0,1,0,0,0],
    [1,0,0,0,0],
    [1,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,0],
  ],
  '7': [
    [1,1,1,1,1],
    [0,0,0,0,1],
    [0,0,0,1,0],
    [0,0,1,0,0],
    [0,1,0,0,0],
    [0,1,0,0,0],
    [0,1,0,0,0],
  ],
  '8': [
    [0,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,0],
  ],
  '9': [
    [0,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [0,1,1,1,1],
    [0,0,0,0,1],
    [0,0,0,1,0],
    [0,1,1,0,0],
  ],
  '.': [
    [0,0],
    [0,0],
    [0,0],
    [0,0],
    [0,0],
    [1,1],
    [1,1],
  ],
  ':': [
    [0,0],
    [1,1],
    [1,1],
    [0,0],
    [1,1],
    [1,1],
    [0,0],
  ],
  '-': [
    [0,0,0,0,0],
    [0,0,0,0,0],
    [0,0,0,0,0],
    [1,1,1,1,1],
    [0,0,0,0,0],
    [0,0,0,0,0],
    [0,0,0,0,0],
  ],
  '%': [
    [1,1,0,0,1],
    [1,1,0,1,0],
    [0,0,1,0,0],
    [0,1,0,0,0],
    [0,0,1,0,0],
    [0,1,0,1,1],
    [1,0,0,1,1],
  ],
  '₹': [
    [1,1,1,1,1],
    [0,0,1,0,0],
    [1,1,1,1,0],
    [0,0,1,0,0],
    [0,1,0,1,0],
    [1,0,0,0,1],
    [1,0,0,0,0],
  ],
  '/': [
    [0,0,0,0,1],
    [0,0,0,1,0],
    [0,0,1,0,0],
    [0,1,0,0,0],
    [1,0,0,0,0],
    [0,0,0,0,0],
    [0,0,0,0,0],
  ],
  ' ': [
    [0,0,0],
    [0,0,0],
    [0,0,0],
    [0,0,0],
    [0,0,0],
    [0,0,0],
    [0,0,0],
  ],
  'K': [
    [1,0,0,0,1],
    [1,0,0,1,0],
    [1,0,1,0,0],
    [1,1,0,0,0],
    [1,0,1,0,0],
    [1,0,0,1,0],
    [1,0,0,0,1],
  ],
  'M': [
    [1,0,0,0,1],
    [1,1,0,1,1],
    [1,0,1,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,0,0,0,1],
  ],
  'L': [
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,1,1,1,1],
  ],
  'R': [
    [1,1,1,1,0],
    [1,0,0,0,1],
    [1,0,0,0,1],
    [1,1,1,1,0],
    [1,0,1,0,0],
    [1,0,0,1,0],
    [1,0,0,0,1],
  ],
  'E': [
    [1,1,1,1,1],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,1,1,1,0],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,1,1,1,1],
  ],
  'C': [
    [0,1,1,1,1],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [1,0,0,0,0],
    [0,1,1,1,1],
  ],
};

interface DotMatrixCharProps {
  char: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  activeColor?: string;
  inactiveColor?: string;
}

export const DotMatrixChar: React.FC<DotMatrixCharProps> = ({
  char,
  size = 'md',
  activeColor = '#ffffff',
  inactiveColor = 'rgba(255, 255, 255, 0.06)',
}) => {
  const upper = char.toUpperCase();
  const matrix = CHAR_MAP[upper] || CHAR_MAP[' '];
  
  const dotSize = {
    xs: 2,
    sm: 3,
    md: 4.5,
    lg: 6,
    xl: 8,
  }[size];

  const gap = {
    xs: 1,
    sm: 1.5,
    md: 2,
    lg: 2.5,
    xl: 3.5,
  }[size];

  return (
    <div
      style={{
        display: 'inline-grid',
        gridTemplateColumns: `repeat(${matrix[0].length}, ${dotSize}px)`,
        gridTemplateRows: `repeat(7, ${dotSize}px)`,
        gap: `${gap}px`,
        marginRight: `${gap * 2}px`,
      }}
      aria-hidden="true"
    >
      {matrix.flatMap((row, rIdx) =>
        row.map((cell, cIdx) => (
          <div
            key={`${rIdx}-${cIdx}`}
            style={{
              width: `${dotSize}px`,
              height: `${dotSize}px`,
              borderRadius: '50%',
              backgroundColor: cell === 1 ? activeColor : inactiveColor,
              boxShadow: cell === 1 && activeColor === '#e50914' 
                ? '0 0 6px rgba(229, 9, 20, 0.6)' 
                : cell === 1 && activeColor === '#ffffff' 
                ? '0 0 4px rgba(255, 255, 255, 0.4)' 
                : 'none',
              transition: 'background-color 0.15s ease',
            }}
          />
        ))
      )}
    </div>
  );
};

interface DotMatrixTextProps {
  text: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  activeColor?: string;
  inactiveColor?: string;
  className?: string;
}

export const DotMatrixText: React.FC<DotMatrixTextProps> = ({
  text,
  size = 'md',
  activeColor,
  inactiveColor,
  className = '',
}) => {
  const resolvedActive = activeColor && activeColor !== '#ffffff' 
    ? activeColor 
    : 'var(--nothing-dot-active, #ffffff)';
  const resolvedInactive = inactiveColor && inactiveColor !== 'rgba(255, 255, 255, 0.06)' 
    ? inactiveColor 
    : 'var(--nothing-dot-dim, rgba(255, 255, 255, 0.06))';

  return (
    <div className={`inline-flex items-center select-none ${className}`} title={text}>
      <span className="sr-only">{text}</span>
      {text.split('').map((char, index) => (
        <DotMatrixChar
          key={index}
          char={char}
          size={size}
          activeColor={resolvedActive}
          inactiveColor={resolvedInactive}
        />
      ))}
    </div>
  );
};
