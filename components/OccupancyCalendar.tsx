import React, { useState, useMemo } from 'react';
import { IndividualRoom, Reservation, IndividualReservation } from '../types';
import { PrintIcon } from './icons/PrintIcon';

interface OccupancyCalendarProps {
  rooms: IndividualRoom[];
  reservations: Reservation[];
  individualReservations: IndividualReservation[];
}

const getRoomTypeColor = (type: string): string => {
    switch (type) {
        case 'single': return 'bg-blue-100 text-blue-800';
        case 'double': return 'bg-green-100 text-green-800';
        case 'triple': return 'bg-yellow-100 text-yellow-800';
        case 'quad': return 'bg-purple-100 text-purple-800';
        case 'bunk': return 'bg-orange-100 text-orange-800';
        case 'special': return 'bg-pink-100 text-pink-800';
        case 'small_hall': return 'bg-gray-200 text-gray-800 font-semibold';
        case 'medium_hall': return 'bg-gray-300 text-gray-900 font-semibold';
        case 'large_hall': return 'bg-gray-400 text-white font-semibold';
        case 'other_halls': return 'bg-stone-200 text-stone-800 font-semibold';
        case 'secretarial_services': return 'bg-teal-100 text-teal-800 font-semibold';
        default: return 'bg-slate-100 text-slate-800';
    }
};


const OccupancyCalendar: React.FC<OccupancyCalendarProps> = ({ rooms, reservations, individualReservations }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { year, month, daysInMonth } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { year, month, daysInMonth };
  }, [currentDate]);

  const allReservations = useMemo(() => {
    const combined: (Reservation | { id: string, roomId: string, guestName: string, checkIn: string, checkOut: string})[] = [...reservations];
    
    individualReservations.forEach(ir => {
      const roomType = rooms.find(r => r.name.includes(` ${ir.contractDetails.roomNumber} `))?.type;
      if (roomType) {
        combined.push({
          id: ir.id,
          roomId: `${roomType}_${ir.contractDetails.roomNumber}`,
          guestName: `${ir.guestPersonalDetails.firstSurname}, ${ir.guestPersonalDetails.name}`,
          checkIn: ir.contractDetails.checkInDate,
          checkOut: ir.contractDetails.checkOutDate,
        });
      }
    });

    return combined;
  }, [reservations, individualReservations, rooms]);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getBookingForRoomAndDay = (roomId: string, day: number): (typeof allReservations[0]) | undefined => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return allReservations.find(res => 
      res.roomId === roomId &&
      dateStr >= res.checkIn &&
      dateStr < res.checkOut
    );
  };
  
  const handlePrint = () => {
    const printableElement = document.getElementById('occupancy-calendar-printable-area');
    if (printableElement) {
        printableElement.classList.add('printable-area');
        window.print();
        // Delay removal to allow print dialog to process
        setTimeout(() => {
            printableElement.classList.remove('printable-area');
        }, 500);
    }
  };

  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div id="occupancy-calendar-printable-area" className="bg-white p-6 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center space-x-2 no-print">
            <button onClick={goToPreviousMonth} className="px-4 py-2 bg-slate-200 rounded-lg hover:bg-slate-300">&lt;</button>
            <button onClick={goToNextMonth} className="px-4 py-2 bg-slate-200 rounded-lg hover:bg-slate-300">&gt;</button>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 text-center">
          {new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(currentDate)}
        </h2>
        <button 
            onClick={handlePrint}
            className="flex items-center space-x-2 bg-slate-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-700 transition-all duration-300 shadow-md no-print"
        >
            <PrintIcon className="w-5 h-5"/>
            <span className="hidden sm:inline">Imprimir</span>
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-center">
          <thead>
            <tr>
              <th className="sticky left-0 bg-slate-100 p-2 border border-slate-200 z-10 font-semibold text-slate-600 min-w-[150px]">Habitación/Servicio</th>
              {Array.from({ length: daysInMonth }, (_, i) => {
                const day = i + 1;
                const date = new Date(year, month, day);
                const dayOfWeek = date.getDay();
                return <th key={i} className="p-2 border border-slate-200 min-w-[60px]">
                  <div className="text-sm text-slate-500">{weekDays[dayOfWeek]}</div>
                  <div className="font-semibold text-slate-700">{day}</div>
                </th>
              })}
            </tr>
          </thead>
          <tbody>
            {rooms.map(room => (
              <tr key={room.id}>
                <td className={`sticky left-0 p-2 border-slate-200 z-10 text-sm text-left font-medium whitespace-nowrap ${getRoomTypeColor(room.type)}`}>
                    {room.name}
                </td>
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1;
                  const booking = getBookingForRoomAndDay(room.id, day);
                  const isBooked = !!booking;
                  return (
                    <td 
                        key={i} 
                        className={`p-1 border border-slate-200 text-xs text-center align-middle whitespace-nowrap overflow-hidden text-ellipsis ${isBooked ? 'bg-indigo-200 text-indigo-900 font-semibold' : 'bg-green-100/50'}`} 
                        title={isBooked ? `Ocupado por ${booking.guestName}` : 'Disponible'}
                    >
                        {booking?.guestName}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OccupancyCalendar;