import React from 'react';
import { useGameStore } from '../store';
import './HUD.css';

export default function HUD() {
  const { speed, nitro, isBoosting, setIsBoosting } = useGameStore();

  const handleNitroStart = () => {
    if (nitro > 0) setIsBoosting(true);
  };
  
  const handleNitroEnd = () => {
    setIsBoosting(false);
  };

  return (
    <div className="hud-container">
      <div className="speedometer pointer-events-none">
        <div className="speed-value">{Math.round(speed)}</div>
        <div className="speed-unit">KM/H</div>
      </div>
      
      <div className="bottom-hud">
        <div className="nitro-gauge-container pointer-events-none">
          <div className="nitro-label">NITRO</div>
          <div className={`nitro-bar-bg ${isBoosting ? 'boosting' : ''}`}>
            <div 
              className="nitro-fill" 
              style={{ 
                width: `${nitro}%`,
                backgroundColor: isBoosting ? '#fff' : '#00ffff',
                boxShadow: isBoosting ? '0 0 20px #fff' : '0 0 10px #00ffff'
              }}
            />
          </div>
        </div>

        <button 
          className="nitro-btn"
          onPointerDown={handleNitroStart}
          onPointerUp={handleNitroEnd}
          onPointerLeave={handleNitroEnd}
        >
          BOOST
        </button>
      </div>
    </div>
  );
}
