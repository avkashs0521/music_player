// terminal.js - Terminal helper utilities for CLI display and input

// ANSI escape codes for basic formatting and screen control
const ANSI = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  gray: '\x1b[90m',
  clear: '\x1b[2J\x1b[0;0H',      // Clears terminal screen and moves cursor to top-left
  cursorHome: '\x1b[H',           // Moves cursor to top-left without clearing screen
  hideCursor: '\x1b[?25l',        // Hides cursor
  showCursor: '\x1b[?25h',        // Restores cursor visibility
};

// Clear the terminal screen
function clearScreen() {
  process.stdout.write(ANSI.clear);
}

// Move cursor to top-left without clearing screen (for in-place updates)
function cursorHome() {
  process.stdout.write(ANSI.cursorHome);
}

// Hide the cursor
function hideCursor() {
  process.stdout.write(ANSI.hideCursor);
}


// Show the cursor
function showCursor() {
  process.stdout.write(ANSI.showCursor);
}

// Reset formatting
function reset() {
  process.stdout.write(ANSI.reset);
}

// Print formatted message to terminal output
function print(message = '') {
  console.log(message);
}

// Track whether the terminal has already been restored to prevent duplicate work
let isRestored = false;

// Optional cleanup hook before restoring terminal (e.g. stopping audio child process)
let cleanupHook = null;

function setCleanupHook(fn) {
  cleanupHook = fn;
}

// Enable raw keyboard input to capture keypresses immediately
function enableRawInput(onKeyPress) {
  isRestored = false;

  if (process.stdin.isTTY) {
    process.stdin.setRawMode(true);
  }
  process.stdin.resume();
  process.stdin.setEncoding('utf8');

  process.stdin.on('data', (key) => {
    // Handle Ctrl+C (\u0003) to exit safely
    if (key === '\u0003') {
      restoreTerminal();
      process.exit(0);
    }

    if (onKeyPress) {
      onKeyPress(key);
    }
  });
}

// Restore terminal settings before exiting
function restoreTerminal() {
  if (isRestored) {
    return;
  }
  isRestored = true;

  if (typeof cleanupHook === 'function') {
    try {
      cleanupHook();
    } catch (err) {
      // Ignore cleanup hook errors during exit
    }
  }

  if (process.stdin.isTTY) {
    process.stdin.setRawMode(false);
  }
  process.stdin.pause();
  showCursor();
  reset();
}

module.exports = {
  ANSI,
  clearScreen,
  cursorHome,
  hideCursor,
  showCursor,
  reset,
  print,
  setCleanupHook,
  enableRawInput,
  restoreTerminal,
};



