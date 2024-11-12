import { App } from './core/App';

// Initialize the application
const app = new App(document.getElementById('app'));
app.init();

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    app.scene.render();
}

// Start the animation loop
animate();
