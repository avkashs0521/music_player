// app.js - Main entry point of the Terminal Music Player

const terminal = require('./terminal');
const player = require('./player');

// Pad plain text to exact visual column width
function padLine(text, width = 42) {
  if (text.length < width) {
    return text + ' '.repeat(width - text.length);
  }
  return text.slice(0, width);
}

// Render the player and playlist interface
function renderUI(statusMessage = 'Ready') {
  terminal.clearScreen();
  const c = terminal.ANSI;
  const state = player.getState();

  // Top header
  terminal.print(`${c.cyan}╔══════════════════════════════════════════╗${c.reset}`);
  terminal.print(`${c.cyan}║${c.bold}        🎵 TERMINAL MUSIC PLAYER          ${c.reset}${c.cyan}║${c.reset}`);
  terminal.print(`${c.cyan}╠══════════════════════════════════════════╣${c.reset}`);
  terminal.print(`${c.cyan}║${c.reset}${padLine(' Songs', 42)}${c.cyan}║${c.reset}`);
  terminal.print(`${c.cyan}║${c.reset}${padLine('', 42)}${c.cyan}║${c.reset}`);

  // Playlist items or error states
  if (state.directoryStatus === 'NOT_FOUND') {
    terminal.print(`${c.cyan}║${c.yellow}${padLine('  Music directory not found.', 42)}${c.reset}${c.cyan}║${c.reset}`);
    terminal.print(`${c.cyan}║${c.yellow}${padLine('  Please create "music" folder.', 42)}${c.reset}${c.cyan}║${c.reset}`);
  } else if (state.directoryStatus === 'EMPTY' || state.songs.length === 0) {
    terminal.print(`${c.cyan}║${c.yellow}${padLine('  No music files found.', 42)}${c.reset}${c.cyan}║${c.reset}`);
    terminal.print(`${c.cyan}║${c.gray}${padLine('  Add .mp3 or .wav files to music folder.', 42)}${c.reset}${c.cyan}║${c.reset}`);
  } else {
    state.songs.forEach((song, index) => {
      const num = String(index + 1).padStart(2, '0');
      const isSelected = index === state.selectedIndex;
      if (isSelected) {
        const row = padLine(` > ${num}. ${song}`, 42);
        terminal.print(`${c.cyan}║${c.green}${c.bold}${row}${c.reset}${c.cyan}║${c.reset}`);
      } else {
        const row = padLine(`   ${num}. ${song}`, 42);
        terminal.print(`${c.cyan}║${c.reset}${row}${c.cyan}║${c.reset}`);
      }
    });
  }

  terminal.print(`${c.cyan}║${c.reset}${padLine('', 42)}${c.cyan}║${c.reset}`);

  // Playback state row
  let trackText = '  No song playing';
  if (state.currentTrack) {
    if (state.isPlaying && !state.isPaused) {
      trackText = `  ▶ Playing: ${state.currentTrack}`;
    } else if (state.isPaused) {
      trackText = `  ❚❚ Paused: ${state.currentTrack}`;
    } else {
      trackText = `  ■ Stopped: ${state.currentTrack}`;
    }
  }

  terminal.print(`${c.cyan}║${c.reset}${padLine(trackText, 42)}${c.cyan}║${c.reset}`);
  terminal.print(`${c.cyan}║${c.reset}${padLine('', 42)}${c.cyan}║${c.reset}`);

  // Controls guide
  terminal.print(`${c.cyan}║${c.reset}${padLine(' [↑/↓] Select', 42)}${c.cyan}║${c.reset}`);
  terminal.print(`${c.cyan}║${c.reset}${padLine(' [P]   Play/Pause', 42)}${c.cyan}║${c.reset}`);
  terminal.print(`${c.cyan}║${c.reset}${padLine(' [S]   Stop', 42)}${c.cyan}║${c.reset}`);
  terminal.print(`${c.cyan}║${c.reset}${padLine(' [N]   Next', 42)}${c.cyan}║${c.reset}`);
  terminal.print(`${c.cyan}║${c.reset}${padLine(' [B]   Previous', 42)}${c.cyan}║${c.reset}`);
  terminal.print(`${c.cyan}║${c.reset}${padLine(' [Q]   Quit', 42)}${c.cyan}║${c.reset}`);
  terminal.print(`${c.cyan}╚══════════════════════════════════════════╝${c.reset}`);
  terminal.print();
  terminal.print(`${c.gray}Status: ${statusMessage}${c.reset}`);
}

// Handle keypress events routed from terminal.js
function handleInput(key) {
  // Arrow Up
  if (key === '\x1b[A' || key === '\x1bOA') {
    player.selectPrevious();
    renderUI('Selection moved up');
    return;
  }

  // Arrow Down
  if (key === '\x1b[B' || key === '\x1bOB') {
    player.selectNext();
    renderUI('Selection moved down');
    return;
  }

  const cleanKey = typeof key === 'string' ? key.replace(/[\r\n]/g, '').trim() : '';
  const upperKey = cleanKey.toUpperCase();

  switch (upperKey) {
    case 'P': {
      const msg = player.togglePlay();
      renderUI(msg);
      break;
    }
    case 'S': {
      const msg = player.stop();
      renderUI(msg);
      break;
    }
    case 'N': {
      const msg = player.next();
      renderUI(msg);
      break;
    }
    case 'B': {
      const msg = player.previous();
      renderUI(msg);
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
      renderUI(`Key pressed: ${cleanKey || 'Unknown'}`);
      break;
    }
  }
}

// Start the application
function start() {
  player.loadSongs();
  terminal.hideCursor();
  renderUI('Ready');
  terminal.enableRawInput(handleInput);
}

start();


