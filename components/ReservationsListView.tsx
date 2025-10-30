import React, { useMemo, useState } from 'react';
import { Reservation, GroupedReservation, GroupedReservationWithCost, IndividualReservation } from '../types';
import { ROOM_TYPES, SERVICE_TYPES, ALL_INDIVIDUAL_ITEMS } from '../constants';
import { UserIcon } from './icons/UserIcon';
import { EditIcon } from './icons/EditIcon';
import { TrashIcon } from './icons/TrashIcon';
import { PrintIcon } from './icons/PrintIcon';
import { InvoiceIcon } from './icons/InvoiceIcon';
import { LinkIcon } from './icons/LinkIcon';

interface ReservationsListViewProps {
  reservations: Reservation[];
  individualReservations: IndividualReservation[];
  onDeleteGroup: (guestName: string) => void;
  onEditGroup: (group: GroupedReservation) => void;
  onGenerateInvoice: (group: GroupedReservationWithCost) => void;
  onEditIndividual: (reservation: IndividualReservation) => void;
  onPrintIndividual: (reservation: IndividualReservation) => void;
}


const ReservationsListView: React.FC<ReservationsListViewProps> = ({ 
    reservations, 
    individualReservations,
    onDeleteGroup, 
    onEditGroup, 
    onGenerateInvoice,
    onEditIndividual,
    onPrintIndividual,
}) => {
  const [activeList, setActiveList] = useState<'grupales' | 'individuales'>('grupales');

  const handlePrint = (guestName: string) => {
    document.querySelectorAll('.printable-area').forEach(el => el.classList.remove('printable-area'));
    document.getElementById(`reservation-${guestName}`)?.classList.add('printable-area');
    window.print();
  };

  const handleCopyLink = (id: string) => {
    const url = `${window.location.origin}${window.location.pathname}?guestFormId=${id}`;
    navigator.clipboard.writeText(url).then(() => {
      alert('Enlace copiado al portapapeles. ¡Ahora puedes enviárselo al huésped!');
    }, (err) => {
      console.error('Could not copy text: ', err);
      alert('Error al copiar el enlace.');
    });
  };

  const getStatusChip = (status: IndividualReservation['status']) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">Completado</span>;
      case 'pending_guest':
        return <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded-full">Pendiente de Huésped</span>;
      default:
        return <span className="px-2 py-1 text-xs font-semibold text-slate-800 bg-slate-100 rounded-full">Borrador</span>;
    }
  };

  const groupedReservations = useMemo((): GroupedReservationWithCost[] => {
    const groups: { [key: string]: GroupedReservation } = reservations.reduce((acc, res) => {
      const groupKey = res.groupName || res.guestName;
      if (!acc[groupKey]) {
        acc[groupKey] = {
          guestName: res.guestName,
          groupName: res.groupName,
          minCheckIn: res.checkIn,
          maxCheckOut: res.checkOut,
          roomSummary: {},
          otherServicesSummary: res.otherServices || {},
          unitServicesSummary: res.unitServices || {},
          // FIX: Add diningSummary to correctly group dining services info.
          diningSummary: res.dining || {},
          totalGuests: 0,
          reservations: [],
        };
      }
      
      const group = acc[groupKey];

      if (res.checkIn < group.minCheckIn) group.minCheckIn = res.checkIn;
      if (res.checkOut > group.maxCheckOut) group.maxCheckOut = res.checkOut;

      group.roomSummary[res.roomType] = (group.roomSummary[res.roomType] || 0) + 1;
      
      group.reservations.push(res);

      return acc;
    }, {} as { [key: string]: GroupedReservation });

    return Object.values(groups)
      .map(group => {
        const totalGuests = Object.entries(group.roomSummary).reduce((sum, [roomTypeId, count]) => {
            const roomType = ROOM_TYPES.find(rt => rt.id === roomTypeId);
            if (roomType) {
                return sum + (roomType.capacity * count);
            }
            return sum;
        }, 0);

        const accommodationCost = group.reservations.reduce((sum, res) => {
            const itemType = [...ROOM_TYPES, ...SERVICE_TYPES].find(rt => rt.id === res.roomType);
            if (itemType && itemType.price && itemType.priceUnit === 'per_day') {
                const resNights = Math.max(1, (new Date(res.checkOut).getTime() - new Date(res.checkIn).getTime()) / (1000 * 3600 * 24));
                return sum + (itemType.price * resNights);
            }
            return sum;
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
                }
                return serviceSum; 
            }, 0);
        }, 0);

        const unitServicesCost = Object.values(group.unitServicesSummary || {}).reduce((dateSum, dailyServices) => {
            return dateSum + Object.entries(dailyServices).reduce((serviceSum, [serviceId, units]) => {
                const serviceInfo = SERVICE_TYPES.find(s => s.id === serviceId);
                if (serviceInfo && serviceInfo.price && units > 0) {
                    return serviceSum + (serviceInfo.price * units);
                }
                return serviceSum;
            }, 0);
        }, 0);
        
        const totalCost = accommodationCost + otherServicesCost + unitServicesCost;


        return { ...group, totalGuests, totalCost };
      })
      .sort((a, b) => a.minCheckIn.localeCompare(b.minCheckIn));
  }, [reservations]);
  
  const GroupReservationsList = () => (
    <>
        {groupedReservations.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
            {groupedReservations.map(group => {
                const roomReservations = group.reservations.filter(res => ROOM_TYPES.some(rt => rt.id === res.roomType));
                const serviceReservations = group.reservations.filter(res => SERVICE_TYPES.some(st => st.id === res.roomType));
                
                return (
                <div key={group.guestName} id={`reservation-${group.guestName}`} className="bg-white p-6 rounded-xl shadow-lg flex flex-col transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
                    <div className="flex justify-between items-start mb-2">
                        <div>
                            <h2 className="text-2xl font-bold text-indigo-700">{group.groupName || group.guestName}</h2>
                            {group.groupName && <p className="text-sm text-slate-500 -mt-1 mb-2">Responsable: {group.guestName}</p>}
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
                    {(serviceReservations.length > 0 || Object.keys(group.otherServicesSummary).length > 0) && (
                        <>
                        <hr className="!my-3 border-slate-200" />
                        
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
                                <p className="text-sm text-slate-400 italic">Sin uso detallado de servicios por horas.</p>
                            )}
                        </div>

                        <div>
                            <h3 className="font-semibold text-slate-700 mb-2">Uso de Servicios por Unidad</h3>
                            {group.unitServicesSummary && Object.keys(group.unitServicesSummary).length > 0 ? (
                                <div className="text-sm max-h-32 overflow-y-auto bg-slate-50 p-2 rounded-md space-y-2">
                                {Object.entries(group.unitServicesSummary).sort(([dateA], [dateB]) => dateA.localeCompare(dateB)).map(([date, services]) => {
                                    const dailyServices = Object.entries(services).filter(([, units]) => units > 0);
                                    if (dailyServices.length === 0) return null;
                                    return (
                                        <div key={date}>
                                            <p className="font-medium text-slate-600">{new Date(date).toLocaleDateString('es-ES', { month: 'long', day: 'numeric', timeZone: 'UTC' })}:</p>
                                            <ul className="list-disc list-inside ml-2 text-slate-500">
                                                {dailyServices.map(([serviceId, units]) => {
                                                    const serviceName = SERVICE_TYPES.find(opt => opt.id === serviceId)?.name || serviceId;
                                                    return (
                                                        <li key={serviceId}>{serviceName}:
                                                        <span className="font-mono"> {units} unidades</span>
                                                        </li>
                                                    )
                                                })}
                                            </ul>
                                        </div>
                                    )
                                })}
                                </div>
                            ) : (
                                <p className="text-sm text-slate-400 italic">Sin uso detallado de servicios por unidad.</p>
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
                <p className="text-slate-500 text-lg">No hay reservas grupales para mostrar.</p>
            </div>
        )}
    </>
  );

  const IndividualReservationsList = () => (
     <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="overflow-x-auto">
          {individualReservations.length > 0 ? (
            <table className="w-full text-sm text-left text-slate-500">
              <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3">Huésped</th>
                  <th scope="col" className="px-6 py-3">Fechas</th>
                  <th scope="col" className="px-6 py-3">Nº Habitación</th>
                  <th scope="col" className="px-6 py-3">Estado</th>
                  <th scope="col" className="px-6 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {individualReservations.sort((a,b) => a.contractDetails.checkInDate.localeCompare(b.contractDetails.checkInDate)).map((res) => (
                  <tr key={res.id} className="bg-white border-b hover:bg-slate-50">
                    <th scope="row" className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                      {res.guestPersonalDetails?.name || 'Huésped'} {res.guestPersonalDetails?.firstSurname || 'Sin Asignar'}
                    </th>
                    <td className="px-6 py-4">
                      {new Date(res.contractDetails.checkInDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', timeZone: 'UTC' })} - {new Date(res.contractDetails.checkOutDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })}
                    </td>
                    <td className="px-6 py-4">{res.contractDetails.roomNumber}</td>
                    <td className="px-6 py-4">{getStatusChip(res.status)}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center items-center space-x-1">
                         <button onClick={() => onPrintIndividual(res)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-full transition-colors" title="Imprimir Ficha"><PrintIcon className="w-4 h-4" /></button>
                         <button onClick={() => handleCopyLink(res.id)} className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors" title="Copiar enlace para el huésped"><LinkIcon className="w-4 h-4" /></button>
                         <button onClick={() => onEditIndividual(res)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors" title="Editar Ficha"><EditIcon className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-16">
              <p className="text-slate-500 text-lg">No hay fichas de registro individuales.</p>
            </div>
          )}
        </div>
      </div>
  );


  return (
    <div className="space-y-8">
      <header className="text-center">
        <h1 className="text-5xl font-extrabold text-slate-800">Listado de Reservas</h1>
        <p className="text-xl text-slate-500 mt-2">Gestiona las reservas grupales o individuales.</p>
      </header>
      
      <div className="flex justify-center space-x-2 bg-slate-200 p-1 rounded-lg max-w-sm mx-auto no-print">
        <button 
          onClick={() => setActiveList('grupales')}
          className={`w-full px-4 py-2 rounded-md font-semibold text-sm transition-all ${activeList === 'grupales' ? 'bg-white text-indigo-700 shadow' : 'bg-transparent text-slate-600'}`}
        >
          Grupales
        </button>
        <button 
          onClick={() => setActiveList('individuales')}
          className={`w-full px-4 py-2 rounded-md font-semibold text-sm transition-all ${activeList === 'individuales' ? 'bg-white text-indigo-700 shadow' : 'bg-transparent text-slate-600'}`}
        >
          Individuales
        </button>
      </div>

      <div className="animate-fade-in-up">
        {activeList === 'grupales' ? (
            <div className="space-y-4">
                <h2 className="text-3xl font-bold text-slate-800 text-center">Listado de Reservas Grupal</h2>
                <GroupReservationsList />
            </div>
        ) : (
             <div className="space-y-4">
                <h2 className="text-3xl font-bold text-slate-800 text-center">Listado de Reservas Individual</h2>
                <IndividualReservationsList />
            </div>
        )}
      </div>

    </div>
  );
};

export default ReservationsListView;