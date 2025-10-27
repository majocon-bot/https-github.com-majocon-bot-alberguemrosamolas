import React, { useMemo } from 'react';
import { Reservation, DiningSelection, GroupedReservation, TimeSlot, GroupedReservationWithCost } from '../types';
import { ROOM_TYPES, SERVICE_TYPES, ALL_INDIVIDUAL_ITEMS, DINING_OPTIONS } from '../constants';
import { UserIcon } from './icons/UserIcon';
import { EditIcon } from './icons/EditIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PrintIcon } from './icons/PrintIcon';
import { InvoiceIcon } from './icons/InvoiceIcon';

interface ReservationsListViewProps {
  reservations: Reservation[];
  onDeleteGroup: (guestName: string) => void;
  onEditGroup: (group: GroupedReservation) => void;
  onGenerateInvoice: (group: GroupedReservationWithCost) => void;
}


const ReservationsListView: React.FC<ReservationsListViewProps> = ({ reservations, onDeleteGroup, onEditGroup, onGenerateInvoice }) => {

  const handlePrint = (guestName: string) => {
    document.querySelectorAll('.printable-area').forEach(el => el.classList.remove('printable-area'));
    document.getElementById(`reservation-${guestName}`)?.classList.add('printable-area');
    window.print();
  };

  const groupedReservations = useMemo((): GroupedReservationWithCost[] => {
    const groups: { [key: string]: GroupedReservation } = reservations.reduce((acc, res) => {
      if (!acc[res.guestName]) {
        acc[res.guestName] = {
          guestName: res.guestName,
          minCheckIn: res.checkIn,
          maxCheckOut: res.checkOut,
          roomSummary: {},
          // Assign dining and other services info from the first reservation of the group,
          // as it's duplicated across all reservations for that group booking.
          diningSummary: res.dining || {},
          otherServicesSummary: res.otherServices || {},
          totalGuests: 0,
          reservations: [],
        };
      }
      
      const group = acc[res.guestName];

      if (res.checkIn < group.minCheckIn) group.minCheckIn = res.checkIn;
      if (res.checkOut > group.maxCheckOut) group.maxCheckOut = res.checkOut;

      group.roomSummary[res.roomType] = (group.roomSummary[res.roomType] || 0) + 1;
      
      group.reservations.push(res);

      return acc;
    }, {} as { [key: string]: GroupedReservation });

    return Object.values(groups)
      .map(group => {
        const roomReservations = group.reservations.filter(res => 
            ROOM_TYPES.some(rt => rt.id === res.roomType)
        );

        let totalGuests = 0;
        if (roomReservations.length === 1) {
            const reservation = roomReservations[0];
            const roomType = ROOM_TYPES.find(rt => rt.id === reservation.roomType)!;
            const parts = reservation.roomId.split('_');
            const roomNumber = parts.length > 1 ? parseInt(parts[parts.length - 1], 10) : 1;
            totalGuests = roomType.capacity * (isNaN(roomNumber) ? 1 : roomNumber);
        } else if (roomReservations.length > 1) {
            totalGuests = roomReservations.reduce((sum, reservation) => {
                const roomType = ROOM_TYPES.find(rt => rt.id === reservation.roomType);
                return sum + (roomType ? roomType.capacity : 0);
            }, 0);
        }


        // Calculate total cost
        const accommodationCost = group.reservations.reduce((sum, res) => {
            const roomType = ROOM_TYPES.find(rt => rt.id === res.roomType);
            if (roomType && roomType.price) {
                const resNights = Math.max(1, (new Date(res.checkOut).getTime() - new Date(res.checkIn).getTime()) / (1000 * 3600 * 24));
                return sum + (roomType.price * resNights);
            }
            return sum;
        }, 0);

        const diningCost = Object.values(group.diningSummary).reduce((dateSum, dailyServices) => {
            return dateSum + Object.entries(dailyServices).reduce((serviceSum, [serviceKey, count]) => {
                const option = DINING_OPTIONS.find(opt => opt.id === serviceKey);
                if (option && count > 0) {
                    return serviceSum + (option.price * count);
                }
                return serviceSum;
            }, 0);
        }, 0);

        const otherServicesCost = Object.values(group.otherServicesSummary).reduce((dateSum, dailyServices) => {
            return dateSum + Object.entries(dailyServices).reduce((serviceSum, [serviceId, slots]) => {
                const serviceInfo = SERVICE_TYPES.find(s => s.id === serviceId);
                if (!serviceInfo || !serviceInfo.price) return serviceSum;

                if (serviceInfo.priceUnit === 'per_hour') {
                    const totalHours = slots.reduce((hourSum, slot) => {
                         if (!slot.startTime || !slot.endTime) return hourSum;
                         const startTime = new Date(`1970-01-01T${slot.startTime}:00`);
                         const endTime = new Date(`1970-01-01T${slot.endTime}:00`);
                         if (isNaN(startTime.getTime()) || isNaN(endTime.getTime()) || endTime <= startTime) return hourSum;
                         return hourSum + (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
                    }, 0);
                    return serviceSum + (serviceInfo.price * totalHours);
                } else { // per_day or one_time
                    // Assuming price is per day per slot/unit booked on that day
                    return serviceSum + (serviceInfo.price * slots.length);
                }
            }, 0);
        }, 0);
        
        const totalCost = accommodationCost + diningCost + otherServicesCost;


        return { ...group, totalGuests, totalCost };
      })
      .sort((a, b) => a.minCheckIn.localeCompare(b.minCheckIn));
  }, [reservations]);

  return (
    <div className="space-y-8">
      <header className="text-center">
        <h1 className="text-5xl font-extrabold text-slate-800">Listado de Reservas</h1>
        <p className="text-xl text-slate-500 mt-2">Todas las reservas de grupos, organizadas para una fácil gestión.</p>
      </header>

      {groupedReservations.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {groupedReservations.map(group => {
            const roomReservations = group.reservations.filter(res => ROOM_TYPES.some(rt => rt.id === res.roomType));
            const serviceReservations = group.reservations.filter(res => SERVICE_TYPES.some(st => st.id === res.roomType));
            
            return (
              <div key={group.guestName} id={`reservation-${group.guestName}`} className="bg-white p-6 rounded-xl shadow-lg flex flex-col transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
                <div className="flex justify-between items-start mb-2">
                    <div>
                        <h2 className="text-2xl font-bold text-indigo-700">{group.guestName}</h2>
                        <div className="flex items-center space-x-1 no-print">
                            <button onClick={() => onEditGroup(group)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors" title="Editar Reserva"><EditIcon className="w-5 h-5"/></button>
                            <button onClick={() => onDeleteGroup(group.guestName)} className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors" title="Borrar Grupo"><TrashIcon className="w-5 h-5"/></button>
                            <button onClick={() => handlePrint(group.guestName)} className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors" title="Imprimir Resumen"><PrintIcon className="w-5 h-5"/></button>
                             <button onClick={() => onGenerateInvoice(group)} className="p-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors" title="Generar Factura"><InvoiceIcon className="w-5 h-5"/></button>
                        </div>
                    </div>
                    <div className="text-right flex-shrink-0 pl-2">
                        <div className="text-2xl font-bold text-slate-800">
                            {group.totalCost.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                        </div>
                        <div className="text-xs text-slate-500">Coste Total Estimado</div>
                    </div>
                </div>
                <div className="text-sm text-slate-500 mb-4 border-b pb-3 space-y-1">
                  <p><strong>Fechas:</strong> {new Date(group.minCheckIn).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', timeZone: 'UTC' })} &rarr; {new Date(group.maxCheckOut).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })}</p>
                  <p><strong>DNI:</strong> {group.reservations[0]?.dni}</p>
                  <p><strong>Teléfono:</strong> {group.reservations[0]?.phone}</p>
                </div>
                
                <div className="flex-grow flex flex-col space-y-4">
                  {/* --- ROOMS SECTION --- */}
                  <div>
                      <div className="flex justify-between items-center mb-2">
                          <h3 className="font-semibold text-slate-700">Habitaciones</h3>
                           {group.totalGuests > 0 && (
                              <div className="flex items-center space-x-2 text-slate-600 font-bold bg-slate-100 px-3 py-1 rounded-full">
                                  <UserIcon className="w-5 h-5"/>
                                  <span>{group.totalGuests}</span>
                              </div>
                          )}
                      </div>
                      {roomReservations.length > 0 ? (
                        <ul className="list-disc list-inside text-slate-600 text-sm max-h-24 overflow-y-auto bg-slate-50 p-2 rounded-md">
                            {roomReservations.sort((a,b) => a.roomId.localeCompare(b.roomId)).map(res => {
                                const itemDetails = ALL_INDIVIDUAL_ITEMS.find(i => i.id === res.roomId);
                                return <li key={res.id}>{itemDetails?.name || res.roomId}</li>
                            })}
                        </ul>
                      ) : (
                        <p className="text-sm text-slate-400 italic">Sin habitaciones asignadas.</p>
                      )}
                  </div>
                  
                  {group.reservations[0]?.observations && (
                      <div>
                          <h3 className="font-semibold text-slate-700 mb-1">Observaciones</h3>
                          <p className="text-sm bg-yellow-50 border border-yellow-200 text-yellow-800 p-2 rounded-md">
                              {group.reservations[0].observations}
                          </p>
                      </div>
                  )}
                  
                  {/* --- SEPARATOR & SERVICES SECTION --- */}
                  {(serviceReservations.length > 0 || Object.keys(group.otherServicesSummary).length > 0 || Object.keys(group.diningSummary).length > 0) && (
                    <>
                      <hr className="!my-3 border-slate-200" />
                      
                      {serviceReservations.length > 0 && (
                        <div>
                            <h3 className="font-semibold text-slate-700">Salas y Servicios Asignados</h3>
                            <ul className="list-disc list-inside text-slate-600 text-sm max-h-24 overflow-y-auto bg-slate-50 p-2 rounded-md">
                                {serviceReservations.sort((a,b) => a.roomId.localeCompare(b.roomId)).map(res => {
                                    const itemDetails = ALL_INDIVIDUAL_ITEMS.find(i => i.id === res.roomId);
                                    return <li key={res.id}>{itemDetails?.name || res.roomId}</li>
                                })}
                            </ul>
                        </div>
                      )}
                      
                      <div>
                        <h3 className="font-semibold text-slate-700 mb-2">Uso de Salas y Servicios</h3>
                        {Object.keys(group.otherServicesSummary).length > 0 ? (
                            <div className="text-sm max-h-32 overflow-y-auto bg-slate-50 p-2 rounded-md space-y-2">
                              {Object.entries(group.otherServicesSummary).sort(([dateA], [dateB]) => dateA.localeCompare(dateB)).map(([date, services]) => {
                                  const dailyServices = Object.entries(services).filter(([, slots]) => slots.length > 0);
                                  if (dailyServices.length === 0) return null;
                                  return (
                                    <div key={date}>
                                        <p className="font-medium text-slate-600">{new Date(date).toLocaleDateString('es-ES', { month: 'long', day: 'numeric', timeZone: 'UTC' })}:</p>
                                        <ul className="list-disc list-inside ml-2 text-slate-500">
                                            {dailyServices.map(([serviceId, slots]) => {
                                                const serviceName = SERVICE_TYPES.find(opt => opt.id === serviceId)?.name || serviceId;
                                                return (
                                                    <li key={serviceId}>{serviceName}:
                                                      <span className="font-mono"> {slots.map(s => `${s.startTime}-${s.endTime}`).join(', ')}</span>
                                                    </li>
                                                )
                                            })}
                                        </ul>
                                    </div>
                                  )
                              })}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400 italic">Sin uso detallado de servicios.</p>
                        )}
                      </div>

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
                    </>
                  )}
                </div>
              </div>
            )
          })}
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