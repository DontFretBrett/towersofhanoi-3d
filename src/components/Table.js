import * as THREE from 'three';

export class Table {
  constructor(width = 12, height = 0.5, depth = 6) {
    this.group = new THREE.Group();
    
    // Create table top
    const topGeometry = new THREE.BoxGeometry(width, height, depth);
    const material = new THREE.MeshStandardMaterial({
      color: 0xffffff,  // Changed to white to let texture color show through
      roughness: 0.4,   // Reduced roughness
      metalness: 0.0,   // Removed metalness
      map: null,        // Will be set when texture loads
    });
    
    this.tableTop = new THREE.Mesh(topGeometry, material);
    this.tableTop.position.y = -0.25;
    this.tableTop.receiveShadow = true;
    this.tableTop.castShadow = true;
    
    // Create legs
    const legGeometry = new THREE.BoxGeometry(0.4, 2, 0.4);
    const legPositions = [
      { x: width/2 - 0.5, z: depth/2 - 0.5 },
      { x: -(width/2 - 0.5), z: depth/2 - 0.5 },
      { x: width/2 - 0.5, z: -(depth/2 - 0.5) },
      { x: -(width/2 - 0.5), z: -(depth/2 - 0.5) }
    ];
    
    this.legs = legPositions.map(pos => {
      const leg = new THREE.Mesh(legGeometry, material.clone());
      leg.position.set(pos.x, -1.25, pos.z);
      leg.receiveShadow = true;
      leg.castShadow = true;
      return leg;
    });
    
    // Add all elements to group
    this.group.add(this.tableTop);
    this.legs.forEach(leg => this.group.add(leg));

    // Load texture asynchronously
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      '/textures/woodgrain.jpg',
      (texture) => {
        // Configure texture
        texture.wrapS = texture.wrapT = THREE.RepeatWrapping;
        texture.repeat.set(2, 1);
        
        // Adjust texture brightness
        const brightnessFactor = 1.2;  // Increase this value to make it brighter
        texture.encoding = THREE.sRGBEncoding;
        
        // Update material for table top
        this.tableTop.material.map = texture;
        this.tableTop.material.needsUpdate = true;
        
        // Update materials for legs
        this.legs.forEach(leg => {
          const legTexture = texture.clone();
          legTexture.repeat.set(0.5, 1);
          leg.material.map = legTexture;
          leg.material.needsUpdate = true;
        });
      },
      undefined,
      (error) => {
        console.error('Error loading wood texture:', error);
      }
    );
  }

  getMesh() {
    return this.group;
  }
}
