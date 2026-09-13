// player.js - Music player module with audio playback, duration detection, and time management

const fs = require('fs');
const path = require('path');
const { spawn, execSync } = require('child_process');

// Supported audio file extensions
const SUPPORTED_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.m4a'];

// Active child process reference for audio playback
let audioProcess = null;

// Active timer reference for elapsed time tracking
let playbackTimer = null;
let playbackStartTime = 0;
let pausedElapsed = 0;

// Callback to notify app.js when player state changes
let stateChangeCallback = null;

// Simple state to track player status and playlist
const state = {
  status: 'STOPPED', // 'STOPPED' | 'PLAYING' | 'PAUSED'
  isPlaying: false,
  isPaused: false,
  currentTrack: null,
  songs: [],
  selectedIndex: 0,
  directoryStatus: 'OK', // 'OK', 'NOT_FOUND', 'EMPTY'
  elapsed: 0,            // Elapsed time in seconds
  duration: 0,           // Total duration in seconds
};

// Register listener for player state changes
function setOnStateChange(callback) {
  stateChangeCallback = callback;
}

// Notify listener of state changes
function notifyStateChange() {
  if (typeof stateChangeCallback === 'function') {
    stateChangeCallback(getState());
  }
}

// Determine audio duration in seconds using macOS afinfo
function getAudioDuration(filePath) {
  try {
    const output = execSync(`afinfo "${filePath}"`, { encoding: 'utf8' });
    const match = output.match(/estimated duration:\s*([\d.]+)\s*sec/i);
    if (match && match[1]) {
      return Math.max(1, Math.round(parseFloat(match[1])));
    }
  } catch (err) {
    // Fallback if afinfo fails or is unavailable
  }
  return 180; // 3-minute fallback
}

// Clear active progress interval timer
function clearTimer() {
  if (playbackTimer) {
    clearInterval(playbackTimer);
    playbackTimer = null;
  }
}

// Start live progress interval timer (updates once per second)
function startTimer() {
  clearTimer();
  playbackStartTime = Date.now();
  playbackTimer = setInterval(() => {
    if (state.status === 'PLAYING') {
      const currentRunSec = Math.floor((Date.now() - playbackStartTime) / 1000);
      state.elapsed = Math.min(state.duration, pausedElapsed + currentRunSec);
      notifyStateChange();
    }
  }, 1000);
}

// Stop and kill any active audio child process
function stopAudioProcess() {
  if (audioProcess) {
    audioProcess.removeAllListeners();
    try {
      audioProcess.kill('SIGKILL');
    } catch (err) {
      // Process may already have terminated
    }
    audioProcess = null;
  }
}

// Scan music directory and load discovered audio files
function loadSongs(dirPath) {
  const musicDir = dirPath || path.join(__dirname, 'music');

  if (!fs.existsSync(musicDir)) {
    state.songs = [];
    state.selectedIndex = 0;
    state.currentTrack = null;
    state.directoryStatus = 'NOT_FOUND';
    state.duration = 0;
    state.elapsed = 0;
    return state.directoryStatus;
  }

  try {
    const files = fs.readdirSync(musicDir);
    const audioFiles = files
      .filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return SUPPORTED_EXTENSIONS.includes(ext);
      })
      .sort();

    state.songs = audioFiles;
    state.directoryStatus = audioFiles.length === 0 ? 'EMPTY' : 'OK';
    state.selectedIndex = 0;
    state.currentTrack = null;
    state.elapsed = 0;

    if (audioFiles.length > 0) {
      const firstPath = path.join(musicDir, audioFiles[0]);
      state.duration = getAudioDuration(firstPath);
    } else {
      state.duration = 0;
    }

    return state.directoryStatus;
  } catch (err) {
    state.songs = [];
    state.directoryStatus = 'NOT_FOUND';
    state.duration = 0;
    state.elapsed = 0;
    return state.directoryStatus;
  }
}

// Move selection down in the playlist
function selectNext() {
  if (state.songs.length === 0) return;
  state.selectedIndex = (state.selectedIndex + 1) % state.songs.length;
  if (state.status === 'STOPPED') {
    const songPath = path.join(__dirname, 'music', state.songs[state.selectedIndex]);
    state.duration = getAudioDuration(songPath);
  }
}

// Move selection up in the playlist
function selectPrevious() {
  if (state.songs.length === 0) return;
  state.selectedIndex = (state.selectedIndex - 1 + state.songs.length) % state.songs.length;
  if (state.status === 'STOPPED') {
    const songPath = path.join(__dirname, 'music', state.songs[state.selectedIndex]);
    state.duration = getAudioDuration(songPath);
  }
}

// Play audio file using macOS afplay
function play(track) {
  if (state.songs.length === 0) {
    return 'No songs available to play';
  }

  // Prevent multiple audio processes: stop previous before starting new one
  stopAudioProcess();
  clearTimer();

  const targetTrack = track || state.songs[state.selectedIndex];
  state.currentTrack = targetTrack;

  const filePath = path.join(__dirname, 'music', targetTrack);

  if (!fs.existsSync(filePath)) {
    state.status = 'STOPPED';
    state.isPlaying = false;
    state.isPaused = false;
    state.elapsed = 0;
    return 'Unable to play this audio file (file not found).';
  }

  // Detect exact duration
  state.duration = getAudioDuration(filePath);
  state.elapsed = 0;
  pausedElapsed = 0;

  try {
    audioProcess = spawn('afplay', [filePath], { stdio: 'ignore' });
  } catch (err) {
    state.status = 'STOPPED';
    state.isPlaying = false;
    state.isPaused = false;
    state.elapsed = 0;
    audioProcess = null;
    return 'Unable to play this audio file.';
  }

  state.status = 'PLAYING';
  state.isPlaying = true;
  state.isPaused = false;

  // Start elapsed time tracking
  startTimer();

  // Handle process errors gracefully
  audioProcess.on('error', () => {
    stopAudioProcess();
    clearTimer();
    state.status = 'STOPPED';
    state.isPlaying = false;
    state.isPaused = false;
    state.elapsed = 0;
    pausedElapsed = 0;
    notifyStateChange();
  });

  // Handle natural song completion
  audioProcess.on('close', () => {
    audioProcess = null;
    clearTimer();
    state.status = 'STOPPED';
    state.isPlaying = false;
    state.isPaused = false;
    state.elapsed = 0;
    pausedElapsed = 0;
    notifyStateChange();
  });

  return `Playing: ${state.currentTrack}`;
}

// Pause playback using SIGSTOP signal
function pause() {
  if (audioProcess && state.status === 'PLAYING') {
    try {
      audioProcess.kill('SIGSTOP');
      clearTimer();
      pausedElapsed = state.elapsed;
      state.status = 'PAUSED';
      state.isPlaying = true;
      state.isPaused = true;
      notifyStateChange();
      return `Paused: ${state.currentTrack}`;
    } catch (err) {
      return 'Unable to pause playback.';
    }
  }
  return 'Not currently playing';
}

// Resume playback using SIGCONT signal
function resume() {
  if (audioProcess && state.status === 'PAUSED') {
    try {
      audioProcess.kill('SIGCONT');
      state.status = 'PLAYING';
      state.isPlaying = true;
      state.isPaused = false;
      startTimer();
      notifyStateChange();
      return `Resumed: ${state.currentTrack}`;
    } catch (err) {
      return 'Unable to resume playback.';
    }
  }
  return 'Not currently paused';
}

// Stop playback and clean up audio process and timer
function stop() {
  clearTimer();
  stopAudioProcess();
  state.status = 'STOPPED';
  state.isPlaying = false;
  state.isPaused = false;
  state.currentTrack = null;
  state.elapsed = 0;
  pausedElapsed = 0;
  notifyStateChange();
  return 'Playback stopped';
}

// Move to next song and play it
function next() {
  if (state.songs.length === 0) {
    return 'No songs available';
  }
  state.selectedIndex = (state.selectedIndex + 1) % state.songs.length;
  return play(state.songs[state.selectedIndex]);
}

// Move to previous song and play it
function previous() {
  if (state.songs.length === 0) {
    return 'No songs available';
  }
  state.selectedIndex = (state.selectedIndex - 1 + state.songs.length) % state.songs.length;
  return play(state.songs[state.selectedIndex]);
}

// Toggle between Play, Pause, and Resume
function togglePlay() {
  if (state.songs.length === 0) {
    return 'No songs available to play';
  }
  if (state.status === 'PLAYING') {
    return pause();
  }
  if (state.status === 'PAUSED') {
    return resume();
  }
  return play();
}

// Complete cleanup of timer and audio child process
function cleanup() {
  stop();
}


// Get current player state
function getState() {
  return { ...state };
}

module.exports = {
  loadSongs,
  selectNext,
  selectPrevious,
  play,
  pause,
  resume,
  stop,
  next,
  previous,
  togglePlay,
  getState,
  setOnStateChange,
  cleanup,
};




