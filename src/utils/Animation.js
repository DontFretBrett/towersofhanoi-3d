export class Animation {
    static async moveDisk(disk, targetPosition, duration = 100) {
        const startPosition = {
            x: disk.mesh.position.x,
            y: disk.mesh.position.y,
            z: disk.mesh.position.z
        };
        
        const steps = 5;
        const stepDuration = duration / steps;
        
        const deltaX = (targetPosition.x - startPosition.x) / steps;
        const deltaY = (targetPosition.y - startPosition.y) / steps;
        const deltaZ = (targetPosition.z - startPosition.z) / steps;

        for (let i = 0; i < steps; i++) {
            await new Promise(resolve => setTimeout(resolve, stepDuration));
            
            disk.mesh.position.x += deltaX;
            disk.mesh.position.y += deltaY;
            disk.mesh.position.z += deltaZ;
        }

        // Ensure final position is exact
        disk.mesh.position.set(targetPosition.x, targetPosition.y, targetPosition.z);
    }
}
