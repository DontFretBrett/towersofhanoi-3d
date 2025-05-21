import { Timer } from '../utils/Timer';
import { GAME_CONFIG } from '../constants/GameConfig';

export class UIManager {
  constructor(gameManager) {
    this.gameManager = gameManager;
    this.moveCounter = document.getElementById('move-counter');
    this.optimalMoves = document.getElementById('optimal-moves');
    this.timer = new Timer(
      document.getElementById('timer'), 
      GAME_CONFIG.UI.UPDATE_INTERVAL
    );
    this.resetButton = document.getElementById('reset');
    this.difficultySelect = document.getElementById('difficulty');
    this.hasStarted = false;
  }

  init() {
    this.undoButton = document.getElementById('undo-button');
    this.setupEventListeners();
    this.updateUndoButtonState(); // Initial state
  }

  updateUndoButtonState() {
    if (this.gameManager && this.gameManager.stateManager && this.undoButton) {
      const historyLength = this.gameManager.stateManager.getHistoryLength();
      this.undoButton.disabled = historyLength <= 1;
    } else if (this.undoButton) {
      // If gameManager or stateManager is not ready, disable button by default
      this.undoButton.disabled = true;
    }
  }

  setupEventListeners() {
    this.resetButton.addEventListener('click', () => {
      this.gameManager.reset();
      this.resetUI();
      this.updateUndoButtonState(); // Update after reset
    });

    const randomizeButton = document.getElementById('randomize');
    randomizeButton.addEventListener('click', () => {
      this.gameManager.randomize();
      this.resetUI();
      this.updateUndoButtonState(); // Update after randomize
    });

    if (this.undoButton) {
      this.undoButton.addEventListener('click', () => {
        this.gameManager.undoMove();
        this.updateUndoButtonState(); // Update after undo attempt
      });
    }

    this.difficultySelect.addEventListener('change', (e) => {
      const newDifficulty = parseInt(e.target.value);
      this.gameManager.numDisks = newDifficulty;
      this.gameManager.reset();
      this.resetUI();
    });
  }

  updateMoveCounter(moves) {
    if (!this.hasStarted && moves > 0) {
      this.timer.start();
      this.hasStarted = true;
    }
    this.moveCounter.textContent = moves;
    this.updateUndoButtonState(); // Update after a move
  }

  updateOptimalMoves(moves) {
    this.optimalMoves.textContent = moves;
  }

  resetUI() {
    this.moveCounter.textContent = '0';
    this.optimalMoves.textContent = this.gameManager.optimalMoves;
    this.timer.reset();
    this.hasStarted = false;
    this.updateUndoButtonState(); // Update after UI reset (e.g. new game from difficulty change)
  }
}
