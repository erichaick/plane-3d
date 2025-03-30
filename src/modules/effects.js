import * as THREE from 'three';
import { scene } from './scene.js';

export function createExplosion(position) {
    // Create particle system for explosion
    const particleCount = 50;
    const particles = new THREE.BufferGeometry();
    
    const positions = new Float32Array(particleCount * 3);
    const colors = new Float32Array(particleCount * 3);
    const sizes = new Float32Array(particleCount);
    
    const color = new THREE.Color();
    
    for (let i = 0; i < particleCount; i++) {
        // Random position within sphere
        const x = (Math.random() - 0.5) * 2;
        const y = (Math.random() - 0.5) * 2;
        const z = (Math.random() - 0.5) * 2;
        
        positions[i * 3] = x;
        positions[i * 3 + 1] = y;
        positions[i * 3 + 2] = z;
        
        // Color gradient from yellow to red
        const ratio = Math.random();
        color.setHSL(0.1 - ratio * 0.1, 1.0, 0.5);
        
        colors[i * 3] = color.r;
        colors[i * 3 + 1] = color.g;
        colors[i * 3 + 2] = color.b;
        
        // Random size
        sizes[i] = Math.random() * 2 + 1;
    }
    
    particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    particles.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    particles.setAttribute('size', new THREE.BufferAttribute(sizes, 1));
    
    const particleMaterial = new THREE.PointsMaterial({
        size: 1,
        vertexColors: true,
        blending: THREE.AdditiveBlending,
        transparent: true,
        sizeAttenuation: true
    });
    
    const particleSystem = new THREE.Points(particles, particleMaterial);
    particleSystem.position.copy(position);
    
    // Add to scene
    scene.add(particleSystem);
    
    // Animate explosion
    const explosionData = {
        system: particleSystem,
        velocity: [],
        timeCreated: Date.now(),
        update: function(deltaTime) {
            const positions = particleSystem.geometry.attributes.position.array;
            
            // Initialize velocities if needed
            if (this.velocity.length === 0) {
                for (let i = 0; i < particleCount; i++) {
                    this.velocity.push({
                        x: (Math.random() - 0.5) * 10,
                        y: (Math.random() - 0.5) * 10,
                        z: (Math.random() - 0.5) * 10
                    });
                }
            }
            
            // Update particle positions
            for (let i = 0; i < particleCount; i++) {
                positions[i * 3] += this.velocity[i].x * deltaTime;
                positions[i * 3 + 1] += this.velocity[i].y * deltaTime;
                positions[i * 3 + 2] += this.velocity[i].z * deltaTime;
            }
            
            particleSystem.geometry.attributes.position.needsUpdate = true;
            
            // Fade out
            const age = Date.now() - this.timeCreated;
            if (age < 1000) {
                particleSystem.material.opacity = 1.0;
            } else {
                particleSystem.material.opacity = 1.0 - (age - 1000) / 1000;
            }
            
            // Remove when done
            if (age > 2000) {
                scene.remove(particleSystem);
                return false;
            }
            
            return true;
        }
    };
    
    return explosionData;
}