// FIX: Imported DiningSelection to use as a type for DINING_OPTIONS.
import { RoomType, IndividualRoom, Reservation, IndividualReservation, DiningSelection } from './types';

// Source of truth from the provided PDF
// FIX: Export ALL_ROOMS_DATA to make it available for import in other modules.
export const ALL_ROOMS_DATA = [
    // Cuádruple (Capacity 4)
    { number: 16, type: 'quad', typeName: 'Habitación Cuádruple', floor: '1º Jardín', description: '2 literas (4 huéspedes), vistas al jardín' },
    { number: 18, type: 'quad', typeName: 'Habitación Cuádruple', floor: '1º Jardín', description: '2 literas (4 huéspedes), vistas al jardín' },
    { number: 20, type: 'quad', typeName: 'Habitación Cuádruple', floor: '1º Jardín', description: '2 literas (4 huéspedes), vistas al jardín' },
    { number: 44, type: 'quad', typeName: 'Habitación Cuádruple', floor: '2º Jardín', description: '2 literas (4 huéspedes), vistas al jardín' },
    { number: 46, type: 'quad', typeName: 'Habitación Cuádruple', floor: '2º Jardín', description: '2 literas (4 huéspedes), vistas al jardín' },
    { number: 48, type: 'quad', typeName: 'Habitación Cuádruple', floor: '2º Jardín', description: '2 literas (4 huéspedes), vistas al jardín' },
    // Doble (Capacity 2)
    { number: 21, type: 'double', typeName: 'Habitación Doble', floor: '1º Xerta', description: '2 camas (2 huéspedes), vistas a Xerta' },
    { number: 22, type: 'double', typeName: 'Habitación Doble', floor: '1º Jardín', description: '2 camas (2 huéspedes), vistas al jardín' },
    { number: 45, type: 'double', typeName: 'Habitación Doble', floor: '2º Xerta', description: '2 camas (2 huéspedes), vistas a Xerta' },
    { number: 50, type: 'double', typeName: 'Habitación Doble', floor: '2º Jardín', description: '2 camas (2 huéspedes), vistas al jardín' },
    // Individual (Capacity 1)
    { number: 1, type: 'single', typeName: 'Habitación Individual', floor: '1º Xerta', description: '1 cama individual (1 huésped)' },
    { number: 2, type: 'single', typeName: 'Habitación Individual', floor: '1º Jardín', description: '1 cama individual (1 huésped)' },
    { number: 3, type: 'single', typeName: 'Habitación Individual', floor: '1º Xerta', description: '1 cama individual (1 huésped)' },
    { number: 4, type: 'single', typeName: 'Habitación Individual', floor: '1º Jardín', description: '1 cama individual (1 huésped)' },
    { number: 5, type: 'single', typeName: 'Habitación Individual', floor: '1º Xerta', description: '1 cama individual (1 huésped)' },
    { number: 6, type: 'single', typeName: 'Habitación Individual', floor: '1º Jardín', description: '1 cama individual (1 huésped)' },
    { number: 7, type: 'single', typeName: 'Habitación Individual', floor: '1º Xerta', description: '1 cama individual (1 huésped)' },
    { number: 8, type: 'single', typeName: 'Habitación Individual', floor: '1º Jardín', description: '1 cama individual (1 huésped)' },
    { number: 9, type: 'single', typeName: 'Habitación Individual', floor: '1º Xerta', description: '1 cama individual (1 huésped)' },
    { number: 10, type: 'single', typeName: 'Habitación Individual', floor: '1º Jardín', description: '1 cama individual (1 huésped)' },
    { number: 11, type: 'single', typeName: 'Habitación Individual', floor: '1º Xerta', description: '1 cama individual (1 huésped)' },
    { number: 12, type: 'single', typeName: 'Habitación Individual', floor: '1º Jardín', description: '1 cama individual (1 huésped)' },
    { number: 13, type: 'single', typeName: 'Habitación Individual', floor: '1º Xerta', description: '1 cama individual (1 huésped)' },
    { number: 14, type: 'single', typeName: 'Habitación Individual', floor: '1º Jardín', description: '1 cama individual (1 huésped)' },
    { number: 15, type: 'single', typeName: 'Habitación Individual', floor: '1º Xerta', description: '1 cama individual (1 huésped)' },
    { number: 17, type: 'single', typeName: 'Habitación Individual', floor: '1º Xerta', description: '1 cama individual (1 huésped)' },
    { number: 19, type: 'single', typeName: 'Habitación Individual', floor: '1º Xerta', description: '1 cama individual (1 huésped)' },
    { number: 30, type: 'single', typeName: 'Habitación Individual', floor: '1º Jardín', description: '1 cama individual (1 huésped)' },
    { number: 32, type: 'single', typeName: 'Habitación Individual', floor: '1º Jardín', description: '1 cama individual (1 huésped)' },
    { number: 38, type: 'single', typeName: 'Habitación Individual', floor: '1º Jardín', description: '1 cama individual (1 huésped)' },
    { number: 40, type: 'single', typeName: 'Habitación Individual', floor: '1º Jardín', description: '1 cama individual (1 huésped)' },
    { number: 42, type: 'single', typeName: 'Habitación Individual', floor: '1º Jardín', description: '1 cama individual (1 huésped)' },
    { number: 29, type: 'single', typeName: 'Habitación Individual', floor: '2º Xerta', description: '1 cama individual (1 huésped)' },
    { number: 31, type: 'single', typeName: 'Habitación Individual', floor: '2º Xerta', description: '1 cama individual (1 huésped)' },
    { number: 33, type: 'single', typeName: 'Habitación Individual', floor: '2º Xerta', description: '1 cama individual (1 huésped)' },
    { number: 35, type: 'single', typeName: 'Habitación Individual', floor: '2º Xerta', description: '1 cama individual (1 huésped)' },
    { number: 37, type: 'single', typeName: 'Habitación Individual', floor: '2º Xerta', description: '1 cama individual (1 huésped)' },
    { number: 39, type: 'single', typeName: 'Habitación Individual', floor: '2º Xerta', description: '1 cama individual (1 huésped)' },
    { number: 41, type: 'single', typeName: 'Habitación Individual', floor: '2º Xerta', description: '1 cama individual (1 huésped)' },
    { number: 43, type: 'single', typeName: 'Habitación Individual', floor: '2º Xerta', description: '1 cama individual (1 huésped)' },
    // Doble con litera (Capacity 2)
    { number: 23, type: 'bunk', typeName: 'Habitación Doble (Litera)', floor: '1º Xerta', description: '1 litera (2 huéspedes)' },
    { number: 25, type: 'bunk', typeName: 'Habitación Doble (Litera)', floor: '1º Xerta', description: '1 litera (2 huéspedes)' },
    { number: 27, type: 'bunk', typeName: 'Habitación Doble (Litera)', floor: '1º Xerta', description: '1 litera (2 huéspedes)' },
    { number: 28, type: 'bunk', typeName: 'Habitación Doble (Litera)', floor: '1º Xerta', description: '1 litera (2 huéspedes)' },
    { number: 47, type: 'bunk', typeName: 'Habitación Doble (Litera)', floor: '2º Jardín', description: '1 litera (2 huéspedes)' },
    { number: 49, type: 'bunk', typeName: 'Habitación Doble (Litera)', floor: '2º Jardín', description: '1 litera (2 huéspedes)' },
    { number: 51, type: 'bunk', typeName: 'Habitación Doble (Litera)', floor: '2º Jardín', description: '1 litera (2 huéspedes)' },
    { number: 53, type: 'bunk', typeName: 'Habitación Doble (Litera)', floor: '2º Jardín', description: '1 litera (2 huéspedes)' },
    // Triple (Capacity 3)
    { number: 24, type: 'triple', typeName: 'Habitación Triple', floor: '1º Jardín', description: '1 cama matrimonio + litera superior (3 huéspedes)' },
    { number: 52, type: 'triple', typeName: 'Habitación Triple', floor: '2º Jardín', description: '1 cama matrimonio + 1 cama individual (3 huéspedes)' },
    // Especial (Capacity 1)
    { number: 26, type: 'special', typeName: 'Habitación Especial (Adaptada)', floor: '1º Jardín', description: '1 cama adaptada (1 huésped)' },
    { number: 54, type: 'special', typeName: 'Habitación Especial (Adaptada)', floor: '2º Xerta', description: '1 cama adaptada (1 huésped)' },
];

export const ROOM_TYPES: RoomType[] = [
  {
    id: 'quad',
    name: 'Habitación Cuádruple',
    description: '2 literas para 4 huéspedes. Algunas habitaciones tienen vistas al jardín.',
    capacity: 4,
    available: 6,
    image: 'https://picsum.photos/seed/quad/600/400',
    price: 80,
    priceUnit: 'per_day',
    bedConfiguration: '2 Literas',
  },
  {
    id: 'double',
    name: 'Habitación Doble',
    description: 'Habitación con 2 camas individuales para 2 huéspedes.',
    capacity: 2,
    available: 4,
    image: 'https://picsum.photos/seed/double/600/400',
    price: 60,
    priceUnit: 'per_day',
    bedConfiguration: '2 Camas',
  },
  {
    id: 'single',
    name: 'Habitación Individual',
    description: 'Privacidad y confort para viajeros solos. Capacidad para 1 persona.',
    capacity: 1,
    available: 30,
    image: 'https://picsum.photos/seed/single/600/400',
    price: 40,
    priceUnit: 'per_day',
    bedConfiguration: '1 Cama Individual',
  },
  {
    id: 'bunk',
    name: 'Habitación Doble (Litera)',
    description: 'Habitación con 1 litera para 2 huéspedes.',
    capacity: 2,
    available: 8,
    image: 'https://picsum.photos/seed/bunk/600/400',
    price: 55,
    priceUnit: 'per_day',
    bedConfiguration: '1 Litera',
  },
  {
    id: 'triple',
    name: 'Habitación Triple',
    description: 'Espacio para 3 huéspedes, con cama de matrimonio y cama individual o litera superior.',
    capacity: 3,
    available: 2,
    image: 'https://picsum.photos/seed/triple/600/400',
    price: 75,
    priceUnit: 'per_day',
    bedConfiguration: '1 Matrimonio + 1 Individual/Litera',
  },
  {
    id: 'special',
    name: 'Habitación Especial (Adaptada)',
    description: 'Habitación individual adaptada para personas con movilidad reducida.',
    capacity: 1,
    available: 2,
    image: 'https://picsum.photos/seed/special/600/400',
    price: 50,
    priceUnit: 'per_day',
    bedConfiguration: '1 Cama Individual Adaptada',
  },
];

// FIX: Added and exported DINING_OPTIONS constant.
export const DINING_OPTIONS: { id: keyof DiningSelection; label: string }[] = [
    { id: 'breakfast', label: 'Desayuno' },
    { id: 'morningSnack', label: 'Almuerzo' },
    { id: 'lunch', label: 'Comida' },
    { id: 'afternoonSnack', label: 'Merienda' },
    { id: 'dinner', label: 'Cena' },
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
    name: 'FOTOCOPIAS',
    description: 'Servicio de fotocopias y soporte administrativo. El precio es por unidad (ej. por fotocopia).',
    capacity: 1, 
    available: 1,
    image: 'https://picsum.photos/seed/secretarial/600/400',
    price: 0.07,
    priceUnit: 'one_time',
  },
];

export const INDIVIDUAL_ROOMS: IndividualRoom[] = ALL_ROOMS_DATA.map(room => ({
    id: `${room.type}_${room.number}`,
    type: room.type,
    name: `${room.number} ${room.typeName} (${room.floor})`,
    description: (room as any).description,
}));

export const INDIVIDUAL_SERVICES: IndividualRoom[] = SERVICE_TYPES.flatMap(serviceType => 
  Array.from({ length: serviceType.available }, (_, i) => ({
      id: `${serviceType.id}_${i + 1}`,
      type: serviceType.id,
      name: `${serviceType.name} ${i + 1}`,
  }))
);

export const ALL_INDIVIDUAL_ITEMS: IndividualRoom[] = [...INDIVIDUAL_ROOMS, ...INDIVIDUAL_SERVICES];

const today = new Date();
const formatDate = (date: Date) => date.toISOString().split('T')[0];

export const MOCK_RESERVATIONS: Reservation[] = [
  { 
    id: 'res1', 
    roomId: 'quad_16', 
    roomType: 'quad', 
    guestName: 'Alice', 
    groupName: 'Familia Smith',
    dni: '12345678A',
    phone: '600111222',
    observations: 'Quiere una habitación tranquila.',
    checkIn: formatDate(new Date(today.getFullYear(), today.getMonth(), 2)), 
    checkOut: formatDate(new Date(today.getFullYear(), today.getMonth(), 5)),
  },
  { 
    id: 'res6', 
    roomId: 'double_21', 
    roomType: 'double', 
    guestName: 'Alice', 
    groupName: 'Familia Smith',
    dni: '12345678A',
    phone: '600111222',
    observations: 'Quiere una habitación tranquila.',
    checkIn: formatDate(new Date(today.getFullYear(), today.getMonth(), 2)), 
    checkOut: formatDate(new Date(today.getFullYear(), today.getMonth(), 4)),
  },
  { 
    id: 'res2', 
    roomId: 'double_22', 
    roomType: 'double', 
    guestName: 'Bob', 
    groupName: 'Empresa TechSol',
    dni: '87654321B',
    phone: '600333444',
    observations: '',
    checkIn: formatDate(new Date(today.getFullYear(), today.getMonth(), 7)), 
    checkOut: formatDate(new Date(today.getFullYear(), today.getMonth(), 9)),
    otherServices: {
        [formatDate(new Date(today.getFullYear(), today.getMonth(), 7))]: {
            'small_hall': [{ startTime: '10:00', endTime: '13:00' }],
        },
        [formatDate(new Date(today.getFullYear(), today.getMonth(), 8))]: {
            'small_hall': [{ startTime: '10:00', endTime: '18:00' }],
        },
    },
    unitServices: {
        [formatDate(new Date(today.getFullYear(), today.getMonth(), 7))]: {
            'secretarial_services': 50
        },
        [formatDate(new Date(today.getFullYear(), today.getMonth(), 8))]: {
            'secretarial_services': 25
        },
    },
    // FIX: Added sample dining data.
    dining: {
        [formatDate(new Date(today.getFullYear(), today.getMonth(), 7))]: {
            breakfast: 2, lunch: 2, dinner: 0, morningSnack: 0, afternoonSnack: 0,
        },
        [formatDate(new Date(today.getFullYear(), today.getMonth(), 8))]: {
            breakfast: 2, lunch: 0, dinner: 2, morningSnack: 0, afternoonSnack: 0,
        },
    },
  },
   { 
    id: 'res2b', 
    roomId: 'small_hall_1', 
    roomType: 'small_hall', 
    guestName: 'Bob', 
    groupName: 'Empresa TechSol',
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
    groupName: 'Empresa TechSol',
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
    groupName: 'Empresa TechSol',
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
    roomId: 'quad_18', 
    roomType: 'quad', 
    guestName: 'Diana', 
    dni: '55667788D',
    phone: '600777888',
    observations: '',
    checkIn: formatDate(new Date(today.getFullYear(), today.getMonth(), 18)), 
    checkOut: formatDate(new Date(today.getFullYear(), today.getMonth(), 22)),
  },
  { 
    id: 'res5', 
    roomId: 'bunk_27', 
    roomType: 'bunk', 
    guestName: 'Eve', 
    dni: '99887766E',
    phone: '600999000',
    observations: 'Llegará tarde el primer día.',
    checkIn: formatDate(new Date(today.getFullYear(), today.getMonth(), 1)), 
    checkOut: formatDate(new Date(today.getFullYear(), today.getMonth(), 30)) 
  },
];

export const ESTABLISHMENT_DETAILS = {
    policeId: 'ID50008751',
    establishmentName: 'ALBERGUE MARIA ROSA MOLAS',
    hasInternet: true,
};

export const MOCK_INDIVIDUAL_RESERVATIONS: IndividualReservation[] = [
    {
        id: 'indiv_res_1',
        status: 'pending_guest',
        contractDetails: {
            ...ESTABLISHMENT_DETAILS,
            contractNumber: 'C-2024-001',
            formalizationDate: formatDate(new Date()),
            contractType: 'RESERVA',
            checkInDate: formatDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 5)),
            checkOutDate: formatDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 10)),
            roomNumber: '12',
            travelers: 1,
            paymentType: 'Tarjeta de crédito',
        },
        guestPersonalDetails: {
            name: 'Juan',
            firstSurname: 'Pérez',
        },
        guestIdDetails: {},
        guestAddressDetails: {},
    },
    {
        id: 'indiv_res_2',
        status: 'completed',
        contractDetails: {
            ...ESTABLISHMENT_DETAILS,
            contractNumber: 'C-2024-002',
            formalizationDate: formatDate(new Date()),
            contractType: 'RESERVA',
            checkInDate: formatDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 2)),
            checkOutDate: formatDate(new Date(today.getFullYear(), today.getMonth(), today.getDate() + 4)),
            roomNumber: '3',
            travelers: 1,
            paymentType: 'Efectivo',
        },
        guestIdDetails: {
            documentType: 'NIF',
            documentNumber: '12345678Z',
        },
        guestPersonalDetails: {
            name: 'Ana',
            firstSurname: 'García',
            secondSurname: 'López',
            sex: 'Mujer',
            birthDate: '1990-05-15',
            nationality: 'Española',
            email: 'ana.garcia@email.com',
            phone: '600123456',
        },
        guestAddressDetails: {
            address: 'Calle Mayor 1',
            country: 'España',
            province: 'Madrid',
            municipality: 'Madrid',
            locality: 'Madrid',
            postalCode: '28001'
        },
        consents: {
            healthData: true,
            commercialInfo: false,
            imageUse: false,
        }
    }
];