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

## Features (Milestone 4)

- **Real Audio Playback**: Plays audio out of Mac speakers using the native macOS `afplay` command spawned via Node.js `child_process`.
- **Process Signal Controls**: Uses operating-system signals (`SIGSTOP` to pause, `SIGCONT` to resume, and `SIGKILL` to stop) for responsive playback management.
- **Multiple Process Prevention**: Guarantees previous audio processes are completely terminated before a new track begins.
- **Interactive Playlist**: Discovers `.mp3`, `.wav`, `.ogg`, and `.m4a` files in `music/`, allows selection with `↑`/`↓`, and displays `PLAYING`, `PAUSED`, or `STOPPED` status.
- **Safe Exit & Cleanup**: Quitting via `Q` or `Ctrl+C` immediately stops any background audio process and restores the terminal.

## Controls

- **↑ / ↓**: Select song in playlist
- **p / P**: Play / Pause / Resume toggle
- **s / S**: Stop playback
- **n / N**: Next track (stops current and starts next)
- **b / B**: Previous track (stops current and starts previous)
- **q / Q**: Exit the application cleanly (stops audio)
- **Ctrl+C**: Exit the application safely (stops audio)

## Audio Troubleshooting

Before running the application, verify that macOS can play your audio files:
```bash
afplay music/song1.mp3
```
If you hear audio through your Mac speakers, the terminal player will work seamlessly.



