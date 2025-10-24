import React, { useState, useMemo } from 'react';
import { IndividualRoom, Reservation } from '../types';

interface OccupancyCalendarProps {
  rooms: IndividualRoom[];
  reservations: Reservation[];
}

const getRoomTypeColor = (type: string): string => {
    switch (type) {
        case 'single': return 'bg-blue-100 text-blue-800';
        case 'double': return 'bg-green-100 text-green-800';
        case 'triple': return 'bg-yellow-100 text-yellow-800';
        case 'quad': return 'bg-purple-100 text-purple-800';
        case 'bunk': return 'bg-orange-100 text-orange-800';
        case 'special': return 'bg-pink-100 text-pink-800';
        default: return 'bg-slate-100 text-slate-800';
    }
};


const OccupancyCalendar: React.FC<OccupancyCalendarProps> = ({ rooms, reservations }) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const { year, month, daysInMonth } = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    return { year, month, daysInMonth };
  }, [currentDate]);

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const getBookingForRoomAndDay = (roomId: string, day: number): Reservation | undefined => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return reservations.find(res => 
      res.roomId === roomId &&
      dateStr >= res.checkIn &&
      dateStr < res.checkOut
    );
  };
  
  const weekDays = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <div className="flex justify-between items-center mb-6">
        <button onClick={goToPreviousMonth} className="px-4 py-2 bg-slate-200 rounded-lg hover:bg-slate-300">&lt;</button>
        <h2 className="text-2xl font-bold text-slate-800">
          {new Intl.DateTimeFormat('es-ES', { month: 'long', year: 'numeric' }).format(currentDate)}
        </h2>
        <button onClick={goToNextMonth} className="px-4 py-2 bg-slate-200 rounded-lg hover:bg-slate-300">&gt;</button>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-center">
          <thead>
            <tr>
              <th className="sticky left-0 bg-slate-100 p-2 border border-slate-200 z-10 font-semibold text-slate-600 min-w-[150px]">Habitación</th>
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