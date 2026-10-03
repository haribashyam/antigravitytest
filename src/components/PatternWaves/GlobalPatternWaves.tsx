'use client';

import React, { useState, useEffect } from 'react';
import PatternWaves from './PatternWaves';

export function GlobalPatternWaves() {
  const [isLight, setIsLight] = useState(false);

  useEffect(() => {
    // Check initial document state
    const checkTheme = () => {
      setIsLight(document.documentElement.classList.contains('light'));
    };
    checkTheme();

    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ theme: 'dark' | 'light' }>;
      setIsLight(customEvent.detail.theme === 'light');
    };

    window.addEventListener('fuelwise-theme-change', handleThemeChange);
    return () => window.removeEventListener('fuelwise-theme-change', handleThemeChange);
  }, []);

  return (
    <div
      className="fixed inset-0 pointer-events-none z-0 overflow-hidden transition-colors duration-500"
      aria-hidden="true"
      style={{ width: '100vw', height: '100vh', position: 'fixed' }}
    >
      <PatternWaves
        key={isLight ? 'light-waves' : 'dark-waves'}
        preset="silk"
        pattern="dot"
        wave="silk"
        color={isLight ? '#18181b' : '#f5f5f5'}
        accentColor={isLight ? '#e50914' : '#ff2a34'}
        backgroundColor={isLight ? '#f4f5f8' : '#000000'}
        opacity={isLight ? 0.75 : 0.7}
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
      <div
        className={`absolute inset-0 pointer-events-none transition-opacity duration-500 ${
          isLight
            ? 'bg-[radial-gradient(ellipse_at_center,transparent_55%,rgba(0,0,0,0.06)_100%)]'
            : 'bg-[radial-gradient(ellipse_at_center,transparent_40%,rgba(0,0,0,0.6)_100%)]'
        }`}
      />
    </div>
  );
}

export default GlobalPatternWaves;
