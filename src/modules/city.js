import * as THREE from 'three';

export function createCity() {
    const city = new THREE.Group();
    
    // City parameters
    const gridSize = 10; // Reduced from 20 to 10 for better performance
    const blockSize = 40;
    const streetWidth = 12;
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
            
            // Create 1-3 buildings per block (reduced for performance)
            const buildingsPerBlock = Math.floor(Math.random() * 3) + 1;
            
            for (let b = 0; b < buildingsPerBlock; b++) {
                // Random building properties
                const buildingWidth = 5 + Math.random() * 20;
                const buildingDepth = 5 + Math.random() * 20;
                const buildingHeight = 10 + Math.random() * 70;
                
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
                
                // Add UFO above some buildings (10% chance)
                if (Math.random() < 0.1) {
                    const ufo = createUFO();
                    const ufoHeight = buildingHeight + 20 + Math.random() * 30;
                    ufo.position.set(posX, ufoHeight, posZ);
                    city.add(ufo);
                }
            }
        }
    }
    
    // Add some additional UFOs scattered around the city
    for (let i = 0; i < 15; i++) {
        const ufo = createUFO();
        const randomX = (Math.random() - 0.5) * totalSize * 0.8;
        const randomZ = (Math.random() - 0.5) * totalSize * 0.8;
        const randomHeight = 80 + Math.random() * 100;
        ufo.position.set(randomX, randomHeight, randomZ);
        
        // Add random rotation
        ufo.rotation.y = Math.random() * Math.PI * 2;
        
        city.add(ufo);
    }
    
    return city;
}

// Helper function to create a UFO
function createUFO() {
    const ufo = new THREE.Group();
    
    // Materials
    const hullMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x888888,
        metalness: 0.5,
        roughness: 0.2
    });
    
    const domeMaterial = new THREE.MeshStandardMaterial({ 
        color: 0x777777,
        metalness: 0.7,
        roughness: 0.2
    });
    
    const glowMaterial = new THREE.MeshStandardMaterial({
        color: 0x88ff88,
        emissive: 0x88ff88,
        emissiveIntensity: 0.5
    });
    
    // Main saucer body
    const saucerGeometry = new THREE.CylinderGeometry(5, 5, 1.5, 16);
    const saucer = new THREE.Mesh(saucerGeometry, hullMaterial);
    saucer.castShadow = true;
    ufo.add(saucer);
    
    // Top dome
    const domeGeometry = new THREE.SphereGeometry(3, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2);
    const dome = new THREE.Mesh(domeGeometry, domeMaterial);
    dome.position.y = 0.75;
    dome.castShadow = true;
    ufo.add(dome);
    
    // Bottom rim
    const rimGeometry = new THREE.TorusGeometry(5, 0.5, 8, 16);
    const rim = new THREE.Mesh(rimGeometry, hullMaterial);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = -0.5;
    rim.castShadow = true;
    ufo.add(rim);
    
    // Bottom opening
    const openingGeometry = new THREE.CylinderGeometry(2, 2, 0.5, 16);
    const opening = new THREE.Mesh(openingGeometry, glowMaterial);
    opening.position.y = -1;
    ufo.add(opening);
    
    // Add a point light inside the UFO for glow effect
    const ufoLight = new THREE.PointLight(0x88ff88, 1, 20);
    ufoLight.position.set(0, -1, 0);
    ufo.add(ufoLight);
    
    // Add animation data to the UFO
    ufo.userData = {
        bobSpeed: 0.5 + Math.random() * 0.5,
        bobHeight: 1 + Math.random() * 2,
        rotationSpeed: 0.2 + Math.random() * 0.3,
        originalY: 0 // Will be set when positioned
    };
    
    return ufo;
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
    const windowSpacing = 5; // Increased spacing between windows
    
    // Calculate how many windows can fit on each side
    const windowsX = Math.floor(width / windowSpacing) - 1;
    const windowsY = Math.floor(height / windowSpacing) - 1;
    const windowsZ = Math.floor(depth / windowSpacing) - 1;
    
    // Only add windows if the building is large enough and limit the number of windows
    if (windowsX > 0 && windowsY > 0 && height > 20) { // Only add windows to taller buildings
        // Windows on front and back
        for (let y = 0; y < Math.min(windowsY, 5); y++) { // Limit to 5 rows of windows
            for (let x = 0; x < Math.min(windowsX, 3); x++) { // Limit to 3 columns of windows
                // Skip more windows randomly for variety
                if (Math.random() > 0.5) {
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
                    
                    // Only add back windows to larger buildings
                    if (Math.random() > 0.5) {
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
    }
    
    // Windows on sides - only add to larger buildings
    if (windowsY > 0 && windowsZ > 0 && width > 10 && depth > 10) {
        for (let y = 0; y < Math.min(windowsY, 5); y++) { // Limit to 5 rows
            for (let z = 0; z < Math.min(windowsZ, 3); z++) { // Limit to 3 columns
                // Skip more windows randomly
                if (Math.random() > 0.7) {
                    // Left side windows only
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
                }
            }
        }
    }
    
    return building;
}