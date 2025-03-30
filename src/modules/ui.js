export let ui;

export function createUI(flightControls) {
    const uiContainer = document.createElement('div');
    uiContainer.style.position = 'absolute';
    uiContainer.style.bottom = '20px';
    uiContainer.style.left = '20px';
    uiContainer.style.color = 'white';
    uiContainer.style.fontFamily = 'Arial, sans-serif';
    uiContainer.style.padding = '10px';
    uiContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    uiContainer.style.borderRadius = '5px';
    uiContainer.style.userSelect = 'none';
    
    uiContainer.innerHTML = `
        <h3 style="margin: 0 0 10px 0;">Controls</h3>
        <div>W/S: Pitch up/down</div>
        <div>A/D: Roll left/right</div>
        <div>Q/E: Decrease/Increase speed</div>
        <div>C: Toggle camera mode</div>
    `;
    
    document.body.appendChild(uiContainer);
    
    // Speed indicator
    const speedContainer = document.createElement('div');
    speedContainer.style.position = 'absolute';
    speedContainer.style.top = '20px';
    speedContainer.style.right = '20px';
    speedContainer.style.color = 'white';
    speedContainer.style.fontFamily = 'Arial, sans-serif';
    speedContainer.style.padding = '10px';
    speedContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    speedContainer.style.borderRadius = '5px';
    speedContainer.style.userSelect = 'none';
    speedContainer.id = 'speed-indicator';
    
    // Score display
    const scoreContainer = document.createElement('div');
    scoreContainer.style.position = 'absolute';
    scoreContainer.style.top = '20px';
    scoreContainer.style.left = '20px';
    scoreContainer.style.color = 'white';
    scoreContainer.style.fontFamily = 'Arial, sans-serif';
    scoreContainer.style.padding = '10px';
    scoreContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    scoreContainer.style.borderRadius = '5px';
    scoreContainer.style.userSelect = 'none';
    scoreContainer.id = 'score-display';
    scoreContainer.innerHTML = `<h3 style="margin: 0;">Score: 0</h3>`;
    
    document.body.appendChild(speedContainer);
    document.body.appendChild(scoreContainer);
    
    ui = {
        updateSpeedIndicator: (speed) => {
            const speedPercent = (speed - flightControls.minSpeed) / 
                                (flightControls.maxSpeed - flightControls.minSpeed);
            
            // Color coding: green for medium speed, blue for slow, red for fast
            let color;
            if (speedPercent < 0.3) color = '#4287f5'; // Blue for slow
            else if (speedPercent > 0.7) color = '#f54242'; // Red for fast
            else color = '#42f54e'; // Green for medium
            
            speedContainer.innerHTML = `
                <h3 style="margin: 0 0 10px 0;">Speed</h3>
                <div style="width: 100px; height: 20px; background-color: #333; border-radius: 10px; overflow: hidden;">
                    <div style="width: ${speedPercent * 100}%; height: 100%; background-color: ${color};"></div>
                </div>
                <div style="text-align: center; margin-top: 5px;">${Math.round(speed)}</div>
            `;
        },
        
        updateScore: (score) => {
            scoreContainer.innerHTML = `<h3 style="margin: 0;">Score: ${score}</h3>`;
        }
    };
    
    return ui;
}