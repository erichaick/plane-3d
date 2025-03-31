import * as THREE from 'three';

export function createExplosion(position, size = 1) {
    const explosion = new THREE.Group();
    explosion.position.copy(position);
    
    // Explosion parameters
    const particleCount = 30;
    const explosionDuration = 1.5; // seconds
    const maxExpansion = 10 * size;
    
    // Create particles
    const particles = [];
    const particleGeometry = new THREE.SphereGeometry(0.3 * size, 8, 8);
    
    // Different colors for explosion particles
    const particleMaterials = [
        new THREE.MeshBasicMaterial({ color: 0xff5500 }), // Orange
        new THREE.MeshBasicMaterial({ color: 0xff0000 }), // Red
        new THREE.MeshBasicMaterial({ color: 0xffff00 })  // Yellow
    ];
    
    // Create point light for glow effect
    const light = new THREE.PointLight(0xff5500, 5, 20 * size);
    explosion.add(light);
    
    // Create particles in random directions
    for (let i = 0; i < particleCount; i++) {
        const particle = new THREE.Mesh(
            particleGeometry,
            particleMaterials[Math.floor(Math.random() * particleMaterials.length)]
        );
        
        // Random direction
        const direction = new THREE.Vector3(
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2,
            (Math.random() - 0.5) * 2
        ).normalize();
        
        // Random speed
        const speed = 2 + Math.random() * 8;
        
        // Store particle data
        particles.push({
            mesh: particle,
            direction: direction,
            speed: speed,
            rotationSpeed: Math.random() * 0.2 - 0.1
        });
        
        explosion.add(particle);
    }
    
    // Add a central flash sphere
    const flashGeometry = new THREE.SphereGeometry(2 * size, 16, 16);
    const flashMaterial = new THREE.MeshBasicMaterial({ 
        color: 0xffffff,
        transparent: true,
        opacity: 1
    });
    const flash = new THREE.Mesh(flashGeometry, flashMaterial);
    explosion.add(flash);
    
    // Time tracking
    let elapsedTime = 0;
    
    // Update function
    explosion.update = function(deltaTime) {
        elapsedTime += deltaTime;
        
        if (elapsedTime > explosionDuration) {
            // Remove all particles
            while (explosion.children.length > 0) {
                const child = explosion.children[0];
                explosion.remove(child);
                if (child.geometry) child.geometry.dispose();
                if (child.material) child.material.dispose();
            }
            return false; // Explosion is complete
        }
        
        // Calculate progress (0 to 1)
        const progress = elapsedTime / explosionDuration;
        
        // Update flash
        if (flash) {
            flash.scale.set(1 + progress * 3, 1 + progress * 3, 1 + progress * 3);
            flash.material.opacity = 1 - (progress * 2); // Fade out faster than the duration
            
            if (flash.material.opacity <= 0) {
                explosion.remove(flash);
                flash.geometry.dispose();
                flash.material.dispose();
                flash = null;
            }
        }
        
        // Update light
        if (light) {
            light.intensity = 5 * (1 - progress);
            light.distance = 20 * size * (1 + progress);
        }
        
        // Update particles
        for (let i = 0; i < particles.length; i++) {
            const particle = particles[i];
            
            // Move particle outward
            const distance = particle.speed * progress * maxExpansion;
            particle.mesh.position.copy(particle.direction).multiplyScalar(distance);
            
            // Rotate particle
            particle.mesh.rotation.x += particle.rotationSpeed;
            particle.mesh.rotation.y += particle.rotationSpeed;
            
            // Shrink particle over time
            const scale = 1 - (progress * 0.8);
            particle.mesh.scale.set(scale, scale, scale);
            
            // Fade out particle
            if (particle.mesh.material.opacity !== undefined) {
                particle.mesh.material.opacity = 1 - progress;
            }
        }
        
        return true; // Explosion is still active
    };
    
    return explosion;
}