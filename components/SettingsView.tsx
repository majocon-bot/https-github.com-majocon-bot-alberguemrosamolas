import React, { useState, useRef } from 'react';
import { FiscalDetails } from '../types';

interface SettingsViewProps {
    fiscalDetails: FiscalDetails;
    onSave: (details: FiscalDetails) => void;
    onExport: () => void;
    onImport: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const SettingsView: React.FC<SettingsViewProps> = ({ fiscalDetails, onSave, onExport, onImport }) => {
    const [details, setDetails] = useState<FiscalDetails>(fiscalDetails);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDetails(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(details);
    };

    const handleImportClick = () => {
        fileInputRef.current?.click();
    };


    return (
        <div className="space-y-8 animate-fade-in-up">
            <header className="text-center">
                <h1 className="text-5xl font-extrabold text-slate-800">Ajustes</h1>
                <p className="text-xl text-slate-500 mt-2">Configura los datos de la empresa y gestiona la información de las reservas.</p>
            </header>

            {/* Fiscal Data Card */}
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg">
                <form onSubmit={handleSave}>
                    <h2 className="text-3xl font-bold text-slate-800 mb-6 border-b pb-4">Datos Fiscales</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                        <div>
                            <label htmlFor="companyName" className="block text-sm font-medium text-slate-600 mb-1">Nombre de la Empresa</label>
                            <input type="text" name="companyName" id="companyName" value={details.companyName} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label htmlFor="taxId" className="block text-sm font-medium text-slate-600 mb-1">CIF / NIF</label>
                            <input type="text" name="taxId" id="taxId" value={details.taxId} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div className="md:col-span-2">
                            <label htmlFor="address" className="block text-sm font-medium text-slate-600 mb-1">Dirección</label>
                            <input type="text" name="address" id="address" value={details.address} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-slate-600 mb-1">Teléfono</label>
                            <input type="tel" name="phone" id="phone" value={details.phone} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-slate-600 mb-1">Email</label>
                            <input type="email" name="email" id="email" value={details.email} onChange={handleChange} className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500" />
                        </div>
                    </div>
                    <div className="flex justify-end">
                        <button type="submit" className="bg-indigo-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-indigo-700 transition-all duration-300 shadow-md">
                            Guardar Cambios
                        </button>
                    </div>
                </form>
            </div>

            {/* Data Management Card */}
            <div className="max-w-4xl mx-auto bg-white p-8 rounded-xl shadow-lg">
                <h2 className="text-3xl font-bold text-slate-800 mb-6 border-b pb-4">Gestión de Datos</h2>
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-700">Exportar Reservas</h3>
                        <p className="text-slate-500 text-sm mt-1 mb-3">Guarda una copia de seguridad de todas las reservas en un archivo JSON.</p>
                        <button onClick={onExport} className="w-full md:w-auto bg-green-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-green-700 transition-all duration-300 shadow-md">
                            Exportar Datos
                        </button>
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-semibold text-slate-700">Importar Reservas</h3>
                        <p className="text-slate-500 text-sm mt-1 mb-3">Carga reservas desde un archivo JSON. <strong className="text-red-600">Esto reemplazará todos los datos actuales.</strong></p>
                        <button onClick={handleImportClick} className="w-full md:w-auto bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-all duration-300 shadow-md">
                            Importar Datos
                        </button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={onImport}
                            className="hidden"
                            accept=".json"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsView;