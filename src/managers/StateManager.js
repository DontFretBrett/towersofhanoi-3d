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