import * as THREE from 'three';

export function createSkybox() {
    const skyboxGeometry = new THREE.BoxGeometry(900, 900, 900);
    const skyboxMaterials = [];
    
    // Create materials for each side of the skybox
    const skyboxTexture = new THREE.Color(0x87CEEB); // Sky blue
    
    for (let i = 0; i < 6; i++) {
        // Make the top slightly lighter for a better sky effect
        const material = new THREE.MeshBasicMaterial({
            color: i === 2 ? new THREE.Color(0x9DCFEC) : skyboxTexture, // Top face slightly lighter
            side: THREE.BackSide // Render on the inside
        });
        skyboxMaterials.push(material);
    }
    
    const skybox = new THREE.Mesh(skyboxGeometry, skyboxMaterials);
    return skybox;
}