import * as THREE from 'three';
import { DISK_COLORS, DISK_CONFIG, HIGHLIGHT_COLOR } from '../constants/GameConfig';

export class Disk {
  constructor(radius, height, color, position) {
    this.geometry = new THREE.CylinderGeometry(radius, radius, height, 32);
    this.material = new THREE.MeshStandardMaterial({
      color,
      metalness: 0.3,
      roughness: 0.5
    });
    this.mesh = new THREE.Mesh(this.geometry, this.material);
    this.mesh.position.set(...position);
    this.mesh.castShadow = true;
    this.mesh.receiveShadow = true;
    
    // Store original material properties
    this.originalColor = color;
    this.originalMetalness = 0.3;
    this.originalRoughness = 0.5;
  }

  setPosition(x, y, z) {
    this.mesh.position.set(x, y, z);
  }

  highlight() {
    this.material.color.setHex(HIGHLIGHT_COLOR);
    this.material.metalness = 0.1;  // Less metallic for brighter appearance
    this.material.roughness = 0.2;  // Smoother for more shine
    this.material.emissive.setHex(0x333333);  // Add slight glow
  }

  resetColor() {
    this.material.color.setHex(this.originalColor);
    this.material.metalness = this.originalMetalness;
    this.material.roughness = this.originalRoughness;
    this.material.emissive.setHex(0x000000);  // Remove glow
  }

  dispose() {
    this.geometry.dispose();
    this.material.dispose();
  }
}