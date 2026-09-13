# Terminal Music Player Application

A lightweight, interactive command-line music player built using Node.js for macOS.

---

## Problem Statement

The goal of this project is to create an interactive terminal-based music player without relying on heavy GUI frameworks, Electron, or external third-party audio packages. Built entirely with core Node.js built-ins and standard macOS audio utilities, it demonstrates fundamental software engineering concepts:
* **CLI Development**: Standard I/O handling, terminal raw mode, and ANSI escape sequences.
* **File Handling**: Directory reading, path normalization, and audio file filtering.
* **Process Management**: Spawning external child processes, signal-based process control (`SIGSTOP`, `SIGCONT`, `SIGKILL`), and graceful exit cleanup.

---

## Features

* **Terminal-Based Interface**: Clean, box-styled terminal UI rendered with ANSI colors.
* **Local Music Library**: Scans local audio files stored in the `music/` directory on startup.
* **Playlist Scanning**: Automatically detects supported audio formats (`.mp3`, `.wav`, `.ogg`, `.m4a`) while ignoring non-audio files.
* **Keyboard Navigation**: Interactive song selection using `↑` and `↓` arrow keys with visual `>` indicator.
* **Real Audio Playback**: Plays actual sound through Mac speakers via the native macOS `afplay` command.
* **Playback Controls**: Complete keyboard shortcuts to Play, Pause, Resume, Stop, Next, and Previous tracks.
* **Live Progress Bar**: Dynamic 20-character visual progress bar (`[██████████░░░░░░░░░░]`) updating every second.
* **Elapsed Time & Duration**: Displays current playback position and total track length in `MM:SS` format.
* **In-Place Terminal Rendering**: Frame updates use ANSI cursor repositioning (`\x1b[H`) to eliminate screen flickering and duplicate lines.
* **Graceful Exit & Cleanup**: Quitting via `Q` or `Ctrl+C` immediately terminates background audio processes and restores the terminal.

---

## Technologies

* **Node.js**: JavaScript runtime environment.
* **JavaScript (ES6+)**: Core programming language.
* **Node.js `fs`**: Synchronous directory reading and filesystem checks (`fs.readdirSync`, `fs.existsSync`).
* **Node.js `path`**: Cross-platform path resolution and file extension inspection.
* **Node.js `child_process`**: Spawning and controlling external operating-system processes (`spawn`, `execSync`).
* **`process.stdin`**: Capturing unbuffered keyboard input in raw mode (`setRawMode(true)`).
* **`process.stdout`**: Streaming raw ANSI escape sequences and UI frames.
* **ANSI Escape Sequences**: Terminal formatting (colors, bold), screen clearing, and cursor control.
* **macOS `afplay`**: Native command-line audio utility built into macOS.
* **macOS `afinfo`**: Native audio file metadata utility for exact track duration detection.

---

## Project Structure

```text
terminal-music-player/
├── music/        # Directory containing audio files (.mp3, .wav, etc.)
├── app.js        # Main application controller, UI rendering, and input router
├── player.js     # Audio engine, child-process manager, and playlist state
├── terminal.js   # Terminal helpers (raw mode, ANSI escape codes, cursor control)
├── package.json  # Project metadata and start script
└── README.md     # Project documentation and submission report
```

### Module Responsibilities

* **`app.js`**: Orchestrates the application lifecycle, formats UI layout and progress bar, listens to keyboard input, and routes commands to `player.js` and `terminal.js`.
* **`terminal.js`**: Configures raw mode on `process.stdin`, outputs ANSI control sequences to `process.stdout`, manages cursor visibility, and provides centralized terminal restoration.
* **`player.js`**: Manages the playlist array, selection cursor, duration inspection via `afinfo`, child-process spawning with `afplay`, signal-based pause/resume, and progress timer lifecycle.
* **`music/`**: Stores local audio tracks scanned dynamically on launch.

---

## Prerequisites

* **Operating System**: macOS (required for built-in `afplay` and `afinfo`).
* **Node.js**: Version 14 or higher.

---

## Installation

No external npm packages are required.

1. Clone or navigate to the project repository:
   ```bash
   cd "Music player"
   ```

2. Verify that audio files exist in the `music/` directory (e.g. `song1.mp3`, `song2.mp3`, `song3.mp3`).

---

## Running the Application

Start the application with npm:
```bash
npm start
```

or directly using Node.js:
```bash
node app.js
```

---

## Controls

| Key | Action | Description |
| :--- | :--- | :--- |
| **`↑` / `↓`** | Select Song | Move playlist cursor up or down through discovered tracks |
| **`P` / `p`** | Play / Pause / Resume | Start playback on highlighted track, or toggle pause/resume |
| **`S` / `s`** | Stop | Stop playback, terminate child process, and reset timer |
| **`N` / `n`** | Next Track | Stop current track and immediately play the next song |
| **`B` / `b`** | Previous Track | Stop current track and immediately play the previous song |
| **`Q` / `q`** | Quit | Terminate audio, restore terminal mode, and exit cleanly |
| **`Ctrl+C`** | Force Exit | Intercept interrupt, terminate audio process, and exit safely |

---

## Audio Playback Architecture

The application does not use external audio decoding libraries. Instead, it delegates audio decoding directly to macOS:

```text
Keyboard Press (e.g. 'P')
        ↓
    app.js
        ↓
    player.js
        ↓
child_process.spawn('afplay', [filePath])
        ↓
  macOS CoreAudio Engine
        ↓
    Mac Speakers
```

* **Process Control**: Pausing sends `SIGSTOP` to freeze the `afplay` process. Resuming sends `SIGCONT` to continue playback. Stopping sends `SIGKILL` to terminate the process.
* **Multiple Process Prevention**: Before starting any new song, any existing audio child process is terminated to guarantee tracks never play simultaneously.

---

## Audio Troubleshooting

Verify that macOS can play your audio files independently of Node.js:
```bash
afplay music/song1.mp3
```
If sound plays through your Mac speakers, the Terminal Music Player is ready to run.
