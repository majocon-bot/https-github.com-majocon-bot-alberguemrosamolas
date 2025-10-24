import React from 'react';
import { RoomSelection, RoomType } from '../types';
import { UserIcon } from './icons/UserIcon';
import { BedIcon } from './icons/BedIcon';
import { BriefcaseIcon } from './icons/BriefcaseIcon';

interface BookingSummaryProps {
  roomSelection: RoomSelection;
  roomTypes: RoomType[];
  serviceTypes: RoomType[];
  totalRooms: number;
  totalGuests: number;
}

const BookingSummary: React.FC<BookingSummaryProps> = ({ roomSelection, roomTypes, serviceTypes, totalRooms, totalGuests }) => {
  const selectedRooms = Object.entries(roomSelection).filter(([roomId]) => roomTypes.some(rt => rt.id === roomId) && (roomSelection[roomId] ?? 0) > 0);
  const selectedServices = Object.entries(roomSelection).filter(([roomId]) => serviceTypes.some(st => st.id === roomId) && (roomSelection[roomId] ?? 0) > 0);
  const totalServices = selectedServices.reduce((sum, [, count]) => sum + Number(count), 0);
  
  return (
    <div className="bg-white p-6 rounded-xl shadow-lg sticky top-6">
      <h2 className="text-3xl font-bold text-slate-800 mb-6 border-b pb-4">Resumen de la Reserva</h2>
      {totalRooms === 0 && totalServices === 0 ? (
        <p className="text-slate-500 text-center py-8">Selecciona habitaciones o servicios para ver tu resumen.</p>
      ) : (
        <>
          {selectedRooms.length > 0 && (
            <>
              <h3 className="text-lg font-semibold text-slate-600 mb-2">Habitaciones</h3>
              <ul className="space-y-3 mb-6">
                {selectedRooms.map(([roomId, count]) => {
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
            </>
          )}

          {selectedServices.length > 0 && (
            <>
              <h3 className="text-lg font-semibold text-slate-600 mb-2 mt-4">Salas y Servicios</h3>
              <ul className="space-y-3 mb-6">
                {selectedServices.map(([roomId, count]) => {
                    const service = serviceTypes.find(s => s.id === roomId);
                    if (!service) return null;
                    return (
                      <li key={roomId} className="flex justify-between items-center text-slate-700">
                        <span>{service.name}</span>
                        <span className="font-semibold">{`x ${count}`}</span>
                      </li>
                    );
                  })}
              </ul>
            </>
          )}

          <div className="border-t pt-4 space-y-4">
             {totalRooms > 0 && (
              <div className="flex justify-between items-center text-lg">
                <span className="text-slate-600 flex items-center"><BedIcon className="w-5 h-5 mr-2"/> Total Habitaciones:</span>
                <span className="font-bold text-slate-800">{totalRooms}</span>
              </div>
            )}
             {totalGuests > 0 && (
                <div className="flex justify-between items-center text-lg">
                    <span className="text-slate-600 flex items-center"><UserIcon className="w-5 h-5 mr-2"/> Capacidad Total:</span>
                    <span className="font-bold text-slate-800">{totalGuests} Huéspedes</span>
                </div>
             )}
             {totalServices > 0 && (
                <div className="flex justify-between items-center text-lg">
                    <span className="text-slate-600 flex items-center"><BriefcaseIcon className="w-5 h-5 mr-2"/> Servicios Adicionales:</span>
                    <span className="font-bold text-slate-800">{totalServices}</span>
                </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default BookingSummary;