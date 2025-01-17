# Towers of Hanoi - 3D Game

https://towersofhanoi-alpha.vercel.app

![Game Screenshot](game.png)

This project is a 3D implementation of the classic Towers of Hanoi puzzle game using Three.js. The game provides an interactive experience where users can solve the puzzle by moving disks between rods.

## Features

- Interactive 3D environment with optimized graphics
- Multiple difficulty levels (3-10 disks)
- Mouse/touch and keyboard controls
- Move counter and timer
- Optimal moves calculator
- Smooth animations using GSAP
- Debug panel for development
- Responsive design for all screen sizes
- Real-time move validation
- Victory detection
- Wood-textured table surface
- Destination rod highlighting
- Reset button to start a new game
- Difficulty selector to change number of disks
- Real-time move counter and timer display

## Getting Started

### Prerequisites

- Node.js and npm installed on your machine

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   ```

2. Navigate to the project directory:
   ```bash
   cd towersofhanoi-3d
   ```

3. Install the dependencies:
   ```bash
   npm install
   ```

### Running the Game

To start the development server:

```bash
npm run dev
```

This will use Vite to bundle the application and serve it locally.

### Building for Production

To create a production build:

```bash
npm run build
```

This will create a `dist` directory with the bundled files.

## Dependencies

- **Three.js**: 3D graphics rendering engine
- **GSAP**: Animation library for smooth disk movements
- **Vite**: Build tool and development server

## Game Overview

The game is set up with a 3D scene where:

- **Rods**: Represent the three pegs in the Towers of Hanoi puzzle.
- **Disks**: Can be moved between rods to solve the puzzle.
- **Lighting**: Enhances the visual appearance of the scene.

### Key Functions

- **`init()`**: Initializes the scene, camera, renderer, and game components
- **`setupRenderer()`**: Configures the renderer
- **`setupScene()`**: Sets up the scene
- **`setupCamera()`**: Configures the camera
- **`setupLighting()`**: Adds lighting to the scene
- **`createRods()`**: Creates rods in the scene
- **`createDisks()`**: Creates disks in the scene
- **`setupEventListeners()`**: Sets up event listeners for user interaction
- **`moveDisk()`**: Handles disk movement animation and logic
- **`handleRodSelection()`**: Manages rod selection and validation
- **`isValidMove()`**: Validates disk movements between rods
- **`checkWin()`**: Checks for victory condition
- **`randomize()`**: Randomizes disk positions for varied gameplay
- **`calculateOptimalMoves()`**: Calculates minimum moves needed
- **`resetGame()`**: Resets the game state and creates new disks
- **`updateUI()`**: Updates move counter, timer, and optimal moves display

## How to Play

- Use number keys 1-3 or click/tap the rods to select and move disks
- Press the same rod number or click/tap the same rod to deselect a disk
- Selected disks are highlighted with a bright glow effect
- Move all disks to the green destination rod to win
- The game tracks your moves and time
- You can only place smaller disks on top of larger ones
- Use the difficulty selector to change the number of disks (3-10)
- Click 'Randomize' to start with a random valid configuration

## License

This project is licensed under the MIT License.

## Acknowledgments

Thanks to the creators and maintainers of:
- [Three.js](https://threejs.org/)
- [GSAP](https://greensock.com/gsap/)
- [Vite](https://vitejs.dev/)
