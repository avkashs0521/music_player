// player.js - Music player module with real audio playback via macOS afplay

const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

// Supported audio file extensions
const SUPPORTED_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.m4a'];

// Active child process reference for audio playback
let audioProcess = null;

// Callback to notify app.js when player state changes (e.g. natural song completion)
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
    return state.directoryStatus;
  } catch (err) {
    state.songs = [];
    state.directoryStatus = 'NOT_FOUND';
    return state.directoryStatus;
  }
}

// Move selection down in the playlist
function selectNext() {
  if (state.songs.length === 0) return;
  state.selectedIndex = (state.selectedIndex + 1) % state.songs.length;
}

// Move selection up in the playlist
function selectPrevious() {
  if (state.songs.length === 0) return;
  state.selectedIndex = (state.selectedIndex - 1 + state.songs.length) % state.songs.length;
}

// Play audio file using macOS afplay
function play(track) {
  if (state.songs.length === 0) {
    return 'No songs available to play';
  }

  // Prevent multiple audio processes: stop previous before starting new one
  stopAudioProcess();

  const targetTrack = track || state.songs[state.selectedIndex];
  state.currentTrack = targetTrack;

  const filePath = path.join(__dirname, 'music', targetTrack);

  if (!fs.existsSync(filePath)) {
    state.status = 'STOPPED';
    state.isPlaying = false;
    state.isPaused = false;
    return 'Unable to play this audio file (file not found).';
  }

  try {
    audioProcess = spawn('afplay', [filePath], { stdio: 'ignore' });
  } catch (err) {
    state.status = 'STOPPED';
    state.isPlaying = false;
    state.isPaused = false;
    audioProcess = null;
    return 'Unable to play this audio file.';
  }

  state.status = 'PLAYING';
  state.isPlaying = true;
  state.isPaused = false;

  // Handle process errors gracefully
  audioProcess.on('error', () => {
    stopAudioProcess();
    state.status = 'STOPPED';
    state.isPlaying = false;
    state.isPaused = false;
    notifyStateChange();
  });

  // Handle natural song completion
  audioProcess.on('close', () => {
    audioProcess = null;
    state.status = 'STOPPED';
    state.isPlaying = false;
    state.isPaused = false;
    notifyStateChange();
  });

  return `Playing: ${state.currentTrack}`;
}

// Pause playback using SIGSTOP signal
function pause() {
  if (audioProcess && state.status === 'PLAYING') {
    try {
      audioProcess.kill('SIGSTOP');
      state.status = 'PAUSED';
      state.isPlaying = true;
      state.isPaused = true;
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
      return `Resumed: ${state.currentTrack}`;
    } catch (err) {
      return 'Unable to resume playback.';
    }
  }
  return 'Not currently paused';
}

// Stop playback and clean up audio process
function stop() {
  stopAudioProcess();
  state.status = 'STOPPED';
  state.isPlaying = false;
  state.isPaused = false;
  state.currentTrack = null;
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
  cleanup: stopAudioProcess,
};



