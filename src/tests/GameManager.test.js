import { GameManager } from '../managers/GameManager';

describe('GameManager', () => {
  let gameManager;

  beforeEach(() => {
    gameManager = new GameManager(mockScene);
  });

  test('should initialize with correct number of disks', () => {
    gameManager.init();
    expect(gameManager.disks.length).toBe(3);
  });

  test('should detect win condition correctly', () => {
    // Setup win condition
    gameManager.rods[2].disks = gameManager.disks;
    expect(gameManager.checkWin()).toBe(true);
  });
}); 