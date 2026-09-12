// app.js - Main entry point of the Terminal Music Player

const terminal = require('./terminal');
const player = require('./player');

// Helper to format a box row with consistent padding
function formatRow(text, width = 42) {
  const line = '  ' + text;
  if (line.length < width) {
    return line + ' '.repeat(width - line.length);
  }
  return line.slice(0, width);
}

// Render the player interface
function renderUI(status = 'No song selected') {
  terminal.clearScreen();
  const c = terminal.ANSI;

  terminal.print(`${c.cyan}╔══════════════════════════════════════════╗${c.reset}`);
  terminal.print(`${c.cyan}║${c.bold}        🎵 TERMINAL MUSIC PLAYER          ${c.reset}${c.cyan}║${c.reset}`);
  terminal.print(`${c.cyan}╠══════════════════════════════════════════╣${c.reset}`);
  terminal.print(`${c.cyan}║${c.reset}                                          ${c.cyan}║${c.reset}`);
  terminal.print(`${c.cyan}║${c.reset}${formatRow(status)}${c.cyan}║${c.reset}`);
  terminal.print(`${c.cyan}║${c.reset}                                          ${c.cyan}║${c.reset}`);
  terminal.print(`${c.cyan}║${c.reset}  ${c.bold}[P]${c.reset} Play/Pause                          ${c.cyan}║${c.reset}`);
  terminal.print(`${c.cyan}║${c.reset}  ${c.bold}[S]${c.reset} Stop                                ${c.cyan}║${c.reset}`);
  terminal.print(`${c.cyan}║${c.reset}  ${c.bold}[N]${c.reset} Next                                ${c.cyan}║${c.reset}`);
  terminal.print(`${c.cyan}║${c.reset}  ${c.bold}[B]${c.reset} Previous                            ${c.cyan}║${c.reset}`);
  terminal.print(`${c.cyan}║${c.reset}  ${c.bold}[Q]${c.reset} Quit                                ${c.cyan}║${c.reset}`);
  terminal.print(`${c.cyan}║${c.reset}                                          ${c.cyan}║${c.reset}`);
  terminal.print(`${c.cyan}╚══════════════════════════════════════════╝${c.reset}`);
  terminal.print();
  terminal.print(`${c.gray}Press any key above to control, or 'Q' / Ctrl+C to quit.${c.reset}`);
}

// Handle keypress events routed from terminal.js
function handleInput(key) {
  const cleanKey = typeof key === 'string' ? key.replace(/[\r\n]/g, '').trim() : '';
  const upperKey = cleanKey.toUpperCase();


  switch (upperKey) {
    case 'P': {
      const result = player.togglePlay();
      renderUI(`Pressed: P (${result})`);
      break;
    }
    case 'S': {
      const result = player.stop();
      renderUI(`Pressed: S (${result})`);
      break;
    }
    case 'N': {
      const result = player.next();
      renderUI(`Pressed: N (${result})`);
      break;
    }
    case 'B': {
      const result = player.previous();
      renderUI(`Pressed: B (${result})`);
      break;
    }
    case 'Q': {
      terminal.restoreTerminal();
      terminal.print();
      terminal.print(`${terminal.ANSI.green}Thank you for using Terminal Music Player. Goodbye!${terminal.ANSI.reset}`);
      process.exit(0);
      break;
    }
    default: {
      const displayKey = typeof key === 'string' ? key.replace(/[\r\n\t]/g, '').trim() : '';
      renderUI(`Pressed: ${displayKey || 'Unknown'}`);
      break;
    }
  }
}

// Start the application
function start() {
  terminal.hideCursor();
  renderUI('No song selected');
  terminal.enableRawInput(handleInput);
}

start();

