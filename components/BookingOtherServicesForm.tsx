import React, { useMemo } from 'react';
import { BookingDetails, RoomSelection } from '../types';
import { SERVICE_TYPES } from '../constants';

interface BookingOtherServicesFormProps {
  details: BookingDetails;
  setDetails: React.Dispatch<React.SetStateAction<BookingDetails>>;
  roomSelection: RoomSelection;
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

const BookingOtherServicesForm: React.FC<BookingOtherServicesFormProps> = ({ details, setDetails, roomSelection }) => {
    
    const stayDates = useMemo(() => {
        if (!details.checkIn || !details.checkOut) return [];
        return getDatesInRange(details.checkIn, details.checkOut);
    }, [details.checkIn, details.checkOut]);

    const selectedServices = useMemo(() => {
        return SERVICE_TYPES.filter(service => (roomSelection[service.id] || 0) > 0);
    }, [roomSelection]);

    const handleServiceChange = (date: string, serviceId: string, value: number) => {
        const maxAllowed = roomSelection[serviceId] || 0;
        const count = Math.max(0, Math.min(value, maxAllowed));
        setDetails(prev => {
            const newOtherServices = { ...(prev.otherServices || {}) };
            const daySelection = newOtherServices[date] || {};
            daySelection[serviceId] = count;
            newOtherServices[date] = daySelection;
            return { ...prev, otherServices: newOtherServices };
        });
    };
    
    if (selectedServices.length === 0) {
        return (
             <div className="bg-white p-8 rounded-xl shadow-lg text-center animate-fade-in-up">
                <p className="text-slate-500 text-lg">No se han seleccionado salas o servicios adicionales.</p>
                <p className="text-sm text-slate-400 mt-2">Puedes continuar para confirmar tu reserva o volver para añadir servicios.</p>
            </div>
        )
    }

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg space-y-8 animate-fade-in-up">
             <fieldset>
                <legend className="text-2xl font-bold text-slate-800 mb-4">Uso de Salas y Servicios</legend>
                 <p className="text-sm text-slate-500 mb-4">
                    Especifica cuántas unidades de cada servicio necesitarás por día.
                </p>
                <div className="space-y-4">
                    {stayDates.map(date => (
                        <div key={date} className="bg-slate-50 p-4 rounded-md">
                            <p className="font-semibold text-slate-700 mb-3">{new Date(date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}</p>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {selectedServices.map(service => (
                                    <div key={service.id}>
                                        <label htmlFor={`${date}-${service.id}`} className="block text-sm font-medium text-slate-600 mb-1">{service.name}</label>
                                        <input 
                                            type="number" 
                                            id={`${date}-${service.id}`}
                                            name={`${date}-${service.id}`}
                                            value={details.otherServices?.[date]?.[service.id] || 0}
                                            onChange={(e) => handleServiceChange(date, service.id, parseInt(e.target.value, 10) || 0)}
                                            min="0"
                                            max={roomSelection[service.id]}
                                            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </fieldset>
        </div>
    );
};

export default BookingOtherServicesForm;
