import React, { useMemo } from 'react';
import { BookingDetails, RoomSelection, TimeSlot } from '../types';
import { SERVICE_TYPES } from '../constants';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';

interface BookingOtherServicesFormProps {
  details: BookingDetails;
  setDetails: React.Dispatch<React.SetStateAction<BookingDetails>>;
  roomSelection: RoomSelection;
}

const getDatesInRange = (startDate: string, endDate: string): string[] => {
    const dates = [];
    let currentDate = new Date(startDate);
    const stopDate = new Date(endDate);
    
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
    
    const updateOtherServices = (date: string, serviceId: string, newSlots: TimeSlot[]) => {
        setDetails(prev => ({
            ...prev,
            otherServices: {
                ...prev.otherServices,
                [date]: {
                    ...prev.otherServices[date],
                    [serviceId]: newSlots
                }
            }
        }));
    };

    const handleAddSlot = (date: string, serviceId: string) => {
        const currentSlots = details.otherServices?.[date]?.[serviceId] || [];
        const newSlots = [...currentSlots, { startTime: '', endTime: '' }];
        updateOtherServices(date, serviceId, newSlots);
    };

    const handleRemoveSlot = (date: string, serviceId: string, indexToRemove: number) => {
        const currentSlots = details.otherServices?.[date]?.[serviceId] || [];
        const newSlots = currentSlots.filter((_, index) => index !== indexToRemove);
        updateOtherServices(date, serviceId, newSlots);
    };

    const handleTimeChange = (date: string, serviceId: string, index: number, field: 'startTime' | 'endTime', value: string) => {
        const currentSlots = details.otherServices?.[date]?.[serviceId] || [];
        const newSlots = currentSlots.map((slot, i) => i === index ? { ...slot, [field]: value } : slot);
        updateOtherServices(date, serviceId, newSlots);
    };

    const handleUnitChange = (date: string, serviceId: string, value: string) => {
        let units = parseInt(value, 10) || 0;
        if (units > 999) {
            units = 999;
        }
        setDetails(prev => {
            const newUnitServices = { ...(prev.unitServices || {}) };
            if (!newUnitServices[date]) newUnitServices[date] = {};
            newUnitServices[date][serviceId] = units;
            return { ...prev, unitServices: newUnitServices };
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
                    Especifica los horarios o unidades para cada servicio.
                </p>
                <div className="space-y-6">
                    {stayDates.map(date => (
                        <div key={date} className="bg-slate-50 p-4 rounded-lg">
                            <p className="font-semibold text-slate-700 mb-3 text-lg">{new Date(date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}</p>
                            <div className="space-y-4">
                                {selectedServices.map(service => {
                                    if (service.priceUnit === 'one_time') {
                                        return (
                                            <div key={service.id} className="bg-white p-3 rounded-md shadow-sm">
                                                <label htmlFor={`${date}-${service.id}-units`} className="block text-md font-medium text-slate-800 mb-2">{service.name}</label>
                                                <div className="flex items-center gap-2">
                                                    <input 
                                                        type="number"
                                                        id={`${date}-${service.id}-units`}
                                                        value={details.unitServices?.[date]?.[service.id] || ''}
                                                        onChange={e => handleUnitChange(date, service.id, e.target.value)}
                                                        min="0"
                                                        max="999"
                                                        placeholder="0"
                                                        className="w-40 px-2 py-1 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                                    />
                                                    <span className="text-slate-500">unidades</span>
                                                </div>
                                            </div>
                                        );
                                    }

                                    const maxSlots = roomSelection[service.id] || 0;
                                    const currentSlots = details.otherServices?.[date]?.[service.id] || [];
                                    return (
                                        <div key={service.id} className="bg-white p-3 rounded-md shadow-sm">
                                            <label className="block text-md font-medium text-slate-800 mb-2">{service.name} ({currentSlots.length}/{maxSlots} uds.)</label>
                                            <div className="space-y-2">
                                                {currentSlots.map((slot, index) => (
                                                    <div key={index} className="flex items-center gap-2">
                                                        <input 
                                                            type="time"
                                                            value={slot.startTime}
                                                            onChange={e => handleTimeChange(date, service.id, index, 'startTime', e.target.value)}
                                                            className="w-full px-2 py-1 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                                        />
                                                        <span className="text-slate-500">-</span>
                                                        <input 
                                                            type="time"
                                                            value={slot.endTime}
                                                            onChange={e => handleTimeChange(date, service.id, index, 'endTime', e.target.value)}
                                                            min={slot.startTime}
                                                            className="w-full px-2 py-1 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                                                        />
                                                        <button
                                                            onClick={() => handleRemoveSlot(date, service.id, index)}
                                                            className="p-1.5 text-red-500 hover:bg-red-100 rounded-full transition-colors"
                                                            title="Eliminar tramo"
                                                        >
                                                            <TrashIcon className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                            {currentSlots.length < maxSlots && (
                                                <button
                                                    onClick={() => handleAddSlot(date, service.id)}
                                                    className="mt-2 flex items-center gap-1 text-sm text-indigo-600 font-semibold hover:text-indigo-800"
                                                >
                                                    <PlusIcon className="w-4 h-4" />
                                                    Añadir horario
                                                </button>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </fieldset>
        </div>
    );
};

export default BookingOtherServicesForm;