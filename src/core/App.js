import { Scene } from './Scene';
import { GameManager } from '../managers/GameManager';
import { EventManager } from '../managers/EventManager';
import { UIManager } from '../managers/UIManager';

export class App {
  constructor(element) {
    this.element = element;
    this.scene = new Scene(element);
    this.gameManager = new GameManager(this.scene);
    this.eventManager = new EventManager(this.gameManager);
    this.uiManager = new UIManager(this.gameManager);
  }

  init() {
    this.scene.init();
    this.gameManager.init();
    this.uiManager = new UIManager(this.gameManager);
    this.gameManager.setUIManager(this.uiManager);
    this.eventManager.init();
    this.uiManager.init();
  }
}
