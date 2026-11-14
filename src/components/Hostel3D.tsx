import { useMemo, useRef, useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Html, Float, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { motion } from 'framer-motion';
import type { Room } from '@/types';
import { roomStatus } from '@/data';

interface Props {
  rooms: Room[];
  selectedFloor: number;
  onSelectFloor: (f: number) => void;
  selectedRoomId?: string | null;
  onSelectRoom?: (room: Room) => void;
  height?: string;
}

const statusColors = {
  available: '#4abd84',
  partial: '#ff8c5e',
  occupied: '#f56c3a',
};

function Ground() {
  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.5, 0]} receiveShadow>
      <planeGeometry args={[40, 40]} />
      <meshStandardMaterial color="#d7f5e3" transparent opacity={0.55} />
    </mesh>
  );
}

function WindowPane({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[0.7, 0.5, 0.04]} />
      <meshStandardMaterial color="#bcdcff" transparent opacity={0.6} metalness={0.2} roughness={0.1} />
    </mesh>
  );
}

function Door({ position }: { position: [number, number, number] }) {
  return (
    <mesh position={position}>
      <boxGeometry args={[0.5, 0.8, 0.04]} />
      <meshStandardMaterial color="#1e8756" />
    </mesh>
  );
}

function Room3D({
  room,
  position,
  selected,
  onClick,
}: {
  room: Room;
  position: [number, number, number];
  selected: boolean;
  onClick: () => void;
}) {
  const status = roomStatus(room);
  const color = statusColors[status];
  const [hovered, setHovered] = useState(false);

  const beds: JSX.Element[] = [];
  const bedSpacing = 0.55;
  const bedStartX = position[0] - (room.capacity - 1) * bedSpacing * 0.25;
  for (let b = 0; b < room.capacity; b++) {
    const bx = bedStartX + b * bedSpacing;
    const occupied = room.beds[b]?.occupied;
    beds.push(
      <group key={b} position={[bx, position[1] + 0.18, position[2] + 0.25]}>
        <mesh castShadow>
          <boxGeometry args={[0.4, 0.12, 0.55]} />
          <meshStandardMaterial color={occupied ? '#ffcfb0' : '#effbf4'} />
        </mesh>
        <mesh position={[0, 0.1, -0.22]}>
          <boxGeometry args={[0.4, 0.18, 0.08]} />
          <meshStandardMaterial color="#faf6ec" />
        </mesh>
      </group>
    );
  }

  return (
    <group position={position}>
      <mesh
        castShadow
        receiveShadow
        onClick={(e) => { e.stopPropagation(); onClick(); }}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); document.body.style.cursor = 'pointer'; }}
        onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto'; }}
      >
        <boxGeometry args={[1.3, 0.85, 1.1]} />
        <meshStandardMaterial
          color={selected || hovered ? color : '#fbfaf3'}
          emissive={color}
          emissiveIntensity={selected ? 0.35 : hovered ? 0.2 : 0.05}
          transparent
          opacity={0.92}
          roughness={0.4}
        />
      </mesh>

      {/* door */}
      <Door position={[position[0] - 0.4, position[1] - 0.05, position[2] + 0.55]} />
      {/* window */}
      <WindowPane position={[position[0] + 0.45, position[1] + 0.15, position[2] - 0.55]} />

      {beds}

      <Html position={[0, 0.62, 0]} center distanceFactor={9} occlude>
        <div className="pointer-events-none select-none whitespace-nowrap rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-semibold text-mint-700 shadow-soft backdrop-blur">
          {room.number} · {room.capacity}B
        </div>
      </Html>
    </group>
  );
}

function Floor3D({
  floor,
  rooms,
  y,
  selectedRoomId,
  onSelectRoom,
}: {
  floor: number;
  rooms: Room[];
  y: number;
  selectedRoomId?: string | null;
  onSelectRoom?: (room: Room) => void;
}) {
  const sideRooms = rooms.filter((r) => r.number.startsWith(String(floor)));
  const cols = 4;
  const spacing = 1.55;
  const half = ((cols - 1) * spacing) / 2;

  return (
    <group position={[0, y, 0]}>
      {/* floor slab */}
      <mesh position={[0, -0.48, 0]} receiveShadow castShadow>
        <boxGeometry args={[8.4, 0.12, 3.2]} />
        <meshStandardMaterial color="#eadcb4" />
      </mesh>
      {/* corridor */}
      <mesh position={[0, -0.42, 0]}>
        <boxGeometry args={[8.2, 0.02, 0.9]} />
        <meshStandardMaterial color="#f3ecd6" />
      </mesh>
      {/* back wall */}
      <mesh position={[0, 0, -1.25]}>
        <boxGeometry args={[8.4, 1, 0.08]} />
        <meshStandardMaterial color="#d0f2f3" transparent opacity={0.5} />
      </mesh>

      {sideRooms.map((room, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = -half + col * spacing;
        const z = row === 0 ? -0.35 : 0.6;
        return (
          <Room3D
            key={room.id}
            room={room}
            position={[x, 0, z]}
            selected={selectedRoomId === room.id}
            onClick={() => onSelectRoom?.(room)}
          />
        );
      })}
    </group>
  );
}

function BuildingLabel({ text, position }: { text: string; position: [number, number, number] }) {
  return (
    <Html position={position} center distanceFactor={10}>
      <div className="pointer-events-none select-none whitespace-nowrap rounded-xl bg-mint-600 px-3 py-1 text-xs font-bold text-white shadow-lg">
        {text}
      </div>
    </Html>
  );
}

export default function Hostel3D({
  rooms,
  selectedFloor,
  onSelectFloor,
  selectedRoomId,
  onSelectRoom,
  height = '420px',
}: Props) {
  const groupRef = useRef<THREE.Group>(null);
  const floors = useMemo(() => {
    const set = new Set(rooms.map((r) => r.floor));
    return [...set].sort((a, b) => a - b);
  }, [rooms]);

  const floorRooms = (f: number) => rooms.filter((r) => r.number.startsWith(`${f}`));
  const floorHeight = 1.1;

  return (
    <div className="relative w-full overflow-hidden rounded-3xl border border-white/80 bg-gradient-to-b from-sky-50 via-cream-50 to-mint-50 shadow-glass" style={{ height }}>
      <Canvas shadows camera={{ position: [9, 5, 11], fov: 42 }} dpr={[1, 2]}>
        <ambientLight intensity={0.7} />
        <directionalLight
          position={[8, 12, 6]}
          intensity={1.1}
          castShadow
          shadow-mapSize={[2048, 2048]}
          shadow-camera-left={-15}
          shadow-camera-right={15}
          shadow-camera-top={15}
          shadow-camera-bottom={-15}
        />
        {/* offline-safe lighting (the drei "city" HDR needs a CDN download and crashed the app when blocked) */}
        <hemisphereLight args={["#ffffff", "#cfd8dc", 0.9]} />

        <group ref={groupRef} position={[0, -1, 0]}>
          <Float speed={1.2} rotationIntensity={0} floatIntensity={0.4}>
            {/* base platform */}
            <mesh position={[0, -0.55, 0]} receiveShadow castShadow>
              <boxGeometry args={[9, 0.25, 3.8]} />
              <meshStandardMaterial color="#7dd6a6" />
            </mesh>

            {/* roof */}
            <mesh position={[0, floors.length * floorHeight + 0.1, 0]} castShadow>
              <boxGeometry args={[8.8, 0.2, 3.4]} />
              <meshStandardMaterial color="#2aa36a" />
            </mesh>
            {/* roof accent */}
            <mesh position={[0, floors.length * floorHeight + 0.28, 0]}>
              <coneGeometry args={[1.2, 0.5, 4]} />
              <meshStandardMaterial color="#1e8756" />
            </mesh>

            {floors.map((f, idx) => (
              <group key={f}>
                <Floor3D
                  floor={f}
                  rooms={floorRooms(f)}
                  y={idx * floorHeight}
                  selectedRoomId={selectedRoomId}
                  onSelectRoom={onSelectRoom}
                />
              </group>
            ))}

            <BuildingLabel text="Smart Hostel" position={[0, floors.length * floorHeight + 0.7, 0]} />
          </Float>

          <Ground />
          <ContactShadows position={[0, -0.49, 0]} opacity={0.35} scale={20} blur={2} far={6} />
        </group>

        <OrbitControls
          enablePan={false}
          minDistance={6}
          maxDistance={20}
          minPolarAngle={Math.PI / 6}
          maxPolarAngle={Math.PI / 2.1}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>

      {/* floor selector overlay */}
      <div className="pointer-events-none absolute left-4 top-4 flex flex-col gap-2">
        <div className="pointer-events-auto rounded-2xl bg-white/85 p-2 shadow-card backdrop-blur">
          <p className="mb-1 px-1 text-[10px] font-bold uppercase tracking-wider text-mint-700">Floors</p>
          <div className="flex flex-col gap-1">
            {floors.slice().reverse().map((f) => (
              <button
                key={f}
                onClick={() => onSelectFloor(f)}
                className={`pointer-events-auto rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                  selectedFloor === f
                    ? 'bg-mint-500 text-white shadow'
                    : 'bg-cream-100 text-mint-700 hover:bg-mint-100'
                }`}
              >
                Floor {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* legend */}
      <div className="absolute bottom-4 right-4 flex flex-col gap-1.5 rounded-2xl bg-white/85 p-3 text-[11px] shadow-card backdrop-blur">
        <p className="font-bold text-mint-700">Availability</p>
        <Legend color="#4abd84" label="Available" />
        <Legend color="#ff8c5e" label="Partially occupied" />
        <Legend color="#f56c3a" label="Fully occupied" />
      </div>

      <div className="absolute bottom-4 left-4 rounded-full bg-white/85 px-3 py-1.5 text-[11px] font-medium text-mint-700 shadow-card backdrop-blur">
        Drag to rotate · Scroll to zoom · Click a room
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
      <span className="text-gray-600">{label}</span>
    </div>
  );
}
