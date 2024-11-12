import * as THREE from 'three';
import { CAMERA_CONFIG } from '../constants/GameConfig';

export class Scene {
  constructor(element) {
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      CAMERA_CONFIG.fov,
      window.innerWidth / window.innerHeight,
      CAMERA_CONFIG.near,
      CAMERA_CONFIG.far
    );
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.element = element;
  }

  init() {
    // Setup renderer
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    this.renderer.domElement.style.position = 'fixed';
    this.renderer.domElement.style.zIndex = '1';
    
    // Prevent canvas from capturing all events
    this.renderer.domElement.style.pointerEvents = 'none';
    
    this.element.appendChild(this.renderer.domElement);

    // Setup camera
    this.camera.position.set(
      CAMERA_CONFIG.position.x,
      CAMERA_CONFIG.position.y,
      CAMERA_CONFIG.position.z
    );
    this.camera.lookAt(new THREE.Vector3(0, -1, 0));

    // Setup lighting
    this.setupLighting();

    // Handle window resize
    window.addEventListener('resize', () => this.handleResize());
  }

  setupLighting() {
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    this.scene.add(ambientLight);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 20, 10);
    directionalLight.castShadow = true;
    this.scene.add(directionalLight);
  }

  handleResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  add(object) {
    this.scene.add(object);
  }

  remove(object) {
    this.scene.remove(object);
  }

  render() {
    if (this.renderer && this.scene && this.camera) {
        this.renderer.render(this.scene, this.camera);
    }
  }
}
