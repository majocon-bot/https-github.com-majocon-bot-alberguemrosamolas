import React, { useMemo } from 'react';
import { Reservation, DiningSelection, GroupedReservation } from '../types';
import { ROOM_TYPES, DINING_OPTIONS } from '../constants';
import { UserIcon } from './icons/UserIcon';
import { EditIcon } from './icons/EditIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PrintIcon } from './icons/PrintIcon';

interface ReservationsListViewProps {
  reservations: Reservation[];
  onDeleteGroup: (guestName: string) => void;
  onEditGroup: (group: GroupedReservation) => void;
}

const ReservationsListView: React.FC<ReservationsListViewProps> = ({ reservations, onDeleteGroup, onEditGroup }) => {

  const handlePrint = (guestName: string) => {
    document.querySelectorAll('.printable-area').forEach(el => el.classList.remove('printable-area'));
    document.getElementById(`reservation-${guestName}`)?.classList.add('printable-area');
    window.print();
  };

  const groupedReservations = useMemo((): GroupedReservation[] => {
    const groups: { [key: string]: GroupedReservation } = reservations.reduce((acc, res) => {
      if (!acc[res.guestName]) {
        acc[res.guestName] = {
          guestName: res.guestName,
          minCheckIn: res.checkIn,
          maxCheckOut: res.checkOut,
          roomSummary: {},
          diningSummary: {},
          totalGuests: 0,
          reservations: [],
        };
      }
      
      const group = acc[res.guestName];

      if (res.checkIn < group.minCheckIn) group.minCheckIn = res.checkIn;
      if (res.checkOut > group.maxCheckOut) group.maxCheckOut = res.checkOut;

      group.roomSummary[res.roomType] = (group.roomSummary[res.roomType] || 0) + 1;
      
      if (res.dining) {
        Object.entries(res.dining).forEach(([date, services]) => {
          if (!group.diningSummary[date]) {
            group.diningSummary[date] = { breakfast: 0, lunch: 0, dinner: 0, morningSnack: 0, afternoonSnack: 0 };
          }
          Object.entries(services).forEach(([service, count]) => {
            group.diningSummary[date][service as keyof DiningSelection] += count;
          });
        });
      }

      group.reservations.push(res);

      return acc;
    }, {} as { [key: string]: GroupedReservation });

    return Object.values(groups)
      .map(group => {
        const totalGuests = group.reservations.reduce((sum, res) => {
            const roomType = ROOM_TYPES.find(rt => rt.id === res.roomType);
            return sum + (roomType?.capacity || 0);
        }, 0);
        return { ...group, totalGuests };
      })
      .sort((a, b) => a.minCheckIn.localeCompare(b.minCheckIn));
  }, [reservations]);

  const getRoomTypeName = (typeId: string) => {
    return ROOM_TYPES.find(rt => rt.id === typeId)?.name || 'Habitación Desconocida';
  }

  return (
    <div className="space-y-8">
      <header className="text-center">
        <h1 className="text-5xl font-extrabold text-slate-800">Listado de Reservas</h1>
        <p className="text-xl text-slate-500 mt-2">Todas las reservas de grupos, organizadas para una fácil gestión.</p>
      </header>

      {groupedReservations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {groupedReservations.map(group => (
            <div key={group.guestName} id={`reservation-${group.guestName}`} className="bg-white p-6 rounded-xl shadow-lg flex flex-col transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
              <div className="flex justify-between items-start mb-2">
                <h2 className="text-2xl font-bold text-indigo-700">{group.guestName}</h2>
                <div className="flex items-center space-x-2 no-print">
                    <button onClick={() => onEditGroup(group)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors" title="Editar Reserva"><EditIcon className="w-5 h-5"/></button>
                    <button onClick={() => onDeleteGroup(group.guestName)} className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors" title="Borrar Grupo"><TrashIcon className="w-5 h-5"/></button>
                    <button onClick={() => handlePrint(group.guestName)} className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors" title="Imprimir"><PrintIcon className="w-5 h-5"/></button>
                </div>
              </div>
              <p className="text-slate-500 mb-4 border-b pb-3">
                {new Date(group.minCheckIn).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', timeZone: 'UTC' })} &rarr; {new Date(group.maxCheckOut).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })}
              </p>
              
              <div className="flex-grow space-y-4">
                <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-slate-700">Habitaciones</h3>
                    <div className="flex items-center space-x-2 text-slate-600 font-bold bg-slate-100 px-3 py-1 rounded-full">
                        <UserIcon className="w-5 h-5"/>
                        <span>{group.totalGuests}</span>
                    </div>
                </div>
                <ul className="list-disc list-inside text-slate-600">
                    {Object.entries(group.roomSummary).map(([roomType, count]) => (
                        <li key={roomType}>{count} x {getRoomTypeName(roomType)}</li>
                    ))}
                </ul>
                
                <div>
                    <h3 className="font-semibold text-slate-700 mb-2">Servicios de Comedor</h3>
                    {Object.keys(group.diningSummary).length > 0 ? (
                        <div className="text-sm max-h-32 overflow-y-auto bg-slate-50 p-2 rounded-md space-y-2">
                           {Object.entries(group.diningSummary).sort(([dateA], [dateB]) => dateA.localeCompare(dateB)).map(([date, services]) => (
                                <div key={date}>
                                    <p className="font-medium text-slate-600">{new Date(date).toLocaleDateString('es-ES', { month: 'long', day: 'numeric', timeZone: 'UTC' })}:</p>
                                    <p className="pl-2 text-slate-500">
                                        {Object.entries(services)
                                            .filter(([, count]) => count > 0)
                                            .map(([service, count]) => {
                                                const serviceName = DINING_OPTIONS.find(opt => opt.id === service)?.label || service;
                                                return `${serviceName} (x${count})`;
                                            })
                                            .join(', ')}
                                    </p>
                                </div>
                           ))}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-400 italic">Sin servicios de comedor.</p>
                    )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-white rounded-xl shadow-lg">
            <p className="text-slate-500 text-lg">No hay reservas para mostrar. ¡Crea una nueva!</p>
        </div>
      )}
    </div>
  );
};

export default ReservationsListView;