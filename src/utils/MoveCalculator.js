import { DISK_CONFIG } from '../constants/GameConfig';

export class MoveCalculator {
  static getStandardMinimumMoves(numDisks) {
    return Math.pow(2, numDisks) - 1;
  }

  static calculateOptimalMoves(rods, destinationRodIndex) {
    // Convert to array of arrays where each number represents disk size (0 = smallest)
    const state = rods.map(rod => 
      rod.disks.map(disk => {
        const radius = disk.geometry.parameters.radiusTop;
        return radius; // Keep actual radius for accurate comparison
      })
    );

    return this.findMinimumMoves(state, destinationRodIndex);
  }

  static isValidMove(state, from, to) {
    if (state[from].length === 0) return false;
    if (state[to].length === 0) return true;
    
    const movingDiskRadius = state[from][state[from].length - 1];
    const targetDiskRadius = state[to][state[to].length - 1];
    return movingDiskRadius < targetDiskRadius;
  }

  static makeMove(state, from, to) {
    const newState = state.map(rod => [...rod]);
    const disk = newState[from].pop();
    newState[to].push(disk);
    return newState;
  }

  static stateToString(state) {
    return state.map(rod => rod.join(',')).join('|');
  }

  static isSolved(state, destRod) {
    const totalDisks = state.reduce((sum, rod) => sum + rod.length, 0);
    if (state[destRod].length !== totalDisks) return false;

    // Check if disks are in correct order (larger radius = larger disk)
    for (let i = 1; i < state[destRod].length; i++) {
      if (state[destRod][i] >= state[destRod][i-1]) return false;
    }
    return true;
  }

  static findMinimumMoves(initialState, destRod) {
    const queue = [{state: initialState, moves: 0}];
    const seen = new Set([this.stateToString(initialState)]);

    while (queue.length > 0) {
      const {state, moves} = queue.shift();

      if (this.isSolved(state, destRod)) {
        return moves;
      }

      // Try all possible moves
      for (let from = 0; from < 3; from++) {
        for (let to = 0; to < 3; to++) {
          if (from !== to && this.isValidMove(state, from, to)) {
            const newState = this.makeMove(state, from, to);
            const stateString = this.stateToString(newState);

            if (!seen.has(stateString)) {
              seen.add(stateString);
              queue.push({
                state: newState,
                moves: moves + 1
              });
            }
          }
        }
      }
    }

    // Fallback to prevent infinite loop
    return -1; // Should indicate an error or unreachable state if queue empties
  }
} 