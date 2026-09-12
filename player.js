// player.js - Music player module and playlist state management

const fs = require('fs');
const path = require('path');

// Supported audio file extensions
const SUPPORTED_EXTENSIONS = ['.mp3', '.wav', '.ogg', '.m4a'];

// Simple state to track player status and playlist
const state = {
  isPlaying: false,
  isPaused: false,
  currentTrack: null,
  songs: [],
  selectedIndex: 0,
  directoryStatus: 'OK', // 'OK', 'NOT_FOUND', 'EMPTY'
};

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

// Play track placeholder (simulated for Milestone 3)
function play(track) {
  if (state.songs.length === 0) {
    return 'No songs available';
  }
  state.isPlaying = true;
  state.isPaused = false;
  state.currentTrack = track || state.songs[state.selectedIndex];
  return `Playing: ${state.currentTrack} (Simulated)`;
}

// Pause playback placeholder
function pause() {
  if (state.isPlaying && !state.isPaused) {
    state.isPaused = true;
    return `Playback paused: ${state.currentTrack || 'Unknown'}`;
  }
  return 'Not currently playing';
}

// Stop playback placeholder
function stop() {
  state.isPlaying = false;
  state.isPaused = false;
  state.currentTrack = null;
  return 'Playback stopped';
}

// Next track in playlist
function next() {
  if (state.songs.length === 0) {
    return 'No songs available';
  }
  state.selectedIndex = (state.selectedIndex + 1) % state.songs.length;
  state.currentTrack = state.songs[state.selectedIndex];
  state.isPlaying = true;
  state.isPaused = false;
  return `Next track: ${state.currentTrack} (Simulated)`;
}

// Previous track in playlist
function previous() {
  if (state.songs.length === 0) {
    return 'No songs available';
  }
  state.selectedIndex = (state.selectedIndex - 1 + state.songs.length) % state.songs.length;
  state.currentTrack = state.songs[state.selectedIndex];
  state.isPlaying = true;
  state.isPaused = false;
  return `Previous track: ${state.currentTrack} (Simulated)`;
}

// Toggle between play and pause
function togglePlay() {
  if (state.songs.length === 0) {
    return 'No songs available to play';
  }
  if (state.isPlaying && !state.isPaused) {
    return pause();
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
  stop,
  next,
  previous,
  togglePlay,
  getState,
};


