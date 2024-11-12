import { Rod } from '../components/Rod';
import { Disk } from '../components/Disk';
import { DISK_COLORS, DISK_CONFIG } from '../constants/GameConfig';

export class GameManager {
  constructor(scene) {
    this.scene = scene;
    this.rods = [];
    this.disks = [];
    this.selectedDisk = null;
    this.moveCounter = 0;
    this.numDisks = 3;
    this.uiManager = null;
  }

  setUIManager(uiManager) {
    this.uiManager = uiManager;
  }

  init() {
    this.createRods();
    this.createDisks();
  }

  createRods() {
    const positions = [
      { x: -4, z: 0 },
      { x: 0, z: 0 },
      { x: 4, z: 0 }
    ];

    positions.forEach(pos => {
      const rod = new Rod(pos);
      this.rods.push(rod);
      this.scene.add(rod.getMesh());
    });
  }

  createDisks() {
    // Make sure we don't exceed the available colors
    const numDisks = Math.min(this.numDisks, DISK_COLORS.length);
    
    for (let i = 0; i < numDisks; i++) {
      const radius = DISK_CONFIG.maxRadius - (i * 0.2);
      const disk = new Disk(
        radius,
        DISK_CONFIG.height,
        DISK_COLORS[i],
        [this.rods[0].rod.position.x, (i * 0.35) + 0.3, 0]
      );
      this.disks.push(disk);
      this.rods[0].addDisk(disk);
      this.scene.add(disk.mesh);
    }
  }

  reset() {
    // Remove existing disks
    this.disks.forEach(disk => {
        this.scene.remove(disk.mesh);
        disk.dispose();
    });
    
    // Clear arrays
    this.disks = [];
    this.rods.forEach(rod => rod.disks = []);
    
    // Reset move counter
    this.moveCounter = 0;
    
    // Create new disks
    this.createDisks();
  }

  checkWin() {
    return this.rods[2].disks.length === this.numDisks;
  }
}
