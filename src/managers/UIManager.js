import { Timer } from '../utils/Timer';
import { GAME_CONFIG } from '../constants/GameConfig';

export class UIManager {
  constructor(gameManager) {
    this.gameManager = gameManager;
    this.moveCounter = document.getElementById('move-counter');
    this.optimalMoves = document.getElementById('optimal-moves');
    
    const timerElement = document.getElementById('timer');
    if (timerElement) {
      this.timer = new Timer(timerElement, GAME_CONFIG.UI.UPDATE_INTERVAL);
    } else {
      this.timer = null;
      console.warn("UI element #timer not found!");
    }

    this.resetButton = document.getElementById('reset');
    this.difficultySelect = document.getElementById('difficulty');
    this.hasStarted = false;

    if (!this.moveCounter) console.warn("UI element #move-counter not found!");
    if (!this.optimalMoves) console.warn("UI element #optimal-moves not found!");
    if (!this.resetButton) console.warn("UI element #reset not found!");
    if (!this.difficultySelect) console.warn("UI element #difficulty not found!");
  }

  init() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    if (this.resetButton) {
      this.resetButton.addEventListener('click', () => {
        this.gameManager.reset();
        this.resetUI();
      });
    }

    const randomizeButton = document.getElementById('randomize');
    if (randomizeButton) {
      randomizeButton.addEventListener('click', () => {
        this.gameManager.randomize();
        this.resetUI();
      });
    } else {
      console.warn("UI element #randomize not found!");
    }

    if (this.difficultySelect) {
      this.difficultySelect.addEventListener('change', (e) => {
        let newDifficulty = parseInt(e.target.value);
        // Assuming min 3, max 10 disks as per readme
        if (isNaN(newDifficulty) || newDifficulty < 3 || newDifficulty > 10) { 
          console.error("Invalid difficulty selected:", e.target.value + ". Reverting to current.");
          if (this.difficultySelect) { // Check again in case it became null somehow
            this.difficultySelect.value = this.gameManager.numDisks.toString();
          }
          return;
        }
        this.gameManager.numDisks = newDifficulty;
        this.gameManager.reset();
        this.resetUI();
      });
    }
  }

  updateMoveCounter(moves) {
    if (this.timer && !this.hasStarted && moves > 0) {
      this.timer.start();
      this.hasStarted = true;
    }
    if (this.moveCounter) {
      this.moveCounter.textContent = moves.toString();
    }
  }

  updateOptimalMoves(moves) {
    if (this.optimalMoves) {
      this.optimalMoves.textContent = moves.toString();
    }
  }

  resetUI() {
    if (this.moveCounter) {
      this.moveCounter.textContent = '0';
    }
    if (this.optimalMoves) {
      this.optimalMoves.textContent = this.gameManager.optimalMoves.toString();
    }
    if (this.timer) {
      this.timer.reset();
    }
    this.hasStarted = false;
  }
}
