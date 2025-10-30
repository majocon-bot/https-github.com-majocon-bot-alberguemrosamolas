import React, { useState, useEffect } from 'react';
import { IndividualReservation, ContractDetails, GuestIdDetails, GuestPersonalDetails, GuestAddressDetails } from '../types';

interface IndividualBookingFormProps {
  reservation: IndividualReservation;
  onSave: (reservation: IndividualReservation) => void;
  onCancel?: () => void;
  mode: 'staff' | 'guest';
}

const IndividualBookingForm: React.FC<IndividualBookingFormProps> = ({ reservation, onSave, onCancel, mode }) => {
  const [formData, setFormData] = useState<IndividualReservation>(reservation);

  useEffect(() => {
    setFormData(reservation);
  }, [reservation]);

  const handleContractChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const isCheckbox = type === 'checkbox';
    const checked = (e.target as HTMLInputElement).checked;

    setFormData(prev => ({
      ...prev,
      contractDetails: {
        ...prev.contractDetails,
        [name]: isCheckbox ? checked : value,
      },
    }));
  };

  const handleGuestChange = (section: 'guestIdDetails' | 'guestPersonalDetails' | 'guestAddressDetails', e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
     const { name, value } = e.target;
     setFormData(prev => ({
        ...prev,
        [section]: {
            ...prev[section],
            [name]: value,
        }
     }))
  };
  
  const handleConsentChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({
        ...prev,
        consents: {
            ...prev.consents,
            [name]: checked,
        }
    }))
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    let updatedData = { ...formData };
    if(mode === 'staff' && formData.status === 'pending_staff') {
        updatedData.status = 'pending_guest';
    } else if (mode === 'guest') {
        updatedData.status = 'completed';
    }
    onSave(updatedData);
  };
  
  const isStaff = mode === 'staff';

  return (
    <form onSubmit={handleSubmit} className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg space-y-12 animate-fade-in-up">
        <header className="text-center">
            <h1 className="text-4xl font-extrabold text-slate-800">Registro de Personas Alojadas</h1>
            {isStaff && <p className="text-lg text-slate-500 mt-1">Ficha de registro individual</p>}
            {!isStaff && <p className="text-lg text-slate-500 mt-1">Por favor, complete sus datos para confirmar su estancia.</p>}
        </header>

        {/* Section 1: Datos del Contrato */}
        <fieldset disabled={!isStaff}>
            <legend className="text-2xl font-bold text-slate-800 mb-6 border-b pb-2">Datos del Contrato</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div><label className="block text-sm font-medium text-slate-600">ID policial</label><input type="text" name="policeId" value={formData.contractDetails.policeId} onChange={handleContractChange} className="mt-1 w-full form-input" /></div>
                <div><label className="block text-sm font-medium text-slate-600">Nombre establecimiento</label><input type="text" name="establishmentName" value={formData.contractDetails.establishmentName} onChange={handleContractChange} className="mt-1 w-full form-input" /></div>
                <div><label className="block text-sm font-medium text-slate-600">Tipo de contrato *</label>
                    <select name="contractType" value={formData.contractDetails.contractType} onChange={handleContractChange} className="mt-1 w-full form-select">
                        <option value="RESERVA">Reserva</option><option value="CONTRATO_EN_CURSO">Contrato en curso</option>
                    </select>
                </div>
                <div><label className="block text-sm font-medium text-slate-600">Número de contrato *</label><input type="text" name="contractNumber" value={formData.contractDetails.contractNumber} onChange={handleContractChange} className="mt-1 w-full form-input" required={isStaff} /></div>
                <div><label className="block text-sm font-medium text-slate-600">Fecha formalización *</label><input type="date" name="formalizationDate" value={formData.contractDetails.formalizationDate} onChange={handleContractChange} className="mt-1 w-full form-input" required={isStaff} /></div>
                <div><label className="block text-sm font-medium text-slate-600">Fecha entrada *</label><input type="date" name="checkInDate" value={formData.contractDetails.checkInDate} onChange={handleContractChange} className="mt-1 w-full form-input" required={isStaff} /></div>
                <div><label className="block text-sm font-medium text-slate-600">Fecha salida *</label><input type="date" name="checkOutDate" value={formData.contractDetails.checkOutDate} onChange={handleContractChange} className="mt-1 w-full form-input" required={isStaff} /></div>
                <div><label className="block text-sm font-medium text-slate-600">Número habitación</label><input type="text" name="roomNumber" value={formData.contractDetails.roomNumber} onChange={handleContractChange} className="mt-1 w-full form-input" /></div>
                <div><label className="block text-sm font-medium text-slate-600">Número viajeros *</label><input type="number" name="travelers" value={formData.contractDetails.travelers} onChange={handleContractChange} className="mt-1 w-full form-input" min="1" required={isStaff} /></div>
                <div><label className="block text-sm font-medium text-slate-600">Tipo de pago *</label><input type="text" name="paymentType" value={formData.contractDetails.paymentType} onChange={handleContractChange} className="mt-1 w-full form-input" required={isStaff} /></div>
                <div className="flex items-center"><input type="checkbox" name="hasInternet" checked={formData.contractDetails.hasInternet} onChange={handleContractChange} className="form-checkbox" /><label className="ml-2 text-sm font-medium text-slate-600">¿Dispone de internet?</label></div>
            </div>
        </fieldset>
        
        {/* Section 2: Datos Identificativos */}
        <fieldset disabled={isStaff}>
            <legend className="text-2xl font-bold text-slate-800 mb-6 border-b pb-2">Datos Identificativos de la Persona que se Aloja</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 <div><label className="block text-sm font-medium text-slate-600">Tipo de documento *</label>
                    <select name="documentType" value={formData.guestIdDetails.documentType || ''} onChange={e => handleGuestChange('guestIdDetails', e)} className="mt-1 w-full form-select" required={!isStaff}>
                        <option value="">Seleccione...</option><option value="NIF">NIF</option><option value="NIE">NIE</option><option value="Pasaporte">Pasaporte</option>
                    </select>
                </div>
                <div><label className="block text-sm font-medium text-slate-600">Nº de documento *</label><input type="text" name="documentNumber" value={formData.guestIdDetails.documentNumber || ''} onChange={e => handleGuestChange('guestIdDetails', e)} className="mt-1 w-full form-input" required={!isStaff}/></div>
                <div><label className="block text-sm font-medium text-slate-600">Número soporte documento</label><input type="text" name="supportDocumentNumber" value={formData.guestIdDetails.supportDocumentNumber || ''} onChange={e => handleGuestChange('guestIdDetails', e)} className="mt-1 w-full form-input" /></div>
                <div><label className="block text-sm font-medium text-slate-600">Fecha de expedición</label><input type="date" name="expeditionDate" value={formData.guestIdDetails.expeditionDate || ''} onChange={e => handleGuestChange('guestIdDetails', e)} className="mt-1 w-full form-input" /></div>
            </div>
        </fieldset>
        
        {/* Section 3: Datos Personales */}
        <fieldset disabled={isStaff}>
             <legend className="text-2xl font-bold text-slate-800 mb-6 border-b pb-2">Datos Personales</legend>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div><label className="block text-sm font-medium text-slate-600">Nombre *</label><input type="text" name="name" value={formData.guestPersonalDetails.name || ''} onChange={e => handleGuestChange('guestPersonalDetails', e)} className="mt-1 w-full form-input" required /></div>
                <div><label className="block text-sm font-medium text-slate-600">Primer apellido *</label><input type="text" name="firstSurname" value={formData.guestPersonalDetails.firstSurname || ''} onChange={e => handleGuestChange('guestPersonalDetails', e)} className="mt-1 w-full form-input" required /></div>
                <div><label className="block text-sm font-medium text-slate-600">Segundo apellido</label><input type="text" name="secondSurname" value={formData.guestPersonalDetails.secondSurname || ''} onChange={e => handleGuestChange('guestPersonalDetails', e)} className="mt-1 w-full form-input" /></div>
                <div><label className="block text-sm font-medium text-slate-600">Sexo</label>
                     <select name="sex" value={formData.guestPersonalDetails.sex || ''} onChange={e => handleGuestChange('guestPersonalDetails', e)} className="mt-1 w-full form-select">
                        <option value="">Seleccione...</option><option value="Hombre">Hombre</option><option value="Mujer">Mujer</option><option value="Otro">Otro</option>
                    </select>
                </div>
                <div><label className="block text-sm font-medium text-slate-600">Fecha de nacimiento *</label><input type="date" name="birthDate" value={formData.guestPersonalDetails.birthDate || ''} onChange={e => handleGuestChange('guestPersonalDetails', e)} className="mt-1 w-full form-input" required={!isStaff}/></div>
                <div><label className="block text-sm font-medium text-slate-600">País / Nacionalidad *</label><input type="text" name="nationality" value={formData.guestPersonalDetails.nationality || ''} onChange={e => handleGuestChange('guestPersonalDetails', e)} className="mt-1 w-full form-input" required={!isStaff}/></div>
                <div><label className="block text-sm font-medium text-slate-600">Correo electrónico *</label><input type="email" name="email" value={formData.guestPersonalDetails.email || ''} onChange={e => handleGuestChange('guestPersonalDetails', e)} className="mt-1 w-full form-input" required /></div>
                <div><label className="block text-sm font-medium text-slate-600">Teléfono *</label><input type="tel" name="phone" value={formData.guestPersonalDetails.phone || ''} onChange={e => handleGuestChange('guestPersonalDetails', e)} className="mt-1 w-full form-input" required /></div>
                <div><label className="block text-sm font-medium text-slate-600">Relación de parentesco</label><input type="text" name="kinship" value={formData.guestPersonalDetails.kinship || ''} onChange={e => handleGuestChange('guestPersonalDetails', e)} className="mt-1 w-full form-input" /></div>
             </div>
        </fieldset>
        
        {/* Section 4: Dirección Postal */}
        <fieldset disabled={isStaff}>
            <legend className="text-2xl font-bold text-slate-800 mb-6 border-b pb-2">Dirección Postal</legend>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-3"><label className="block text-sm font-medium text-slate-600">Dirección postal *</label><input type="text" name="address" value={formData.guestAddressDetails.address || ''} onChange={e => handleGuestChange('guestAddressDetails', e)} className="mt-1 w-full form-input" required={!isStaff}/></div>
                <div><label className="block text-sm font-medium text-slate-600">País *</label><input type="text" name="country" value={formData.guestAddressDetails.country || ''} onChange={e => handleGuestChange('guestAddressDetails', e)} className="mt-1 w-full form-input" required={!isStaff}/></div>
                <div><label className="block text-sm font-medium text-slate-600">Provincia</label><input type="text" name="province" value={formData.guestAddressDetails.province || ''} onChange={e => handleGuestChange('guestAddressDetails', e)} className="mt-1 w-full form-input" /></div>
                <div><label className="block text-sm font-medium text-slate-600">Municipio</label><input type="text" name="municipality" value={formData.guestAddressDetails.municipality || ''} onChange={e => handleGuestChange('guestAddressDetails', e)} className="mt-1 w-full form-input" /></div>
                <div><label className="block text-sm font-medium text-slate-600">Localidad</label><input type="text" name="locality" value={formData.guestAddressDetails.locality || ''} onChange={e => handleGuestChange('guestAddressDetails', e)} className="mt-1 w-full form-input" /></div>
                <div><label className="block text-sm font-medium text-slate-600">Código postal *</label><input type="text" name="postalCode" value={formData.guestAddressDetails.postalCode || ''} onChange={e => handleGuestChange('guestAddressDetails', e)} className="mt-1 w-full form-input" required={!isStaff}/></div>
            </div>
        </fieldset>

        {/* Section 5: Finalidades y Consentimientos */}
        <fieldset disabled={isStaff}>
            <legend className="text-2xl font-bold text-slate-800 mb-6 border-b pb-2">Finalidades que requieren consentimiento</legend>
            <div className="space-y-4">
                <div className="flex items-start">
                    <input id="healthData" name="healthData" type="checkbox" checked={formData.consents?.healthData || false} onChange={handleConsentChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mt-1" />
                    <div className="ml-3 text-sm">
                        <label htmlFor="healthData" className="font-medium text-gray-700">DATOS DE SALUD</label>
                        <p className="text-gray-500">Autorizo al tratamiento de la información relativa a mi salud que considere relevante para recibir una adecuada atención durante mi estancia.</p>
                    </div>
                </div>
                 <div className="flex items-start">
                    <input id="commercialInfo" name="commercialInfo" type="checkbox" checked={formData.consents?.commercialInfo || false} onChange={handleConsentChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mt-1" />
                    <div className="ml-3 text-sm">
                        <label htmlFor="commercialInfo" className="font-medium text-gray-700">INFORMACIÓN COMERCIAL</label>
                        <p className="text-gray-500">Deseo recibir información comercial inclusive por medios electrónicos.</p>
                    </div>
                </div>
                 <div className="flex items-start">
                    <input id="imageUse" name="imageUse" type="checkbox" checked={formData.consents?.imageUse || false} onChange={handleConsentChange} className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500 mt-1" />
                    <div className="ml-3 text-sm">
                        <label htmlFor="imageUse" className="font-medium text-gray-700">USO DE IMAGEN</label>
                        <p className="text-gray-500">Autorizo el uso de mi imagen, realización de fotografías y su utilización y publicación, en el marco de mi estancia.</p>
                    </div>
                </div>
            </div>
        </fieldset>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-4 pt-6 border-t">
            {isStaff && onCancel && (
                <button type="button" onClick={onCancel} className="bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded-lg hover:bg-slate-300 transition-colors">
                    Cancelar
                </button>
            )}
            <button type="submit" className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 transition-colors shadow-md">
                {isStaff ? (formData.status === 'pending_staff' ? 'Guardar y Generar Enlace' : 'Guardar Cambios') : 'Enviar Mis Datos'}
            </button>
        </div>
        
        <style jsx>{`
            .form-input, .form-select, .form-checkbox {
                padding: 0.5rem 0.75rem;
                border: 1px solid #d1d5db;
                border-radius: 0.375rem;
                box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05);
            }
            .form-input:disabled, .form-select:disabled {
                background-color: #f3f4f6;
                color: #6b7280;
                cursor: not-allowed;
            }
            fieldset:disabled {
                opacity: 0.7;
            }
        `}</style>
    </form>
  );
};

export default IndividualBookingForm;
