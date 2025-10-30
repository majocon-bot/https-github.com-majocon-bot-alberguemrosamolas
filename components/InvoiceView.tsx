import React, { useMemo } from 'react';
import { GroupedReservationWithCost, TimeSlot, FiscalDetails } from '../types';
import { ROOM_TYPES, SERVICE_TYPES } from '../constants';
import { PrintIcon } from './icons/PrintIcon';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';

interface InvoiceViewProps {
  group: GroupedReservationWithCost;
  onBack: () => void;
  fiscalDetails: FiscalDetails;
}

const InvoiceView: React.FC<InvoiceViewProps> = ({ group, onBack, fiscalDetails }) => {
  const handlePrint = () => {
    window.print();
  };

  const costDetails = useMemo(() => {
    const accommodationItems = Object.entries(group.roomSummary)
      .map(([roomTypeId, count]) => {
        const roomType = ROOM_TYPES.find(rt => rt.id === roomTypeId);
        if (!roomType || !roomType.price) return null;
        const nights = Math.max(1, (new Date(group.maxCheckOut).getTime() - new Date(group.minCheckIn).getTime()) / (1000 * 3600 * 24));
        return {
          description: `${roomType.name} (${nights} ${nights > 1 ? 'noches' : 'noche'})`,
          quantity: Number(count),
          unitPrice: roomType.price * nights,
          total: roomType.price * nights * Number(count),
        };
      })
      .filter(Boolean);

    const serviceItems = Object.entries(group.otherServicesSummary)
        .flatMap(([date, services]) =>
            Object.entries(services).flatMap(([serviceId, slots]) => {
                const serviceInfo = SERVICE_TYPES.find(s => s.id === serviceId);
                if (!serviceInfo || !serviceInfo.price || slots.length === 0) return [];
                
                return (slots as TimeSlot[]).map(slot => {
                    let quantity = 1;
                    let unitPrice = serviceInfo.price;
                    let description = `${serviceInfo.name} (${new Date(date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', timeZone: 'UTC' })})`;

                    if (serviceInfo.priceUnit === 'per_hour' && slot.startTime && slot.endTime) {
                         const startTime = new Date(`1970-01-01T${slot.startTime}:00`);
                         const endTime = new Date(`1970-01-01T${slot.endTime}:00`);
                         const hours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
                         if(hours > 0) {
                            quantity = Number(hours.toFixed(2));
                            unitPrice = serviceInfo.price;
                            description += ` - ${slot.startTime} a ${slot.endTime}`
                         }
                    }
                    
                    return {
                        description,
                        quantity,
                        unitPrice,
                        total: unitPrice * quantity,
                    };
                });
            })
        )
        .filter(item => item.total > 0);

    const unitServiceItems = Object.entries(group.unitServicesSummary || {})
      .flatMap(([date, services]) =>
        Object.entries(services).map(([serviceId, units]) => {
            const serviceInfo = SERVICE_TYPES.find(s => s.id === serviceId);
            if (!serviceInfo || !serviceInfo.price || Number(units) <= 0) return null;

            return {
                description: `${serviceInfo.name} (${new Date(date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric', timeZone: 'UTC' })})`,
                quantity: Number(units),
                unitPrice: serviceInfo.price,
                total: serviceInfo.price * Number(units),
            };
        })
      )
      .filter(Boolean);


    const subtotal = [...accommodationItems, ...serviceItems, ...unitServiceItems].reduce((sum, item) => sum + (item?.total || 0), 0);
    const iva = subtotal * 0.21;
    const total = subtotal + iva;

    return { accommodationItems, serviceItems, unitServiceItems, subtotal, iva, total };
  }, [group]);


  return (
    <div className="animate-fade-in-up">
        <div className="no-print my-8 flex justify-between items-center">
            <button onClick={onBack} className="flex items-center space-x-2 bg-white text-slate-700 font-bold py-2 px-4 rounded-lg hover:bg-slate-100 transition-all duration-300 shadow-md">
                <ArrowLeftIcon className="w-5 h-5" />
                <span>Volver a Reservas</span>
            </button>
            <h1 className="text-3xl font-extrabold text-slate-800">Detalle de Factura</h1>
            <button onClick={handlePrint} className="flex items-center space-x-2 bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-all duration-300 shadow-md">
                <PrintIcon className="w-5 h-5" />
                <span>Imprimir Factura</span>
            </button>
        </div>

        <div id="invoice-printable" className="printable-area bg-white p-8 sm:p-12 rounded-xl shadow-lg">
            <header className="flex justify-between items-start pb-8 border-b">
                <div>
                    <h2 className="text-3xl font-bold text-slate-800">{fiscalDetails.companyName}</h2>
                    <p className="text-slate-500">{fiscalDetails.address}</p>
                    <p className="text-slate-500">{fiscalDetails.taxId}</p>
                </div>
                <div className="text-right">
                    <h1 className="text-4xl font-bold text-slate-800 uppercase tracking-widest">Factura</h1>
                    <p className="text-slate-500 mt-2">Nº: <span className="font-mono">{`INV-${group.reservations[0].id.substring(4, 10).toUpperCase()}`}</span></p>
                    <p className="text-slate-500">Fecha: <span className="font-mono">{new Date().toLocaleDateString('es-ES')}</span></p>
                </div>
            </header>

            <section className="flex justify-between my-8">
                <div>
                    <h3 className="font-semibold text-slate-600 mb-1">FACTURAR A:</h3>
                    <p className="font-bold text-slate-800 text-lg">{group.guestName}</p>
                    <p className="text-slate-500">DNI: {group.reservations[0].dni}</p>
                    <p className="text-slate-500">Tel: {group.reservations[0].phone}</p>
                </div>
                 <div className="text-right">
                    <h3 className="font-semibold text-slate-600 mb-1">FECHAS ESTANCIA:</h3>
                    <p className="font-bold text-slate-800">{new Date(group.minCheckIn).toLocaleDateString('es-ES', {timeZone: 'UTC'})} - {new Date(group.maxCheckOut).toLocaleDateString('es-ES', {timeZone: 'UTC'})}</p>
                </div>
            </section>
            
            <section>
                <table className="w-full text-left">
                    <thead className="bg-slate-50">
                        <tr>
                            <th className="p-3 font-semibold text-slate-600">Descripción</th>
                            <th className="p-3 font-semibold text-slate-600 text-right">Cantidad</th>
                            <th className="p-3 font-semibold text-slate-600 text-right">Precio Unitario</th>
                            <th className="p-3 font-semibold text-slate-600 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[...costDetails.accommodationItems, ...costDetails.serviceItems, ...costDetails.unitServiceItems].map((item, index) => item && (
                            <tr key={index} className="border-b">
                                <td className="p-3 text-slate-700">{item.description}</td>
                                <td className="p-3 text-slate-700 text-right">{item.quantity}</td>
                                <td className="p-3 text-slate-700 text-right">{item.unitPrice.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</td>
                                <td className="p-3 text-slate-700 text-right font-medium">{item.total.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            <section className="flex justify-end mt-8">
                <div className="w-full max-w-xs space-y-2 text-slate-600">
                    <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span className="font-medium text-slate-800">{costDetails.subtotal.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span>
                    </div>
                     <div className="flex justify-between">
                        <span>IVA (21%)</span>
                        <span className="font-medium text-slate-800">{costDetails.iva.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span>
                    </div>
                    <div className="flex justify-between text-xl font-bold text-slate-800 border-t pt-2">
                        <span>TOTAL</span>
                        <span>{costDetails.total.toLocaleString('es-ES', { style: 'currency', currency: 'EUR' })}</span>
                    </div>
                </div>
            </section>

            <footer className="mt-12 pt-6 border-t text-center text-slate-500 text-sm">
                <p>Gracias por su estancia.</p>
                <p>{fiscalDetails.companyName} - {fiscalDetails.taxId} - {fiscalDetails.phone} - {fiscalDetails.email}</p>
            </footer>
        </div>
    </div>
  );
};

export default InvoiceView;