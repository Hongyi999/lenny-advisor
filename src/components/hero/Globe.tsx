"use client";

import { useRef, useMemo, useState, useEffect, useCallback } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { OrbitControls, Line, Billboard } from "@react-three/drei";
import * as THREE from "three";
import { GUESTS, type GuestData } from "@/data/guests";
import { CONTINENT_DOTS } from "@/data/continentDots";

// --- Geometry helpers ---

function ll2v(lat: number, lng: number, r: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(r * Math.sin(phi) * Math.cos(theta)),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

function makeGrid(
  r: number,
  latN: number,
  lngN: number,
  seg: number
): [number, number, number][][] {
  const out: [number, number, number][][] = [];
  for (let i = 0; i <= latN; i++) {
    const lat = -90 + (180 * i) / latN;
    const pts: [number, number, number][] = [];
    for (let j = 0; j <= seg; j++) {
      const v = ll2v(lat, -180 + (360 * j) / seg, r);
      pts.push([v.x, v.y, v.z]);
    }
    out.push(pts);
  }
  for (let j = 0; j <= lngN; j++) {
    const lng = -180 + (360 * j) / lngN;
    const pts: [number, number, number][] = [];
    for (let i = 0; i <= seg; i++) {
      const v = ll2v(-90 + (180 * i) / seg, lng, r);
      pts.push([v.x, v.y, v.z]);
    }
    out.push(pts);
  }
  return out;
}

// --- Sub-components ---

/** Wireframe grid sphere - very faint lines */
function GridSphere({ r }: { r: number }) {
  const major = useMemo(() => makeGrid(r, 18, 36, 72), [r]);
  return (
    <group>
      {major.map((pts, i) => (
        <Line
          key={`g${i}`}
          points={pts}
          color="#b5ad9e"
          lineWidth={0.4}
          transparent
          opacity={0.12}
        />
      ))}
    </group>
  );
}

/** Continent dot cloud - dense dots filling continent shapes */
function ContinentDots({ r }: { r: number }) {
  const geometry = useMemo(() => {
    const positions = new Float32Array(CONTINENT_DOTS.length * 3);
    for (let i = 0; i < CONTINENT_DOTS.length; i++) {
      const [lat, lng] = CONTINENT_DOTS[i];
      const v = ll2v(lat, lng, r + 0.005);
      positions[i * 3] = v.x;
      positions[i * 3 + 1] = v.y;
      positions[i * 3 + 2] = v.z;
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [r]);

  return (
    <points geometry={geometry}>
      <pointsMaterial
        color="#9a9285"
        size={0.018}
        transparent
        opacity={0.55}
        sizeAttenuation
      />
    </points>
  );
}

/** Dot for active guest highlight - warm glow ring */
function ActiveGlow({ position }: { position: THREE.Vector3 }) {
  const ringRef = useRef<THREE.Mesh>(null);
  const elapsed = useRef(0);

  useFrame((_, dt) => {
    if (!ringRef.current) return;
    elapsed.current += dt;
    const s = 1 + Math.sin(elapsed.current * 3) * 0.15;
    ringRef.current.scale.set(s, s, s);
  });

  return (
    <group position={position}>
      <Billboard>
        {/* Outer glow */}
        <mesh ref={ringRef}>
          <ringGeometry args={[0.04, 0.08, 32]} />
          <meshBasicMaterial
            color="#d4a853"
            transparent
            opacity={0.5}
            side={THREE.DoubleSide}
          />
        </mesh>
        {/* Inner filled dot */}
        <mesh>
          <circleGeometry args={[0.03, 16]} />
          <meshBasicMaterial color="#d4a853" transparent opacity={0.9} />
        </mesh>
      </Billboard>
    </group>
  );
}

/** All guest markers as a single Points mesh for performance */
function GuestPoints({ r, activeIdx }: { r: number; activeIdx: number }) {
  const positions = useMemo(() => {
    const arr = new Float32Array(GUESTS.length * 3);
    for (let i = 0; i < GUESTS.length; i++) {
      const v = ll2v(GUESTS[i].lat, GUESTS[i].lng, r + 0.015);
      arr[i * 3] = v.x;
      arr[i * 3 + 1] = v.y;
      arr[i * 3 + 2] = v.z;
    }
    return arr;
  }, [r]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    return geo;
  }, [positions]);

  const activePos = useMemo(() => {
    if (activeIdx < 0 || activeIdx >= GUESTS.length) return null;
    return ll2v(GUESTS[activeIdx].lat, GUESTS[activeIdx].lng, r + 0.015);
  }, [activeIdx, r]);

  return (
    <group>
      {/* All guest dots */}
      <points geometry={geometry}>
        <pointsMaterial
          color="#c4a060"
          size={0.025}
          transparent
          opacity={0.7}
          sizeAttenuation
        />
      </points>
      {/* Active guest highlight */}
      {activePos && <ActiveGlow position={activePos} />}
    </group>
  );
}

/** Rotating scene that smoothly rotates to show active guest front-center */
function RotatingScene({
  children,
  activeIdx,
  controlsRef,
}: {
  children: React.ReactNode;
  activeIdx: number;
  controlsRef: React.RefObject<any>;
}) {
  const ref = useRef<THREE.Group>(null);
  const targetY = useRef<number | null>(null);
  const currentY = useRef(0);
  const autoRotate = useRef(true);

  useEffect(() => {
    if (activeIdx >= 0 && activeIdx < GUESTS.length) {
      const g = GUESTS[activeIdx];
      // Target: rotate globe so guest's longitude faces the camera
      // Camera is at z+, so we need guest at lng=0 relative to view
      // Globe rotation Y: -lng - 90 degrees (offset for the coordinate mapping)
      targetY.current = (-g.lng - 90) * (Math.PI / 180);
      autoRotate.current = false;
    }
  }, [activeIdx]);

  useFrame((_, dt) => {
    if (!ref.current) return;

    if (targetY.current !== null) {
      // Smooth lerp to target
      let d = targetY.current - currentY.current;
      // Normalize to [-PI, PI]
      d = ((d + Math.PI) % (2 * Math.PI)) - Math.PI;
      if (d < -Math.PI) d += 2 * Math.PI;

      if (Math.abs(d) < 0.005) {
        currentY.current = targetY.current;
        targetY.current = null;
        // Resume auto-rotate after a pause
        setTimeout(() => {
          autoRotate.current = true;
        }, 4000);
      } else {
        currentY.current += d * Math.min(dt * 2.0, 0.08);
      }
    } else if (autoRotate.current) {
      // Slow auto-rotation: ~60s per revolution
      currentY.current += dt * 0.105;
    }

    ref.current.rotation.y = currentY.current;
  });

  return <group ref={ref}>{children}</group>;
}

// --- Main ---

interface GlobeProps {
  onGuestChange?: (guest: GuestData, index: number) => void;
}

function GlobeScene({ onGuestChange }: GlobeProps) {
  const [activeIdx, setActiveIdx] = useState(-1);
  const controlsRef = useRef<any>(null);
  const R = 2.0;

  useEffect(() => {
    function cycle() {
      const idx = Math.floor(Math.random() * GUESTS.length);
      setActiveIdx(idx);
      onGuestChange?.(GUESTS[idx], idx);
    }
    // First spotlight after a short delay
    const first = setTimeout(cycle, 1500);
    const iv = setInterval(cycle, 7000);
    return () => {
      clearTimeout(first);
      clearInterval(iv);
    };
  }, [onGuestChange]);

  return (
    <>
      <ambientLight intensity={0.6} />
      <RotatingScene activeIdx={activeIdx} controlsRef={controlsRef}>
        <GridSphere r={R} />
        <ContinentDots r={R} />
        <GuestPoints r={R} activeIdx={activeIdx} />
      </RotatingScene>
      <OrbitControls
        ref={controlsRef}
        enableZoom={false}
        enablePan={false}
        rotateSpeed={0.3}
        minPolarAngle={Math.PI * 0.3}
        maxPolarAngle={Math.PI * 0.7}
      />
    </>
  );
}

export default function Globe({ onGuestChange }: GlobeProps) {
  return (
    <div className="w-full h-[500px] sm:h-[580px] md:h-[660px] lg:h-[720px]">
      <Canvas
        camera={{ position: [0, 0.2, 5.0], fov: 38 }}
        style={{ background: "transparent" }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 1.5]}
      >
        <GlobeScene onGuestChange={onGuestChange} />
      </Canvas>
    </div>
  );
}
