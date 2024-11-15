import gsap from 'gsap';

export class Animation {
    static moveDisk(disk, targetPosition, duration = 0.2) {
        return new Promise(resolve => {
            disk.isMoving = true;

            gsap.to(disk.mesh.position, {
                x: targetPosition.x,
                y: targetPosition.y,
                z: targetPosition.z,
                duration,
                ease: "power2.out",
                onComplete: () => {
                    disk.isMoving = false;
                    resolve();
                }
            });
        });
    }
}
