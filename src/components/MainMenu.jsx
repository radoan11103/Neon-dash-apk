import React from 'react';
import { useGameStore, CARS } from '../store';
import './MainMenu.css';

export default function MainMenu() {
  const { setGameState, selectedCar, setSelectedCar } = useGameStore();

  const handleStart = () => {
    setGameState('playing');
  };

  return (
    <div className="main-menu-container">
      <div className="overlay-blur" />
      
      <div className="menu-content">
        <h1 className="game-title">NEON <span className="title-highlight">DASH</span></h1>
        
        <div className="car-selection">
          <h2>Select Your Ride</h2>
          <div className="car-cards">
            {Object.values(CARS).map((car) => (
              <div 
                key={car.id} 
                className={`car-card ${selectedCar.id === car.id ? 'selected' : ''}`}
                onClick={() => setSelectedCar(car.id)}
              >
                <h3>{car.name}</h3>
                <div className="car-stats">
                  <div className="stat-row">
                    <span>Top Speed:</span>
                    <div className="stat-bar"><div className="stat-fill" style={{width: `${(car.maxSpeed / 600) * 100}%`}}></div></div>
                    <span>{car.maxSpeed} km/h</span>
                  </div>
                  <div className="stat-row">
                    <span>Acceleration:</span>
                    <div className="stat-bar"><div className="stat-fill" style={{width: `${(car.acceleration / 30) * 100}%`}}></div></div>
                  </div>
                  <div className="stat-row">
                    <span>Handling:</span>
                    <div className="stat-bar"><div className="stat-fill" style={{width: `${(car.handling / 20) * 100}%`}}></div></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button className="start-btn" onClick={handleStart}>START ENGINE</button>
      </div>
    </div>
  );
}
