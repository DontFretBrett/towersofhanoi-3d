import * as THREE from 'three';
import { GAME_CONFIG, DISK_CONFIG } from '../constants/GameConfig';

export class Rod {
  constructor(position, height = GAME_CONFIG.ROD.HEIGHT, radius = GAME_CONFIG.ROD.RADIUS, isDestination = false) {
    this.isDestination = isDestination;
    // Create base
    const baseGeometry = new THREE.CylinderGeometry(1.8, 1.8, 0.2, 32);
    const baseMaterial = new THREE.MeshStandardMaterial({ 
      color: isDestination ? 0x4a8a4a : 0x4a4a4a,
      metalness: 0.5,
      roughness: 0.5
    });
    this.base = new THREE.Mesh(baseGeometry, baseMaterial);
    this.base.position.set(position.x, 0.1, position.z);
    this.base.receiveShadow = true;

    // Create rod
    const rodGeometry = new THREE.CylinderGeometry(radius, radius, height, 16);
    const rodMaterial = new THREE.MeshStandardMaterial({ 
      color: isDestination ? 0x80a080 : 0x808080,
      metalness: 0.7,
      roughness: 0.3
    });
    this.rod = new THREE.Mesh(rodGeometry, rodMaterial);
    this.rod.position.set(position.x, height/2 + 0.1, position.z);
    this.rod.receiveShadow = true;

    this.disks = [];
  }

  addDisk(disk) {
    const effectiveDiskThickness = DISK_CONFIG.height + DISK_CONFIG.SPACING;
    const stackHeight = this.disks.length * effectiveDiskThickness;
    disk.mesh.position.y = effectiveDiskThickness + stackHeight;
    this.disks.push(disk);
  }

  removeDisk() {
    return this.disks.pop();
  }

  getTopDisk() {
    return this.disks[this.disks.length - 1];
  }

  getMesh() {
    const group = new THREE.Group();
    group.add(this.base);
    group.add(this.rod);
    return group;
  }

  dispose() {
    this.base.geometry.dispose();
    this.base.material.dispose();
    this.rod.geometry.dispose();
    this.rod.material.dispose();
  }
}
