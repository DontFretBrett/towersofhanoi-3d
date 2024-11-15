import { GAME_CONFIG } from '../constants/GameConfig';

export class Animation {
    static async moveDisk(disk, targetPosition, duration = GAME_CONFIG.ANIMATION.DURATION) {
        disk.isMoving = true;
        
        const startPosition = {
            x: disk.mesh.position.x,
            y: disk.mesh.position.y,
            z: disk.mesh.position.z
        };
        
        const steps = GAME_CONFIG.ANIMATION.STEPS;
        const stepDuration = duration / steps;
        
        const deltaX = (targetPosition.x - startPosition.x) / steps;
        const deltaY = (targetPosition.y - startPosition.y) / steps;
        const deltaZ = (targetPosition.z - startPosition.z) / steps;

        for (let i = 0; i < steps; i++) {
            // Always wait for the step duration unless interrupted
            await new Promise(resolve => setTimeout(resolve, stepDuration));
            
            // If interrupted, complete the movement instantly and break
            if (disk.interrupted) {
                disk.mesh.position.set(targetPosition.x, targetPosition.y, targetPosition.z);
                disk.interrupted = false;
                break;
            }
            
            // Otherwise continue with normal animation
            disk.mesh.position.x += deltaX;
            disk.mesh.position.y += deltaY;
            disk.mesh.position.z += deltaZ;
        }

        // Ensure final position is exact
        disk.mesh.position.set(targetPosition.x, targetPosition.y, targetPosition.z);
        disk.isMoving = false;
    }
}
