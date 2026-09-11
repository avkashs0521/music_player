// terminal.js - Terminal helper utilities for CLI display and input

// ANSI escape codes for basic formatting and screen control
const ANSI = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  gray: '\x1b[90m',
  clear: '\x1b[2J\x1b[0;0H', // Clears terminal screen and moves cursor to top-left
};

// Clear the terminal screen
function clearScreen() {
  process.stdout.write(ANSI.clear);
}

// Print formatted message to terminal output
function print(message = '') {
  console.log(message);
}

// Enable raw keyboard input to capture keypresses immediately
function enableRawInput(onKeyPress) {
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
  if (process.stdin.isTTY) {
    process.stdin.setRawMode(false);
  }
  process.stdin.pause();
}

module.exports = {
  ANSI,
  clearScreen,
  print,
  enableRawInput,
  restoreTerminal,
};
