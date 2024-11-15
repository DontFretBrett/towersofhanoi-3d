import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { Debug } from '../utils/Debug';
import { CAMERA_CONFIG, LIGHT_CONFIG } from '../constants/GameConfig';

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
        this.controls = null;
        this.debug = null;
        this.directionalLight = null;
    }

    init() {
        // Setup renderer
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        this.element.appendChild(this.renderer.domElement);

        // Setup camera
        this.camera.position.set(
            CAMERA_CONFIG.position.x,
            CAMERA_CONFIG.position.y,
            CAMERA_CONFIG.position.z
        );
        this.camera.lookAt(
            CAMERA_CONFIG.lookAt.x,
            CAMERA_CONFIG.lookAt.y,
            CAMERA_CONFIG.lookAt.z
        );

        // Setup OrbitControls
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 5;
        this.controls.maxDistance = 30;
        this.controls.maxPolarAngle = Math.PI / 2;

        // Setup lights
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);

        this.directionalLight = new THREE.DirectionalLight(0xffffff, 1.18);
        this.directionalLight.position.set(
            LIGHT_CONFIG.position.x,
            LIGHT_CONFIG.position.y,
            LIGHT_CONFIG.position.z
        );
        this.directionalLight.castShadow = true;
        this.scene.add(this.directionalLight);

        // Add debug panel with controls reference
        this.debug = new Debug(this.scene, this.camera, this.directionalLight, this.controls);

        // Handle window resize
        window.addEventListener('resize', () => this.handleResize());

        // Add keyboard shortcut to log camera values
        window.addEventListener('keydown', (e) => {
            if (e.key === 'p') {
                const config = {
                    position: {
                        x: Number(this.camera.position.x.toFixed(2)),
                        y: Number(this.camera.position.y.toFixed(2)),
                        z: Number(this.camera.position.z.toFixed(2))
                    },
                    lookAt: this.debug.cameraValues.lookAt
                };
                console.log(JSON.stringify(config, null, 2));
            }
        });
    }

    handleResize() {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const pixelRatio = Math.min(window.devicePixelRatio, 2);

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        
        this.renderer.setSize(width, height);
        this.renderer.setPixelRatio(pixelRatio);
        
        // Update camera position based on screen size
        if (width < 768) {
            this.camera.position.z = 20; // Mobile view
        } else {
            this.camera.position.z = 15; // Desktop view
        }
    }

    add(object) {
        this.scene.add(object);
    }

    remove(object) {
        this.scene.remove(object);
    }

    render() {
        if (this.controls) {
            this.controls.update();
        }
        this.renderer.render(this.scene, this.camera);
    }
}
