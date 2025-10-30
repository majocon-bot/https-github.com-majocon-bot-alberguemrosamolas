

import React, { useState, useMemo } from 'react';
import { Reservation, DiningSelection } from '../types';
import { DINING_OPTIONS } from '../constants';
import { PrintIcon } from './icons/PrintIcon';

interface DiningHallViewProps {
  reservations: Reservation[];
}

const formatDate = (date: Date): string => date.toISOString().split('T')[0];

const getDatesInRange = (start: Date, end: Date): Date[] => {
    const dates = [];
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return [];
    
    let currentDate = new Date(start.valueOf());
    currentDate.setUTCHours(0,0,0,0);
    
    let stopDate = new Date(end.valueOf());
    stopDate.setUTCHours(0,0,0,0);

    while (currentDate <= stopDate) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
};

const DiningHallView: React.FC<DiningHallViewProps> = ({ reservations }) => {
  type FilterType = 'day' | 'week' | 'month' | 'range';
  const [filterType, setFilterType] = useState<FilterType>('day');
  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());

  const handleFilterChange = (type: FilterType) => {
    setFilterType(type);
    const today = new Date();
    today.setUTCHours(0,0,0,0);

    if (type === 'day') {
      setStartDate(today);
      setEndDate(today);
    } else if (type === 'week') {
      const dayOfWeek = today.getDay();
      const diff = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1); // Adjust for Sunday
      const weekStart = new Date(today.setDate(diff));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);
      setStartDate(weekStart);
      setEndDate(weekEnd);
    } else if (type === 'month') {
      const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
      const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      setStartDate(monthStart);
      setEndDate(monthEnd);
    } else { // range
      setStartDate(today);
      const nextWeek = new Date();
      nextWeek.setDate(today.getDate() + 6);
      setEndDate(nextWeek);
    }
  };
  
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>, dateType: 'start' | 'end' | 'day' | 'week' | 'month') => {
    const value = e.target.value;
    if (!value) return;

    if(dateType === 'day') {
        const selected = new Date(value + 'T00:00:00');
        setStartDate(selected);
        setEndDate(selected);
    } else if (dateType === 'week') {
        const [year, week] = value.split('-W');
        const d = (1 + (parseInt(week) - 1) * 7);
        const weekStart = new Date(parseInt(year), 0, d);
        const dayOfWeek = weekStart.getDay();
        const diff = weekStart.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
        const finalStart = new Date(weekStart.setDate(diff));
        const finalEnd = new Date(finalStart);
        finalEnd.setDate(finalStart.getDate() + 6);
        setStartDate(finalStart);
        setEndDate(finalEnd);
    } else if (dateType === 'month') {
        const [year, month] = value.split('-');
        const monthStart = new Date(parseInt(year), parseInt(month) - 1, 1);
        const monthEnd = new Date(parseInt(year), parseInt(month), 0);
        setStartDate(monthStart);
        setEndDate(monthEnd);
    } else if (dateType === 'start') {
        const newStartDate = new Date(value + 'T00:00:00');
        setStartDate(newStartDate);
        if (newStartDate > endDate) {
            setEndDate(newStartDate);
        }
    } else if (dateType === 'end') {
        const newEndDate = new Date(value + 'T00:00:00');
        setEndDate(newEndDate);
        if (newEndDate < startDate) {
            setStartDate(newEndDate);
        }
    }
  };

  const periodData = useMemo(() => {
    const periodTotals: DiningSelection = { breakfast: 0, lunch: 0, dinner: 0, morningSnack: 0, afternoonSnack: 0 };
    const dailyBreakdown: { [date: string]: DiningSelection } = {};
    const dates = getDatesInRange(startDate, endDate);

    // FIX: The previous logic had a flaw where it would overwrite reservations for the same guest,
    // potentially losing dining information. It was also inefficiently placed inside a loop.
    // The new logic correctly finds a representative reservation for each guest group once.
    // FIX: The return type of `reduce` is inferred from its initial value. By casting the initial
    // empty object to the correct type, we ensure `reservationsByGuest` is correctly typed.
    const reservationsByGuest: Record<string, Reservation[]> = reservations.reduce(
      (acc, res) => {
        // Group all reservations by guest name
        (acc[res.guestName] = acc[res.guestName] || []).push(res);
        return acc;
      },
      {} as Record<string, Reservation[]>
    );

    const representativeReservationsByGuest = Object.values(
      reservationsByGuest
    ).map((guestReservations) => {
      // For each group, find one reservation that contains the dining info.
      // This avoids double-counting if dining info is duplicated across reservations for a single booking.
      return guestReservations.find((r) => r.dining) || guestReservations[0];
    });

    dates.forEach(date => {
        const dateStr = formatDate(date);
        const dailyTotals: DiningSelection = { breakfast: 0, lunch: 0, dinner: 0, morningSnack: 0, afternoonSnack: 0 };
        
        representativeReservationsByGuest.forEach(res => {
            if (res && res.checkIn <= dateStr && res.checkOut > dateStr && res.dining?.[dateStr]) {
                const diningDay = res.dining[dateStr];
                dailyTotals.breakfast += diningDay.breakfast || 0;
                dailyTotals.lunch += diningDay.lunch || 0;
                dailyTotals.dinner += diningDay.dinner || 0;
                dailyTotals.morningSnack += diningDay.morningSnack || 0;
                dailyTotals.afternoonSnack += diningDay.afternoonSnack || 0;
            }
        });
        
        dailyBreakdown[dateStr] = dailyTotals;
        periodTotals.breakfast += dailyTotals.breakfast;
        periodTotals.lunch += dailyTotals.lunch;
        periodTotals.dinner += dailyTotals.dinner;
        periodTotals.morningSnack += dailyTotals.morningSnack;
        periodTotals.afternoonSnack += dailyTotals.afternoonSnack;
    });

    return { periodTotals, dailyBreakdown };
  }, [reservations, startDate, endDate]);
  
  const handlePrint = () => {
    const printableElement = document.getElementById('dining-hall-printable-area');
    if (printableElement) {
        printableElement.classList.add('printable-area');
        window.print();
        setTimeout(() => printableElement.classList.remove('printable-area'), 500);
    }
  };

  const getFilterTitle = () => {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' };
    if (filterType === 'day') return startDate.toLocaleDateString('es-ES', options);
    if (formatDate(startDate) === formatDate(endDate)) return startDate.toLocaleDateString('es-ES', options);
    return `${startDate.toLocaleDateString('es-ES', options)} - ${endDate.toLocaleDateString('es-ES', options)}`;
  }

  const baseButtonClass = "px-4 py-2 rounded-lg font-semibold transition-colors duration-200";
  const activeButtonClass = "bg-indigo-600 text-white shadow";
  const inactiveButtonClass = "bg-slate-200 text-slate-700 hover:bg-slate-300";


  return (
    <div className="space-y-8">
      <header className="text-center no-print">
        <h1 className="text-5xl font-extrabold text-slate-800">Resumen del Comedor</h1>
        <p className="text-xl text-slate-500 mt-2">Consulta el número total de comensales por día, semana, mes o rango.</p>
      </header>

      <div className="max-w-4xl mx-auto bg-white p-6 rounded-xl shadow-lg no-print">
        <div className="flex flex-wrap items-center justify-center gap-4">
            <div className="flex space-x-1 border border-slate-200 rounded-lg p-1">
                {(['day', 'week', 'month', 'range'] as FilterType[]).map(type => (
                    <button key={type} onClick={() => handleFilterChange(type)} className={`${baseButtonClass} ${filterType === type ? activeButtonClass : inactiveButtonClass}`}>
                        {type === 'day' ? 'Día' : type === 'week' ? 'Semana' : type === 'month' ? 'Mes' : 'Rango'}
                    </button>
                ))}
            </div>
            <div className="flex items-center gap-2">
                {filterType === 'day' && <input type="date" value={formatDate(startDate)} onChange={(e) => handleDateChange(e, 'day')} className="px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />}
                {filterType === 'week' && <input type="week" value={`${startDate.getFullYear()}-W${Math.ceil((((startDate.getTime() - new Date(startDate.getFullYear(), 0, 1).getTime()) / 86400000) + new Date(startDate.getFullYear(), 0, 1).getDay() + 1) / 7)}`} onChange={(e) => handleDateChange(e, 'week')} className="px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />}
                {filterType === 'month' && <input type="month" value={`${startDate.getFullYear()}-${String(startDate.getMonth() + 1).padStart(2, '0')}`} onChange={(e) => handleDateChange(e, 'month')} className="px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />}
                {filterType === 'range' && (
                    <>
                        <input type="date" value={formatDate(startDate)} onChange={(e) => handleDateChange(e, 'start')} className="px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                        <span className="text-slate-500">a</span>
                        <input type="date" value={formatDate(endDate)} onChange={(e) => handleDateChange(e, 'end')} min={formatDate(startDate)} className="px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                    </>
                )}
            </div>
             <button onClick={handlePrint} className="flex items-center space-x-2 bg-slate-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-700 transition-all duration-300 shadow-md">
                <PrintIcon className="w-5 h-5"/>
                <span>Imprimir Resumen</span>
            </button>
        </div>
      </div>

      <div id="dining-hall-printable-area" className="bg-white p-6 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold text-slate-800 mb-6 border-b pb-4">
          Resumen para el período: {getFilterTitle()}
        </h2>
        
        <h3 className="text-xl font-bold text-slate-700 mb-4">Totales del Período</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-8">
            {DINING_OPTIONS.map(option => (
                <div key={option.id} className="bg-slate-100 p-4 rounded-lg text-center">
                    <p className="text-base font-semibold text-slate-600">{option.label}</p>
                    <p className="text-4xl font-bold text-indigo-600 mt-2">{periodData.periodTotals[option.id]}</p>
                    <p className="text-sm text-slate-500">Comensales</p>
                </div>
            ))}
        </div>

        <div>
            <h3 className="text-2xl font-bold text-slate-800 mb-4">Desglose Diario</h3>
            {Object.keys(periodData.dailyBreakdown).length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-500">
                        <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                            <tr>
                                <th scope="col" className="px-6 py-3">Fecha</th>
                                {DINING_OPTIONS.map(opt => <th key={opt.id} scope="col" className="px-6 py-3 text-center">{opt.label}</th>)}
                            </tr>
                        </thead>
                        <tbody>
                            {Object.entries(periodData.dailyBreakdown).map(([date, totals]) => (
                                <tr key={date} className="bg-white border-b hover:bg-slate-50">
                                    <th scope="row" className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                                        {new Date(date + 'T00:00:00').toLocaleDateString('es-ES', { weekday:'short', month: 'long', day: 'numeric', timeZone: 'UTC' })}
                                    </th>
                                    {DINING_OPTIONS.map(opt => (
                                        <td key={opt.id} className="px-6 py-4 text-center font-mono">
                                            {totals[opt.id] > 0 ? totals[opt.id] : '-'}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                <p className="text-slate-500 text-center py-8">No hay servicios de comedor programados para este período.</p>
            )}
        </div>
      </div>
    </div>
  );
};

export default DiningHallView;
