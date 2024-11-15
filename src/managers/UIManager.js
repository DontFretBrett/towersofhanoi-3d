import { Timer } from '../utils/Timer';
import { GAME_CONFIG } from '../constants/GameConfig';

export class UIManager {
  constructor(gameManager) {
    this.gameManager = gameManager;
    this.moveCounter = document.getElementById('move-counter');
    this.timer = new Timer(
      document.getElementById('timer'), 
      GAME_CONFIG.UI.UPDATE_INTERVAL
    );
    this.resetButton = document.getElementById('reset');
    this.difficultySelect = document.getElementById('difficulty');
    this.hasStarted = false;
  }

  init() {
    this.setupEventListeners();
  }

  setupEventListeners() {
    this.resetButton.addEventListener('click', () => {
      this.gameManager.reset();
      this.resetUI();
    });

    const randomizeButton = document.getElementById('randomize');
    randomizeButton.addEventListener('click', () => {
      this.gameManager.randomize();
      this.resetUI();
    });

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
  }

  resetUI() {
    this.moveCounter.textContent = '0';
    this.timer.reset();
    this.hasStarted = false;
  }
}
