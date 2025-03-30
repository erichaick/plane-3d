import * as THREE from 'three';
import { scene } from './scene.js';
import { ufoManager } from './ufo.js';
import { createExplosion } from './effects.js';
import { gameState } from './gameState.js';
import { ui } from './ui.js';

export const shootingSystem = {
    bullets: [],
    bulletSpeed: 100,
    lastShootTime: 0,
    shootInterval: 250, // ms between shots
    
    init(plane) {
        this.plane = plane;
        
        // Add shooting key listener
        window.addEventListener('keydown', (e) => {
            if (e.key === ' ' || e.key === 'Space') {
                this.shoot();
            }
        });
    },
    
    shoot() {
        const currentTime = Date.now();
        if (currentTime - this.lastShootTime < this.shootInterval) return;
        
        this.lastShootTime = currentTime;
        
        // Create bullet
        const bulletGeometry = new THREE.SphereGeometry(0.2, 8, 8);
        const bulletMaterial = new THREE.MeshBasicMaterial({ color: 0xff0000 });
        const bullet = new THREE.Mesh(bulletGeometry, bulletMaterial);
        
        // Position bullet at plane's nose
        const bulletOffset = new THREE.Vector3(0, 0, 1);
        bulletOffset.applyQuaternion(this.plane.quaternion);
        bullet.position.copy(this.plane.position).add(bulletOffset);
        
        // Set bullet direction based on plane's orientation
        const direction = new THREE.Vector3(0, 0, 1);
        direction.applyQuaternion(this.plane.quaternion);
        bullet.userData = { direction, timeCreated: currentTime };
        
        scene.add(bullet);
        this.bullets.push(bullet);
        
        // Play shooting sound (to be added in milestone 5)
    },
    
    update(deltaTime, plane) {
        const currentTime = Date.now();
        
        // Move bullets
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            const direction = bullet.userData.direction;
            
            // Move bullet forward
            bullet.position.x += direction.x * this.bulletSpeed * deltaTime;
            bullet.position.y += direction.y * this.bulletSpeed * deltaTime;
            bullet.position.z += direction.z * this.bulletSpeed * deltaTime;
            
            // Check for collisions with UFOs
            let hitUFO = false;
            for (const ufo of ufoManager.ufos) {
                const distance = bullet.position.distanceTo(ufo.position);
                if (distance < 5) { // UFO hit radius
                    hitUFO = true;
                    
                    // Damage UFO
                    ufo.userData.health -= 25;
                    
                    // If UFO is destroyed
                    if (ufo.userData.health <= 0) {
                        // Create explosion
                        const explosion = createExplosion(ufo.position);
                        gameState.explosions.push(explosion);
                        
                        // Remove UFO
                        ufoManager.removeUFO(ufo);
                        
                        // Update score
                        gameState.score += 100;
                        ui.updateScore(gameState.score);
                    }
                    
                    break;
                }
            }
            
            // Remove bullet if it hit something or is too old
            const bulletAge = currentTime - bullet.userData.timeCreated;
            if (hitUFO || bulletAge > 3000) {
                scene.remove(bullet);
                this.bullets.splice(i, 1);
            }
        }
    }
};