import React, { useMemo } from 'react';
import { Reservation, GroupedReservation, ServiceBooking, TimeSlot } from '../types';
import { SERVICE_TYPES } from '../constants';
import { PlusIcon } from './icons/PlusIcon';
import { PrintIcon } from './icons/PrintIcon';
import { EditIcon } from './icons/EditIcon';
import { TrashIcon } from './icons/TrashIcon';

interface ServicesListViewProps {
  reservations: Reservation[];
  onDeleteService: (booking: ServiceBooking) => void;
  onEditService: (booking: ServiceBooking) => void;
  onNewBooking: () => void;
}

const ServicesListView: React.FC<ServicesListViewProps> = ({ reservations, onDeleteService, onEditService, onNewBooking }) => {
  
  const handlePrint = () => {
    const printableElement = document.getElementById('services-table-container');
    if (printableElement) {
        printableElement.classList.add('printable-area');
        window.print();
        // Delay removal to allow print dialog to process
        setTimeout(() => {
            printableElement.classList.remove('printable-area');
        }, 500);
    }
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
            otherServicesSummary: {},
            totalGuests: 0,
            reservations: [],
          };
        }
        
        const group = acc[res.guestName];
  
        if (res.checkIn < group.minCheckIn) group.minCheckIn = res.checkIn;
        if (res.checkOut > group.maxCheckOut) group.maxCheckOut = res.checkOut;
  
        group.roomSummary[res.roomType] = (group.roomSummary[res.roomType] || 0) + 1;
        
        if (res.otherServices) {
          Object.entries(res.otherServices).forEach(([date, services]) => {
            if (!group.otherServicesSummary[date]) {
              group.otherServicesSummary[date] = {};
            }
            Object.entries(services).forEach(([serviceId, timeSlots]) => {
               if (!group.otherServicesSummary[date][serviceId]) {
                group.otherServicesSummary[date][serviceId] = [];
               }
               group.otherServicesSummary[date][serviceId].push(...timeSlots as TimeSlot[]);
            });
          });
        }
  
        group.reservations.push(res);
  
        return acc;
      }, {} as { [key: string]: GroupedReservation });
  
      return Object.values(groups);
  }, [reservations]);


  const serviceBookings = useMemo((): ServiceBooking[] => {
    const bookings: ServiceBooking[] = [];

    groupedReservations.forEach(group => {
        Object.entries(group.otherServicesSummary).forEach(([date, services]) => {
            Object.entries(services).forEach(([serviceId, timeSlots]) => {
                const serviceInfo = SERVICE_TYPES.find(s => s.id === serviceId);
                if (serviceInfo) {
                    (timeSlots as TimeSlot[]).forEach((slot, index) => {
                        bookings.push({
                            guestName: group.guestName,
                            date,
                            serviceId,
                            serviceName: serviceInfo.name,
                            startTime: slot.startTime,
                            endTime: slot.endTime,
                            price: serviceInfo.price,
                            priceUnit: serviceInfo.priceUnit,
                            slotIndex: index,
                        });
                    });
                }
            });
        });
    });

    return bookings.sort((a, b) => a.date.localeCompare(b.date) || a.startTime.localeCompare(b.startTime) || a.guestName.localeCompare(b.guestName));
  }, [groupedReservations]);

  const formatPriceUnit = (price: number, unit?: 'per_day' | 'per_hour' | 'one_time'): string => {
    const formattedPrice = price.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' });
      switch(unit) {
          case 'per_day': return `${formattedPrice} / día`;
          case 'per_hour': return `${formattedPrice} / hora`;
          case 'one_time': return formattedPrice;
          default: return formattedPrice;
      }
  }

  const calculateDuration = (start: string, end: string): { hours: number, formatted: string } => {
    if (!start || !end) return { hours: 0, formatted: '-' };
    const startTime = new Date(`1970-01-01T${start}:00`);
    const endTime = new Date(`1970-01-01T${end}:00`);
    if (isNaN(startTime.getTime()) || isNaN(endTime.getTime()) || endTime <= startTime) return { hours: 0, formatted: '-' };
    
    const diffMs = endTime.getTime() - startTime.getTime();
    const hours = diffMs / (1000 * 60 * 60);
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);

    return { hours, formatted: `${h}h ${m > 0 ? `${m}m` : ''}`.trim() };
  };

  const grandTotal = useMemo(() => {
    return serviceBookings.reduce((sum, booking) => {
        const duration = calculateDuration(booking.startTime, booking.endTime);
        let total = 0;
        if (booking.price) {
            if (booking.priceUnit === 'per_hour') {
                total = booking.price * duration.hours;
            } else {
                total = booking.price;
            }
        }
        return sum + total;
    }, 0);
  }, [serviceBookings]);


  return (
    <div className="space-y-8 animate-fade-in-up">
      <header className="no-print flex flex-wrap justify-between items-center gap-4">
        <div>
            <h1 className="text-4xl font-extrabold text-slate-800">Listado de Salas y Servicios</h1>
            <p className="text-lg text-slate-500 mt-1">
                Gestiona todas las reservas de salas y servicios adicionales.
            </p>
        </div>
        <div className="flex items-center space-x-2">
            <button 
                onClick={onNewBooking}
                className="flex items-center space-x-2 bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-all duration-300 shadow-md"
            >
                <PlusIcon className="w-5 h-5"/>
                <span>Añadir Reserva</span>
            </button>
            <button 
                onClick={handlePrint}
                className="flex items-center space-x-2 bg-white text-slate-700 font-bold py-2 px-4 rounded-lg hover:bg-slate-100 transition-all duration-300 shadow-md"
            >
                <PrintIcon className="w-5 h-5"/>
                <span>Imprimir</span>
            </button>
        </div>
      </header>
      <div id="services-table-container" className="bg-white p-6 rounded-xl shadow-lg">
        <div className="overflow-x-auto">
          {serviceBookings.length > 0 ? (
            <table className="w-full text-sm text-left text-slate-500">
              <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3">Grupo</th>
                  <th scope="col" className="px-6 py-3">Fecha</th>
                  <th scope="col" className="px-6 py-3">Sala / Servicio</th>
                  <th scope="col" className="px-6 py-3 text-center">Hora Inicio</th>
                  <th scope="col" className="px-6 py-3 text-center">Hora Fin</th>
                  <th scope="col" className="px-6 py-3 text-center">Duración</th>
                  <th scope="col" className="px-6 py-3 text-right">Precio</th>
                  <th scope="col" className="px-6 py-3 text-right">Total</th>
                  <th scope="col" className="px-6 py-3 text-center no-print">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {serviceBookings.map((booking, index) => {
                    const duration = calculateDuration(booking.startTime, booking.endTime);
                    let total = 0;
                    if(booking.price) {
                        if (booking.priceUnit === 'per_hour') {
                            total = booking.price * duration.hours;
                        } else { // per_day or one_time
                            total = booking.price; // Each slot costs the full price
                        }
                    }

                    return (
                        <tr key={`${booking.guestName}-${booking.date}-${booking.serviceId}-${index}`} className="bg-white border-b hover:bg-slate-50">
                            <th scope="row" className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                            {booking.guestName}
                            </th>
                            <td className="px-6 py-4">
                            {new Date(booking.date).toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric', timeZone: 'UTC' })}
                            </td>
                            <td className="px-6 py-4">{booking.serviceName}</td>
                            <td className="px-6 py-4 text-center font-mono">{booking.startTime || '-'}</td>
                            <td className="px-6 py-4 text-center font-mono">{booking.endTime || '-'}</td>
                            <td className="px-6 py-4 text-center">{duration.formatted}</td>
                            <td className="px-6 py-4 text-right">
                                {booking.price ? formatPriceUnit(booking.price, booking.priceUnit) : '-'}
                            </td>
                            <td className="px-6 py-4 text-right font-semibold text-slate-700">
                                {total > 0 ? total.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' }) : '-'}
                            </td>
                             <td className="px-6 py-4 text-center no-print">
                                <div className="flex justify-center items-center space-x-1">
                                    <button onClick={() => onEditService(booking)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors" title="Editar Reserva"><EditIcon className="w-4 h-4" /></button>
                                    <button onClick={() => onDeleteService(booking)} className="p-2 text-red-600 hover:bg-red-100 rounded-full transition-colors" title="Borrar Tramo"><TrashIcon className="w-4 h-4" /></button>
                                </div>
                            </td>
                        </tr>
                    )
                })}
              </tbody>
              <tfoot>
                <tr className="font-semibold text-slate-900 bg-slate-100 border-t-2 border-slate-300">
                    <th scope="row" colSpan={8} className="px-6 py-3 text-right text-base">Total General</th>
                    <td className="px-6 py-3 text-right text-base no-print"></td>
                    <td className="px-6 py-3 text-right text-base print-only">
                        {grandTotal.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                    </td>
                </tr>
              </tfoot>
            </table>
          ) : (
             <div className="text-center py-16">
                <p className="text-slate-500 text-lg">No hay uso de salas o servicios para mostrar.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ServicesListView;