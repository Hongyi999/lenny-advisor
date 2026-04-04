"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Billboard } from "@react-three/drei";
import * as THREE from "three";
import { GUESTS, type GuestData } from "@/data/guests";
import { CONTINENT_DOTS, POLYS } from "@/data/continentDots";

/* ── helpers ───────────────────────────────────────────── */

function ll2v(lat: number, lng: number, r: number): THREE.Vector3 {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);
  return new THREE.Vector3(
    -(r * Math.sin(phi) * Math.cos(theta)),
    r * Math.cos(phi),
    r * Math.sin(phi) * Math.sin(theta)
  );
}

function normalizeAngle(a: number): number {
  while (a > Math.PI) a -= 2 * Math.PI;
  while (a < -Math.PI) a += 2 * Math.PI;
  return a;
}

/**
 * Target rotation Y so that a guest at (lat, lng) appears at a
 * FIXED screen position: slightly left-of-center horizontally,
 * lower-center vertically — matching Anthropic's globe behavior
 * where highlighted areas always land at the same spot.
 *
 * We offset lng by a fixed amount so the dot appears ~15° left of
 * dead-center, placing it above the text card area.
 */
const LNG_OFFSET = 10; // degrees — shift guest slightly left of center
function lngToRotY(lng: number): number {
  return Math.PI / 2 - ((lng + LNG_OFFSET + 180) * Math.PI) / 180;
}

/* ── Clean grid: 36 meridians + 17 parallels ──────────── */

function CleanGrid({ r }: { r: number }) {
  const objs = useMemo(() => {
    const segs = 72;
    const mat = new THREE.LineBasicMaterial({ color: "#000000", transparent: true, opacity: 0.05, depthWrite: false });
    const lines: THREE.Line[] = [];

    for (let lat = -80; lat <= 80; lat += 10) {
      const pos = new Float32Array((segs + 1) * 3);
      for (let i = 0; i <= segs; i++) {
        const v = ll2v(lat, -180 + (360 * i) / segs, r);
        pos[i * 3] = v.x; pos[i * 3 + 1] = v.y; pos[i * 3 + 2] = v.z;
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      lines.push(new THREE.Line(g, mat));
    }
    for (let lng = -180; lng < 180; lng += 10) {
      const pos = new Float32Array((segs + 1) * 3);
      for (let i = 0; i <= segs; i++) {
        const v = ll2v(-90 + (180 * i) / segs, lng, r);
        pos[i * 3] = v.x; pos[i * 3 + 1] = v.y; pos[i * 3 + 2] = v.z;
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      lines.push(new THREE.Line(g, mat));
    }
    return lines;
  }, [r]);

  return <group>{objs.map((o, i) => <primitive key={i} object={o} />)}</group>;
}

/* ── Continent outline wireframes ─────────────────────── */

function ContinentOutlines({ r }: { r: number }) {
  const objs = useMemo(() => {
    const mat = new THREE.LineBasicMaterial({ color: "#000000", transparent: true, opacity: 0.12, depthWrite: false });
    return POLYS.map(poly => {
      const pos = new Float32Array(poly.length * 3);
      for (let i = 0; i < poly.length; i++) {
        const v = ll2v(poly[i][0], poly[i][1], r + 0.005);
        pos[i * 3] = v.x; pos[i * 3 + 1] = v.y; pos[i * 3 + 2] = v.z;
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      return new THREE.LineLoop(g, mat);
    });
  }, [r]);

  return <group>{objs.map((o, i) => <primitive key={i} object={o} />)}</group>;
}

/* ── Continent dot cloud (edge-dense, organic) ────────── */

function ContinentCloud({ r }: { r: number }) {
  const geo = useMemo(() => {
    const pos = new Float32Array(CONTINENT_DOTS.length * 3);
    for (let i = 0; i < CONTINENT_DOTS.length; i++) {
      const v = ll2v(CONTINENT_DOTS[i][0], CONTINENT_DOTS[i][1], r + 0.003);
      pos[i * 3] = v.x; pos[i * 3 + 1] = v.y; pos[i * 3 + 2] = v.z;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, [r]);

  return (
    <points geometry={geo}>
      <pointsMaterial color="#000000" size={0.02} transparent opacity={0.22} sizeAttenuation depthWrite={false} />
    </points>
  );
}

/* ── Guest markers (all 302) ──────────────────────────── */

function GuestMarkers({ r, activeIdx }: { r: number; activeIdx: number }) {
  const geo = useMemo(() => {
    const pos = new Float32Array(GUESTS.length * 3);
    for (let i = 0; i < GUESTS.length; i++) {
      const v = ll2v(GUESTS[i].lat, GUESTS[i].lng, r + 0.01);
      pos[i * 3] = v.x; pos[i * 3 + 1] = v.y; pos[i * 3 + 2] = v.z;
    }
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
    return g;
  }, [r]);

  const activePos = useMemo(() => {
    if (activeIdx < 0 || activeIdx >= GUESTS.length) return null;
    return ll2v(GUESTS[activeIdx].lat, GUESTS[activeIdx].lng, r + 0.012);
  }, [activeIdx, r]);

  return (
    <group>
      <points geometry={geo}>
        <pointsMaterial color="#d4a853" size={0.035} transparent opacity={0.8} sizeAttenuation depthWrite={false} />
      </points>
      {activePos && <ActiveHighlight position={activePos} />}
    </group>
  );
}

function ActiveHighlight({ position }: { position: THREE.Vector3 }) {
  const ref = useRef<THREE.Mesh>(null);
  const t = useRef(0);
  useFrame((_, dt) => { if (!ref.current) return; t.current += dt; ref.current.scale.setScalar(1 + Math.sin(t.current * 2.5) * 0.18); });

  return (
    <group position={position}>
      <Billboard>
        <mesh ref={ref}>
          <ringGeometry args={[0.055, 0.09, 32]} />
          <meshBasicMaterial color="#d4a853" transparent opacity={0.55} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
        <mesh>
          <circleGeometry args={[0.045, 24]} />
          <meshBasicMaterial color="#d4a853" transparent opacity={0.9} depthWrite={false} />
        </mesh>
      </Billboard>
    </group>
  );
}

/* ── Rotation: always land guest at unified screen position ── */

function RotatingScene({ children, activeIdx }: { children: React.ReactNode; activeIdx: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const currentY = useRef(0);
  const targetY = useRef<number | null>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isIdle = useRef(true);

  useEffect(() => {
    if (activeIdx < 0 || activeIdx >= GUESTS.length) return;
    const desired = lngToRotY(GUESTS[activeIdx].lng);
    const diff = normalizeAngle(desired - currentY.current);
    targetY.current = currentY.current + diff;
    isIdle.current = false;
    if (idleTimer.current) clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => { isIdle.current = true; }, 5500);
    return () => { if (idleTimer.current) clearTimeout(idleTimer.current); };
  }, [activeIdx]);

  useFrame((_, dt) => {
    if (!groupRef.current) return;
    if (targetY.current !== null) {
      const rem = targetY.current - currentY.current;
      if (Math.abs(rem) < 0.002) { currentY.current = targetY.current; targetY.current = null; }
      else currentY.current += rem * Math.min(dt * 2.0, 0.05);
    } else if (isIdle.current) {
      currentY.current += dt * 0.08;
    }
    groupRef.current.rotation.y = currentY.current;
  });

  return <group ref={groupRef}>{children}</group>;
}

/* ── Scene + Export ────────────────────────────────────── */

interface GlobeProps { onGuestChange?: (guest: GuestData, index: number) => void; }

function Scene({ onGuestChange }: GlobeProps) {
  const [activeIdx, setActiveIdx] = useState(-1);
  const R = 2.0;

  useEffect(() => {
    function pick() {
      const idx = Math.floor(Math.random() * GUESTS.length);
      setActiveIdx(idx);
      onGuestChange?.(GUESTS[idx], idx);
    }
    const first = setTimeout(pick, 1500);
    const iv = setInterval(pick, 7000);
    return () => { clearTimeout(first); clearInterval(iv); };
  }, [onGuestChange]);

  return (
    <>
      <ambientLight intensity={0.5} />
      <RotatingScene activeIdx={activeIdx}>
        <CleanGrid r={R} />
        <ContinentOutlines r={R} />
        <ContinentCloud r={R} />
        <GuestMarkers r={R} activeIdx={activeIdx} />
      </RotatingScene>
      <OrbitControls enableZoom={false} enablePan={false} rotateSpeed={0.3} minPolarAngle={Math.PI * 0.3} maxPolarAngle={Math.PI * 0.7} />
    </>
  );
}

export default function Globe({ onGuestChange }: GlobeProps) {
  return (
    <Canvas
      camera={{ position: [0, 0.4, 5.2], fov: 36 }}
      style={{ background: "transparent" }}
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 1.5]}
    >
      <Scene onGuestChange={onGuestChange} />
    </Canvas>
  );
}
