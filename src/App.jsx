import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { Physics } from '@react-three/cannon';
import { Environment, OrbitControls } from '@react-three/drei';
import MainMenu from './components/MainMenu';
import HUD from './components/HUD';
import CarController from './components/CarController';
import { useGameStore } from './store';

function Track() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
      <planeGeometry args={[1000, 1000]} />
      <meshStandardMaterial color="#111" roughness={0.8} />
    </mesh>
  );
}

function GameScene() {
  return (
    <>
      <HUD />
      <Canvas shadows camera={{ position: [0, 5, -10], fov: 60 }}>
        <color attach="background" args={['#050510']} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 10]} intensity={1} castShadow />
        
        <Suspense fallback={null}>
          {/* We'll use a futuristic environment */}
          <Environment preset="night" />
          <Physics broadphase="sap" gravity={[0, -9.81, 0]}>
            <Track />
            <CarController position={[0, 2, 0]} />
          </Physics>
        </Suspense>
        
        {/* Basic camera controls for now, ideally the camera would follow the car */}
        <OrbitControls />
      </Canvas>
    </>
  );
}

function App() {
  const { gameState } = useGameStore();

  return (
    <div style={{ width: '100vw', height: '100vh', overflow: 'hidden' }}>
      {gameState === 'menu' && <MainMenu />}
      {gameState === 'playing' && <GameScene />}
    </div>
  );
}

export default App;
