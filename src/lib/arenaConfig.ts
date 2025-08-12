// Arena SDK configuration
// These values should be set according to your Reown project setup

export const ARENA_CONFIG = {
  // Replace with your actual Reown Project ID
  PROJECT_ID: import.meta.env.VITE_REOWN_PROJECT_ID || "60d1bdef75d2389275fcbf3d875b652a",
  
  // App metadata for Arena
  APP_NAME: "DroidHub Arena",
  APP_DESCRIPTION: "Control and stake on autonomous robots through the Arena platform",
  
  // App icon (should be hosted and accessible via HTTPS)
  APP_ICON: `${window.location.origin}/favicon.ico`,
  
  // Development mode detection
  IS_DEV_MODE: import.meta.env.DEV,
  
  // Required port for Arena local testing
  REQUIRED_PORT: 3481,
};

export const checkArenaEnvironment = (): boolean => {
  // Check if running in Arena environment (iframe detection)
  try {
    const isIframe = window.self !== window.top;
    const hasArenaSDK = typeof window !== 'undefined' && !!window.ArenaAppStoreSdk;
    const isArenaHost = window.location.hostname === 'arena.app' || window.location.hostname.includes('arena');
    
    return isIframe || hasArenaSDK || isArenaHost;
  } catch (e) {
    return true; // Cross-origin iframe
  }
};

export const isLocalArenaTest = (): boolean => {
  return window.location.port === ARENA_CONFIG.REQUIRED_PORT.toString();
};
