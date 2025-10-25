import React, { useState, useMemo } from 'react';
import { Reservation, DiningSelection } from '../types';
import { DINING_OPTIONS } from '../constants';

interface DiningHallViewProps {
  reservations: Reservation[];
}

const formatDate = (date: Date) => date.toISOString().split('T')[0];

const DiningHallView: React.FC<DiningHallViewProps> = ({ reservations }) => {
  const [selectedDate, setSelectedDate] = useState(formatDate(new Date()));

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };

  const dailyTotals = useMemo(() => {
    const totals: DiningSelection = {
      breakfast: 0,
      lunch: 0,
      dinner: 0,
      morningSnack: 0,
      afternoonSnack: 0,
    };

    // Group reservations by guest to avoid multiple counting for the same group booking
    // FIX: Add explicit type annotation to `reservationsByGuest` to ensure correct type inference.
    const reservationsByGuest: Record<string, Reservation> = reservations.reduce((acc, res) => {
        if (!acc[res.guestName]) {
            acc[res.guestName] = res; // Store the first reservation for each guest
        }
        return acc;
    }, {} as Record<string, Reservation>);


    Object.values(reservationsByGuest).forEach(res => {
      // Check if reservation is active on the selected date
      if (res.checkIn <= selectedDate && res.checkOut > selectedDate) {
        if (res.dining && res.dining[selectedDate]) {
          const dailyDining = res.dining[selectedDate];
          totals.breakfast += dailyDining.breakfast || 0;
          totals.lunch += dailyDining.lunch || 0;
          totals.dinner += dailyDining.dinner || 0;
          totals.morningSnack += dailyDining.morningSnack || 0;
          totals.afternoonSnack += dailyDining.afternoonSnack || 0;
        }
      }
    });

    return totals;
  }, [selectedDate, reservations]);

  const guestsForDate = useMemo(() => {
    const uniqueGuests: { [guestName: string]: Reservation } = {};
    reservations.forEach(res => {
        if (
            res.checkIn <= selectedDate && res.checkOut > selectedDate &&
            res.dining && res.dining[selectedDate] &&
            Object.values(res.dining[selectedDate]).some(count => (count as number) > 0)
        ) {
            // Only add the guest once to the list
            if (!uniqueGuests[res.guestName]) {
                uniqueGuests[res.guestName] = res;
            }
        }
    });
    return Object.values(uniqueGuests);
  }, [selectedDate, reservations]);


  return (
    <div className="space-y-8">
      <header className="text-center">
        <h1 className="text-5xl font-extrabold text-slate-800">Resumen del Comedor</h1>
        <p className="text-xl text-slate-500 mt-2">Consulta el número total de comensales por día.</p>
      </header>

      <div className="max-w-md mx-auto bg-white p-6 rounded-xl shadow-lg">
        <label htmlFor="dining-date" className="block text-lg font-medium text-slate-700 mb-2">Selecciona una fecha:</label>
        <input
          type="date"
          id="dining-date"
          value={selectedDate}
          onChange={handleDateChange}
          className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 text-lg"
        />
      </div>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-slate-800 mb-6 border-b pb-4">
          Resumen para el {new Date(selectedDate).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}
        </h2>
        
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
            {DINING_OPTIONS.map(option => (
                <div key={option.id} className="bg-slate-100 p-4 rounded-lg text-center">
                    <p className="text-base font-semibold text-slate-600">{option.label}</p>
                    <p className="text-4xl font-bold text-indigo-600 mt-2">{dailyTotals[option.id]}</p>
                    <p className="text-sm text-slate-500">Comensales</p>
                </div>
            ))}
        </div>

        <div>
            <h3 className="text-2xl font-bold text-slate-800 mb-4">Grupos con servicio de comedor este día</h3>
            {guestsForDate.length > 0 ? (
                <ul className="divide-y divide-slate-200">
                    {guestsForDate.map(res => (
                        <li key={res.id} className="py-3">
                            <p className="font-semibold text-slate-700">{res.guestName}</p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 mt-1">
                                {DINING_OPTIONS.map(opt => {
                                    const count = res.dining?.[selectedDate]?.[opt.id];
                                    return count && count > 0 ? <span key={opt.id}>{opt.label}: <strong>{count}</strong></span> : null;
                                })}
                            </div>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-slate-500 text-center py-8">No hay servicios de comedor programados para esta fecha.</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default DiningHallView;