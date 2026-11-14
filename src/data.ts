import type { Hostel, Room } from './types';

export const HOSTELS: Hostel[] = [
  { id: 'h1', name: 'Aravali Block', blocks: 1, floors: 4, roomsPerFloor: 8, gender: 'Male', warden: 'Prof. R. Menon' },
  { id: 'h2', name: 'Nilgiri Block', blocks: 1, floors: 4, roomsPerFloor: 8, gender: 'Female', warden: 'Dr. S. Iyer' },
  { id: 'h3', name: 'Shivalik Block', blocks: 1, floors: 3, roomsPerFloor: 6, gender: 'Co-ed', warden: 'Prof. A. Kumar' },
];

const AVATARS = [
  'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=128&h=128&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1531123897727-8f129e168847?w=128&h=128&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=128&h=128&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=128&h=128&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=128&h=128&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=128&h=128&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1547425260-76bcadfb4f2c?w=128&h=128&fit=crop&crop=faces',
  'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=128&h=128&fit=crop&crop=faces',
];

export const TESTIMONIALS = [
  { name: 'Arjun Sharma', branch: 'CSE', year: 2, text: 'The 3D hostel explorer made it so easy to pick a room I actually liked. I found a corner room with a great view!', avatar: AVATARS[0] },
  { name: 'Priya Nair', branch: 'ECE', year: 3, text: 'Filing a maintenance complaint took 30 seconds and I could track it till it was resolved. Brilliant system.', avatar: AVATARS[3] },
  { name: 'Rohan Verma', branch: 'ME', year: 1, text: 'I loved how the room search matched me with roommates from my branch and year. Felt personalized.', avatar: AVATARS[2] },
];

export const FACILITIES = [
  { name: '24/7 Wi-Fi', desc: 'High-speed internet in every room', icon: 'wifi' },
  { name: 'Mess & Cafeteria', desc: 'Hygienic multi-cuisine dining', icon: 'utensils' },
  { name: 'Laundry', desc: 'Weekly pickup and delivery', icon: 'washing-machine' },
  { name: 'Gym & Sports', desc: 'Fully equipped fitness center', icon: 'dumbbell' },
  { name: 'Medical Room', desc: 'On-call doctor and first aid', icon: 'stethoscope' },
  { name: 'Study Lounge', desc: 'Quiet common study areas', icon: 'book-open' },
  { name: 'Security', desc: 'CCTV and 24/7 guards', icon: 'shield-check' },
  { name: 'Recreation', desc: 'Indoor games & TV lounge', icon: 'gamepad-2' },
];

export function roomStatus(room: Room): 'available' | 'partial' | 'occupied' {
  const occ = room.beds.filter((b) => b.occupied).length;
  if (occ === 0) return 'available';
  if (occ >= room.capacity) return 'occupied';
  return 'partial';
}
