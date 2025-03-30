import * as THREE from 'three';
import { orbitControls } from './scene.js';

// Input state
const keys = {
    w: false,
    s: false,
    a: false,
    d: false,
    q: false,
    e: false,
    c: false  // Camera toggle
};

// Setup key listeners
window.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() in keys) {
        keys[e.key.toLowerCase()] = true;
    }
});

window.addEventListener('keyup', (e) => {
    if (e.key.toLowerCase() in keys) {
        keys[e.key.toLowerCase()] = false;
        
        // Camera toggle on key release to prevent multiple toggles
        if (e.key.toLowerCase() === 'c') {
            flightControls.followCamera = !flightControls.followCamera;
            orbitControls.enabled = !flightControls.followCamera;
        }
    }
});

export const inputManager = {
    processFlightControls(deltaTime, flightControls) {
        // Process pitch (W/S)
        if (keys.w) {
            flightControls.pitch = THREE.MathUtils.lerp(flightControls.pitch, -1, 0.1);
        } else if (keys.s) {
            flightControls.pitch = THREE.MathUtils.lerp(flightControls.pitch, 1, 0.1);
        } else {
            // Auto-center pitch
            flightControls.pitch *= 0.95;
        }
        
        // Process roll (A/D)
        if (keys.a) {
            flightControls.roll = THREE.MathUtils.lerp(flightControls.roll, -1, 0.1);
        } else if (keys.d) {
            flightControls.roll = THREE.MathUtils.lerp(flightControls.roll, 1, 0.1);
        } else {
            // Auto-level roll
            flightControls.roll *= flightControls.autoLevelForce;
        }
        
        // Calculate yaw from roll (with negative sign as specified)
        flightControls.yaw = -flightControls.roll * flightControls.turnSensitivity * deltaTime;
        
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