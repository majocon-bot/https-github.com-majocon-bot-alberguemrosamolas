import React, { useState } from 'react';
import { IndividualReservation } from '../types';
import IndividualBookingForm from './IndividualBookingForm';
import { PlusIcon } from './icons/PlusIcon';
import { EditIcon } from './icons/EditIcon';
import { LinkIcon } from './icons/LinkIcon';
import { ESTABLISHMENT_DETAILS } from '../constants';

interface IndividualReservationsViewProps {
  reservations: IndividualReservation[];
  onSave: (reservation: IndividualReservation) => void;
}

const formatDate = (date: Date) => date.toISOString().split('T')[0];

const IndividualReservationsView: React.FC<IndividualReservationsViewProps> = ({ reservations, onSave }) => {
  const [view, setView] = useState<'list' | 'form'>('list');
  const [currentReservation, setCurrentReservation] = useState<IndividualReservation | null>(null);

  const handleNew = () => {
    setCurrentReservation({
      id: `indiv_${Date.now()}`,
      status: 'pending_staff',
      contractDetails: {
        ...ESTABLISHMENT_DETAILS,
        contractNumber: '',
        formalizationDate: formatDate(new Date()),
        contractType: 'RESERVA',
        checkInDate: formatDate(new Date()),
        checkOutDate: formatDate(new Date(Date.now() + 86400000)),
        roomNumber: '',
        travelers: 1,
        paymentType: '',
      },
      guestPersonalDetails: {},
      guestIdDetails: {},
      guestAddressDetails: {},
    });
    setView('form');
  };

  const handleEdit = (reservation: IndividualReservation) => {
    setCurrentReservation(reservation);
    setView('form');
  };

  const handleSave = (reservation: IndividualReservation) => {
    onSave(reservation);
    setView('list');
    setCurrentReservation(null);
  };

  const handleCancel = () => {
    setView('list');
    setCurrentReservation(null);
  };

  const handleCopyLink = (id: string) => {
    const url = `${window.location.origin}${window.location.pathname}?guestFormId=${id}`;
    navigator.clipboard.writeText(url).then(() => {
      alert('Enlace copiado al portapapeles. ¡Ahora puedes enviárselo al huésped!');
    }, (err) => {
      console.error('Could not copy text: ', err);
      alert('Error al copiar el enlace.');
    });
  };

  const getStatusChip = (status: IndividualReservation['status']) => {
    switch (status) {
      case 'completed':
        return <span className="px-2 py-1 text-xs font-semibold text-green-800 bg-green-100 rounded-full">Completado</span>;
      case 'pending_guest':
        return <span className="px-2 py-1 text-xs font-semibold text-yellow-800 bg-yellow-100 rounded-full">Pendiente de Huésped</span>;
      default:
        return <span className="px-2 py-1 text-xs font-semibold text-slate-800 bg-slate-100 rounded-full">Borrador</span>;
    }
  };

  if (view === 'form' && currentReservation) {
    return (
      <IndividualBookingForm
        reservation={currentReservation}
        onSave={handleSave}
        onCancel={handleCancel}
        mode="staff"
      />
    );
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      <header className="flex flex-wrap justify-between items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-slate-800">Fichas de Registro Individual</h1>
          <p className="text-lg text-slate-500 mt-1">
            Gestiona las fichas de entrada de los huéspedes.
          </p>
        </div>
        <button
          onClick={handleNew}
          className="flex items-center space-x-2 bg-indigo-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-indigo-700 transition-all duration-300 shadow-md"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Crear Nueva Ficha</span>
        </button>
      </header>
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="overflow-x-auto">
          {reservations.length > 0 ? (
            <table className="w-full text-sm text-left text-slate-500">
              <thead className="text-xs text-slate-700 uppercase bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3">Huésped</th>
                  <th scope="col" className="px-6 py-3">Fechas</th>
                  <th scope="col" className="px-6 py-3">Nº Habitación</th>
                  <th scope="col" className="px-6 py-3">Estado</th>
                  <th scope="col" className="px-6 py-3 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {reservations.sort((a,b) => a.contractDetails.checkInDate.localeCompare(b.contractDetails.checkInDate)).map((res) => (
                  <tr key={res.id} className="bg-white border-b hover:bg-slate-50">
                    <th scope="row" className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">
                      {res.guestPersonalDetails?.name || 'Huésped'} {res.guestPersonalDetails?.firstSurname || 'Sin Asignar'}
                    </th>
                    <td className="px-6 py-4">
                      {new Date(res.contractDetails.checkInDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', timeZone: 'UTC' })} - {new Date(res.contractDetails.checkOutDate).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })}
                    </td>
                    <td className="px-6 py-4">{res.contractDetails.roomNumber}</td>
                    <td className="px-6 py-4">{getStatusChip(res.status)}</td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center items-center space-x-1">
                         <button onClick={() => handleCopyLink(res.id)} className="p-2 text-green-600 hover:bg-green-100 rounded-full transition-colors" title="Copiar enlace para el huésped"><LinkIcon className="w-4 h-4" /></button>
                         <button onClick={() => handleEdit(res)} className="p-2 text-blue-600 hover:bg-blue-100 rounded-full transition-colors" title="Editar Ficha"><EditIcon className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="text-center py-16">
              <p className="text-slate-500 text-lg">No hay fichas de registro individuales. ¡Crea una nueva!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IndividualReservationsView;