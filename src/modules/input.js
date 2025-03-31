import * as THREE from 'three';
import { orbitControls } from './scene.js';

// Input state
const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    q: false,
    e: false,
    c: false  // Camera toggle
};

// Setup key listeners
window.addEventListener('keydown', (e) => {
    if (e.key in keys) {
        keys[e.key] = true;
    }
});

window.addEventListener('keyup', (e) => {
    if (e.key in keys) {
        keys[e.key] = false;
        
        // Camera toggle on key release to prevent multiple toggles
        if (e.key === 'c') {
            flightControls.followCamera = !flightControls.followCamera;
            orbitControls.enabled = !flightControls.followCamera;
        }
    }
});

export const inputManager = {
    processFlightControls(deltaTime, flightControls) {
        // Process pitch (Up/Down) - more responsive values
        if (keys.ArrowUp) {
            flightControls.pitch = THREE.MathUtils.lerp(flightControls.pitch, -1, 0.2);
        } else if (keys.ArrowDown) {
            flightControls.pitch = THREE.MathUtils.lerp(flightControls.pitch, 1, 0.2);
        } else {
            // Auto-center pitch more quickly
            flightControls.pitch *= 0.9;
        }
        
        // Process roll (Left/Right) - more responsive values
        if (keys.ArrowLeft) {
            flightControls.roll = THREE.MathUtils.lerp(flightControls.roll, -1, 0.2);
        } else if (keys.ArrowRight) {
            flightControls.roll = THREE.MathUtils.lerp(flightControls.roll, 1, 0.2);
        } else {
            // Auto-level roll
            flightControls.roll *= flightControls.autoLevelForce;
        }
        
        // Calculate yaw from roll with increased effect
        flightControls.yaw = -flightControls.roll * flightControls.turnSensitivity * 1.5 * deltaTime;
        
        // Process speed (Q/E)
        if (keys.q) {
            flightControls.targetSpeed = Math.max(flightControls.minSpeed, 
                                                flightControls.targetSpeed - 10 * deltaTime);
        } else if (keys.e) {
            flightControls.targetSpeed = Math.min(flightControls.maxSpeed, 
                                                flightControls.targetSpeed + 10 * deltaTime);
        }
        
        // Smooth speed changes
        flightControls.speed = THREE.MathUtils.lerp(
            flightControls.speed, 
            flightControls.targetSpeed, 
            0.05
        );
    }
};