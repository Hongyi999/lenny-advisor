"use client";

import { useRef, useMemo, useState, useEffect, useCallback } from "react";
import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Line, Html } from "@react-three/drei";
import * as THREE from "three";
import { motion, AnimatePresence } from "framer-motion";
import { GUESTS } from "@/data/guests";

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

function makeGrid(r: number, latN: number, lngN: number, seg: number): [number, number, number][][] {
  const out: [number, number, number][][] = [];
  for (let i = 0; i <= latN; i++) {
    const lat = -90 + (180 * i) / latN;
    const l: [number, number, number][] = [];
    for (let j = 0; j <= seg; j++) {
      const v = ll2v(lat, -180 + (360 * j) / seg, r);
      l.push([v.x, v.y, v.z]);
    }
    out.push(l);
  }
  for (let j = 0; j <= lngN; j++) {
    const lng = -180 + (360 * j) / lngN;
    const l: [number, number, number][] = [];
    for (let i = 0; i <= seg; i++) {
      const v = ll2v(-90 + (180 * i) / seg, lng, r);
      l.push([v.x, v.y, v.z]);
    }
    out.push(l);
  }
  return out;
}

// Continent outline coords
const C: [number, number][][] = [
  [[60,-140],[65,-168],[72,-168],[71,-155],[60,-147],[58,-136],[55,-130],[49,-125],[38,-122],[33,-117],[25,-110],[20,-105],[15,-92],[18,-88],[21,-87],[25,-80],[30,-81],[35,-75],[40,-74],[43,-70],[45,-67],[47,-60],[50,-56],[52,-55],[55,-60],[60,-65],[65,-62],[70,-55],[73,-57],[75,-80],[72,-95],[70,-100],[68,-110],[65,-140],[60,-140]],
  [[12,-72],[10,-75],[8,-77],[5,-77],[2,-80],[-5,-80],[-8,-78],[-15,-75],[-20,-70],[-25,-65],[-30,-65],[-35,-58],[-40,-63],[-45,-65],[-50,-68],[-55,-67],[-55,-64],[-50,-60],[-45,-58],[-40,-57],[-35,-55],[-30,-50],[-25,-46],[-20,-40],[-15,-39],[-10,-37],[-5,-35],[0,-50],[5,-60],[8,-62],[10,-67],[12,-72]],
  [[36,-10],[38,-8],[40,-2],[43,0],[44,3],[43,8],[45,12],[40,18],[38,22],[35,25],[37,28],[40,27],[42,30],[44,28],[45,30],[48,18],[50,15],[52,8],[54,10],[56,12],[58,18],[60,20],[63,25],[66,26],[70,28],[68,20],[65,15],[60,5],[55,5],[52,4],[50,2],[48,-5],[45,-8],[42,-9],[38,-10],[36,-10]],
  [[35,-5],[37,10],[33,12],[30,32],[22,36],[15,42],[12,44],[5,42],[0,42],[-5,40],[-10,40],[-15,40],[-20,35],[-25,33],[-30,30],[-33,27],[-35,20],[-34,18],[-30,15],[-20,12],[-15,12],[-8,13],[-5,10],[0,10],[5,0],[5,-5],[10,-15],[15,-17],[20,-17],[25,-15],[30,-10],[35,-5]],
  [[42,30],[45,40],[40,50],[38,55],[35,52],[30,50],[25,55],[22,60],[25,65],[28,68],[30,70],[25,75],[20,73],[15,75],[10,78],[8,80],[5,80],[1,104],[5,105],[10,107],[15,108],[22,108],[25,120],[30,122],[35,130],[38,135],[42,132],[45,142],[50,140],[55,135],[60,140],[65,170],[70,175],[72,140],[70,90],[65,70],[60,60],[55,55],[50,40],[42,30]],
  [[-12,130],[-15,132],[-18,140],[-20,145],[-25,150],[-30,153],[-35,151],[-38,147],[-38,140],[-35,137],[-32,133],[-35,118],[-30,115],[-25,113],[-22,114],[-20,118],[-15,130],[-12,130]],
];

// --- Sub-components ---

function GridSphere({ r }: { r: number }) {
  // Major grid: 24 lat x 48 lng for dense Anthropic-style look
  const major = useMemo(() => makeGrid(r, 24, 48, 80), [r]);
  // Minor sub-grid (finer, more transparent)
  const minor = useMemo(() => makeGrid(r - 0.002, 48, 96, 80), [r]);

  return (
    <group>
      {minor.map((pts, i) => (
        <Line key={`m${i}`} points={pts} color="#9a9080" lineWidth={0.3} transparent opacity={0.07} />
      ))}
      {major.map((pts, i) => (
        <Line key={`M${i}`} points={pts} color="#7a6e5e" lineWidth={0.6} transparent opacity={0.22} />
      ))}
    </group>
  );
}

function Continents({ r }: { r: number }) {
  const lines = useMemo(
    () => C.map(cc => cc.map(([la, ln]): [number, number, number] => { const v = ll2v(la, ln, r + 0.008); return [v.x, v.y, v.z]; })),
    [r]
  );
  return (
    <group>
      {lines.map((pts, i) => (
        <Line key={i} points={pts} color="#8a7a62" lineWidth={1.4} transparent opacity={0.6} />
      ))}
    </group>
  );
}

function GuestAvatars({ r, activeIdx }: { r: number; activeIdx: number }) {
  const positions = useMemo(() => GUESTS.map(g => ll2v(g.lat, g.lng, r + 0.015)), [r]);

  return (
    <group>
      {positions.map((pos, i) => {
        const g = GUESTS[i];
        const active = i === activeIdx;

        return (
          <group key={i} position={pos}>
            {/* Avatar sprite or dot */}
            {g.avatar ? (
              <Html
                distanceFactor={active ? 5 : 7}
                style={{ pointerEvents: "none" }}
                center
              >
                <div
                  className={`rounded-full overflow-hidden border-2 transition-all duration-300 ${
                    active
                      ? "w-10 h-10 border-accent shadow-lg shadow-accent/30"
                      : "w-4 h-4 border-sand-300/60 opacity-70"
                  }`}
                >
                  <img
                    src={g.avatar}
                    alt={g.guest}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
              </Html>
            ) : (
              <mesh>
                <sphereGeometry args={[active ? 0.025 : 0.01, 8, 8]} />
                <meshBasicMaterial
                  color={active ? "#e8764a" : "#c4956a"}
                  transparent
                  opacity={active ? 1 : 0.6}
                />
              </mesh>
            )}

            {/* Active guest: spotlight card on globe */}
            {active && g.thumbnail && (
              <Html distanceFactor={4} style={{ pointerEvents: "none" }} center position={[0, 0.15, 0]}>
                <SpotlightCard guest={g} />
              </Html>
            )}
          </group>
        );
      })}
    </group>
  );
}

// Spotlight card shown on the globe near the active guest
function SpotlightCard({ guest }: { guest: typeof GUESTS[0] }) {
  const [text, setText] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    setText("");
    setDone(false);
    let i = 0;
    const t = setInterval(() => {
      i++;
      setText(guest.question.slice(0, i));
      if (i >= guest.question.length) {
        clearInterval(t);
        setDone(true);
      }
    }, 20);
    return () => clearInterval(t);
  }, [guest.question]);

  return (
    <div className="w-64 bg-white/95 backdrop-blur-xl rounded-xl shadow-2xl shadow-sand-900/20 border border-sand-200 overflow-hidden">
      {/* YouTube thumbnail */}
      <div className="relative h-28 bg-sand-200">
        <img
          src={guest.thumbnail!}
          alt={guest.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        <div className="absolute bottom-2 left-2.5 right-2.5">
          <p className="text-white text-[10px] font-medium truncate">
            {guest.guest} <span className="text-white/60">with Lenny</span>
          </p>
        </div>
      </div>
      {/* Typed question */}
      <div className="px-3 py-2.5">
        <p className="text-xs text-sand-800 leading-relaxed">
          &ldquo;{text}
          {!done && (
            <span className="inline-block w-px h-3 bg-accent ml-px animate-pulse" />
          )}
          {done && "&rdquo;"}
        </p>
        {done && guest.video_id && (
          <p className="text-[10px] text-accent font-medium mt-1.5">
            Watch episode →
          </p>
        )}
      </div>
    </div>
  );
}

function RotatingScene({ children, activeIdx }: { children: React.ReactNode; activeIdx: number }) {
  const ref = useRef<THREE.Group>(null);
  const target = useRef<number | null>(null);
  const cur = useRef(0);

  useEffect(() => {
    if (activeIdx >= 0 && activeIdx < GUESTS.length) {
      target.current = (-GUESTS[activeIdx].lng - 90) * (Math.PI / 180);
    }
  }, [activeIdx]);

  useFrame((_, dt) => {
    if (!ref.current) return;
    if (target.current !== null) {
      const d = ((target.current - cur.current + Math.PI) % (2 * Math.PI)) - Math.PI;
      cur.current += d * dt * 1.2;
      if (Math.abs(d) < 0.01) target.current = null;
    } else {
      cur.current += dt * 0.05;
    }
    ref.current.rotation.y = cur.current;
  });

  return <group ref={ref}>{children}</group>;
}

// --- Main ---

export default function Globe() {
  const [activeIdx, setActiveIdx] = useState(-1);
  const R = 1.8;

  useEffect(() => {
    function go() {
      setActiveIdx(Math.floor(Math.random() * GUESTS.length));
    }
    go();
    const iv = setInterval(go, 7000);
    return () => clearInterval(iv);
  }, []);

  const guest = activeIdx >= 0 ? GUESTS[activeIdx] : null;

  return (
    <div className="relative w-full">
      {/* Canvas */}
      <div className="w-full h-[460px] sm:h-[540px] md:h-[600px]">
        <Canvas
          camera={{ position: [0, 0.3, 4.6], fov: 40 }}
          style={{ background: "transparent" }}
          gl={{ alpha: true, antialias: true }}
        >
          <ambientLight intensity={0.5} />
          <RotatingScene activeIdx={activeIdx}>
            <GridSphere r={R} />
            <Continents r={R} />
            <GuestAvatars r={R} activeIdx={activeIdx} />
          </RotatingScene>
          <OrbitControls
            enableZoom={false}
            enablePan={false}
            rotateSpeed={0.4}
            minPolarAngle={Math.PI * 0.25}
            maxPolarAngle={Math.PI * 0.75}
          />
        </Canvas>
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3">
        <span className="text-xs text-sand-400">Hold & drag to explore</span>
        <span className="text-sand-300">&middot;</span>
        <span className="text-xs text-sand-400">{GUESTS.length} guests worldwide</span>
      </div>
    </div>
  );
}
