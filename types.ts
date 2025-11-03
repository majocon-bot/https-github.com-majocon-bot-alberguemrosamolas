

export interface RoomType {
  id: string;
  name: string;
  description: string;
  capacity: number;
  available: number;
  image: string;
  price?: number;
  priceUnit?: 'per_day' | 'per_hour' | 'one_time';
  bedConfiguration?: string;
}

export interface RoomSelection {
  [roomId: string]: number;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
}

// FIX: Added DiningSelection interface for dining services.
export interface DiningSelection {
  breakfast: number;
  lunch: number;
  dinner: number;
  morningSnack: number;
  afternoonSnack: number;
}

export interface BookingDetails {
  name: string;
  groupName: string;
  dni: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  observations: string;
  otherServices: { [date: string]: { [serviceId: string]: TimeSlot[] } };
  unitServices?: { [date: string]: { [serviceId: string]: number } };
  // FIX: Added optional dining property.
  dining?: { [date: string]: DiningSelection };
}

export interface FullBooking {
  roomSelection: RoomSelection;
  details: BookingDetails;
}

export interface Reservation {
  id: string;
  roomId: string; // quad_1, quad_2
  roomType: string; // quad
  guestName: string;
  groupName?: string;
  dni: string;
  phone: string;
  observations: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  otherServices?: { [date: string]: { [serviceId: string]: TimeSlot[] } };
  unitServices?: { [date: string]: { [serviceId: string]: number } };
  // FIX: Added optional dining property.
  dining?: { [date: string]: DiningSelection };
}

export interface IndividualRoom {
    id: string; // quad_1
    type: string; // quad
    name: string; // Habitación Cuádruple 1
    description?: string;
}

export interface GroupedReservation {
  guestName: string;
  groupName?: string;
  minCheckIn: string;
  maxCheckOut: string;
  roomSummary: { [roomType: string]: number };
  otherServicesSummary: { [date: string]: { [serviceId: string]: TimeSlot[] } };
  unitServicesSummary?: { [date: string]: { [serviceId: string]: number } };
  totalGuests: number;
  reservations: Reservation[]; // Keep track of original reservations
}

export interface GroupedReservationWithCost extends GroupedReservation {
  totalCost: number;
}

export interface ServiceBooking {
  guestName: string;
  date: string;
  serviceId: string;
  serviceName: string;
  startTime: string;
  endTime: string;
  price?: number;
  priceUnit?: 'per_day' | 'per_hour' | 'one_time';
  slotIndex: number;
  units?: number;
}

export interface FiscalDetails {
    companyName: string;
    taxId: string;
    address: string;
    phone: string;
    email: string;
}

// New Interfaces for Individual Reservation Form
export interface ContractDetails {
  policeId: string;
  establishmentName: string;
  contractNumber: string;
  formalizationDate: string;
  contractType: 'RESERVA' | 'CONTRATO_EN_CURSO';
  checkInDate: string;
  checkOutDate: string;
  roomNumber: string;
  travelers: number;
  paymentType: string;
  hasInternet: boolean;
}

export interface GuestIdDetails {
  documentType: 'NIF' | 'NIE' | 'Pasaporte' | '';
  documentNumber: string;
  supportDocumentNumber?: string;
  expeditionDate?: string;
}

export interface GuestPersonalDetails {
  name: string;
  firstSurname: string;
  secondSurname?: string;
  sex: 'Hombre' | 'Mujer' | 'Otro' | '';
  birthDate: string;
  nationality: string;
  email: string;
  phone: string;
  kinship?: string;
}

export interface GuestAddressDetails {
  address: string;
  country: string;
  province?: string;
  municipality?: string;
  locality: string;
  postalCode: string;
}

export interface IndividualReservation {
  id: string;
  status: 'pending_staff' | 'pending_guest' | 'completed';
  contractDetails: ContractDetails;
  guestIdDetails: Partial<GuestIdDetails>;
  guestPersonalDetails: Partial<GuestPersonalDetails>;
  guestAddressDetails: Partial<GuestAddressDetails>;
  signature?: {
    signed: boolean;
    locationAndDate: string;
  };
  consents?: {
    healthData: boolean;
    commercialInfo: boolean;
    imageUse: boolean;
  };
}