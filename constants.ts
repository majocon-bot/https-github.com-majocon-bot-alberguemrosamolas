import { RoomType, IndividualRoom, Reservation } from './types';

export const ROOM_TYPES: RoomType[] = [
  {
    id: 'quad',
    name: 'Habitación Cuádruple',
    description: 'Ideal para pequeños grupos y amigos.',
    capacity: 4,
    available: 6,
    image: 'https://picsum.photos/seed/quad/600/400',
    price: 80,
    priceUnit: 'per_day',
  },
  {
    id: 'double',
    name: 'Habitación Doble',
    description: 'Perfecta para parejas o compañeros.',
    capacity: 2,
    available: 4,
    image: 'https://picsum.photos/seed/double/600/400',
    price: 60,
    priceUnit: 'per_day',
  },
  {
    id: 'single',
    name: 'Habitación Individual',
    description: 'Privacidad y confort para viajeros solos.',
    capacity: 1,
    available: 30,
    image: 'https://picsum.photos/seed/single/600/400',
    price: 40,
    priceUnit: 'per_day',
  },
  {
    id: 'bunk',
    name: 'Habitación con Doble Litera',
    description: 'Una opción divertida y económica.',
    capacity: 4,
    available: 8,
    image: 'https://picsum.photos/seed/bunk/600/400',
    price: 70,
    priceUnit: 'per_day',
  },
  {
    id: 'triple',
    name: 'Habitación Triple',
    description: 'Espacio extra para grupos de tres.',
    capacity: 3,
    available: 2,
    image: 'https://picsum.photos/seed/triple/600/400',
    price: 75,
    priceUnit: 'per_day',
  },
  {
    id: 'special',
    name: 'Habitación Especial',
    description: 'Perfecta para familias pequeñas (2+1), con una cama supletoria.',
    capacity: 3,
    available: 2,
    image: 'https://picsum.photos/seed/special/600/400',
    price: 85,
    priceUnit: 'per_day',
  },
];

export const SERVICE_TYPES: RoomType[] = [
  {
    id: 'small_hall',
    name: 'SALA PEQUEÑA',
    description: 'Espacio acogedor para reuniones de hasta 30 personas.',
    capacity: 30,
    available: 3,
    image: 'https://picsum.photos/seed/small_hall/600/400',
    price: 33,
    priceUnit: 'per_day',
  },
  {
    id: 'medium_hall',
    name: 'SALA MEDIANA',
    description: 'Perfecta para talleres y presentaciones de hasta 50 personas.',
    capacity: 50,
    available: 2,
    image: 'https://picsum.photos/seed/medium_hall/600/400',
    price: 55,
    priceUnit: 'per_day',
  },
  {
    id: 'large_hall',
    name: 'SALA GRANDE',
    description: 'Ideal para eventos y conferencias de hasta 70 personas.',
    capacity: 70,
    available: 1,
    image: 'https://picsum.photos/seed/large_hall/600/400',
    price: 77,
    priceUnit: 'per_day',
  },
  {
    id: 'other_halls',
    name: 'OTRAS SALAS SALONES',
    description: 'Salones versátiles para diversas actividades, para 20 personas.',
    capacity: 20,
    available: 5,
    image: 'https://picsum.photos/seed/other_halls/600/400',
    price: 22,
    priceUnit: 'per_day',
  },
  {
    id: 'secretarial_services',
    name: 'SERVICIOS SECRETARIA',
    description: 'Soporte administrativo y de secretaría por horas.',
    capacity: 1, // Represents one person using the service, not a capacity
    available: 10, // e.g., 10 hours available per day
    image: 'https://picsum.photos/seed/secretarial/600/400',
    price: 10, // Adjusted price for easier calculation
    priceUnit: 'per_hour',
  },
];


export const INDIVIDUAL_ROOMS: IndividualRoom[] = ROOM_TYPES.flatMap(roomType => 
  Array.from({ length: roomType.available }, (_, i) => ({
      id: `${roomType.id}_${i + 1}`,
      type: roomType.id,
      name: `${roomType.name} ${i + 1}`,
  }))
);

export const INDIVIDUAL_SERVICES: IndividualRoom[] = SERVICE_TYPES.flatMap(serviceType => 
  Array.from({ length: serviceType.available }, (_, i) => ({
      id: `${serviceType.id}_${i + 1}`,
      type: serviceType.id,
      name: `${serviceType.name} ${i + 1}`,
  }))
);

export const ALL_INDIVIDUAL_ITEMS: IndividualRoom[] = [...INDIVIDUAL_ROOMS, ...INDIVIDUAL_SERVICES];

export const DINING_OPTIONS = [
    { id: 'breakfast', label: 'Desayuno', price: 8 },
    { id: 'lunch', label: 'Comida', price: 15 },
    { id: 'dinner', label: 'Cena', price: 12 },
    { id: 'morningSnack', label: 'Tomar Mañana', price: 4 },
    { id: 'afternoonSnack', label: 'Tomar Merienda', price: 4 }
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
    },
    otherServices: {
        [formatDate(new Date(today.getFullYear(), today.getMonth(), 7))]: {
            'small_hall': [{ startTime: '10:00', endTime: '13:00' }],
            'secretarial_services': [
                { startTime: '09:00', endTime: '11:00' },
                { startTime: '15:00', endTime: '16:00' }
            ]
        },
        [formatDate(new Date(today.getFullYear(), today.getMonth(), 8))]: {
            'small_hall': [{ startTime: '10:00', endTime: '18:00' }],
            'secretarial_services': [{ startTime: '09:00', endTime: '12:00' }]
        },
    }
  },
   { 
    id: 'res2b', 
    roomId: 'small_hall_1', 
    roomType: 'small_hall', 
    guestName: 'Bob', 
    dni: '87654321B',
    phone: '600333444',
    observations: '',
    checkIn: formatDate(new Date(today.getFullYear(), today.getMonth(), 7)), 
    checkOut: formatDate(new Date(today.getFullYear(), today.getMonth(), 9)),
  },
  { 
    id: 'res2c', 
    roomId: 'secretarial_services_1', 
    roomType: 'secretarial_services', 
    guestName: 'Bob', 
    dni: '87654321B',
    phone: '600333444',
    observations: '',
    checkIn: formatDate(new Date(today.getFullYear(), today.getMonth(), 7)), 
    checkOut: formatDate(new Date(today.getFullYear(), today.getMonth(), 9)),
  },
  { 
    id: 'res2d', 
    roomId: 'secretarial_services_2', 
    roomType: 'secretarial_services', 
    guestName: 'Bob', 
    dni: '87654321B',
    phone: '600333444',
    observations: '',
    checkIn: formatDate(new Date(today.getFullYear(), today.getMonth(), 7)), 
    checkOut: formatDate(new Date(today.getFullYear(), today.getMonth(), 9)),
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