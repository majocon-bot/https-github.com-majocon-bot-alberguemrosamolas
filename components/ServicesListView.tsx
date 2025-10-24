import React, { useMemo } from 'react';
import { Reservation, GroupedReservation, ServiceBooking, TimeSlot } from '../types';
import { SERVICE_TYPES } from '../constants';

interface ServicesListViewProps {
  reservations: Reservation[];
}

const ServicesListView: React.FC<ServicesListViewProps> = ({ reservations }) => {
  
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
                    timeSlots.forEach(slot => {
                        bookings.push({
                            guestName: group.guestName,
                            date,
                            serviceId,
                            serviceName: serviceInfo.name,
                            startTime: slot.startTime,
                            endTime: slot.endTime,
                            price: serviceInfo.price,
                            priceUnit: serviceInfo.priceUnit,
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


  return (
    <div className="space-y-8 animate-fade-in-up">
      <header className="text-center">
        <h1 className="text-5xl font-extrabold text-slate-800">Listado de Salas y Servicios</h1>
        <p className="text-xl text-slate-500 mt-2">Un resumen detallado de todos los servicios y salas reservados por día y hora.</p>
      </header>
      <div className="bg-white p-6 rounded-xl shadow-lg">
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
                                {total.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}
                            </td>
                        </tr>
                    )
                })}
              </tbody>
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