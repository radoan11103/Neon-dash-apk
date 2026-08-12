import { create } from 'zustand';

export const CARS = {
  BUGATTI: {
    id: 'bugatti',
    name: 'Bugatti Chiron Super Sport 300+',
    maxSpeed: 450, // km/h
    acceleration: 20,
    handling: 15,
  },
  DEVEL: {
    id: 'devel',
    name: 'Devel Sixteen',
    maxSpeed: 551, // km/h
    acceleration: 25,
    handling: 10,
  }
};

export const useGameStore = create((set, get) => ({
  gameState: 'menu', // menu, playing, gameover
  selectedCar: CARS.BUGATTI,
  speed: 0,
  nitro: 100,
  isBoosting: false,
  
  setGameState: (state) => set({ gameState: state }),
  setSelectedCar: (carId) => set({ selectedCar: CARS[carId.toUpperCase()] || CARS.BUGATTI }),
  setSpeed: (speed) => set({ speed: Math.max(0, speed) }),
  setNitro: (nitro) => set({ nitro: Math.max(0, Math.min(100, nitro)) }),
  setIsBoosting: (isBoosting) => set({ isBoosting }),
  
  resetGame: () => set({
    speed: 0,
    nitro: 100,
    isBoosting: false,
  })
}));
