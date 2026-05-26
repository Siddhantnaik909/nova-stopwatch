/**
 * NOVA Stopwatch - Constants and Configuration
 * ============================================
 *
 * Central location for all constant values, configuration, and magic numbers.
 * Helps maintain consistency and makes updates easier.
 */

// ─── TIMING CONSTANTS ───────────────────────────────────────
export const TIMING = {
  // Hold duration (ms) before reset action triggers
  RESET_HOLD_DURATION: 800,

  // Precision display options
  PRECISION: {
    CENTISECONDS: 2,    // .00
    MILLISECONDS: 3,    // .000
  },

  // Default Pomodoro intervals (minutes)
  POMODORO: {
    WORK: 25,
    SHORT_BREAK: 5,
    LONG_BREAK: 15,
    CYCLES_PER_LONG_BREAK: 4,
  },

  // Local storage limits
  MAX_SESSIONS_STORED: 50,
};

// ─── ANIMATION CONSTANTS ────────────────────────────────────
export const ANIMATION = {
  // Tab slider animation duration
  TAB_SLIDER_DURATION: 300,

  // Focus overlay animation
  FOCUS_OVERLAY_FADE_DURATION: 200,

  // Alarm shake animation
  ALARM_SHAKE_DURATION: 100,
};

// ─── UI CONSTANTS ───────────────────────────────────────────
export const UI = {
  // SVG circle circumferences (for progress rings)
  CIRCLES: {
    MINUTE: 2 * Math.PI * 86,    // radius 86
    SECOND: 2 * Math.PI * 93,    // radius 93
    MS: 2 * Math.PI * 100,        // radius 100
  },

  // Theme names (order matters for cycling)
  THEMES: [
    "cyber-gold",
    "neon-blue",
    "matrix-green",
    "crimson-red",
    "vaporwave",
    "midnight-eclipse",
  ],

  // Sound effect modes
  SOUND_MODES: {
    MECHANICAL: "mechanical",
    DIGITAL: "digital",
    NONE: "none",
  },

  // Alarm sound options
  ALARM_SOUNDS: {
    CHIME: "chime",
    ALERT: "alert",
  },
};

// ─── LOCAL STORAGE KEYS ──────────────────────────────────────
export const STORAGE_KEYS = {
  // Session history
  SESSIONS: "nova_stopwatch_sessions_v1",

  // User preferences
  THEME: "nova_theme",
  SOUND_MODE: "nova_sound_mode",
  ALARM_SOUND: "nova_alarm_sound",
  TICKING_ENABLED: "nova_ticking_enabled",
  PARTICLES_ENABLED: "nova_particles_enabled",
  PRECISION: "nova_precision",
};

// ─── TIMER PRESETS ──────────────────────────────────────────
export const TIMER_PRESETS = [
  { label: "1 Min", minutes: 1 },
  { label: "5 Min", minutes: 5 },
  { label: "10 Min", minutes: 10 },
  { label: "15 Min", minutes: 15 },
  { label: "30 Min", minutes: 30 },
  { label: "1 Hour", minutes: 60 },
];

// ─── TEXT/LABEL CONSTANTS ───────────────────────────────────
export const LABELS = {
  // Status messages
  STATUS: {
    READY: "READY",
    RUNNING: "RUNNING",
    PAUSED: "PAUSED",
    TIMER: "TIMER",
    TIMER_PAUSED: "TIMER PAUSED",
    TIMER_READY: "TIMER READY",
    SET_TIMER: "SET TIMER",
    WORK: "WORK",
    BREAK: "BREAK",
  },

  // Phase labels (Pomodoro)
  PHASES: {
    WORK: "WORK TIME",
    SHORT: "SHORT BREAK",
    LONG: "LONG BREAK",
  },

  // Button texts
  BUTTONS: {
    START: "START",
    PAUSE: "PAUSE",
    LAP: "LAP",
    RESET: "RESET",
    HOLD_RESET: "HOLD RESET",
    STOP_ALARM: "STOP ALARM",
  },

  // Modal titles
  MODALS: {
    FOCUS_MODE: "Focus Mode",
    ALARM: "TIME'S UP!",
    SHORTCUTS: "Keyboard Shortcuts",
    SETTINGS: "Settings",
    HISTORY: "Session History",
  },

  // Empty states
  EMPTY: {
    NO_LAPS: "No laps recorded yet.",
    NO_SESSIONS: "No saved sessions yet.",
  },
};

// ─── KEYBOARD SHORTCUTS ──────────────────────────────────────
export const SHORTCUTS = {
  SPACE: "Space",          // Start/Pause
  LAP: "L",                // Record Lap
  RESET: "R",              // Hold to Reset
  CYCLE_THEME: "T",        // Cycle Themes
  FOCUS_MODE: "F",         // Focus Mode
  MINI_WIDGET: "M",        // Mini Widget
  SHOW_SHORTCUTS: "?",     // Show Shortcuts
  CLOSE: "Escape",         // Close Overlays
};

// ─── VALIDATION CONSTANTS ───────────────────────────────────
export const VALIDATION = {
  // Timer bounds
  MIN_TIMER_MS: 1000,                    // 1 second
  MAX_TIMER_MS: 24 * 60 * 60 * 1000,    // 24 hours

  // Spinner bounds
  MIN_MINUTES: 0,
  MAX_MINUTES: 99,
  MIN_SECONDS: 0,
  MAX_SECONDS: 59,
};

// ─── DATE/TIME FORMATS ──────────────────────────────────────
export const FORMATS = {
  // Time display formats
  MMSS: "MM:SS",
  MMSS_CS: "MM:SS.CS",     // Centiseconds
  MMSS_MS: "MM:SS.MS",     // Milliseconds

  // Date display
  ISO: "ISO 8601",
  LOCALE: "Browser Locale",
};

// ─── ACCESSIBILITY CONSTANTS ────────────────────────────────
export const A11Y = {
  // ARIA roles
  ROLES: {
    MAIN: "main",
    BUTTON: "button",
    DIALOG: "dialog",
    ALERT_DIALOG: "alertdialog",
    COMPLEMENTARY: "complementary",
  },

  // ARIA attributes
  ATTRIBUTES: {
    HIDDEN: "aria-hidden",
    LABEL: "aria-label",
    EXPANDED: "aria-expanded",
    CHECKED: "aria-checked",
    LIVE: "aria-live",
    POLITE: "polite",
    ATOMIC: "aria-atomic",
  },
};

// ─── EXPORT ALL ────────────────────────────────────────────────
export const CONFIG = {
  TIMING,
  ANIMATION,
  UI,
  STORAGE_KEYS,
  TIMER_PRESETS,
  LABELS,
  SHORTCUTS,
  VALIDATION,
  FORMATS,
  A11Y,
};

export default CONFIG;
