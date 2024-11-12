import * as dat from 'dat.gui';

export class Debug {
    constructor(scene, camera, light, controls) {
        this.gui = new dat.GUI({
            width: 300,
            autoPlace: true
        });
        
        this.scene = scene;
        this.camera = camera;
        this.light = light;
        this.controls = controls;

        // Camera debug values
        this.cameraValues = {
            position: {
                x: camera.position.x,
                y: camera.position.y,
                z: camera.position.z
            },
            lookAt: {
                x: 0,
                y: 0,
                z: 0
            },
            syncTarget: () => {
                this.cameraValues.lookAt.x = this.controls.target.x;
                this.cameraValues.lookAt.y = this.controls.target.y;
                this.cameraValues.lookAt.z = this.controls.target.z;
                this.gui.updateDisplay();
            }
        };

        this.setupCameraDebug();
        this.setupLightDebug();

        // Force position the GUI
        const guiContainer = this.gui.domElement.parentElement;
        if (guiContainer) {
            guiContainer.style.position = 'fixed';
            guiContainer.style.top = '60px';
            guiContainer.style.right = '10px';
            guiContainer.style.zIndex = '9999';
        }
    }

    setupCameraDebug() {
        const cameraFolder = this.gui.addFolder('Camera');
        
        // Position controls
        const posFolder = cameraFolder.addFolder('Position');
        posFolder.add(this.camera.position, 'x', -20, 20, 0.1)
            .name('X')
            .listen();
        posFolder.add(this.camera.position, 'y', 0, 20, 0.1)
            .name('Y')
            .listen();
        posFolder.add(this.camera.position, 'z', -20, 20, 0.1)
            .name('Z')
            .listen();
        
        // Look At controls
        const lookAtFolder = cameraFolder.addFolder('Look At (Target)');
        lookAtFolder.add(this.cameraValues.lookAt, 'x', -10, 10, 0.1)
            .name('X')
            .onChange(() => {
                this.controls.target.x = this.cameraValues.lookAt.x;
                this.controls.update();
            });
        lookAtFolder.add(this.cameraValues.lookAt, 'y', -10, 10, 0.1)
            .name('Y')
            .onChange(() => {
                this.controls.target.y = this.cameraValues.lookAt.y;
                this.controls.update();
            });
        lookAtFolder.add(this.cameraValues.lookAt, 'z', -10, 10, 0.1)
            .name('Z')
            .onChange(() => {
                this.controls.target.z = this.cameraValues.lookAt.z;
                this.controls.update();
            });

        // Add sync button
        lookAtFolder.add(this.cameraValues, 'syncTarget').name('Sync from Camera');

        cameraFolder.open();
        posFolder.open();
        lookAtFolder.open();
    }

    setupLightDebug() {
        const lightFolder = this.gui.addFolder('Light');
        lightFolder.add(this.light.position, 'x', -20, 20, 0.1).name('X').listen();
        lightFolder.add(this.light.position, 'y', 0, 20, 0.1).name('Y').listen();
        lightFolder.add(this.light.position, 'z', -20, 20, 0.1).name('Z').listen();
        lightFolder.add(this.light, 'intensity', 0, 2).name('Intensity').listen();
    }
}
