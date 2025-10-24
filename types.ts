export interface RoomType {
  id: string;
  name: string;
  description: string;
  capacity: number;
  available: number;
  image: string;
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

export interface BookingDetails {
  name: string;
  dni: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  observations: string;
  dining: { [date: string]: DiningSelection };
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
  totalGuests: number;
  reservations: Reservation[]; // Keep track of original reservations
}