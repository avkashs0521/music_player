// app.js - Main entry point of the Terminal Music Player

const terminal = require('./terminal');
const player = require('./player');

function showWelcome() {
  terminal.clearScreen();
  terminal.print(`${terminal.ANSI.bold}${terminal.ANSI.cyan}====================================${terminal.ANSI.reset}`);
  terminal.print(`${terminal.ANSI.bold}${terminal.ANSI.cyan}       TERMINAL MUSIC PLAYER        ${terminal.ANSI.reset}`);
  terminal.print(`${terminal.ANSI.bold}${terminal.ANSI.cyan}====================================${terminal.ANSI.reset}`);
  terminal.print();
  terminal.print(`${terminal.ANSI.green}Welcome!${terminal.ANSI.reset}`);
  terminal.print('This is a lightweight, interactive terminal-based music player.');
  terminal.print('You can control audio playback directly from your command line.');
  terminal.print();
  terminal.print(`${terminal.ANSI.yellow}Controls:${terminal.ANSI.reset}`);
  terminal.print('  [q] : Exit application');
  terminal.print();
  terminal.print(`${terminal.ANSI.gray}Waiting for input... Press 'q' or Ctrl+C to quit.${terminal.ANSI.reset}`);
}

function handleInput(key) {
  const normalizedKey = typeof key === 'string' ? key.trim().toLowerCase() : '';
  if (normalizedKey === 'q') {
    terminal.restoreTerminal();
    terminal.print();
    terminal.print(`${terminal.ANSI.green}Thank you for using Terminal Music Player. Goodbye!${terminal.ANSI.reset}`);
    process.exit(0);
  }
}

function start() {
  showWelcome();
  terminal.enableRawInput(handleInput);
}

start();
