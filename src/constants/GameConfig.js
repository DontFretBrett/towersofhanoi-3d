export const DISK_COLORS = [
    0xff0000,  // Red
    0x00ff00,  // Green
    0x0000ff,  // Blue
    0xff00ff,  // Magenta
    0x00ffff,  // Cyan
    0xffa500,  // Orange
    0x800080,  // Purple
    0x008000,  // Dark Green
    0x4b0082,  // Indigo
    0x800000   // Maroon
];

// Bright, vibrant yellow for selection
export const HIGHLIGHT_COLOR = 0xffff00;  // Pure yellow

export const DISK_CONFIG = {
  maxRadius: 1.6,
  minRadius: 0.4,
  height: 0.3,
  SPACING: 0.05
};

export const CAMERA_CONFIG = {
  fov: 50,
  near: 0.1,
  far: 1000,
  position: {
    x: 0,
    y: 8,    
    z: 15    
  },
  lookAt: {
    x: 0,
    y: -3,    // Look lower to center the game
    z: 0
  }
};

// Scene lighting position
export const LIGHT_CONFIG = {
  position: {
    x: 10,
    y: 10,
    z: -14
  }
};

export const GAME_CONFIG = {
    ANIMATION: {
        DURATION: 100,
        STEPS: 5,
        LIFT_HEIGHT: 4,
        LIFT_DURATION: 0.15,
        DROP_DURATION: 0.1
    },
    ROD: {
        HEIGHT: 4,
        RADIUS: 0.1,
        SPACING: 4
    },
    UI: {
        UPDATE_INTERVAL: 1000
    }
};
