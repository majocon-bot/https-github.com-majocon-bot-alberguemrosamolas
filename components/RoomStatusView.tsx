import React, { useState, useMemo } from 'react';
import { Reservation, RoomType, IndividualReservation } from '../types';
import { UserIcon } from './icons/UserIcon';
import { BedIcon } from './icons/BedIcon';
import { MapPinIcon } from './icons/MapPinIcon';

interface RoomData {
    number: number;
    type: string;
    typeName: string;
    floor: string;
}

interface RoomStatusViewProps {
  reservations: Reservation[];
  individualReservations: IndividualReservation[];
  allRooms: RoomData[];
  roomTypes: RoomType[];
}

const formatDate = (date: Date): string => date.toISOString().split('T')[0];

const getRoomTypeHeaderStyles = (type: string): string => {
    switch (type) {
        case 'single': return 'bg-blue-500 text-white';
        case 'double': return 'bg-green-500 text-white';
        case 'triple': return 'bg-yellow-500 text-slate-800';
        case 'quad': return 'bg-purple-500 text-white';
        case 'bunk': return 'bg-orange-500 text-white';
        case 'special': return 'bg-pink-500 text-white';
        default: return 'bg-slate-500 text-white';
    }
};

const RoomStatusView: React.FC<RoomStatusViewProps> = ({ reservations, individualReservations, allRooms, roomTypes }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value) {
      setSelectedDate(new Date(value + 'T00:00:00'));
    }
  };
  
  const allBookings = useMemo(() => {
    const combined: { roomId: string, guestName: string, checkIn: string, checkOut: string}[] = reservations.map(r => ({
      roomId: r.roomId,
      guestName: r.groupName || r.guestName,
      checkIn: r.checkIn,
      checkOut: r.checkOut,
    }));
    
    individualReservations.forEach(ir => {
      const roomType = allRooms.find(r => r.number === Number(ir.contractDetails.roomNumber))?.type;
      if (roomType) {
        combined.push({
          roomId: `${roomType}_${ir.contractDetails.roomNumber}`,
          guestName: `${ir.guestPersonalDetails.firstSurname}, ${ir.guestPersonalDetails.name}`,
          checkIn: ir.contractDetails.checkInDate,
          checkOut: ir.contractDetails.checkOutDate,
        });
      }
    });

    return combined;
  }, [reservations, individualReservations, allRooms]);


  const roomStatuses = useMemo(() => {
    const selectedDateStr = formatDate(selectedDate);
    
    return allRooms
        .filter(room => roomTypes.some(rt => rt.id === room.type))
        .map(room => {
            const roomTypeDetails = roomTypes.find(rt => rt.id === room.type);
            const booking = allBookings.find(res => 
                res.roomId === `${room.type}_${room.number}` &&
                selectedDateStr >= res.checkIn &&
                selectedDateStr < res.checkOut
            );

            return {
                ...room,
                ...roomTypeDetails,
                isOccupied: !!booking,
                bookingDetails: booking,
            };
        })
        .sort((a, b) => a.number - b.number);

  }, [selectedDate, allBookings, allRooms, roomTypes]);

  return (
    <div className="space-y-8 animate-fade-in-up">
      <header className="text-center">
        <h1 className="text-5xl font-extrabold text-slate-800">Estado de las Habitaciones</h1>
        <p className="text-xl text-slate-500 mt-2">Selecciona una fecha para ver la ocupación.</p>
      </header>
      
      <div className="flex justify-center">
        <div className="relative">
          <label htmlFor="status-date-picker" className="sr-only">Seleccionar Fecha</label>
          <input 
            type="date"
            id="status-date-picker"
            value={formatDate(selectedDate)}
            onChange={handleDateChange}
            className="bg-white border-2 border-slate-300 text-slate-900 text-lg rounded-lg focus:ring-indigo-500 focus:border-indigo-500 block w-full p-2.5 pl-10"
          />
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <svg className="w-5 h-5 text-slate-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd"></path></svg>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-6">
        {roomStatuses.map(room => (
          <div 
            key={room.number}
            className={`rounded-xl shadow-lg flex flex-col transition-all duration-300 border-4 ${room.isOccupied ? 'border-red-400 bg-red-50' : 'border-green-400 bg-green-50'}`}
          >
            <div className={`p-4 rounded-t-lg ${getRoomTypeHeaderStyles(room.type)}`}>
              <h2 className="text-2xl font-bold text-center">Hab. Nº {room.number}</h2>
            </div>
            
            <div className="p-4 flex-grow flex flex-col">
                <p className="font-semibold text-slate-700 text-center text-lg">{room.name}</p>
                <div className="my-3 border-t border-slate-200"></div>
                <div className="space-y-2 text-slate-600 text-base">
                    <div className="flex items-center space-x-2">
                        <UserIcon className="w-5 h-5 text-indigo-500"/>
                        <span>{room.capacity} Huéspedes</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <BedIcon className="w-5 h-5 text-indigo-500"/>
                        <span>{room.bedConfiguration || 'No especificado'}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <MapPinIcon className="w-5 h-5 text-indigo-500"/>
                        <span>{room.floor}</span>
                    </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-200 flex-grow flex items-end">
                    {room.isOccupied && room.bookingDetails ? (
                        <div className="text-sm">
                            <p className="font-bold text-red-700">Ocupado por: {room.bookingDetails.guestName}</p>
                            <p className="text-slate-500">
                                {new Date(room.bookingDetails.checkIn).toLocaleDateString('es-ES', {timeZone: 'UTC'})} - {new Date(room.bookingDetails.checkOut).toLocaleDateString('es-ES', {timeZone: 'UTC'})}
                            </p>
                        </div>
                    ) : (
                        <p className="font-bold text-green-700 text-lg">Disponible</p>
                    )}
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RoomStatusView;