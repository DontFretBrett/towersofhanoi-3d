import * as THREE from 'three';

export class Rod {
  constructor(position, height = 4, radius = 0.1) {
    // Create base
    const baseGeometry = new THREE.CylinderGeometry(1.8, 1.8, 0.2, 32);
    const baseMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x4a4a4a,
      metalness: 0.5,
      roughness: 0.5
    });
    this.base = new THREE.Mesh(baseGeometry, baseMaterial);
    this.base.position.set(position.x, 0.1, position.z);
    this.base.receiveShadow = true;

    // Create rod
    const rodGeometry = new THREE.CylinderGeometry(radius, radius, height, 16);
    const rodMaterial = new THREE.MeshStandardMaterial({ 
      color: 0x808080,
      metalness: 0.7,
      roughness: 0.3
    });
    this.rod = new THREE.Mesh(rodGeometry, rodMaterial);
    this.rod.position.set(position.x, height/2 + 0.1, position.z);
    this.rod.receiveShadow = true;

    this.disks = [];
  }

  addDisk(disk) {
    const stackHeight = this.disks.length * 0.35;
    disk.mesh.position.y = 0.35 + stackHeight;
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
}
