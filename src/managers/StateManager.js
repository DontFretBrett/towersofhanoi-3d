export class StateManager {
  constructor() {
    this.state = {
      isPlaying: false,
      isPaused: false,
      selectedRodIndex: -1,
      moveCount: 0,
      difficulty: 3
    };
    this.listeners = new Set();
    this.history = [];
  }

  pushState(gameState) {
    // Ensure we're storing a copy, not a reference
    this.history.push(JSON.parse(JSON.stringify(gameState)));
  }

  popState() {
    if (this.history.length <= 1) {
      return null;
    }
    return this.history.pop();
  }

  clearHistory() {
    this.history = [];
  }

  getHistoryLength() {
    return this.history.length;
  }

  setState(newState) {
    this.state = { ...this.state, ...newState };
    this.notifyListeners();
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notifyListeners() {
    this.listeners.forEach(listener => listener(this.state));
  }
} 