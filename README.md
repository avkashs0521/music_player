# Terminal Music Player #

A lightweight, interactive terminal-based music player built using Node.js.

## Overview

This project provides a command-line interface to play and control audio files directly from your terminal without needing external GUI frameworks or heavy dependencies. It demonstrates core Node.js concepts including standard I/O streams, ANSI terminal escape sequences, and raw mode keyboard handling.

## Project Structure

```text
terminal-music-player/
├── music/        # Directory for audio files (.mp3, etc.)
├── app.js        # Main entry point of the application
├── player.js     # Audio player logic and playback state
├── terminal.js   # Terminal helpers (ANSI codes, input/output)
├── package.json  # Project metadata and start script
└── README.md     # Documentation and setup instructions
```

## Prerequisites

- [Node.js](https://nodejs.org/) (version 14 or higher recommended)

## Getting Started

1. Clone or navigate to the project directory:
   ```bash
   cd "Music player"
   ```

2. Run the application:
   ```bash
   node app.js
   ```
   or using npm:
   ```bash
   npm start
   ```

## Features (Milestone 3)

- **Music Library Scanning**: Scans the `music/` directory on startup and detects supported audio files (`.mp3`, `.wav`, `.ogg`, `.m4a`), ignoring unsupported files.
- **Interactive Playlist**: Renders discovered tracks as a numbered list with a visual indicator (`>`) on the currently selected item.
- **Graceful Error Handling**: Displays clear messages if the `music/` folder is missing or contains no audio files.
- **Keyboard Navigation**: Move selection through the playlist with arrow keys (`↑` / `↓`).

## Controls

- **↑ / ↓**: Select song in playlist
- **p / P**: Play / Pause toggle
- **s / S**: Stop playback
- **n / N**: Next track
- **b / B**: Previous track
- **q / Q**: Exit the application cleanly
- **Ctrl+C**: Exit the application safely


