import { useRef, useEffect, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useGLTF, OrbitControls, Stars, Environment } from '@react-three/drei';
import * as THREE from 'three';

useGLTF.preload('/models/city.glb');
useGLTF.preload('/models/sun.glb');
useGLTF.preload('/models/moon.glb');

function City() {
  const { scene } = useGLTF('/models/city.glb');
  const ref = useRef();

  useEffect(() => {
    if (!ref.current) return;
    const box = new THREE.Box3().setFromObject(ref.current);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    const scale = 8 / maxDim;
    ref.current.scale.setScalar(scale);
    const center = new THREE.Vector3();
    box.getCenter(center);
    ref.current.position.set(-center.x * scale, -center.y * scale, -center.z * scale);
  }, [scene]);

  return <primitive ref={ref} object={scene} />;
}

function CelestialBody({ url, isDark, isLight, orbitRadius = 6, orbitY = 5 }) {
  const { scene } = useGLTF(url);
  const ref = useRef();
  const opacityRef = useRef(isLight ? 1 : 0);
  const angleRef = useRef(isLight ? Math.PI * 0.3 : Math.PI * 0.7);

  useEffect(() => {
    scene.traverse(child => {
      if (child.isMesh) {
        child.material = child.material.clone();
        child.material.transparent = true;
      }
    });
  }, [scene]);

  useFrame((state, delta) => {
    if (!ref.current) return;

    // Smooth opacity transition
    const target = (url.includes('sun') ? isLight : isDark) ? 1 : 0;
    opacityRef.current += (target - opacityRef.current) * delta * 2;

    scene.traverse(child => {
      if (child.isMesh) child.material.opacity = opacityRef.current;
    });

    // Slow orbit
    angleRef.current += delta * 0.12;
    ref.current.position.set(
      Math.cos(angleRef.current) * orbitRadius,
      orbitY,
      Math.sin(angleRef.current) * orbitRadius * 0.4 - 2
    );

    // Gentle self-rotation
    ref.current.rotation.y += delta * 0.3;
  });

  useEffect(() => {
    const box = new THREE.Box3().setFromObject(scene);
    const size = new THREE.Vector3();
    box.getSize(size);
    const maxDim = Math.max(size.x, size.y, size.z);
    if (maxDim > 0) {
      const s = 1.8 / maxDim;
      scene.scale.setScalar(s);
    }
  }, [scene]);

  return <primitive ref={ref} object={scene} />;
}

/* eslint-disable react-hooks/immutability */
function Glow({ isDark }) {
  const { scene } = useThree();

  useEffect(() => {
    scene.background = new THREE.Color(isDark ? '#0a0f1e' : '#e8f0ff');
    scene.fog = isDark
      ? new THREE.Fog('#0a0f1e', 20, 60)
      : new THREE.Fog('#e8f0ff', 25, 70);
  }, [isDark, scene]);

  return null;
}
/* eslint-enable react-hooks/immutability */

function Lights({ isDark }) {
  const sunRef = useRef();
  const angleRef = useRef(Math.PI * 0.3);

  useFrame((_, delta) => {
    angleRef.current += delta * 0.12;
    if (sunRef.current) {
      sunRef.current.position.set(
        Math.cos(angleRef.current) * 6,
        5,
        Math.sin(angleRef.current) * 2.4 - 2
      );
    }
  });

  return (
    <>
      <ambientLight intensity={isDark ? 0.25 : 0.6} color={isDark ? '#3b4a6b' : '#ffffff'} />
      <directionalLight
        ref={sunRef}
        intensity={isDark ? 0.4 : 1.4}
        color={isDark ? '#6366f1' : '#ffe566'}
        castShadow
      />
      <pointLight
        position={[0, 3, 0]}
        intensity={isDark ? 0.8 : 0.2}
        color={isDark ? '#818cf8' : '#3b82f6'}
        distance={15}
      />
    </>
  );
}

function Ground({ isDark }) {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.05, 0]} receiveShadow>
      <planeGeometry args={[40, 40]} />
      <meshStandardMaterial
        color={isDark ? '#111827' : '#dbeafe'}
        transparent
        opacity={0.6}
      />
    </mesh>
  );
}

export default function CityScene({ isDark }) {
  return (
    <div style={{ width: '100%', height: '100%', borderRadius: 'inherit' }}>
      <Canvas
        shadows
        camera={{ position: [0, 6, 16], fov: 42 }}
        gl={{ antialias: true, alpha: false }}
        dpr={[1, 1.5]}
      >
        <Glow isDark={isDark} />
        <Lights isDark={isDark} />
        <Ground isDark={isDark} />

        <Suspense fallback={null}>
          <City />
          <CelestialBody
            url="/models/sun.glb"
            isDark={isDark}
            isLight={!isDark}
            orbitRadius={6}
            orbitY={5}
          />
          <CelestialBody
            url="/models/moon.glb"
            isDark={isDark}
            isLight={isDark}
            orbitRadius={6}
            orbitY={5}
          />
        </Suspense>

        {isDark && (
          <Stars
            radius={60}
            depth={30}
            count={2500}
            factor={3}
            saturation={0.3}
            fade
            speed={0.5}
          />
        )}

        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate
          autoRotateSpeed={0.6}
          maxPolarAngle={Math.PI / 2.1}
          minPolarAngle={Math.PI / 6}
        />
      </Canvas>
    </div>
  );
}
