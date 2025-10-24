import React, { useMemo } from 'react';
import { BookingDetails, DiningSelection } from '../types';
import { DINING_OPTIONS } from '../constants';

interface BookingDiningFormProps {
  details: BookingDetails;
  setDetails: React.Dispatch<React.SetStateAction<BookingDetails>>;
  totalGuests: number;
}

const getDatesInRange = (startDate: string, endDate: string): string[] => {
    const dates = [];
    let currentDate = new Date(startDate);
    const stopDate = new Date(endDate);
    
    // Ensure we don't get stuck in an infinite loop and date is valid
    if (stopDate <= currentDate || isNaN(currentDate.getTime())) return [];

    while (currentDate < stopDate) {
        dates.push(currentDate.toISOString().split('T')[0]);
        currentDate.setDate(currentDate.getDate() + 1);
    }
    return dates;
};

const defaultDiningSelection: DiningSelection = {
  breakfast: 0,
  lunch: 0,
  dinner: 0,
  morningSnack: 0,
  afternoonSnack: 0,
};

const BookingDiningForm: React.FC<BookingDiningFormProps> = ({ details, setDetails, totalGuests }) => {
    
    const stayDates = useMemo(() => {
        if (!details.checkIn || !details.checkOut) return [];
        return getDatesInRange(details.checkIn, details.checkOut);
    }, [details.checkIn, details.checkOut]);

    const handleDiningChange = (date: string, optionId: keyof DiningSelection, value: number) => {
        const diners = Math.max(0, Math.min(value, totalGuests)); // Clamp value between 0 and totalGuests
        setDetails(prev => {
            const newDining = { ...prev.dining };
            const daySelection = newDining[date] || { ...defaultDiningSelection };
            daySelection[optionId] = diners;
            newDining[date] = daySelection;
            return { ...prev, dining: newDining };
        });
    };
    
    const handleDetailChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setDetails(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    if (stayDates.length === 0 || totalGuests === 0) {
        return (
            <div className="bg-white p-8 rounded-xl shadow-lg text-center animate-fade-in-up">
                <p className="text-slate-500 text-lg">No se pueden seleccionar servicios de comedor.</p>
                <p className="text-sm text-slate-400 mt-2">Por favor, vuelve al paso anterior para seleccionar fechas y habitaciones.</p>
            </div>
        )
    }


    return (
        <div className="bg-white p-8 rounded-xl shadow-lg space-y-8 animate-fade-in-up">
             <fieldset>
                <legend className="text-2xl font-bold text-slate-800 mb-4">Servicio de Comedor</legend>
                 <p className="text-sm text-slate-500 mb-4">
                    Indica el número de comensales para cada servicio. Máximo: {totalGuests} por servicio.
                </p>
                <div className="space-y-4">
                    {stayDates.map(date => (
                        <div key={date} className="bg-slate-50 p-4 rounded-md">
                            <p className="font-semibold text-slate-700 mb-3">{new Date(date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                                {DINING_OPTIONS.map(option => (
                                    <div key={option.id}>
                                        <label htmlFor={`${date}-${option.id}`} className="block text-sm font-medium text-slate-600 mb-1">{option.label}</label>
                                        <input 
                                            type="number" 
                                            id={`${date}-${option.id}`}
                                            name={`${date}-${option.id}`}
                                            value={details.dining[date]?.[option.id] || 0}
                                            onChange={(e) => handleDiningChange(date, option.id, parseInt(e.target.value, 10) || 0)}
                                            min="0"
                                            max={totalGuests}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </fieldset>

            {/* Observations */}
            <fieldset>
                <legend className="text-2xl font-bold text-slate-800 mb-4">Observaciones</legend>
                <div>
                     <textarea name="observations" id="observations" value={details.observations} onChange={handleDetailChange} rows={4} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="Alergias, peticiones especiales, etc."></textarea>
                </div>
            </fieldset>
        </div>
    );
};

export default BookingDiningForm;
