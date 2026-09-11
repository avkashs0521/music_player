// player.js - Basic music player module structure

// Simple state to track player status
const state = {
  isPlaying: false,
  isPaused: false,
  currentTrack: null,
};

// Play track placeholder
function play(track) {
  state.isPlaying = true;
  state.isPaused = false;
  state.currentTrack = track || null;
  return `Playing: ${track || 'Unknown track'}`;
}

// Pause playback placeholder
function pause() {
  if (state.isPlaying && !state.isPaused) {
    state.isPaused = true;
    return 'Playback paused';
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

// Next track placeholder
function next() {
  return 'Next track';
}

// Previous track placeholder
function previous() {
  return 'Previous track';
}

// Get current player state
function getState() {
  return { ...state };
}

module.exports = {
  play,
  pause,
  stop,
  next,
  previous,
  getState,
};
