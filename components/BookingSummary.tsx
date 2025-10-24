import React from 'react';
import { RoomSelection, RoomType } from '../types';
import { UserIcon } from './icons/UserIcon';
import { BedIcon } from './icons/BedIcon';

interface BookingSummaryProps {
  roomSelection: RoomSelection;
  roomTypes: RoomType[];
  totalRooms: number;
  totalGuests: number;
}

const BookingSummary: React.FC<BookingSummaryProps> = ({ roomSelection, roomTypes, totalRooms, totalGuests }) => {
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg sticky top-6">
      <h2 className="text-3xl font-bold text-slate-800 mb-6 border-b pb-4">Resumen de la Reserva</h2>
      {totalRooms === 0 ? (
        <p className="text-slate-500 text-center py-8">Selecciona habitaciones para ver tu resumen.</p>
      ) : (
        <>
          <ul className="space-y-3 mb-6">
            {Object.entries(roomSelection)
              // FIX: Explicitly cast count to a number to satisfy TypeScript's type checker.
              .filter(([, count]) => Number(count) > 0)
              .map(([roomId, count]) => {
                const room = roomTypes.find(r => r.id === roomId);
                if (!room) return null;
                return (
                  <li key={roomId} className="flex justify-between items-center text-slate-700">
                    <span>{room.name}</span>
                    <span className="font-semibold">{`x ${count}`}</span>
                  </li>
                );
              })}
          </ul>
          <div className="border-t pt-4 space-y-4">
            <div className="flex justify-between items-center text-lg">
              <span className="text-slate-600 flex items-center"><BedIcon className="w-5 h-5 mr-2"/> Total Habitaciones:</span>
              <span className="font-bold text-slate-800">{totalRooms}</span>
            </div>
            <div className="flex justify-between items-center text-lg">
              <span className="text-slate-600 flex items-center"><UserIcon className="w-5 h-5 mr-2"/> Capacidad Total:</span>
              <span className="font-bold text-slate-800">{totalGuests} Huéspedes</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BookingSummary;