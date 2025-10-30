import React from 'react';
import { IndividualReservation } from '../types';
import { PrintIcon } from './icons/PrintIcon';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';

interface IndividualReservationPrintViewProps {
  reservation: IndividualReservation;
  onBack: () => void;
}

const Field: React.FC<{ label: string; value?: string | number | null; className?: string, subtext?: string }> = ({ label, value, className, subtext }) => (
    <div className={`border border-black p-1 ${className}`}>
        <div className="text-xs">{label}{subtext && ` (${subtext})`}</div>
        <div className="font-bold text-sm h-5">{value || ''}</div>
    </div>
);

const Checkbox: React.FC<{ label: string; checked: boolean; }> = ({ label, checked }) => (
    <span className="font-mono">
        {label} [{checked ? 'X' : ' '}]
    </span>
);


const IndividualReservationPrintView: React.FC<IndividualReservationPrintViewProps> = ({ reservation, onBack }) => {
    const { contractDetails: cd, guestIdDetails: gid, guestPersonalDetails: gpd, guestAddressDetails: gad, consents } = reservation;
  
    return (
    <>
    <div className="printable-area bg-white p-8 font-sans text-xs text-black A4-size">
        {/* Page 1 */}
        <div>
            {/* Header */}
            <header className="mb-4">
                <h1 className="text-xl font-bold">Generalitat de Catalunya</h1>
                <h2 className="text-2xl font-bold mt-4">Registro de personas alojadas</h2>
            </header>

            {/* Datos del contrato */}
            <section className="mb-2">
                <h3 className="font-bold bg-gray-200 border border-black p-1">Datos del contrato</h3>
                <div className="grid grid-cols-6 border-b border-r border-black">
                    <Field label="ID policial establecimiento *" value={cd.policeId} className="col-span-2 border-l border-t" />
                    <Field label="Nombre del establecimiento *" value={cd.establishmentName} className="col-span-2 border-l border-t" />
                    <Field label="Tipo de contrato *" value={cd.contractType} subtext="1" className="col-span-2 border-l border-t" />
                </div>
                 <div className="grid grid-cols-6 border-b border-r border-black">
                    <Field label="Número de contrato *" value={cd.contractNumber} className="col-span-2 border-l" />
                    <Field label="Fecha formalización contrato *" value={cd.formalizationDate} subtext="2" className="col-span-2 border-l" />
                    <Field label="Fecha entrada *" value={cd.checkInDate} className="col-span-2 border-l" />
                </div>
                <div className="grid grid-cols-6 border-b border-r border-black">
                    <Field label="Fecha salida *" value={cd.checkOutDate} subtext="3" className="col-span-2 border-l" />
                    <Field label="Número viajeros *" value={cd.travelers} className="col-span-2 border-l" />
                    <Field label="Tipo de pago *" value={cd.paymentType} subtext="4" className="col-span-2 border-l" />
                </div>
                 <div className="grid grid-cols-6 border-b border-r border-black">
                    <Field label="Número de habitaciones" value={cd.roomNumber} className="col-span-3 border-l" />
                    <Field label="¿El establecimiento dispone de internet? (SI/NO)" value={cd.hasInternet ? 'SI' : 'NO'} className="col-span-3 border-l" />
                </div>
            </section>
            
            {/* Datos identificativos */}
            <section className="mb-2">
                <h3 className="font-bold bg-gray-200 border border-black p-1">Datos identificativos de la persona que se aloja</h3>
                <div className="grid grid-cols-6 border-b border-r border-black">
                    <Field label="Tipo de documento *" value={gid.documentType} subtext="5" className="col-span-2 border-l border-t" />
                    <Field label="N° de documento de identidad *" value={gid.documentNumber} subtext="6" className="col-span-4 border-l border-t" />
                </div>
                <div className="grid grid-cols-6 border-b border-r border-black">
                    <Field label="Número soporte documento" value={gid.supportDocumentNumber} subtext="7" className="col-span-3 border-l" />
                    <Field label="Fecha de expedición" value={gid.expeditionDate} className="col-span-3 border-l" />
                </div>
            </section>
            
            {/* Datos personales */}
             <section className="mb-2">
                <h3 className="font-bold bg-gray-200 border border-black p-1">Datos personales de la persona que se aloja (8)</h3>
                <div className="grid grid-cols-6 border-b border-r border-black">
                    <Field label="Nombre *" value={gpd.name} className="col-span-2 border-l border-t" />
                    <Field label="Primer apellido *" value={gpd.firstSurname} className="col-span-2 border-l border-t" />
                    <Field label="Segundo apellido" value={gpd.secondSurname} subtext="9" className="col-span-2 border-l border-t" />
                </div>
                 <div className="grid grid-cols-6 border-b border-r border-black">
                    <Field label="Sexo" value={gpd.sex} className="col-span-1 border-l" />
                    <Field label="Fecha de nacimiento *" value={gpd.birthDate} subtext="10" className="col-span-2 border-l" />
                    <Field label="País / Nacionalidad *" value={gpd.nationality} className="col-span-3 border-l" />
                </div>
                <div className="grid grid-cols-6 border-b border-r border-black">
                    <Field label="Correo electrónico *" value={gpd.email} className="col-span-2 border-l" />
                    <Field label="Relación de parentesco" value={gpd.kinship} subtext="11" className="col-span-2 border-l" />
                    <Field label="Teléfono *" value={gpd.phone} className="col-span-2 border-l" />
                </div>
            </section>

            {/* Dirección postal */}
            <section className="mb-2">
                <h3 className="font-bold bg-gray-200 border border-black p-1">Dirección postal de la persona que se aloja (12)</h3>
                 <div className="grid grid-cols-6 border-b border-r border-black">
                    <Field label="Dirección postal *" value={gad.address} className="col-span-3 border-l border-t" />
                    <Field label="País *" value={gad.country} subtext="13" className="col-span-1 border-l border-t" />
                    <Field label="Provincia" value={gad.province} subtext="13" className="col-span-2 border-l border-t" />
                </div>
                 <div className="grid grid-cols-6 border-b border-r border-black">
                    <Field label="Municipio" value={gad.municipality} subtext="13" className="col-span-2 border-l" />
                    <Field label="Localidad" value={gad.locality} subtext="13" className="col-span-2 border-l" />
                    <Field label="Código postal *" value={gad.postalCode} className="col-span-2 border-l" />
                </div>
            </section>
            
            {/* Firma */}
            <section className="mb-4">
                <div className="grid grid-cols-2 border-b border-r border-l border-black">
                     <Field label="Firma de la persona alojada" value="" className="border-t" />
                     <Field label="Localidad y fecha" value="" className="border-l border-t" />
                </div>
            </section>
            
            {/* Instrucciones */}
            <section className="text-[9px] leading-tight space-y-1">
                <h3 className="font-bold text-sm mb-2">Instrucciones para rellenar el fichero</h3>
                <p>(1) El tipo de contrato puede ser: Contrato en curso o Reserva.</p>
                <p>(2) La fecha de formalización del contrato debe ser igual o anterior al día actual.</p>
                <p>(3) La fecha de salida debe ser posterior a la fecha de entrada.</p>
                <p>(4) El tipo de pago puede ser: Pago en destino, Efectivo, Pago por móvil, Plataforma de pago, Tarjeta de crédito, Transferencia, Tarjeta regalo.</p>
                <p>(5) El tipo de documento puede ser: NIF, NIE o Pasaporte. No es necesario informar si el viajero es menor de edad o si es una reserva.</p>
                <p>(6) Debe ser un número de documento válido para el tipo informado. No es necesario informar si el viajero es menor de edad o si es una reserva.</p>
                <p>(7) Informamos el número de soporte si informamos un NIF o un NIE. No es necesario informar si es una reserva.</p>
                <p>(8) En caso de que sea una reserva, solo es obligatorio informar: Nombre, Primer apellido y un dato de contacto (número de teléfono o email).</p>
                <p>(9) El segundo apellido es obligatorio si el tipo de documento informado es DNI/NIF.</p>
                <p>(10) La fecha de nacimiento debe ser igual o anterior al día actual.</p>
                <p>(11) Las relaciones de parentesco aceptadas son: Abuelo/abuela, Bisabuelo/bisabuela, Bisnieto/bisnieta, Cuñado/cuñada, Cónyuge, Hijo/hija, Hermano/hermana, Nieto/nieta, Otros, Padre o madre, Sobrino/sobrina, Suegro/suegra, Tío/tía, Tutor/tutora, Yerno o nuera.</p>
                <p>(12) La dirección postal del viajero es obligatoria si es un contrato en curso. Para reservas, no es necesario informar.</p>
                <p>(13) Si el país es España, informamos provincia y municipio. Si el país es extranjero, informamos localidad.</p>
            </section>
        </div>

        {/* Page 2 */}
        <div className="break-before-page">
             <section className="text-[8px] leading-tight space-y-1 border border-black p-2 mb-2">
                 <h3 className="font-bold text-xs mb-1">Información básica sobre protección de datos de los tratamientos</h3>
                 <p><b>Sistema de información de la policía de la Generalitat de personas físicas alojadas en establecimientos de alojamiento (SIP-HOTELS).</b></p>
                 <p><b>Responsable del tratamiento:</b> Dirección General de la Policía (DGP), Travessera de les Corts, 319-321, 08029 Barcelona. 93 300 2296.</p>
                 <p><b>Delegado/a de protección de datos:</b> c/ Diputació, 335, 08009 Barcelona o dpd.interior@gencat.cat</p>
                 <p><b>Finalidad del tratamiento:</b> Registrar las actividades relevantes para la seguridad ciudadana. Investigación policial. Gestionar y comprobar los requerimientos de órganos judiciales. Búsqueda de personas desaparecidas. En general, finalidades de prevención, detección, investigación y enjuiciamiento de infracciones penales o de ejecución de sanciones penales, incluidas la protección y la prevención frente a las amenazas contra la seguridad pública.</p>
                 <p><b>Derechos de las personas interesadas:</b> Puede ejercer sus derechos de acceso, rectificación, supresión, oposición al tratamiento ysolicitud de limitación dirigiendo una solicitud en papel al Departamento de Interior c/Diputació, 355, 08009 Barcelona o en formato electrónico, mediante la petición genérica disponible en la web www.gencat.cat.</p>
                 <p><b>Derecho a presentar una reclamación a la Autoridad Catalana de Protección de Datos:</b> Puede presentar una reclamación en suweb apdcat.gencat.cat.</p>
                 <p><b>Información adicional sobre este tratamiento:</b> Página web interior.gencat.cat.</p>
            </section>
            
            <p className="text-[9px] leading-tight mb-2">
                De conformidad con la normativa de registro de viajeros, <b>todos los huéspedes que tengan a partir de 14 años deberán firmar el registro de entrada</b>. En el caso de las personas de edad inferior a 14 años, sus datos serán proporcionados por la persona mayor de edad de la que vayan acompañados. Mediante la firma del presente documento, nos autoriza a cargar en su tarjeta bancaria facilitada en el momento de reserva o check-in el importe total de la estancia y gastos derivados de la misma, incluso con posterioridad a la salida. También nos autoriza al uso de la información relativa a su salud, que se nos proporcione para prestarle una adecuada atención durante su estancia.
            </p>
            
            <section className="text-[9px] leading-tight space-y-1 border border-black p-2 mb-2">
                <h3 className="font-bold text-xs mb-1">Información sobre protección de datos (Reglamento EU 2016/679)</h3>
                <p><b>• Responsable del tratamiento:</b> ALBERGUE CASA MADRE HERMANAS DE NUESTRA SEÑORA DE LA CONSOLACIÓN (TORTOSA). Contacto: C/ Santa María Rosa Molas, 2, El Raval de Jesús, 43590-Tortosa.</p>
                <p><b>• Finalidad:</b> Reserva, prestación y cobro de servicios del albergue; programas de fidelización (con elaboración de su perfil) y envío de información sobre ofertas y servicios mediante la marcación de la casilla.</p>
                <p><b>• Legitimación:</b> Ejecución de un contrato; cumplimiento de la normativa aplicable; consentimiento.</p>
                <p><b>• Destinatarios de los datos:</b> ALBERGUE CASA PROVINCIAL HERMANAS DE NUESTRA SEÑORA DE LA CONSOLACIÓN (TORTOSA); autoridades competentes cuando así lo exija la normativa aplicable; agencias y operadores de viajes involucrados; titular de la factura o del medio de pago.</p>
                <p><b>• Plazo de conservación de los datos:</b> al menos por los plazos establecidos por las normativas de consumo, mercantil y tributaria. Partes de entrada de viajeros, al menos tres años. Mientras sea necesario para acreditar el consentimiento prestado.</p>
                <p><b>• Derechos:</b> Puede acceder, rectificar y suprimir los datos, oponerse a su tratamiento, solicitar la portabilidad de sus datos, la limitación del tratamiento o la revocación del consentimiento, enviando su solicitud a la dirección del responsable. También puede realizar una reclamación ante la Autoridad de Control de protección de datos.</p>
            </section>
            
            <section className="mt-4">
                <h3 className="font-bold mb-2">Finalidades que requieren su consentimiento expreso:</h3>
                <div className="space-y-2 text-sm">
                    <p>
                        <Checkbox label="SI" checked={!!consents?.healthData} /> <Checkbox label="NO" checked={!consents?.healthData} /> <b>DATOS DE SALUD:</b> autorizo al tratamiento de la información relativa a mi salud que considere relevante para recibir una adecuada atención durante mi estancia.
                    </p>
                    <p>
                        <Checkbox label="SI" checked={!!consents?.commercialInfo} /> <Checkbox label="NO" checked={!consents?.commercialInfo} /> Deseo recibir información comercial inclusive por medios electrónicos.
                    </p>
                    <p>
                        <Checkbox label="SI" checked={!!consents?.imageUse} /> <Checkbox label="NO" checked={!consents?.imageUse} /> Autorizo el uso de mi imagen, realización de fotografías y su utilización y publicación, en el marco de mi estancia en ALBERGUE CASA PROVINCIAL HERMANAS DE NUESTRA SEÑORA DE LA CONSOLACIÓN (TORTOSA).
                    </p>
                </div>
            </section>
        </div>

        <style jsx>{`
            .A4-size {
                width: 210mm;
                min-height: 297mm;
                margin: auto;
            }
            .form-input {
                width: 100%;
                background-color: transparent;
                border: none;
                padding: 0;
            }
        `}</style>
    </div>
    <div className="no-print fixed bottom-6 right-6 flex flex-col items-end gap-4 z-50">
        <button 
            onClick={() => window.print()} 
            className="bg-indigo-600 text-white rounded-full p-4 shadow-lg hover:bg-indigo-700 transition-transform hover:scale-110 flex items-center gap-3"
            title="Imprimir / Guardar como PDF"
        >
            <PrintIcon className="w-6 h-6" />
            <span className="font-bold text-lg">Imprimir / Guardar PDF</span>
        </button>
        <button 
            onClick={onBack} 
            className="bg-slate-500 text-white rounded-full p-3 shadow-lg hover:bg-slate-600 transition-transform hover:scale-110"
            title="Volver"
        >
            <ArrowLeftIcon className="w-6 h-6" />
        </button>
    </div>
    </>
  );
};

export default IndividualReservationPrintView;