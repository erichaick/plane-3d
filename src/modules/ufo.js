import * as THREE from 'three';
import { scene } from './scene.js';
import { createExplosion } from './effects.js';
import { gameState } from './gameState.js';

export function createUFO() {
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
    const saucerGeometry = new THREE.CylinderGeometry(5, 5, 1.5, 32, 1, false);
    const saucer = new THREE.Mesh(saucerGeometry, hullMaterial);
    saucer.castShadow = true;
    ufo.add(saucer);
    
    // Top dome
    const domeGeometry = new THREE.SphereGeometry(3, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2);
    const dome = new THREE.Mesh(domeGeometry, domeMaterial);
    dome.position.y = 0.75;
    dome.castShadow = true;
    ufo.add(dome);
    
    // Bottom rim
    const rimGeometry = new THREE.TorusGeometry(5, 0.5, 16, 32);
    const rim = new THREE.Mesh(rimGeometry, hullMaterial);
    rim.rotation.x = Math.PI / 2;
    rim.position.y = -0.5;
    rim.castShadow = true;
    ufo.add(rim);
    
    // Bottom opening
    const openingGeometry = new THREE.CylinderGeometry(2, 2, 0.5, 32, 1, false);
    const opening = new THREE.Mesh(openingGeometry, glowMaterial);
    opening.position.y = -1;
    ufo.add(opening);
    
    // Add a point light inside the UFO for glow effect
    const ufoLight = new THREE.PointLight(0x88ff88, 1, 20);
    ufoLight.position.set(0, -1, 0);
    ufo.add(ufoLight);
    
    return ufo;
}

// Create UFO manager to handle multiple UFOs
export const ufoManager = {
    ufos: [],
    maxUFOs: 10,
    spawnInterval: 5000, // ms between spawns
    lastSpawnTime: 0,
    targetBuildings: [], // Store references to important buildings
    
    init() {
        // Find some buildings to target
        this.findTargetBuildings();
        
        // Initial UFOs
        this.spawnUFO();
        this.spawnUFO();
        this.spawnUFO();
    },
    
    findTargetBuildings() {
        // Find the tallest buildings to target
        const buildings = [];
        scene.traverse(object => {
            // Look for meshes that are likely buildings (tall boxes)
            if (object.isMesh && 
                object.geometry.type === "BoxGeometry" && 
                object.position.y > 10) {
                buildings.push(object);
            }
        });
        
        // Sort by height and take the top 10
        buildings.sort((a, b) => b.position.y - a.position.y);
        this.targetBuildings = buildings.slice(0, 10);
    },
    
    spawnUFO() {
        if (this.ufos.length >= this.maxUFOs) return;
        
        const ufo = createUFO();
        
        // Random position over the city
        const citySize = 400; // Approximate size of our city
        const randomX = (Math.random() - 0.5) * citySize;
        const randomZ = (Math.random() - 0.5) * citySize;
        const height = 50 + Math.random() * 50; // Random height between 50-100
        
        ufo.position.set(randomX, height, randomZ);
        
        // Determine behavior type
        const behaviorType = Math.floor(Math.random() * 3);
        
        // Add movement properties
        ufo.userData = {
            health: 100,
            behaviorType: behaviorType, // 0: random, 1: circular, 2: targeting
            speed: 5 + Math.random() * 10,
            hoverHeight: height,
            
            // Random wandering properties
            wanderTarget: new THREE.Vector3(randomX, height, randomZ),
            wanderRadius: 100,
            wanderTimeout: 0,
            
            // Circular patrol properties
            hoverRadius: 20 + Math.random() * 30,
            hoverAngle: Math.random() * Math.PI * 2,
            hoverSpeed: 0.2 + Math.random() * 0.5,
            
            // Common properties
            bobSpeed: 0.5 + Math.random() * 0.5,
            bobHeight: 2 + Math.random() * 3,
            
            // Targeting properties
            targetBuilding: null,
            targetTime: 0,
            isTargeting: false,
            
            // Evasion properties
            isEvading: false,
            evasionDirection: new THREE.Vector3(),
            evasionTime: 0
        };
        
        // If it's a targeting UFO, assign a target building
        if (behaviorType === 2 && this.targetBuildings.length > 0) {
            const randomIndex = Math.floor(Math.random() * this.targetBuildings.length);
            ufo.userData.targetBuilding = this.targetBuildings[randomIndex];
        }
        
        scene.add(ufo);
        this.ufos.push(ufo);
        
        return ufo;
    },
    
    update(deltaTime, plane) {
        // Spawn new UFOs over time
        const currentTime = Date.now();
        if (currentTime - this.lastSpawnTime > this.spawnInterval) {
            this.spawnUFO();
            this.lastSpawnTime = currentTime;
        }
        
        // Update UFO movements
        this.ufos.forEach(ufo => {
            const data = ufo.userData;
            
            // Check if plane is nearby for evasion
            const distanceToPlane = ufo.position.distanceTo(plane.position);
            
            // Start evasion if plane gets too close
            if (distanceToPlane < 30 && !data.isEvading) {
                data.isEvading = true;
                data.evasionTime = currentTime + 3000; // Evade for 3 seconds
                
                // Calculate evasion direction (away from plane)
                data.evasionDirection.copy(ufo.position).sub(plane.position).normalize();
            }
            
            // End evasion after time expires
            if (data.isEvading && currentTime > data.evasionTime) {
                data.isEvading = false;
            }
            
            // Handle evasion movement
            if (data.isEvading) {
                // Move away from plane
                ufo.position.x += data.evasionDirection.x * 20 * deltaTime;
                ufo.position.z += data.evasionDirection.z * 20 * deltaTime;
                
                // Maintain height with some randomness
                ufo.position.y = data.hoverHeight + Math.sin(currentTime * 0.002) * 5;
            }
            // Handle normal behavior when not evading
            else {
                // Different movement patterns based on behavior type
                switch(data.behaviorType) {
                    case 0: // Random wandering
                        this.updateRandomWandering(ufo, currentTime, deltaTime);
                        break;
                    case 1: // Circular patrol
                        this.updateCircularPatrol(ufo, currentTime, deltaTime);
                        break;
                    case 2: // Building targeting
                        this.updateTargeting(ufo, currentTime, deltaTime);
                        break;
                }
            }
            
            // Bobbing up and down (common to all behaviors)
            const bobOffset = Math.sin(currentTime * 0.001 * data.bobSpeed) * data.bobHeight;
            ufo.position.y += bobOffset * deltaTime;
            
            // Slight tilt in the direction of movement
            if (data.prevX !== undefined && data.prevZ !== undefined) {
                const angle = Math.atan2(
                    ufo.position.z - data.prevZ,
                    ufo.position.x - data.prevX
                );
                
                // Rotate UFO to face movement direction with slight banking
                ufo.rotation.y = angle - Math.PI / 2;
                ufo.rotation.z = Math.sin(angle) * 0.1;
            }
            
            // Store previous position for next frame
            data.prevX = ufo.position.x;
            data.prevZ = ufo.position.z;
        });
    },
    
    updateRandomWandering(ufo, currentTime, deltaTime) {
        const data = ufo.userData;
        
        // Check if we need a new wander target
        if (currentTime > data.wanderTimeout || 
            ufo.position.distanceTo(data.wanderTarget) < 5) {
            
            // Set new random target within wander radius
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * data.wanderRadius;
            
            data.wanderTarget.set(
                distance * Math.cos(angle),
                data.hoverHeight,
                distance * Math.sin(angle)
            );
            
            // Set timeout for next target change (2-5 seconds)
            data.wanderTimeout = currentTime + 2000 + Math.random() * 3000;
        }
        
        // Move towards target
        const direction = new THREE.Vector3()
            .subVectors(data.wanderTarget, ufo.position)
            .normalize();
        
        ufo.position.x += direction.x * data.speed * deltaTime;
        ufo.position.z += direction.z * data.speed * deltaTime;
    },
    
    updateCircularPatrol(ufo, currentTime, deltaTime) {
        const data = ufo.userData;
        
        // Hovering movement (circular pattern)
        data.hoverAngle += data.hoverSpeed * deltaTime;
        
        const targetX = data.hoverRadius * Math.cos(data.hoverAngle);
        const targetZ = data.hoverRadius * Math.sin(data.hoverAngle);
        
        // Smooth movement
        ufo.position.x = THREE.MathUtils.lerp(ufo.position.x, targetX, 0.02);
        ufo.position.z = THREE.MathUtils.lerp(ufo.position.z, targetZ, 0.02);
    },
    
    updateTargeting(ufo, currentTime, deltaTime) {
        const data = ufo.userData;
        
        // If no target building or target is destroyed, find a new one
        if (!data.targetBuilding || !scene.getObjectById(data.targetBuilding.id)) {
            if (this.targetBuildings.length > 0) {
                const randomIndex = Math.floor(Math.random() * this.targetBuildings.length);
                data.targetBuilding = this.targetBuildings[randomIndex];
                data.isTargeting = false;
            } else {
                // No buildings to target, switch to random wandering
                data.behaviorType = 0;
                return;
            }
        }
        
        // Move towards target building
        if (!data.isTargeting) {
            const targetPosition = data.targetBuilding.position.clone();
            targetPosition.y += data.hoverHeight;
            
            const direction = new THREE.Vector3()
                .subVectors(targetPosition, ufo.position)
                .normalize();
            
            ufo.position.x += direction.x * data.speed * deltaTime;
            ufo.position.z += direction.z * data.speed * deltaTime;
            
            // Check if we've reached the target
            const horizontalDistance = Math.sqrt(
                Math.pow(ufo.position.x - targetPosition.x, 2) +
                Math.pow(ufo.position.z - targetPosition.z, 2)
            );
            
            if (horizontalDistance < 10) {
                data.isTargeting = true;
                data.targetTime = currentTime + 5000; // Target for 5 seconds
            }
        } else {
            // Hover over target
            const targetPosition = data.targetBuilding.position.clone();
            targetPosition.y += data.hoverHeight;
            
            ufo.position.x = THREE.MathUtils.lerp(ufo.position.x, targetPosition.x, 0.02);
            ufo.position.z = THREE.MathUtils.lerp(ufo.position.z, targetPosition.z, 0.02);
            
            // Add targeting beam effect
            if (!ufo.userData.beam) {
                const beamGeometry = new THREE.CylinderGeometry(0.5, 2, data.hoverHeight, 16);
                const beamMaterial = new THREE.MeshBasicMaterial({
                    color: 0x88ff88,
                    transparent: true,
                    opacity: 0.7
                });
                const beam = new THREE.Mesh(beamGeometry, beamMaterial);
                beam.position.y = -data.hoverHeight / 2;
                ufo.add(beam);
                ufo.userData.beam = beam;
            }
            
            // Check if targeting time is over
            if (currentTime > data.targetTime) {
                data.isTargeting = false;
                
                // Remove beam
                if (ufo.userData.beam) {
                    ufo.remove(ufo.userData.beam);
                    ufo.userData.beam = null;
                }
                
                // Find a new target
                if (this.targetBuildings.length > 0) {
                    const randomIndex = Math.floor(Math.random() * this.targetBuildings.length);
                    data.targetBuilding = this.targetBuildings[randomIndex];
                }
            }
        }
    },
    
    removeUFO(ufo) {
        const index = this.ufos.indexOf(ufo);
        if (index !== -1) {
            this.ufos.splice(index, 1);
            scene.remove(ufo);
        }
    }
};