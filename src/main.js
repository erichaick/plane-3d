import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { setupScene, renderer, scene, camera } from './modules/scene.js';
import { createCity } from './modules/city.js';
import { createSkybox } from './modules/environment.js';
import { createPlane, setupFlightControls, updatePlanePhysics } from './modules/plane.js';
import { createUFO, ufoManager } from './modules/ufo.js';
import { shootingSystem } from './modules/weapons.js';
import { createExplosion } from './modules/effects.js';
import { createUI } from './modules/ui.js';
import { inputManager } from './modules/input.js';
import { gameState } from './modules/gameState.js';

// Initialize the scene
setupScene();

// Create and add city to scene
const city = createCity();
scene.add(city);

// Add skybox
const skybox = createSkybox();
scene.add(skybox);

// Create plane
const plane = createPlane();
scene.add(plane);
plane.position.set(0, 50, 0);

// Initialize flight controls
const flightControls = setupFlightControls();

// Initialize camera settings for following the plane
const cameraOffset = new THREE.Vector3(0, 2, -10);
const cameraLerpFactor = 0.05;

// Initialize UFO manager
ufoManager.init();

// Initialize shooting system
shootingSystem.init(plane);

// Create UI
const ui = createUI(flightControls);

// Animation loop with physics
let lastTime = 0;
function animate(currentTime) {
    requestAnimationFrame(animate);
    
    // Calculate delta time for frame-rate independent physics
    const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
    lastTime = currentTime;
    
    // Skip if delta time is too large (e.g., after tab switch)
    if (deltaTime > 0.1) return;
    
    // Process inputs
    inputManager.processFlightControls(deltaTime, flightControls);
    
    // Update physics
    updatePlanePhysics(deltaTime, plane, flightControls);
    
    // Update camera
    updateCamera(deltaTime);
    
    // Update UFOs
    ufoManager.update(deltaTime, plane);
    
    // Update bullets and check collisions
    shootingSystem.update(deltaTime, plane);
    
    // Update explosions
    for (let i = gameState.explosions.length - 1; i >= 0; i--) {
        const stillActive = gameState.explosions[i].update(deltaTime);
        if (!stillActive) {
            gameState.explosions.splice(i, 1);
        }
    }
    
    // Update UI
    ui.updateSpeedIndicator(flightControls.speed);
    
    // Rotate propeller (speed-dependent)
    if (plane.propeller) {
        plane.propeller.rotation.z += flightControls.speed * 0.01;
    }
    
    // Update orbit controls if active
    if (!flightControls.followCamera) {
        OrbitControls.update();
    }
    
    renderer.render(scene, camera);
}

function updateCamera(deltaTime) {
    if (flightControls.followCamera) {
        // Calculate desired camera position based on plane's quaternion
        const planeQuat = new THREE.Quaternion();
        planeQuat.setFromEuler(plane.rotation);
        
        const cameraPosition = new THREE.Vector3();
        cameraPosition.copy(cameraOffset);
        cameraPosition.applyQuaternion(planeQuat);
        cameraPosition.add(plane.position);
        
        // Smoothly move camera to desired position
        camera.position.lerp(cameraPosition, cameraLerpFactor);
        
        // Look at a point ahead of the plane
        const lookAtPosition = new THREE.Vector3();
        const lookAheadDistance = 10;
        const lookAheadVector = new THREE.Vector3(0, 0, lookAheadDistance);
        lookAheadVector.applyQuaternion(planeQuat);
        lookAtPosition.copy(plane.position).add(lookAheadVector);
        
        camera.lookAt(lookAtPosition);
    }
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Start animation loop
animate(0);