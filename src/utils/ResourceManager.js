import * as THREE from 'three';

class ResourceManager {
  constructor() {
    this.geometries = new Map();
    this.materials = new Map();
  }

  getGeometry(key, createFn) {
    if (!this.geometries.has(key)) {
      this.geometries.set(key, createFn());
    }
    return this.geometries.get(key);
  }

  getMaterial(key, createFn) {
    if (!this.materials.has(key)) {
      this.materials.set(key, createFn());
    }
    return this.materials.get(key);
  }

  dispose() {
    this.geometries.forEach(geometry => geometry.dispose());
    this.materials.forEach(material => material.dispose());
    this.geometries.clear();
    this.materials.clear();
  }
}

export const resourceManager = new ResourceManager(); 