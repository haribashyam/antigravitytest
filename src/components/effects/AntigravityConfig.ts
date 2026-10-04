/**
 * Antigravity 3D Depth & Scroll Configuration
 * 
 * Central configuration object holding all tuning variables for:
 * - 3D Three.js particle space field (counts, speeds, colors, depths)
 * - Parallax depth speeds for background, middle, and foreground
 * - Pinned Hero scroll scrub and 3D camera projection
 * - Section transitions (perspective, rotateX, scale)
 * - 3D Interactive cursor mouse tilt
 */

export const ANTIGRAVITY_CONFIG = {
  // ════════ 1. THREE.JS 3D SPACE PARTICLES ════════
  particles: {
    desktopCount: 2000,
    mobileCount: 600,
    // Flight speed forward along Z axis per scroll unit
    scrollFlightSpeed: 0.85,
    // Idle drift speed when user is not scrolling
    idleDriftSpeed: 0.15,
    // Particle size range in 3D world units
    size: 2.2,
    minSize: 1.2,
    maxSize: 3.5,
    // 3D Bounding volume dimensions (X, Y, Z)
    spreadX: 1400,
    spreadY: 1000,
    depthZ: 2800,
    // Palette inspired by Nothing OS 2.0 & Google Antigravity
    // (#ff2a34 = Nothing Red, #38bdf8 = Cyan Spark, #fbbf24 = Amber Flame, #ffffff / #a1a1aa = Star dust)
    palette: [
      '#ff2a34',
      '#ffffff',
      '#e4e4e7',
      '#a1a1aa',
      '#38bdf8',
      '#fbbf24',
      '#ef4444',
    ],
    // Max pixel ratio for 60fps performance (cap at 2)
    maxPixelRatio: 2,
    // Fog near and far distances
    fogNear: 100,
    fogFar: 2200,
  },

  // ════════ 2. DEPTH PARALLAX SPEEDS ════════
  // Defines relative scroll velocity per layer (1.0 = native scroll speed)
  parallax: {
    layer1BackgroundSpeed: 0.35,  // Deep space particles & ambient auras
    layer2MiddleSpeed: 0.75,      // Headings, badge chips, and arc ribbons
    layer3ForegroundSpeed: 1.15,  // Cockpit window, bento cards, and interactive steps
  },

  // ════════ 3. PINNED HERO & 3D ZOOM (IMAGE 3) ════════
  hero: {
    // Scroll distance to keep hero pinned before release (e.g., '100vh')
    pinDistance: '100vh',
    // Scale factor for hero text as it flies past camera
    textScaleOut: 1.22,
    // Opacity fade start and end percentages of scrub
    fadeStartRatio: 0.15,
    fadeEndRatio: 0.85,
    // Simulator Cockpit 3D zoom-in starting values
    cockpitInitialScale: 0.90,
    cockpitInitialRotateX: 8, // degrees
    cockpitPerspective: 1200, // px
  },

  // ════════ 4. SECTION 3D TRANSITIONS ════════
  transitions: {
    perspective: 1200,
    initialScale: 0.92,
    targetScale: 1.0,
    initialRotateX: 6, // degrees tilt on enter
    scrubSpeed: 1.0,
  },

  // ════════ 5. DESKTOP 3D MOUSE TILT ════════
  tilt: {
    maxAngleDegrees: 6,
    perspective: 1000,
    transitionSpeedMs: 350,
    scaleOnHover: 1.015,
  },

  // ════════ 6. LENIS SMOOTH SCROLL ════════
  scroll: {
    duration: 1.2,
    smoothWheel: true,
    wheelMultiplier: 1.0,
    touchMultiplier: 1.5,
  },
} as const;

export type AntigravityConfig = typeof ANTIGRAVITY_CONFIG;
