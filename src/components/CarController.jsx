import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { useRaycastVehicle, useBox, useCylinder } from '@react-three/cannon';
import { useGameStore } from '../store';
import * as THREE from 'three';

export default function CarController({ position = [0, 1, 0] }) {
  const { selectedCar, setSpeed, isBoosting } = useGameStore();
  
  // Chassis physics body
  const chassisWidth = 2;
  const chassisHeight = 1;
  const chassisLength = 4.5;
  const chassisArgs = [chassisWidth, chassisHeight, chassisLength];
  
  const [chassisRef, chassisApi] = useBox(() => ({
    mass: 1500,
    position,
    args: chassisArgs,
    allowSleep: false,
  }));

  // Wheel physics bodies
  const wheelRadius = 0.4;
  const wheelWidth = 0.4;
  const wheelInfo = {
    radius: wheelRadius,
    directionLocal: [0, -1, 0],
    axleLocal: [-1, 0, 0],
    suspensionStiffness: 30,
    suspensionRestLength: 0.3,
    frictionSlip: 1.5,
    dampingRelaxation: 2.3,
    dampingCompression: 4.4,
    maxSuspensionForce: 100000,
    rollInfluence: 0.01,
    maxSuspensionTravel: 0.3,
    customSlidingRotationalSpeed: -30,
    useCustomSlidingRotationalSpeed: true,
  };

  const useWheel = (props) => useCylinder(() => ({
    mass: 20,
    type: 'Kinematic',
    material: 'wheel',
    collisionFilterGroup: 0,
    args: [wheelRadius, wheelRadius, wheelWidth, 16],
    ...props
  }));

  const [wheel1Ref] = useWheel({ position: [-1, 0, 1.5] }); // Front Left
  const [wheel2Ref] = useWheel({ position: [1, 0, 1.5] }); // Front Right
  const [wheel3Ref] = useWheel({ position: [-1, 0, -1.5] }); // Back Left
  const [wheel4Ref] = useWheel({ position: [1, 0, -1.5] }); // Back Right

  const wheelRefs = [wheel1Ref, wheel2Ref, wheel3Ref, wheel4Ref];

  const vehicleInfo = {
    chassisBody: chassisRef,
    wheels: wheelRefs,
    wheelInfos: [
      { ...wheelInfo, chassisConnectionPointLocal: [-1, -0.1, 1.5], isFrontWheel: true },
      { ...wheelInfo, chassisConnectionPointLocal: [1, -0.1, 1.5], isFrontWheel: true },
      { ...wheelInfo, chassisConnectionPointLocal: [-1, -0.1, -1.5], isFrontWheel: false },
      { ...wheelInfo, chassisConnectionPointLocal: [1, -0.1, -1.5], isFrontWheel: false },
    ],
    indexForwardAxis: 2,
    indexRightAxis: 0,
    indexUpAxis: 1,
  };

  const [vehicleRef, vehicleApi] = useRaycastVehicle(() => vehicleInfo);

  // Controls state
  const controls = useRef({
    forward: false,
    backward: false,
    left: false,
    right: false,
    steerValue: 0,
    tiltAngle: 0, // for mobile tilt-to-steer
  });

  // Setup DeviceOrientation for Tilt-to-Steer
  useEffect(() => {
    const handleOrientation = (e) => {
      if (e.gamma !== null) {
        // gamma is left-to-right tilt in degrees, where right is positive
        const tilt = Math.max(-45, Math.min(45, e.gamma)); // clamp to 45 deg
        controls.current.tiltAngle = tilt;
      }
    };
    
    // Request permission if on iOS 13+
    if (typeof DeviceOrientationEvent !== 'undefined' && typeof DeviceOrientationEvent.requestPermission === 'function') {
      // Typically needs a user interaction first, but we will attach it anyway
      window.addEventListener('deviceorientation', handleOrientation);
    } else {
      window.addEventListener('deviceorientation', handleOrientation);
    }

    return () => window.removeEventListener('deviceorientation', handleOrientation);
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e) => {
      switch(e.code) {
        case 'ArrowUp':
        case 'KeyW': controls.current.forward = true; break;
        case 'ArrowDown':
        case 'KeyS': controls.current.backward = true; break;
        case 'ArrowLeft':
        case 'KeyA': controls.current.left = true; break;
        case 'ArrowRight':
        case 'KeyD': controls.current.right = true; break;
      }
    };
    const handleKeyUp = (e) => {
      switch(e.code) {
        case 'ArrowUp':
        case 'KeyW': controls.current.forward = false; break;
        case 'ArrowDown':
        case 'KeyS': controls.current.backward = false; break;
        case 'ArrowLeft':
        case 'KeyA': controls.current.left = false; break;
        case 'ArrowRight':
        case 'KeyD': controls.current.right = false; break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Physics Loop
  useFrame(() => {
    const { forward, backward, left, right, tiltAngle } = controls.current;
    const { maxSpeed, acceleration, handling } = selectedCar;
    
    // Auto-accelerate for arcade feel if not braking
    const force = isBoosting ? acceleration * 150 : acceleration * 100;
    const maxEngineForce = 3000;
    
    let engineForce = 0;
    if (forward || (!backward && !left && !right)) {
        engineForce = -force;
    } else if (backward) {
        engineForce = force;
    }

    // Apply Engine Force (Rear wheel drive)
    vehicleApi.applyEngineForce(engineForce, 2);
    vehicleApi.applyEngineForce(engineForce, 3);
    
    // Steering logic (combine keyboard + tilt)
    const steeringSens = handling * 0.05;
    let targetSteer = 0;
    if (left) targetSteer = steeringSens;
    if (right) targetSteer = -steeringSens;
    
    if (!left && !right && tiltAngle !== 0) {
      targetSteer = -(tiltAngle / 45) * steeringSens;
    }

    controls.current.steerValue = THREE.MathUtils.lerp(controls.current.steerValue, targetSteer, 0.1);
    
    vehicleApi.setSteeringValue(controls.current.steerValue, 0);
    vehicleApi.setSteeringValue(controls.current.steerValue, 1);

    // Update Speed in HUD
    const velocity = useRef([0,0,0]);
    chassisApi.velocity.subscribe((v) => velocity.current = v);
    const currentSpeed = Math.sqrt(velocity.current[0]**2 + velocity.current[1]**2 + velocity.current[2]**2) * 3.6; // m/s to km/h
    setSpeed(currentSpeed);
    
    // Nitro Logic
    const currentNitro = useGameStore.getState().nitro;
    if (isBoosting) {
      if (currentNitro > 0) {
        useGameStore.getState().setNitro(currentNitro - 0.5); // Deplete
      } else {
        useGameStore.getState().setIsBoosting(false);
      }
    } else {
      if (currentNitro < 100) {
        useGameStore.getState().setNitro(currentNitro + 0.1); // Regenerate
      }
    }

    // Limit Top Speed
    const currentMaxSpeed = isBoosting ? maxSpeed * 1.3 : maxSpeed;
    if (currentSpeed > currentMaxSpeed) {
      const reduction = currentMaxSpeed / currentSpeed;
      chassisApi.velocity.set(velocity.current[0] * reduction, velocity.current[1], velocity.current[2] * reduction);
    }
  });

  return (
    <group ref={vehicleRef}>
      {/* Chassis Mesh */}
      <mesh ref={chassisRef} castShadow>
        <boxGeometry args={chassisArgs} />
        <meshStandardMaterial color={selectedCar.id === 'bugatti' ? 'cyan' : '#ff0055'} emissive={isBoosting ? '#00ffff' : '#000'} emissiveIntensity={isBoosting ? 2 : 0} />
      </mesh>
      
      {/* Wheel Meshes */}
      {wheelRefs.map((wheelRef, i) => (
        <mesh ref={wheelRef} key={i}>
          <cylinderGeometry args={[wheelRadius, wheelRadius, wheelWidth, 16]} />
          <meshStandardMaterial color="#222" />
        </mesh>
      ))}
    </group>
  );
}
