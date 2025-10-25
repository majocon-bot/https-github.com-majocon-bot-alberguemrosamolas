export interface RoomType {
  id: string;
  name: string;
  description: string;
  capacity: number;
  available: number;
  image: string;
  price?: number;
  priceUnit?: 'per_day' | 'per_hour' | 'one_time';
}

export interface RoomSelection {
  [roomId: string]: number;
}

export interface DiningSelection {
  breakfast: number;
  lunch: number;
  dinner: number;
  morningSnack: number;
  afternoonSnack: number;
}

export interface TimeSlot {
  startTime: string;
  endTime: string;
}

export interface BookingDetails {
  name: string;
  dni: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  observations: string;
  dining: { [date: string]: DiningSelection };
  otherServices: { [date: string]: { [serviceId: string]: TimeSlot[] } };
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
  dni: string;
  phone: string;
  observations: string;
  checkIn: string; // YYYY-MM-DD
  checkOut: string; // YYYY-MM-DD
  dining?: { [date: string]: DiningSelection };
  otherServices?: { [date: string]: { [serviceId: string]: TimeSlot[] } };
}

export interface IndividualRoom {
    id: string; // quad_1
    type: string; // quad
    name: string; // Habitación Cuádruple 1
}

export interface GroupedReservation {
  guestName: string;
  minCheckIn: string;
  maxCheckOut: string;
  roomSummary: { [roomType: string]: number };
  diningSummary: { [date: string]: DiningSelection };
  otherServicesSummary: { [date: string]: { [serviceId: string]: TimeSlot[] } };
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
}