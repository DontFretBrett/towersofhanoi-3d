# Towers of Hanoi - 3D Game

This project is a 3D implementation of the classic Towers of Hanoi puzzle game using Three.js. The game provides an interactive experience where users can solve the puzzle by moving disks between rods.

## Project Structure

- **`src/index.js`**: Main JavaScript file where the Three.js scene is initialized and the game logic is implemented.
- **`index.html`**: HTML file that includes the Three.js application.
- **`src/styles.css`**: Basic styles for the application.

## Getting Started

### Prerequisites

- Node.js and npm should be installed on your machine.

### Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   ```

2. Navigate to the project directory:

   ```bash
   cd towers-of-hanoi-3d
   ```

3. Install the dependencies:

   ```bash
   npm install
   ```

### Running the Game

To start the development server and open the game in your default browser, run:

```bash
npm start
```

This will use Parcel to bundle the application and serve it locally.

### Building for Production

To build the project for production, run:

```bash
npm run build
```

This will create a `dist` directory with the bundled files.

## Libraries Used

- **Three.js**: Used for rendering 3D graphics.
- **@tweenjs/tween.js**: Used for smooth animations and transitions.

## Game Overview

The game is set up with a 3D scene where:

- **Rods**: Represent the three pegs in the Towers of Hanoi puzzle.
- **Disks**: Can be moved between rods to solve the puzzle.
- **Lighting**: Enhances the visual appearance of the scene.

### Key Functions

- **`init()`**: Initializes the scene, camera, renderer, and game components.
- **`setupRenderer()`**: Configures the renderer.
- **`setupScene()`**: Sets up the scene.
- **`setupCamera()`**: Configures the camera.
- **`setupLighting()`**: Adds lighting to the scene.
- **`createRods()`**: Creates rods in the scene.
- **`createDisks()`**: Creates disks in the scene.
- **`setupEventListeners()`**: Sets up event listeners for user interaction.

## License

This project is licensed under the MIT License.

## Acknowledgments

- [Three.js](https://threejs.org/)
- [Parcel](https://parceljs.org/)
- [@tweenjs/tween.js](https://github.com/tweenjs/tween.js)
