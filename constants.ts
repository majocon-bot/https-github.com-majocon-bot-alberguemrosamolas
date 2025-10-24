import { RoomType, IndividualRoom, Reservation } from './types';

export const ROOM_TYPES: RoomType[] = [
  {
    id: 'quad',
    name: 'Habitación Cuádruple',
    description: 'Ideal para pequeños grupos y amigos.',
    capacity: 4,
    available: 6,
    image: 'https://picsum.photos/seed/quad/600/400',
  },
  {
    id: 'double',
    name: 'Habitación Doble',
    description: 'Perfecta para parejas o compañeros.',
    capacity: 2,
    available: 4,
    image: 'https://picsum.photos/seed/double/600/400',
  },
  {
    id: 'single',
    name: 'Habitación Individual',
    description: 'Privacidad y confort para viajeros solos.',
    capacity: 1,
    available: 30,
    image: 'https://picsum.photos/seed/single/600/400',
  },
  {
    id: 'bunk',
    name: 'Habitación con Doble Litera',
    description: 'Una opción divertida y económica.',
    capacity: 4,
    available: 8,
    image: 'https://picsum.photos/seed/bunk/600/400',
  },
  {
    id: 'triple',
    name: 'Habitación Triple',
    description: 'Espacio extra para grupos de tres.',
    capacity: 3,
    available: 2,
    image: 'https://picsum.photos/seed/triple/600/400',
  },
  {
    id: 'special',
    name: 'Habitación Especial',
    description: 'Perfecta para familias pequeñas (2+1), con una cama supletoria.',
    capacity: 3,
    available: 2,
    image: 'https://picsum.photos/seed/special/600/400',
  },
];

export const INDIVIDUAL_ROOMS: IndividualRoom[] = ROOM_TYPES.flatMap(roomType => 
  Array.from({ length: roomType.available }, (_, i) => ({
      id: `${roomType.id}_${i + 1}`,
      type: roomType.id,
      name: `${roomType.name} ${i + 1}`,
  }))
);

export const DINING_OPTIONS = [
    { id: 'breakfast', label: 'Desayuno' },
    { id: 'lunch', label: 'Comida' },
    { id: 'dinner', label: 'Cena' },
    { id: 'morningSnack', label: 'Tomar Mañana' },
    { id: 'afternoonSnack', label: 'Tomar Merienda' }
] as const; // Use const assertion for type safety

const today = new Date();
const formatDate = (date: Date) => date.toISOString().split('T')[0];

export const MOCK_RESERVATIONS: Reservation[] = [
  { 
    id: 'res1', 
    roomId: 'quad_1', 
    roomType: 'quad', 
    guestName: 'Alice', 
    dni: '12345678A',
    phone: '600111222',
    observations: 'Quiere una habitación tranquila.',
    checkIn: formatDate(new Date(today.getFullYear(), today.getMonth(), 2)), 
    checkOut: formatDate(new Date(today.getFullYear(), today.getMonth(), 5)),
    dining: {
      [formatDate(new Date(today.getFullYear(), today.getMonth(), 2))]: { breakfast: 4, lunch: 0, dinner: 4, morningSnack: 0, afternoonSnack: 0 },
      [formatDate(new Date(today.getFullYear(), today.getMonth(), 3))]: { breakfast: 4, lunch: 4, dinner: 4, morningSnack: 0, afternoonSnack: 0 },
      [formatDate(new Date(today.getFullYear(), today.getMonth(), 4))]: { breakfast: 4, lunch: 0, dinner: 0, morningSnack: 0, afternoonSnack: 0 },
    }
  },
  { 
    id: 'res6', 
    roomId: 'double_1', 
    roomType: 'double', 
    guestName: 'Alice', 
    dni: '12345678A',
    phone: '600111222',
    observations: 'Quiere una habitación tranquila.',
    checkIn: formatDate(new Date(today.getFullYear(), today.getMonth(), 2)), 
    checkOut: formatDate(new Date(today.getFullYear(), today.getMonth(), 4)),
    dining: {
      [formatDate(new Date(today.getFullYear(), today.getMonth(), 2))]: { breakfast: 2, lunch: 2, dinner: 0, morningSnack: 0, afternoonSnack: 0 },
      [formatDate(new Date(today.getFullYear(), today.getMonth(), 3))]: { breakfast: 2, lunch: 0, dinner: 2, morningSnack: 0, afternoonSnack: 0 },
    }
  },
  { 
    id: 'res2', 
    roomId: 'double_2', 
    roomType: 'double', 
    guestName: 'Bob', 
    dni: '87654321B',
    phone: '600333444',
    observations: '',
    checkIn: formatDate(new Date(today.getFullYear(), today.getMonth(), 7)), 
    checkOut: formatDate(new Date(today.getFullYear(), today.getMonth(), 9)),
    dining: {
      [formatDate(new Date(today.getFullYear(), today.getMonth(), 7))]: { breakfast: 2, lunch: 2, dinner: 2, morningSnack: 2, afternoonSnack: 2 },
      [formatDate(new Date(today.getFullYear(), today.getMonth(), 8))]: { breakfast: 2, lunch: 2, dinner: 2, morningSnack: 2, afternoonSnack: 2 },
    }
  },
  { 
    id: 'res3', 
    roomId: 'single_5', 
    roomType: 'single', 
    guestName: 'Charlie', 
    dni: '11223344C',
    phone: '600555666',
    observations: 'Alergia al gluten.',
    checkIn: formatDate(new Date(today.getFullYear(), today.getMonth(), 10)), 
    checkOut: formatDate(new Date(today.getFullYear(), today.getMonth(), 15)) 
  },
  { 
    id: 'res4', 
    roomId: 'quad_2', 
    roomType: 'quad', 
    guestName: 'Diana', 
    dni: '55667788D',
    phone: '600777888',
    observations: '',
    checkIn: formatDate(new Date(today.getFullYear(), today.getMonth(), 18)), 
    checkOut: formatDate(new Date(today.getFullYear(), today.getMonth(), 22)),
    dining: {
        [formatDate(new Date(today.getFullYear(), today.getMonth(), 18))]: { breakfast: 3, lunch: 0, dinner: 0, morningSnack: 0, afternoonSnack: 0 },
        [formatDate(new Date(today.getFullYear(), today.getMonth(), 19))]: { breakfast: 3, lunch: 0, dinner: 0, morningSnack: 0, afternoonSnack: 0 },
        [formatDate(new Date(today.getFullYear(), today.getMonth(), 20))]: { breakfast: 3, lunch: 0, dinner: 0, morningSnack: 0, afternoonSnack: 0 },
        [formatDate(new Date(today.getFullYear(), today.getMonth(), 21))]: { breakfast: 3, lunch: 0, dinner: 0, morningSnack: 0, afternoonSnack: 0 },
    }
  },
  { 
    id: 'res5', 
    roomId: 'bunk_3', 
    roomType: 'bunk', 
    guestName: 'Eve', 
    dni: '99887766E',
    phone: '600999000',
    observations: 'Llegará tarde el primer día.',
    checkIn: formatDate(new Date(today.getFullYear(), today.getMonth(), 1)), 
    checkOut: formatDate(new Date(today.getFullYear(), today.getMonth(), 30)) 
  },
];