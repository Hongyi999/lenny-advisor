"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Line, Billboard } from "@react-three/drei";
import * as THREE from "three";
import { GUESTS, type GuestData } from "@/data/guests";
import { CONTINENT_DOTS } from "@/data/continentDots";

// --- Geometry ---

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

// Normalize angle to [-PI, PI]
function normalizeAngle(a: number): number {
  while (a > Math.PI) a -= 2 * Math.PI;
  while (a < -Math.PI) a += 2 * Math.PI;
  return a;
}

// Calculate what Y-rotation of the group places a point at (lat, lng) facing the camera (+Z)
function lngToRotY(lng: number): number {
  // In ll2v, theta = (lng+180) * PI/180.  x = -r*sin(phi)*cos(theta), z = r*sin(phi)*sin(theta)
  // For point to face camera (+Z), we need: groupRotY + theta = PI/2  (so sin is max)
  // → groupRotY = PI/2 - theta = PI/2 - (lng+180)*PI/180
  return Math.PI / 2 - ((lng + 180) * Math.PI) / 180;
}

// --- Sub-components ---

function GridSphere({ r }: { r: number }) {
  const lines = useMemo(() => makeGrid(r, 18, 36, 72), [r]);
  return (
    <group>
      {lines.map((pts, i) => (
        <Line
          key={i}
          points={pts}
          color="#c0b8aa"
          lineWidth={0.35}
          transparent
          opacity={0.1}
        />
      ))}
    </group>
  );
}

/** Dense dot-cloud filling continent shapes */
function ContinentCloud({ r }: { r: number }) {
  const geo = useMemo(() => {
    const pos = new Float32Array(CONTINENT_DOTS.length * 3);
    for (let i = 0; i < CONTINENT_DOTS.length; i++) {
      const v = ll2v(CONTINENT_DOTS[i][0], CONTINENT_DOTS[i][1], r + 0.004);
      pos[i * 3] = v.x;
      pos[i * 3 + 1] = v.y;
      pos[i * 3 + 2] = v.z;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, [r]);

  return (
    <points geometry={geo}>
      <pointsMaterial
        color="#8a8070"
        size={0.028}
        transparent
        opacity={0.65}
        sizeAttenuation
        depthWrite={false}
      />
    </points>
  );
}

/** All 302 guest markers as Points */
function GuestMarkers({ r, activeIdx }: { r: number; activeIdx: number }) {
  const geo = useMemo(() => {
    const pos = new Float32Array(GUESTS.length * 3);
    for (let i = 0; i < GUESTS.length; i++) {
      const v = ll2v(GUESTS[i].lat, GUESTS[i].lng, r + 0.012);
      pos[i * 3] = v.x;
      pos[i * 3 + 1] = v.y;
      pos[i * 3 + 2] = v.z;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, [r]);

  // Active guest highlight position
  const activePos = useMemo(() => {
    if (activeIdx < 0 || activeIdx >= GUESTS.length) return null;
    return ll2v(GUESTS[activeIdx].lat, GUESTS[activeIdx].lng, r + 0.014);
  }, [activeIdx, r]);

  return (
    <group>
      {/* All guest dots - warm gold */}
      <points geometry={geo}>
        <pointsMaterial
          color="#c8a050"
          size={0.035}
          transparent
          opacity={0.8}
          sizeAttenuation
          depthWrite={false}
        />
      </points>

      {/* Active guest: pulsing glow */}
      {activePos && <ActiveRing position={activePos} />}
    </group>
  );
}

function ActiveRing({ position }: { position: THREE.Vector3 }) {
  const ref = useRef<THREE.Mesh>(null);
  const t = useRef(0);

  useFrame((_, dt) => {
    if (!ref.current) return;
    t.current += dt;
    const s = 1 + Math.sin(t.current * 2.5) * 0.2;
    ref.current.scale.set(s, s, s);
  });

  return (
    <group position={position}>
      <Billboard>
        {/* Outer pulsing ring */}
        <mesh ref={ref}>
          <ringGeometry args={[0.06, 0.1, 32]} />
          <meshBasicMaterial
            color="#d4a853"
            transparent
            opacity={0.6}
            side={THREE.DoubleSide}
            depthWrite={false}
          />
        </mesh>
        {/* Inner solid dot */}
        <mesh>
          <circleGeometry args={[0.045, 20]} />
          <meshBasicMaterial
            color="#d4a853"
            transparent
            opacity={0.95}
            depthWrite={false}
          />
        </mesh>
      </Billboard>
    </group>
  );
}

/** Rotating group: auto-rotates + snaps to active guest front-center */
function RotatingScene({
  children,
  activeIdx,
}: {
  children: React.ReactNode;
  activeIdx: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const currentY = useRef(0);
  const targetY = useRef<number | null>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isIdle = useRef(true);

  useEffect(() => {
    if (activeIdx < 0 || activeIdx >= GUESTS.length) return;

    const g = GUESTS[activeIdx];
    // Compute target RELATIVE to current position (avoids wrap-around jump)
    const desiredY = lngToRotY(g.lng);
    const diff = normalizeAngle(desiredY - currentY.current);
    targetY.current = currentY.current + diff;
    isIdle.current = false;

    // After settling, resume idle rotation
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => {
      isIdle.current = true;
    }, 5000);

    return () => {
      if (idleTimer.current) clearTimeout(idleTimer.current);
    };
  }, [activeIdx]);

  useFrame((_, dt) => {
    if (!groupRef.current) return;

    if (targetY.current !== null) {
      const remaining = targetY.current - currentY.current;
      if (Math.abs(remaining) < 0.003) {
        currentY.current = targetY.current;
        targetY.current = null;
      } else {
        // Smooth ease toward target (no normalizeAngle needed — target is already nearby)
        currentY.current += remaining * Math.min(dt * 2.5, 0.06);
      }
    } else if (isIdle.current) {
      // Slow auto-rotation ~60s/rev
      currentY.current += dt * 0.1;
    }

    groupRef.current.rotation.y = currentY.current;
  });

  return <group ref={groupRef}>{children}</group>;
}

// --- Exported Globe ---

interface GlobeProps {
  onGuestChange?: (guest: GuestData, index: number) => void;
}

function Scene({ onGuestChange }: GlobeProps) {
  const [activeIdx, setActiveIdx] = useState(-1);
  const R = 2.0;

  useEffect(() => {
    function pick() {
      const idx = Math.floor(Math.random() * GUESTS.length);
      setActiveIdx(idx);
      onGuestChange?.(GUESTS[idx], idx);
    }
    const first = setTimeout(pick, 1200);
    const iv = setInterval(pick, 7000);
    return () => {
      clearTimeout(first);
      clearInterval(iv);
    };
  }, [onGuestChange]);

  return (
    <>
      <ambientLight intensity={0.6} />
      <RotatingScene activeIdx={activeIdx}>
        <GridSphere r={R} />
        <ContinentCloud r={R} />
        <GuestMarkers r={R} activeIdx={activeIdx} />
      </RotatingScene>
      <OrbitControls
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
        <Scene onGuestChange={onGuestChange} />
      </Canvas>
    </div>
  );
}
