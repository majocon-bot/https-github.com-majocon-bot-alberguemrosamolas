import React from 'react';
import { BookingDetails } from '../types';

interface BookingDetailsFormProps {
  details: BookingDetails;
  setDetails: React.Dispatch<React.SetStateAction<BookingDetails>>;
}

const BookingDetailsForm: React.FC<BookingDetailsFormProps> = ({ details, setDetails }) => {
    
    const handleDetailChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setDetails(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        const newDetails = { ...details, [name]: value };

        // Ensure checkout is after checkin
        if (name === 'checkIn' && newDetails.checkOut <= value) {
            const nextDay = new Date(value);
            nextDay.setDate(nextDay.getDate() + 1);
            newDetails.checkOut = nextDay.toISOString().split('T')[0];
        }
        
        // When dates change, reset other services options
        newDetails.otherServices = {};
        setDetails(newDetails);
    };

    return (
        <div className="bg-white p-8 rounded-xl shadow-lg space-y-8 animate-fade-in-up">
            {/* Personal Details */}
            <fieldset>
                <legend className="text-2xl font-bold text-slate-800 mb-4">Datos de la Reserva</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                        <label htmlFor="groupName" className="block text-sm font-medium text-slate-600 mb-1">Nombre Grupo:</label>
                        <input type="text" name="groupName" id="groupName" value={details.groupName || ''} onChange={handleDetailChange} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required/>
                    </div>
                    <div>
                        <label htmlFor="name" className="block text-sm font-medium text-slate-600 mb-1">Nombre y Apellidos (Responsable)</label>
                        <input type="text" name="name" id="name" value={details.name} onChange={handleDetailChange} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required/>
                    </div>
                     <div>
                        <label htmlFor="dni" className="block text-sm font-medium text-slate-600 mb-1">DNI (Responsable)</label>
                        <input type="text" name="dni" id="dni" value={details.dni} onChange={handleDetailChange} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required/>
                    </div>
                    <div>
                        <label htmlFor="phone" className="block text-sm font-medium text-slate-600 mb-1">Teléfono (Responsable)</label>
                        <input type="tel" name="phone" id="phone" value={details.phone} onChange={handleDetailChange} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" required/>
                    </div>
                </div>
                <div className="mt-6">
                    <label htmlFor="observations" className="block text-sm font-medium text-slate-600 mb-1">Observaciones</label>
                    <textarea name="observations" id="observations" value={details.observations} onChange={handleDetailChange} rows={4} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" placeholder="Alergias, peticiones especiales, etc."></textarea>
                </div>
            </fieldset>

            {/* Booking Dates */}
            <fieldset>
                <legend className="text-2xl font-bold text-slate-800 mb-4">Fechas de la Estancia</legend>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="checkIn" className="block text-sm font-medium text-slate-600 mb-1">Entrada</label>
                        <input type="date" name="checkIn" id="checkIn" value={details.checkIn} onChange={handleDateChange} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" min={new Date().toISOString().split('T')[0]}/>
                    </div>
                    <div>
                        <label htmlFor="checkOut" className="block text-sm font-medium text-slate-600 mb-1">Salida</label>
                        <input type="date" name="checkOut" id="checkOut" value={details.checkOut} onChange={handleDateChange} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" min={details.checkIn}/>
                    </div>
                </div>
            </fieldset>
        </div>
    );
};

export default BookingDetailsForm;