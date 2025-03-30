import * as THREE from 'three';

export function createPlane() {
    const plane = new THREE.Group();
    
    // Materials
    const darkGrayMaterial = new THREE.MeshStandardMaterial({ color: 0x333333 });
    const lightGrayMaterial = new THREE.MeshStandardMaterial({ color: 0x666666 });
    const blueMaterial = new THREE.MeshStandardMaterial({ color: 0x0066cc });
    
    // Fuselage (main body)
    const fuselageGeometry = new THREE.CylinderGeometry(0.2, 0.15, 1.5, 8);
    const fuselage = new THREE.Mesh(fuselageGeometry, darkGrayMaterial);
    fuselage.rotation.x = Math.PI / 2;
    fuselage.castShadow = true;
    plane.add(fuselage);
    
    // Wings
    const wingGeometry = new THREE.BoxGeometry(2, 0.05, 0.4);
    const wing = new THREE.Mesh(wingGeometry, lightGrayMaterial);
    wing.position.y = -0.05;
    wing.castShadow = true;
    plane.add(wing);
    
    // Tail vertical stabilizer
    const tailFinGeometry = new THREE.BoxGeometry(0.05, 0.3, 0.2);
    const tailFin = new THREE.Mesh(tailFinGeometry, lightGrayMaterial);
    tailFin.position.set(0, 0.15, -0.65);
    tailFin.castShadow = true;
    plane.add(tailFin);
    
    // Tail horizontal stabilizer
    const tailWingGeometry = new THREE.BoxGeometry(0.6, 0.05, 0.2);
    const tailWing = new THREE.Mesh(tailWingGeometry, lightGrayMaterial);
    tailWing.position.set(0, 0, -0.65);
    tailWing.castShadow = true;
    plane.add(tailWing);
    
    // Propeller base
    const propBaseGeometry = new THREE.CylinderGeometry(0.1, 0.1, 0.1, 8);
    const propBase = new THREE.Mesh(propBaseGeometry, darkGrayMaterial);
    propBase.rotation.x = Math.PI / 2;
    propBase.position.z = 0.8;
    plane.add(propBase);
    
    // Propeller blades
    const propellerGroup = new THREE.Group();
    propellerGroup.position.z = 0.85;
    
    const blade1Geometry = new THREE.BoxGeometry(0.1, 0.5, 0.05);
    const blade1 = new THREE.Mesh(blade1Geometry, darkGrayMaterial);
    blade1.position.y = 0.25;
    propellerGroup.add(blade1);
    
    const blade2Geometry = new THREE.BoxGeometry(0.1, 0.5, 0.05);
    const blade2 = new THREE.Mesh(blade2Geometry, darkGrayMaterial);
    blade2.position.x = 0.25;
    blade2.rotation.z = Math.PI / 2;
    propellerGroup.add(blade2);
    
    plane.add(propellerGroup);
    plane.propeller = propellerGroup; // Store reference for animation
    
    // Cockpit
    const cockpitGeometry = new THREE.SphereGeometry(0.2, 16, 12, 0, Math.PI * 2, 0, Math.PI / 2);
    const cockpit = new THREE.Mesh(cockpitGeometry, blueMaterial);
    cockpit.rotation.x = Math.PI;
    cockpit.position.set(0, 0.1, 0.2);
    plane.add(cockpit);
    
    return plane;
}

export function setupFlightControls() {
    return {
        // Flight control state
        pitch: 0,
        roll: 0,
        yaw: 0,
        speed: 30,
        targetSpeed: 30,
        
        // Flight control parameters
        minSpeed: 10,
        maxSpeed: 60,
        pitchSensitivity: 1.5,
        rollSensitivity: 2.0,
        turnSensitivity: 0.5,
        autoLevelForce: 0.95,
        maxPitchAngle: Math.PI / 4,
        maxRollAngle: Math.PI / 3,
        
        // Camera mode
        followCamera: true
    };
}

export function updatePlanePhysics(deltaTime, plane, flightControls) {
    // Create a quaternion for our current rotation
    const quaternion = new THREE.Quaternion();
    quaternion.setFromEuler(plane.rotation);
    
    // Create rotation quaternions for each axis
    const pitchDelta = flightControls.pitch * flightControls.pitchSensitivity * deltaTime;
    const pitchQuat = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(1, 0, 0), 
        pitchDelta
    );
    
    const rollDelta = flightControls.roll * flightControls.rollSensitivity * deltaTime;
    const rollQuat = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(0, 0, 1), 
        rollDelta
    );
    
    const yawQuat = new THREE.Quaternion().setFromAxisAngle(
        new THREE.Vector3(0, 1, 0), 
        flightControls.yaw
    );
    
    // Apply rotations in YXZ order
    quaternion.multiply(yawQuat).multiply(pitchQuat).multiply(rollQuat);
    
    // Convert back to Euler angles
    plane.rotation.setFromQuaternion(quaternion);
    
    // Enforce pitch limits
    if (plane.rotation.x > flightControls.maxPitchAngle) {
        plane.rotation.x = flightControls.maxPitchAngle;
    } else if (plane.rotation.x < -flightControls.maxPitchAngle) {
        plane.rotation.x = -flightControls.maxPitchAngle;
    }
    
    // Enforce roll limits
    if (plane.rotation.z > flightControls.maxRollAngle) {
        plane.rotation.z = flightControls.maxRollAngle;
    } else if (plane.rotation.z < -flightControls.maxRollAngle) {
        plane.rotation.z = -flightControls.maxRollAngle;
    }
    
    // Move forward based on current orientation and speed
    const forward = new THREE.Vector3(0, 0, 1);
    forward.applyQuaternion(quaternion);
    forward.multiplyScalar(flightControls.speed * deltaTime);
    
    plane.position.add(forward);
    
    // Prevent plane from going below ground
    if (plane.position.y < 1) {
        plane.position.y = 1;
    }
}