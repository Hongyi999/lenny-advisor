"use client";

import { useRef, useMemo, useState, useEffect, useCallback } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Line, Billboard, Html } from "@react-three/drei";
import * as THREE from "three";
import { GUESTS, type GuestData } from "@/data/guests";

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

function makeGrid(r: number, latN: number, lngN: number, seg: number): [number, number, number][][] {
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

// Simplified continent outlines
const CONTINENTS: [number, number][][] = [
  // North America
  [[60,-140],[65,-168],[72,-168],[71,-155],[60,-147],[58,-136],[55,-130],[49,-125],[38,-122],[33,-117],[25,-110],[20,-105],[15,-92],[18,-88],[21,-87],[25,-80],[30,-81],[35,-75],[40,-74],[43,-70],[45,-67],[47,-60],[50,-56],[52,-55],[55,-60],[60,-65],[65,-62],[70,-55],[73,-57],[75,-80],[72,-95],[70,-100],[68,-110],[65,-140],[60,-140]],
  // South America
  [[12,-72],[10,-75],[8,-77],[5,-77],[2,-80],[-5,-80],[-8,-78],[-15,-75],[-20,-70],[-25,-65],[-30,-65],[-35,-58],[-40,-63],[-45,-65],[-50,-68],[-55,-67],[-55,-64],[-50,-60],[-45,-58],[-40,-57],[-35,-55],[-30,-50],[-25,-46],[-20,-40],[-15,-39],[-10,-37],[-5,-35],[0,-50],[5,-60],[8,-62],[10,-67],[12,-72]],
  // Europe
  [[36,-10],[38,-8],[40,-2],[43,0],[44,3],[43,8],[45,12],[40,18],[38,22],[35,25],[37,28],[40,27],[42,30],[44,28],[45,30],[48,18],[50,15],[52,8],[54,10],[56,12],[58,18],[60,20],[63,25],[66,26],[70,28],[68,20],[65,15],[60,5],[55,5],[52,4],[50,2],[48,-5],[45,-8],[42,-9],[38,-10],[36,-10]],
  // Africa
  [[35,-5],[37,10],[33,12],[30,32],[22,36],[15,42],[12,44],[5,42],[0,42],[-5,40],[-10,40],[-15,40],[-20,35],[-25,33],[-30,30],[-33,27],[-35,20],[-34,18],[-30,15],[-20,12],[-15,12],[-8,13],[-5,10],[0,10],[5,0],[5,-5],[10,-15],[15,-17],[20,-17],[25,-15],[30,-10],[35,-5]],
  // Asia
  [[42,30],[45,40],[40,50],[38,55],[35,52],[30,50],[25,55],[22,60],[25,65],[28,68],[30,70],[25,75],[20,73],[15,75],[10,78],[8,80],[5,80],[1,104],[5,105],[10,107],[15,108],[22,108],[25,120],[30,122],[35,130],[38,135],[42,132],[45,142],[50,140],[55,135],[60,140],[65,170],[70,175],[72,140],[70,90],[65,70],[60,60],[55,55],[50,40],[42,30]],
  // Australia
  [[-12,130],[-15,132],[-18,140],[-20,145],[-25,150],[-30,153],[-35,151],[-38,147],[-38,140],[-35,137],[-32,133],[-35,118],[-30,115],[-25,113],[-22,114],[-20,118],[-15,130],[-12,130]],
];

// Pick a subset of guests spread across the globe for display
const DISPLAY_GUESTS = (() => {
  const selected: GuestData[] = [];
  const buckets = new Map<string, GuestData[]>();
  for (const g of GUESTS) {
    const key = `${Math.round(g.lat / 15)}_${Math.round(g.lng / 30)}`;
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key)!.push(g);
  }
  for (const [, arr] of buckets) {
    selected.push(arr[Math.floor(Math.random() * arr.length)]);
    if (selected.length >= 20) break;
  }
  // Fill up to 20 if needed
  if (selected.length < 20) {
    for (const g of GUESTS) {
      if (!selected.includes(g)) {
        selected.push(g);
        if (selected.length >= 20) break;
      }
    }
  }
  return selected;
})();

// --- Sub-components ---

function GridSphere({ r }: { r: number }) {
  const major = useMemo(() => makeGrid(r, 24, 48, 80), [r]);
  const minor = useMemo(() => makeGrid(r - 0.002, 48, 96, 80), [r]);

  return (
    <group>
      {minor.map((pts, i) => (
        <Line key={`m${i}`} points={pts} color="#c0b8a8" lineWidth={0.3} transparent opacity={0.06} />
      ))}
      {major.map((pts, i) => (
        <Line key={`M${i}`} points={pts} color="#a09880" lineWidth={0.5} transparent opacity={0.15} />
      ))}
    </group>
  );
}

function ContinentLines({ r }: { r: number }) {
  const lines = useMemo(
    () => CONTINENTS.map(cc =>
      cc.map(([la, ln]): [number, number, number] => {
        const v = ll2v(la, ln, r + 0.008);
        return [v.x, v.y, v.z];
      })
    ),
    [r]
  );
  return (
    <group>
      {lines.map((pts, i) => (
        <Line key={i} points={pts} color="#9a9080" lineWidth={1.2} transparent opacity={0.45} />
      ))}
    </group>
  );
}

function GuestMarkers({ r, activeIdx }: { r: number; activeIdx: number }) {
  const positions = useMemo(
    () => DISPLAY_GUESTS.map(g => ll2v(g.lat, g.lng, r + 0.02)),
    [r]
  );

  return (
    <group>
      {positions.map((pos, i) => {
        const active = i === activeIdx;
        return (
          <group key={DISPLAY_GUESTS[i].slug} position={pos}>
            {/* Glow ring for active guest */}
            {active && (
              <mesh>
                <ringGeometry args={[0.04, 0.07, 32]} />
                <meshBasicMaterial color="#d4a853" transparent opacity={0.6} side={THREE.DoubleSide} />
              </mesh>
            )}
            {/* Avatar dot */}
            <Billboard>
              <mesh>
                <circleGeometry args={[active ? 0.035 : 0.015, 16]} />
                <meshBasicMaterial
                  color={active ? "#d4a853" : "#b0a090"}
                  transparent
                  opacity={active ? 1 : 0.5}
                />
              </mesh>
              {/* White border ring */}
              <mesh>
                <ringGeometry args={[active ? 0.035 : 0.015, active ? 0.042 : 0.019, 16]} />
                <meshBasicMaterial color="#ffffff" transparent opacity={active ? 0.9 : 0.3} side={THREE.DoubleSide} />
              </mesh>
            </Billboard>
          </group>
        );
      })}
    </group>
  );
}

function RotatingScene({
  children,
  activeIdx,
}: {
  children: React.ReactNode;
  activeIdx: number;
}) {
  const ref = useRef<THREE.Group>(null);
  const targetY = useRef<number | null>(null);
  const currentY = useRef(0);

  useEffect(() => {
    if (activeIdx >= 0 && activeIdx < DISPLAY_GUESTS.length) {
      const g = DISPLAY_GUESTS[activeIdx];
      targetY.current = (-g.lng - 90) * (Math.PI / 180);
    }
  }, [activeIdx]);

  useFrame((_, dt) => {
    if (!ref.current) return;
    if (targetY.current !== null) {
      const d = ((targetY.current - currentY.current + Math.PI) % (2 * Math.PI)) - Math.PI;
      currentY.current += d * dt * 1.2;
      if (Math.abs(d) < 0.01) targetY.current = null;
    } else {
      // Slow auto-rotation: ~60s per revolution
      currentY.current += dt * 0.105;
    }
    ref.current.rotation.y = currentY.current;
  });

  return <group ref={ref}>{children}</group>;
}

// --- Main exported component ---

interface GlobeProps {
  onGuestChange?: (guest: GuestData | null) => void;
}

function GlobeScene({ onGuestChange }: GlobeProps) {
  const [activeIdx, setActiveIdx] = useState(-1);
  const R = 1.8;

  useEffect(() => {
    function cycle() {
      const idx = Math.floor(Math.random() * DISPLAY_GUESTS.length);
      setActiveIdx(idx);
      onGuestChange?.(DISPLAY_GUESTS[idx]);
    }
    cycle();
    const iv = setInterval(cycle, 6000);
    return () => clearInterval(iv);
  }, [onGuestChange]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <RotatingScene activeIdx={activeIdx}>
        <GridSphere r={R} />
        <ContinentLines r={R} />
        <GuestMarkers r={R} activeIdx={activeIdx} />
      </RotatingScene>
      <OrbitControls
        enableZoom={false}
        enablePan={false}
        rotateSpeed={0.35}
        minPolarAngle={Math.PI * 0.25}
        maxPolarAngle={Math.PI * 0.75}
      />
    </>
  );
}

export default function Globe({ onGuestChange }: GlobeProps) {
  return (
    <div className="w-full h-[400px] sm:h-[480px] md:h-[560px]">
      <Canvas
        camera={{ position: [0, 0.3, 4.6], fov: 40 }}
        style={{ background: "transparent" }}
        gl={{ alpha: true, antialias: true }}
      >
        <GlobeScene onGuestChange={onGuestChange} />
      </Canvas>
    </div>
  );
}
