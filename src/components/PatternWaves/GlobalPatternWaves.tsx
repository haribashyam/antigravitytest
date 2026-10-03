'use client';

import React from 'react';
import PatternWaves from './PatternWaves';

export function GlobalPatternWaves() {
  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden"
      aria-hidden="true"
      style={{ width: '100vw', height: '100vh', position: 'fixed' }}
    >
      <PatternWaves
        preset="silk"
        pattern="dot"
        wave="silk"
        color="#f5f5f5"
        accentColor="#ff2a34"
        backgroundColor="#000000"
        opacity={0.7}
        spacing={11}
        markSize={0.9}
        depth={1.1}
        fade="none"
        interactive={true}
        cursorSize={70}
        cursorStrength={0.8}
        speed={0.22}
      />
      {/* Subtle edge depth vignette to enhance contrast for content readability */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.6)_100%)] pointer-events-none" />
    </div>
  );
}

export default GlobalPatternWaves;
