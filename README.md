# 🎵 Terminal Music Player Application

A lightweight, interactive command-line music player built with pure Node.js for macOS.

---

## 📌 Problem Statement

Traditional desktop music players are frequently resource-heavy, relying on massive GUI frameworks (such as Electron) or complex web runtimes that consume hundreds of megabytes of RAM just to play local audio. 

This project demonstrates that a complete, responsive, and visually appealing music player can be built **using zero external dependencies**, running purely inside the terminal emulator. It serves as an end-to-end demonstration of core software engineering, operating systems, and computer science concepts:
* **Terminal I/O & Streams**: Leveraging unbuffered standard input in raw mode (`process.stdin.setRawMode(true)`) and streaming ANSI escape codes directly to `process.stdout`.
* **Filesystem Operations**: Reading directories, normalizing file paths, and filtering audio file formats synchronously using Node.js built-in `fs` and `path` modules.
* **Process Management & OS Signals**: Spawning and supervising external child processes (`child_process.spawn`) and controlling hardware audio playback via native POSIX signals (`SIGSTOP`, `SIGCONT`, `SIGKILL`).
* **Timer Management & In-Place Rendering**: Calculating track durations, managing elapsed time with `setInterval()`, and dynamically updating UI progress frames using ANSI cursor repositioning (`\x1b[H`) without screen flickering or line duplication.

---

## 🖥️ Live Terminal Interface

```text
╔══════════════════════════════════════════╗
║        🎵 TERMINAL MUSIC PLAYER          ║
╠══════════════════════════════════════════╣
║ Songs                                    ║
║                                          ║
║ > 01. song1.mp3                          ║
║   02. song2.mp3                          ║
║   03. song3.mp3                          ║
║                                          ║
║ ▶ Now Playing: song1.mp3                 ║
║ Status: PLAYING                          ║
║                                          ║
║ [██████████░░░░░░░░░░] 00:15 / 00:31     ║
║                                          ║
║ [↑/↓] Select                             ║
║ [P]   Play/Pause                         ║
║ [S]   Stop                               ║
║ [N]   Next                               ║
║ [B]   Previous                           ║
║ [Q]   Quit                               ║
╚══════════════════════════════════════════╝

Action: Playing: song1.mp3
```

---

## ✨ Key Features

* **Zero External Dependencies**: Built strictly using Node.js core modules (`fs`, `path`, `child_process`) and standard macOS utilities.
* **Interactive Playlist**: Discovers and lists all `.mp3`, `.wav`, `.ogg`, and `.m4a` files stored inside `music/`, ignoring non-audio files.
* **Instant Keyboard Navigation**: Move the `>` selector up and down through tracks with the `↑` and `↓` arrow keys with circular wrap-around.
* **Real Hardware Audio Playback**: Plays actual sound through your Mac speakers using the native macOS `/usr/bin/afplay` utility.
* **Signal-Based Playback Control**:
  * **Play**: Spawns `afplay` as a managed child process.
  * **Pause**: Freezes the audio stream using the OS signal `SIGSTOP`.
  * **Resume**: Continues playback from the exact paused millisecond using `SIGCONT`.
  * **Stop**: Kills the process using `SIGKILL` and clears all timers.
* **Dynamic Visual Progress Bar**: 20-character fixed-width progress bar (`[██████████░░░░░░░░░░]`) updating live every second.
* **Exact Duration Detection**: Inspects track duration in seconds using macOS `/usr/bin/afinfo` (with automatic fallback).
* **Flicker-Free In-Place Rendering**: Frame updates reposition the cursor home (`\x1b[H`) rather than printing hundreds of lines to the scrollback buffer.
* **Single Audio Process Guarantee**: Terminates any active audio process before starting a new track, guaranteeing audio streams never overlap.
* **Graceful Exit & Safe Cleanup**: Exiting via `Q`, `Ctrl+C`, or terminal window closing immediately terminates any background `afplay` processes and restores the terminal to standard mode with cursor visible.

---

## 🛠️ Technology Stack

| Technology | Role | Purpose |
| :--- | :--- | :--- |
| **Node.js** (v14+) | Runtime | Executes the JavaScript application and provides system APIs |
| **JavaScript (ES6+)** | Language | Core application logic and state management |
| **Node.js `child_process`** | Process Control | Spawns `/usr/bin/afplay` and runs `/usr/bin/afinfo` via `spawn()` & `execSync()` |
| **Node.js `fs`** | Filesystem | Synchronously scans the `music/` directory (`readdirSync`, `existsSync`) |
| **Node.js `path`** | Path Utilities | Resolves cross-platform absolute paths and file extensions |
| **`process.stdin`** | Input Stream | Captures single unbuffered keystrokes in raw mode |
| **`process.stdout`** | Output Stream | Writes ANSI control sequences and terminal frames |
| **ANSI Escape Codes** | Terminal Control | Handles colors, bold styling, screen clearing, and cursor positioning |
| **macOS `afplay`** | Audio Engine | Native macOS CLI audio utility for hardware playback |
| **macOS `afinfo`** | Audio Metadata | Native macOS CLI metadata tool for exact duration inspection |

---

## 🏗️ System Architecture & Data Flow

```text
               +----------------------------------+
               |        Keyboard Keypress         |
               +----------------------------------+
                                |
                                v
               +----------------------------------+
               |  process.stdin (Raw Mode TTY)    |
               +----------------------------------+
                                |
                                v
               +----------------------------------+
               |  terminal.js (Input Handler)     |
               +----------------------------------+
                                |
                                v
               +----------------------------------+
               |  app.js (Action Router & UI)     |
               +----------------------------------+
                     /                      \
                    v                        v
+-----------------------------+    +-------------------------------+
|  player.js (Audio Engine)   |    |  terminal.js (ANSI Formatter) |
+-----------------------------+    +-------------------------------+
  |            |            |                      |
  | (afinfo)   | (spawn)    | (Signals)            v
  v            v            v           +--------------------+
Duration    afplay     SIGSTOP/SIGCONT  |   Terminal Screen  |
Metadata    Process     Process Control | (In-Place Redraw)  |
               |                        +--------------------+
               v
      macOS CoreAudio
               |
               v
        Mac Speakers
```

---

## 📂 Project Structure

```text
terminal-music-player/
├── music/               # Local directory containing audio files (.mp3, .wav, etc.)
│   ├── song1.mp3        # Sample audio file
│   ├── song2.mp3        # Sample audio file
│   └── song3.mp3        # Sample audio file
├── app.js               # Main application controller, UI rendering, and input router
├── player.js            # Audio player state machine, child-process manager, and timers
├── terminal.js          # Terminal helper utilities (ANSI codes, raw mode, cursor)
├── package.json         # Project metadata and start script
├── .gitignore           # Git ignore rules (node_modules, .DS_Store)
└── README.md            # Comprehensive project documentation
```

### Module Responsibilities

1. **`app.js` (Presentation & Routing Layer)**:
   - Formats the rectangular boxed UI with fixed padding (`padLine`).
   - Generates the live progress bar string (`getProgressBar`).
   - Formats elapsed time and total duration into `MM:SS` format (`formatTime`).
   - Directs user keyboard inputs (`↑`, `↓`, `P`, `S`, `N`, `B`, `Q`) to `player.js`.
   - Subscribes to player state change events to trigger in-place re-rendering.

2. **`player.js` (Business Logic & Audio Engine Layer)**:
   - Scans the `music/` directory and filters supported extensions.
   - Inspects file durations using macOS `/usr/bin/afinfo`.
   - Spawns `/usr/bin/afplay` using `child_process.spawn()`.
   - Sends operating-system signals (`SIGSTOP`, `SIGCONT`, `SIGKILL`) to control playback.
   - Manages the live 1-second `setInterval()` playback timer and freezes/resets it appropriately.
   - Maintains the playback state machine (`STOPPED`, `PLAYING`, `PAUSED`).

3. **`terminal.js` (Terminal Driver Layer)**:
   - Configures `process.stdin` into unbuffered raw mode (`setRawMode(true)`).
   - Encapsulates ANSI escape sequences (colors, clear screen `\x1b[2J`, cursor home `\x1b[H`).
   - Manages cursor visibility (`hideCursor`, `showCursor`).
   - Implements safe, centralized terminal restoration (`restoreTerminal`).

---

## ⚙️ Prerequisites & Setup

### Prerequisites
* **Operating System**: macOS (required for built-in `afplay` and `afinfo`).
* **Node.js**: Version 14 or higher.

### Quick Verification
Ensure macOS audio tools are functioning:
```bash
afplay music/song1.mp3
```
*Press `Ctrl+C` once you confirm sound plays through your speakers.*

---

## 🚀 Running the Application

1. Clone or navigate to the repository directory:
   ```bash
   cd "Music player"
   ```

2. Start the application using npm:
   ```bash
   npm start
   ```
   *or directly with Node.js:*
   ```bash
   node app.js
   ```

---

## 🎮 Keyboard Controls

| Key | Action | Description |
| :---: | :--- | :--- |
| **`↑`** | Select Previous | Moves playlist cursor up (with circular wrap-around to the bottom) |
| **`↓`** | Select Next | Moves playlist cursor down (with circular wrap-around to the top) |
| **`P` / `p`** | Play / Pause / Resume | Starts highlighted track, or toggles pause (`SIGSTOP`) and resume (`SIGCONT`) |
| **`S` / `s`** | Stop | Terminates audio process (`SIGKILL`), clears timer, and resets elapsed time |
| **`N` / `n`** | Next Track | Stops current audio and immediately plays the next song in the playlist |
| **`B` / `b`** | Previous Track | Stops current audio and immediately plays the previous song in the playlist |
| **`Q` / `q`** | Quit Application | Stops audio, clears timers, restores normal terminal mode, and exits |
| **`Ctrl+C`** | Force Exit | Emergency interrupt hook: kills audio process, restores terminal, and exits cleanly |

---

## 🔄 Player State Machine

The player implements a deterministic 3-state state machine:

```text
               +------------------------------------+
               |              STOPPED               |
               | (No process, timer at 00:00)       |
               +------------------------------------+
                   |                            ^
            P (Play) |                            | S (Stop) / Song Ends
                   v                            |
               +------------------------------------+
               |              PLAYING               |
               | (afplay running, timer ticking)    |
               +------------------------------------+
                   |                            ^
          P (Pause)|                            | P (Resume)
                   v                            |
               +------------------------------------+
               |              PAUSED                |
               | (afplay SIGSTOP, timer frozen)     |
               +------------------------------------+
                   |
                   +----------> S (Stop) -----------> [STOPPED]
```

---

## 🎓 Academic & Engineering Concepts Demonstrated

| Course Concept | Implementation in Project | File & Location |
| :--- | :--- | :--- |
| **Standard Streams** | `process.stdin` and `process.stdout` | [terminal.js](file:///Users/avkashsingh/Desktop/Music%20player/terminal.js#L20) |
| **Terminal Raw Mode** | `process.stdin.setRawMode(true)` for instant keystroke detection | [terminal.js](file:///Users/avkashsingh/Desktop/Music%20player/terminal.js#L64) |
| **ANSI Escape Sequences** | Formatting, color codes, screen clear (`\x1b[2J`), cursor home (`\x1b[H`) | [terminal.js](file:///Users/avkashsingh/Desktop/Music%20player/terminal.js#L4) |
| **Cursor Management** | Hiding cursor during play (`\x1b[?25l`) and restoring on exit (`\x1b[?25h`) | [terminal.js](file:///Users/avkashsingh/Desktop/Music%20player/terminal.js#L30) |
| **In-Place Rendering** | Overwriting existing frames at position (0,0) without scrollback clutter | [app.js](file:///Users/avkashsingh/Desktop/Music%20player/app.js#L39) |
| **Time Management** | `setInterval()` (1000ms) & `clearInterval()` for live progress tracking | [player.js](file:///Users/avkashsingh/Desktop/Music%20player/player.js#L69) |
| **Asynchronous Events** | `process.stdin.on('data')`, `audioProcess.on('close')`, `audioProcess.on('error')` | [terminal.js](file:///Users/avkashsingh/Desktop/Music%20player/terminal.js#L70), [player.js](file:///Users/avkashsingh/Desktop/Music%20player/player.js#L218) |
| **Synchronous Filesystem** | `fs.readdirSync()` and `fs.existsSync()` for startup library scanning | [player.js](file:///Users/avkashsingh/Desktop/Music%20player/player.js#L98) |
| **Child Processes** | Spawning `/usr/bin/afplay` using `child_process.spawn()` | [player.js](file:///Users/avkashsingh/Desktop/Music%20player/player.js#L189) |
| **Inter-Process Signals** | POSIX `SIGSTOP` (pause), `SIGCONT` (resume), `SIGKILL` (stop), `SIGINT` (exit) | [player.js](file:///Users/avkashsingh/Desktop/Music%20player/player.js#L237) |
| **Deterministic State Machine** | Strict transitions between `STOPPED`, `PLAYING`, and `PAUSED` | [player.js](file:///Users/avkashsingh/Desktop/Music%20player/player.js#L22) |
| **Defensive Error Handling** | Handling missing folders, empty playlists, missing audio files, and spawn errors | [player.js](file:///Users/avkashsingh/Desktop/Music%20player/player.js#L175) |
| **Resource Cleanup** | Cleanup hooks terminating child processes and restoring terminal on exit | [terminal.js](file:///Users/avkashsingh/Desktop/Music%20player/terminal.js#L83), [app.js](file:///Users/avkashsingh/Desktop/Music%20player/app.js#L186) |

---

## 🗣️ Viva & Interview Cheat Sheet (Top Questions & Answers)

### Q1. Why did you choose Node.js for this project?
> "Node.js provides built-in low-level access to OS streams (`process.stdin`, `process.stdout`), filesystem utilities (`fs`), and process control (`child_process`) in an asynchronous event-driven model without needing third-party libraries."

### Q2. How is keyboard input captured without pressing Enter?
> "By enabling raw mode on `process.stdin` via `process.stdin.setRawMode(true)`. This disables line buffering and local terminal echo, allowing each keystroke to arrive immediately as a `'data'` event."

### Q3. How does the application prevent multiple songs from playing simultaneously?
> "In `player.js`, before spawning a new `afplay` process, the `stopAudioProcess()` function is called. It terminates any existing child process reference (`audioProcess.kill('SIGKILL')`) before launching the new audio file."

### Q4. How does pause and resume work without a GUI?
> "We use POSIX operating system signals. `audioProcess.kill('SIGSTOP')` instructs the OS kernel to freeze the `afplay` process and its audio thread. When resumed, `audioProcess.kill('SIGCONT')` instructs the kernel to continue execution from the exact paused timestamp."

### Q5. How does in-place terminal rendering work without flickering?
> "Rather than clearing the entire terminal window every second, we reposition the cursor to the top-left coordinate `(0, 0)` using the ANSI escape sequence `\x1b[H` (`cursorHome`). We then overwrite the fixed-width UI box, creating a smooth, flicker-free live frame update."

### Q6. How is the progress bar calculated?
> "The audio duration in seconds is extracted on startup using macOS `afinfo`. During playback, a 1-second `setInterval()` increments the elapsed counter. The ratio `elapsed / duration` determines the number of filled Unicode block characters (`█`) across a 20-column bar, with the remainder filled by empty characters (`░`)."

### Q7. What happens when the user presses `Ctrl+C`?
> "In raw mode, `Ctrl+C` arrives as the byte `\u0003`. Our input listener intercepts it, executes the cleanup hook to kill the `afplay` process, clears active timers, restores normal terminal mode (`setRawMode(false)`), reveals the cursor (`\x1b[?25h`), and exits cleanly with code `0`."

### Q8. What is the difference between `spawn()` and `exec()`?
> "`spawn()` launches an external binary and streams data asynchronously via process pipes, which is ideal for long-running processes like audio playback. `exec()` buffers the entire output in memory before returning, which would freeze or block an interactive audio player."

### Q9. How are non-audio files handled?
> "When `fs.readdirSync()` inspects the `music/` folder, each file's extension is extracted with `path.extname()`. A filter array `['.mp3', '.wav', '.ogg', '.m4a']` ensures files like `.txt`, `.jpg`, or `.gitkeep` are ignored."

### Q10. Why is resource cleanup so critical in terminal applications?
> "If a terminal application crashes or exits without cleanup, the child process (`afplay`) could remain running as an orphan playing music in the background, active `setInterval()` timers could leak memory, and the terminal emulator could be left in raw mode with an invisible cursor."

---

## ⚠️ Known Limitations & Non-Goals

To maintain an uncluttered, understandable codebase suitable for academic evaluation, the following features were intentionally excluded:
* **Seeking / Scrubbing**: Fast-forwarding and rewinding within a track are not supported, as CLI `afplay` does not expose an interactive stream-seek API via standard input.
* **Software Volume Attenuation**: The player uses the macOS hardware master volume.
* **Continuous Autoplay**: The player does not automatically advance to the next track upon completion; track advancement is triggered manually using `N`.
* **Cross-Platform Audio**: The audio engine explicitly targets macOS via `afplay` and `afinfo`.
