"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Billboard } from "@react-three/drei";
import * as THREE from "three";
import { GUESTS, type GuestData } from "@/data/guests";
import { CONTINENT_DOTS, POLYS, pip } from "@/data/continentDots";

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
 * Rotate Y so the guest longitude lands at SCREEN CENTER horizontally.
 */
function lngToRotY(lng: number): number {
  return Math.PI / 2 - ((lng + 180) * Math.PI) / 180;
}

/**
 * Tilt globe on X-axis so the guest's latitude lands at a FIXED
 * vertical screen position — between subtitle and card.
 * Positive rotation tilts globe forward (northern hemisphere comes down).
 * LAT_OFFSET is subtracted to leave the dot slightly above center.
 */
const LAT_OFFSET = -0.15;
function latToRotX(lat: number): number {
  return (lat * Math.PI) / 180 - LAT_OFFSET;
}

/* ── Circular dot texture (shared) ─────────────────────── */

function useCircleTexture() {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 64;
    canvas.height = 64;
    const ctx = canvas.getContext("2d")!;
    ctx.beginPath();
    ctx.arc(32, 32, 30, 0, Math.PI * 2);
    ctx.fillStyle = "#ffffff";
    ctx.fill();
    return new THREE.CanvasTexture(canvas);
  }, []);
  useEffect(() => {
    return () => { texture.dispose(); };
  }, [texture]);
  return texture;
}

/* ── Grid: meridians + parallels + prominent equator ──── */

function CleanGrid({ r }: { r: number }) {
  const objs = useMemo(() => {
    const segs = 72;
    const mat = new THREE.LineBasicMaterial({ color: "#000000", transparent: true, opacity: 0.12, depthWrite: false });
    const eqMat = new THREE.LineBasicMaterial({ color: "#000000", transparent: true, opacity: 0.35, depthWrite: false });
    const lines: THREE.Line[] = [];

    for (let lat = -80; lat <= 80; lat += 10) {
      const pos = new Float32Array((segs + 1) * 3);
      for (let i = 0; i <= segs; i++) {
        const v = ll2v(lat, -180 + (360 * i) / segs, r);
        pos[i * 3] = v.x; pos[i * 3 + 1] = v.y; pos[i * 3 + 2] = v.z;
      }
      const g = new THREE.BufferGeometry();
      g.setAttribute("position", new THREE.BufferAttribute(pos, 3));
      lines.push(new THREE.Line(g, lat === 0 ? eqMat : mat));
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

  useEffect(() => {
    return () => {
      for (const line of objs) {
        line.geometry.dispose();
        (line.material as THREE.Material).dispose();
      }
    };
  }, [objs]);

  return <group>{objs.map((o, i) => <primitive key={i} object={o} />)}</group>;
}

/* ── Continent outline wireframes ─────────────────────── */

function ContinentOutlines({ r }: { r: number }) {
  const objs = useMemo(() => {
    const mat = new THREE.LineBasicMaterial({ color: "#000000", transparent: true, opacity: 0.18, depthWrite: false });
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

  useEffect(() => {
    return () => {
      for (const loop of objs) {
        loop.geometry.dispose();
        (loop.material as THREE.Material).dispose();
      }
    };
  }, [objs]);

  return <group>{objs.map((o, i) => <primitive key={i} object={o} />)}</group>;
}

/* ── Continent dot cloud ────────────────────────────── */

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

  useEffect(() => {
    return () => { geo.dispose(); };
  }, [geo]);

  return (
    <points geometry={geo}>
      <pointsMaterial color="#000000" size={0.018} transparent opacity={0.35} sizeAttenuation depthWrite={false} />
    </points>
  );
}

/* ── Continent highlight: gold fill on active guest's continent ── */

function polyCentroid(poly: [number, number][]): [number, number] {
  let lat = 0, lng = 0;
  for (const [la, ln] of poly) { lat += la; lng += ln; }
  return [lat / poly.length, lng / poly.length];
}

function ContinentHighlight({ r, activeIdx }: { r: number; activeIdx: number }) {
  const { outlineObj, fillGeo } = useMemo(() => {
    if (activeIdx < 0 || activeIdx >= GUESTS.length) return { outlineObj: null, fillGeo: null };
    const guest = GUESTS[activeIdx];

    let polyIdx = -1;
    for (let i = 0; i < POLYS.length; i++) {
      if (pip(guest.lat, guest.lng, POLYS[i])) { polyIdx = i; break; }
    }
    if (polyIdx === -1) {
      let minDist = Infinity;
      for (let i = 0; i < POLYS.length; i++) {
        const [cLat, cLng] = polyCentroid(POLYS[i]);
        const dist = Math.hypot(guest.lat - cLat, guest.lng - cLng);
        if (dist < minDist) { minDist = dist; polyIdx = i; }
      }
    }
    if (polyIdx === -1) return { outlineObj: null, fillGeo: null };

    const poly = POLYS[polyIdx];

    const outPos = new Float32Array(poly.length * 3);
    for (let i = 0; i < poly.length; i++) {
      const v = ll2v(poly[i][0], poly[i][1], r + 0.008);
      outPos[i * 3] = v.x; outPos[i * 3 + 1] = v.y; outPos[i * 3 + 2] = v.z;
    }
    const outGeo = new THREE.BufferGeometry();
    outGeo.setAttribute("position", new THREE.BufferAttribute(outPos, 3));
    const outMat = new THREE.LineBasicMaterial({ color: "#d4a853", transparent: true, opacity: 0.8, depthWrite: false });
    const outline = new THREE.LineLoop(outGeo, outMat);

    const shape = new THREE.Shape();
    shape.moveTo(poly[0][1], poly[0][0]);
    for (let i = 1; i < poly.length; i++) {
      shape.lineTo(poly[i][1], poly[i][0]);
    }
    shape.closePath();

    const shapeGeo = new THREE.ShapeGeometry(shape, 4);
    const pos = shapeGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const lng = pos.getX(i);
      const lat = pos.getY(i);
      const v = ll2v(lat, lng, r + 0.006);
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    pos.needsUpdate = true;

    return { outlineObj: outline, fillGeo: shapeGeo };
  }, [activeIdx, r]);

  useEffect(() => {
    return () => {
      if (outlineObj) {
        outlineObj.geometry.dispose();
        (outlineObj.material as THREE.Material).dispose();
      }
      fillGeo?.dispose();
    };
  }, [outlineObj, fillGeo]);

  if (!outlineObj || !fillGeo) return null;

  return (
    <group>
      <primitive object={outlineObj} />
      <mesh geometry={fillGeo}>
        <meshBasicMaterial color="#d4a853" transparent opacity={0.25} side={THREE.DoubleSide} depthWrite={false} />
      </mesh>
    </group>
  );
}

/* ── Guest markers (circular dots) ────────────────────── */

function GuestMarkers({ r, activeIdx }: { r: number; activeIdx: number }) {
  const circleMap = useCircleTexture();
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

  useEffect(() => {
    return () => { geo.dispose(); };
  }, [geo]);

  const activePos = useMemo(() => {
    if (activeIdx < 0 || activeIdx >= GUESTS.length) return null;
    return ll2v(GUESTS[activeIdx].lat, GUESTS[activeIdx].lng, r + 0.012);
  }, [activeIdx, r]);

  return (
    <group>
      <points geometry={geo}>
        <pointsMaterial color="#d4a853" size={0.06} map={circleMap} transparent opacity={1.0} sizeAttenuation depthWrite={false} alphaTest={0.4} />
      </points>
      {activePos && <ActiveHighlight position={activePos} />}
    </group>
  );
}

/* ── Active highlight — refined, thin ring + small dot ── */

function ActiveHighlight({ position }: { position: THREE.Vector3 }) {
  const ref = useRef<THREE.Mesh>(null);
  const t = useRef(0);
  useFrame((_, dt) => {
    if (!ref.current) return;
    t.current += dt;
    ref.current.scale.setScalar(1 + Math.sin(t.current * 2.5) * 0.12);
  });

  return (
    <group position={position}>
      <Billboard>
        {/* Thin pulsing ring */}
        <mesh ref={ref}>
          <ringGeometry args={[0.045, 0.058, 48]} />
          <meshBasicMaterial color="#d4a853" transparent opacity={0.5} side={THREE.DoubleSide} depthWrite={false} />
        </mesh>
        {/* Small solid center dot */}
        <mesh>
          <circleGeometry args={[0.035, 32]} />
          <meshBasicMaterial color="#d4a853" transparent opacity={0.9} depthWrite={false} />
        </mesh>
      </Billboard>
    </group>
  );
}

/* ── Rotation: land guest at unified screen position ── */

function RotatingScene({ children, activeIdx }: { children: React.ReactNode; activeIdx: number }) {
  const groupRef = useRef<THREE.Group>(null);
  const currentY = useRef(0);
  const currentX = useRef(0);
  const targetY = useRef<number | null>(null);
  const targetX = useRef<number | null>(null);
  const idleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isIdle = useRef(true);

  useEffect(() => {
    if (activeIdx < 0 || activeIdx >= GUESTS.length) return;
    const guest = GUESTS[activeIdx];
    const desiredY = lngToRotY(guest.lng);
    const diffY = normalizeAngle(desiredY - currentY.current);
    targetY.current = currentY.current + diffY;
    targetX.current = latToRotX(guest.lat);
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
      else currentY.current += rem * Math.min(dt * 2.5, 0.06);
    } else if (isIdle.current) {
      currentY.current += dt * 0.06;
    }
    if (targetX.current !== null) {
      const remX = targetX.current - currentX.current;
      if (Math.abs(remX) < 0.002) { currentX.current = targetX.current; targetX.current = null; }
      else currentX.current += remX * Math.min(dt * 2.5, 0.06);
    } else if (isIdle.current) {
      currentX.current += (LAT_OFFSET * 0.3 - currentX.current) * Math.min(dt * 0.3, 0.01);
    }
    // Default 'XYZ': matrix = R_X * R_Y * R_Z → R_Y applied first, then R_X
    groupRef.current.rotation.y = currentY.current;
    groupRef.current.rotation.x = currentX.current;
  });

  return <group ref={groupRef}>{children}</group>;
}

/* ── Scene + Export ────────────────────────────────────── */

interface GlobeProps { onGuestChange?: (guest: GuestData, index?: number) => void; }

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
        <ContinentHighlight r={R} activeIdx={activeIdx} />
        <GuestMarkers r={R} activeIdx={activeIdx} />
      </RotatingScene>
      <OrbitControls enableZoom={false} enablePan={false} rotateSpeed={0.3} minPolarAngle={Math.PI * 0.15} maxPolarAngle={Math.PI * 0.85} />
    </>
  );
}

export default function Globe({ onGuestChange }: GlobeProps) {
  return (
    <Canvas
      camera={{ position: [0, 0, 4.2], fov: 36 }}
      style={{ background: "transparent" }}
      gl={{ alpha: true, antialias: true }}
      dpr={[1, 1.5]}
    >
      <Scene onGuestChange={onGuestChange} />
    </Canvas>
  );
}
