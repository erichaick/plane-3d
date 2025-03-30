import * as THREE from 'three';

export function createCity() {
    const city = new THREE.Group();
    
    // City parameters
    const gridSize = 10; // 10x10 grid
    const blockSize = 30; // Size of each city block
    const streetWidth = 10; // Width of streets
    const totalSize = gridSize * (blockSize + streetWidth);
    const startOffset = -totalSize / 2; // Center the city
    
    // Materials
    const buildingMaterials = [
        new THREE.MeshStandardMaterial({ color: 0x555555 }), // Dark gray
        new THREE.MeshStandardMaterial({ color: 0x666666 }), // Medium gray
        new THREE.MeshStandardMaterial({ color: 0x777777 })  // Light gray
    ];
    
    const streetMaterial = new THREE.MeshStandardMaterial({ color: 0x222222 }); // Dark for streets
    
    // Create streets (horizontal and vertical)
    for (let i = 0; i <= gridSize; i++) {
        // Horizontal streets
        const horizontalStreet = new THREE.Mesh(
            new THREE.BoxGeometry(totalSize, 0.1, streetWidth),
            streetMaterial
        );
        horizontalStreet.position.set(
            0,
            0.05, // Slightly above ground to prevent z-fighting
            startOffset + i * (blockSize + streetWidth)
        );
        horizontalStreet.receiveShadow = true;
        city.add(horizontalStreet);
        
        // Vertical streets
        const verticalStreet = new THREE.Mesh(
            new THREE.BoxGeometry(streetWidth, 0.1, totalSize),
            streetMaterial
        );
        verticalStreet.position.set(
            startOffset + i * (blockSize + streetWidth),
            0.05,
            0
        );
        verticalStreet.receiveShadow = true;
        city.add(verticalStreet);
    }
    
    // Create buildings in each block
    for (let x = 0; x < gridSize; x++) {
        for (let z = 0; z < gridSize; z++) {
            const blockX = startOffset + x * (blockSize + streetWidth) + streetWidth / 2;
            const blockZ = startOffset + z * (blockSize + streetWidth) + streetWidth / 2;
            
            // Create 1-4 buildings per block
            const buildingsPerBlock = Math.floor(Math.random() * 4) + 1;
            
            for (let b = 0; b < buildingsPerBlock; b++) {
                // Random building properties
                const buildingWidth = 5 + Math.random() * 15;
                const buildingDepth = 5 + Math.random() * 15;
                const buildingHeight = 10 + Math.random() * 60;
                
                // Position within block
                const posX = blockX + (Math.random() * (blockSize - buildingWidth) - (blockSize - buildingWidth) / 2);
                const posZ = blockZ + (Math.random() * (blockSize - buildingDepth) - (blockSize - buildingDepth) / 2);
                
                // Create building
                const building = createBuilding(
                    buildingWidth, 
                    buildingHeight, 
                    buildingDepth, 
                    buildingMaterials[Math.floor(Math.random() * buildingMaterials.length)]
                );
                
                building.position.set(posX, buildingHeight / 2, posZ);
                city.add(building);
            }
        }
    }
    
    return city;
}

// Helper function to create a building with windows
function createBuilding(width, height, depth, material) {
    const building = new THREE.Group();
    
    // Main building structure
    const buildingGeometry = new THREE.BoxGeometry(width, height, depth);
    const buildingMesh = new THREE.Mesh(buildingGeometry, material);
    buildingMesh.castShadow = true;
    buildingMesh.receiveShadow = true;
    building.add(buildingMesh);
    
    // Add windows
    const windowMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x88CCFF,
        emissive: 0x88CCFF,
        emissiveIntensity: 0.2
    });
    
    const windowSize = 1;
    const windowSpacing = 3;
    
    // Calculate how many windows can fit on each side
    const windowsX = Math.floor(width / windowSpacing) - 1;
    const windowsY = Math.floor(height / windowSpacing) - 1;
    const windowsZ = Math.floor(depth / windowSpacing) - 1;
    
    // Only add windows if the building is large enough
    if (windowsX > 0 && windowsY > 0) {
        // Windows on front and back
        for (let y = 0; y < windowsY; y++) {
            for (let x = 0; x < windowsX; x++) {
                // Skip some windows randomly for variety
                if (Math.random() > 0.3) {
                    // Front windows
                    const frontWindow = new THREE.Mesh(
                        new THREE.PlaneGeometry(windowSize, windowSize),
                        windowMaterial
                    );
                    frontWindow.position.set(
                        (x * windowSpacing) - (width / 2) + windowSpacing,
                        (y * windowSpacing) - (height / 2) + windowSpacing,
                        depth / 2 + 0.01 // Slightly in front of the building
                    );
                    building.add(frontWindow);
                    
                    // Back windows
                    const backWindow = new THREE.Mesh(
                        new THREE.PlaneGeometry(windowSize, windowSize),
                        windowMaterial
                    );
                    backWindow.position.set(
                        (x * windowSpacing) - (width / 2) + windowSpacing,
                        (y * windowSpacing) - (height / 2) + windowSpacing,
                        -depth / 2 - 0.01 // Slightly behind the building
                    );
                    backWindow.rotation.y = Math.PI;
                    building.add(backWindow);
                }
            }
        }
    }
    
    // Windows on sides
    if (windowsY > 0 && windowsZ > 0) {
        for (let y = 0; y < windowsY; y++) {
            for (let z = 0; z < windowsZ; z++) {
                // Skip some windows randomly
                if (Math.random() > 0.3) {
                    // Left side windows
                    const leftWindow = new THREE.Mesh(
                        new THREE.PlaneGeometry(windowSize, windowSize),
                        windowMaterial
                    );
                    leftWindow.position.set(
                        -width / 2 - 0.01, // Slightly to the left of the building
                        (y * windowSpacing) - (height / 2) + windowSpacing,
                        (z * windowSpacing) - (depth / 2) + windowSpacing
                    );
                    leftWindow.rotation.y = -Math.PI / 2;
                    building.add(leftWindow);
                    
                    // Right side windows
                    const rightWindow = new THREE.Mesh(
                        new THREE.PlaneGeometry(windowSize, windowSize),
                        windowMaterial
                    );
                    rightWindow.position.set(
                        width / 2 + 0.01, // Slightly to the right of the building
                        (y * windowSpacing) - (height / 2) + windowSpacing,
                        (z * windowSpacing) - (depth / 2) + windowSpacing
                    );
                    rightWindow.rotation.y = Math.PI / 2;
                    building.add(rightWindow);
                }
            }
        }
    }
    
    return building;
}