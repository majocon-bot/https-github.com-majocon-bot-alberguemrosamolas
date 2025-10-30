

import React, { useState, useMemo, useEffect } from 'react';
import { RoomSelection, BookingDetails, Reservation, GroupedReservation, GroupedReservationWithCost, TimeSlot, ServiceBooking, FiscalDetails, DiningSelection } from './types';
import { ROOM_TYPES, SERVICE_TYPES, ALL_INDIVIDUAL_ITEMS, MOCK_RESERVATIONS, ALL_ROOMS_DATA, DINING_OPTIONS } from './constants';
import RoomTypeCard from './components/RoomTypeCard';
import BookingSummary from './components/BookingSummary';
import { generateBookingConfirmation } from './services/geminiService';
import Header from './components/Header';
import OccupancyCalendar from './components/OccupancyCalendar';
import BookingDetailsForm from './components/BookingDetailsForm';
import BookingOtherServicesForm from './components/BookingOtherServicesForm';
import ReservationsListView from './components/ReservationsListView';
import DashboardView from './components/DashboardView';
import ServicesListView from './components/ServicesListView';
import InvoiceView from './components/InvoiceView';
import SettingsView from './components/SettingsView';
import RoomStatusView from './components/RoomStatusView';
import BookingDiningForm from './components/BookingDiningForm';
import DiningHallView from './components/DiningHallView';

type View = 'dashboard' | 'booking' | 'calendar' | 'reservations' | 'services' | 'invoice' | 'settings' | 'room_status' | 'dining_hall';
type BookingStep = 'options' | 'dining' | 'schedule' | 'loading' | 'confirmed';

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

const formatDate = (date: Date) => date.toISOString().split('T')[0];

const initialDetails: BookingDetails = {
    name: '',
    dni: '',
    phone: '',
    checkIn: formatDate(today),
    checkOut: formatDate(tomorrow),
    observations: '',
    otherServices: {},
    unitServices: {},
    dining: {},
};

const initialFiscalDetails: FiscalDetails = {
    companyName: 'Albergue Mª Rosa Molas',
    taxId: 'G12345678',
    address: 'Calle Falsa, 123, 12001 Castellón, España',
    phone: '964 000 000',
    email: 'contacto@albergue.es'
};


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

const App: React.FC = () => {
  const [view, setView] = useState<View>('dashboard');
  const [bookingStep, setBookingStep] = useState<BookingStep>('options');
  
  const [roomSelection, setRoomSelection] = useState<RoomSelection>({});
  const [bookingDetails, setBookingDetails] = useState<BookingDetails>(initialDetails);
  
  const [reservations, setReservations] = useState<Reservation[]>(MOCK_RESERVATIONS);
  const [editingGroup, setEditingGroup] = useState<GroupedReservation | null>(null);
  const [invoiceData, setInvoiceData] = useState<GroupedReservationWithCost | null>(null);

  const [fiscalDetails, setFiscalDetails] = useState<FiscalDetails>(() => {
    try {
        const saved = localStorage.getItem('fiscalDetails');
        return saved ? JSON.parse(saved) : initialFiscalDetails;
    } catch (error) {
        return initialFiscalDetails;
    }
  });


  const [confirmation, setConfirmation] = useState<{ groupStayName: string; confirmationMessage: string; } | null>(null);
  
  const allBookableItems = useMemo(() => [...ROOM_TYPES, ...SERVICE_TYPES], []);


  const handleCountChange = (roomId: string, newCount: number) => {
    setRoomSelection(prev => ({ ...prev, [roomId]: newCount }));
  };
  
  const { totalRooms, totalGuests, totalItems, totalServices } = useMemo(() => {
    let roomsCount = 0;
    let guestsCount = 0;
    let servicesCount = 0;

    for (const [itemId, count] of Object.entries(roomSelection)) {
      const numCount = Number(count) || 0;
      if (numCount === 0) continue;

      // Check if it's a room
      const roomType = ROOM_TYPES.find(rt => rt.id === itemId);
      if (roomType) {
        roomsCount += numCount;
        guestsCount += roomType.capacity * numCount;
        continue; // It's a room, so skip to the next item
      }

      // Check if it's a service
      const serviceType = SERVICE_TYPES.find(st => st.id === itemId);
      if (serviceType) {
        servicesCount += numCount;
      }
    }

    return {
      totalRooms: roomsCount,
      totalGuests: guestsCount,
      totalServices: servicesCount,
      totalItems: roomsCount + servicesCount,
    };
  }, [roomSelection]);
  
  const handleNextStep = () => {
      if (bookingStep === 'options') {
          if (totalGuests > 0) {
            setBookingStep('dining');
          } else if (totalServices > 0) {
            setBookingStep('schedule');
          } else {
            handleSaveBooking();
          }
      } else if (bookingStep === 'dining') {
          if (totalServices > 0) {
            const stayDates = getDatesInRange(bookingDetails.checkIn, bookingDetails.checkOut);
            const newOtherServices = { ...(bookingDetails.otherServices || {}) };
            const newUnitServices = { ...(bookingDetails.unitServices || {}) };
            const selectedTimeServices = Object.keys(roomSelection).filter(id => SERVICE_TYPES.some(s => s.id === id && s.priceUnit !== 'one_time') && (roomSelection[id] || 0) > 0);
            const selectedUnitServices = Object.keys(roomSelection).filter(id => SERVICE_TYPES.some(s => s.id === id && s.priceUnit === 'one_time') && (roomSelection[id] || 0) > 0);
            
            for (const date of stayDates) {
                if (!newOtherServices[date]) newOtherServices[date] = {};
                for(const serviceId of selectedTimeServices) {
                    if (!newOtherServices[date][serviceId]) newOtherServices[date][serviceId] = [];
                }
                if (!newUnitServices[date]) newUnitServices[date] = {};
                for(const serviceId of selectedUnitServices) {
                    if (newUnitServices[date][serviceId] === undefined) newUnitServices[date][serviceId] = 0;
                }
            }
            setBookingDetails(prev => ({ ...prev, otherServices: newOtherServices, unitServices: newUnitServices }));
            setBookingStep('schedule');
        } else {
            handleSaveBooking();
        }
      }
  };

  const handlePrevStep = () => {
      if (bookingStep === 'schedule') {
          if (totalGuests > 0) {
            setBookingStep('dining');
          } else {
            setBookingStep('options');
          }
      } else if (bookingStep === 'dining') {
        setBookingStep('options');
      }
  };

  const handleSaveBooking = async () => {
    setBookingStep('loading');

    const baseReservations = editingGroup
        ? reservations.filter(res => !editingGroup.reservations.some(orig => orig.id === res.id))
        : reservations;

    const newReservations: Reservation[] = [];
    let itemsAssigned = true;

    for (const [itemTypeId, count] of Object.entries(roomSelection)) {
      if (Number(count) === 0) continue;

      const availableItems = ALL_INDIVIDUAL_ITEMS.filter(item => item.type === itemTypeId)
        .filter(item => !baseReservations.some(res => 
          res.roomId === item.id &&
          bookingDetails.checkIn < res.checkOut &&
          bookingDetails.checkOut > res.checkIn
        ));
      
      if (availableItems.length < Number(count)) {
        const itemDetails = allBookableItems.find(it => it.id === itemTypeId);
        alert(`No hay suficientes "${itemDetails?.name}" para las fechas seleccionadas.`);
        itemsAssigned = false;
        break;
      }
      
      const itemsToBook = availableItems.slice(0, Number(count));
      itemsToBook.forEach(item => {
        newReservations.push({
          id: `res_${Date.now()}_${Math.random()}`,
          roomId: item.id,
          roomType: item.type,
          guestName: bookingDetails.name,
          dni: bookingDetails.dni,
          phone: bookingDetails.phone,
          observations: bookingDetails.observations,
          checkIn: bookingDetails.checkIn,
          checkOut: bookingDetails.checkOut,
          otherServices: bookingDetails.otherServices,
          unitServices: bookingDetails.unitServices,
          dining: bookingDetails.dining,
        });
      });
    }

    if (itemsAssigned) {
      setReservations([...baseReservations, ...newReservations]);
      
      if (editingGroup) {
        alert('Reserva actualizada correctamente.');
        setEditingGroup(null);
        handleStartOver();
        setView('reservations');
      } else {
        const fullBooking = { roomSelection, details: bookingDetails };
        const confirmationData = await generateBookingConfirmation(fullBooking, allBookableItems, totalRooms, totalGuests);
        setConfirmation(confirmationData);
        setBookingStep('confirmed');
      }
    } else {
       setBookingStep(editingGroup ? 'options' : 'options');
    }
  };

  const handleDeleteGroup = (guestName: string) => {
    if(window.confirm(`¿Estás seguro de que quieres eliminar todas las reservas de ${guestName}?`)) {
      if (editingGroup?.guestName === guestName) {
        setEditingGroup(null);
        handleStartOver();
      }
      setReservations(prev => prev.filter(res => res.guestName !== guestName));
    }
  };

  const handleStartEdit = (group: GroupedReservation, step: BookingStep = 'options') => {
    setEditingGroup(group);

    const initialSelection: RoomSelection = {};
    Object.entries(group.roomSummary).forEach(([itemType, count]) => {
      initialSelection[itemType] = count;
    });
    setRoomSelection(initialSelection);

    const firstRes = group.reservations[0];
    if (firstRes) {
      setBookingDetails({
        name: firstRes.guestName,
        dni: firstRes.dni,
        phone: firstRes.phone,
        checkIn: group.minCheckIn,
        checkOut: group.maxCheckOut,
        observations: firstRes.observations,
        otherServices: group.otherServicesSummary,
        unitServices: group.unitServicesSummary,
        dining: group.diningSummary,
      });
    }

    setView('booking');
    setBookingStep(step);
  };

  const handleEditServiceBooking = (bookingToEdit: ServiceBooking) => {
    const guestReservations = reservations.filter(r => r.guestName === bookingToEdit.guestName);
    if (guestReservations.length === 0) {
      console.error("Could not find group to edit");
      return;
    }
    const firstRes = guestReservations[0];
    const minCheckIn = guestReservations.reduce((min, res) => res.checkIn < min ? res.checkIn : min, firstRes.checkIn);
    const maxCheckOut = guestReservations.reduce((max, res) => res.checkOut > max ? res.checkOut : max, firstRes.checkOut);
    const roomSummary = guestReservations.reduce((summary, res) => {
        summary[res.roomType] = (summary[res.roomType] || 0) + 1;
        return summary;
    }, {} as { [key: string]: number });
    
    const groupToEdit: GroupedReservation = {
        guestName: bookingToEdit.guestName,
        minCheckIn,
        maxCheckOut,
        roomSummary,
        otherServicesSummary: firstRes.otherServices || {},
        // FIX: Added missing diningSummary and unitServicesSummary properties to conform to GroupedReservation type.
        diningSummary: firstRes.dining || {},
        unitServicesSummary: firstRes.unitServices || {},
        totalGuests: 0, 
        reservations: guestReservations,
    };
    handleStartEdit(groupToEdit, 'schedule');
  };

  const handleDeleteServiceBooking = (bookingToDelete: ServiceBooking) => {
    const formattedDate = new Date(bookingToDelete.date).toLocaleDateString('es-ES', {timeZone: 'UTC'});
    if (!window.confirm(`¿Estás seguro de que quieres eliminar la reserva de "${bookingToDelete.serviceName}" para ${bookingToDelete.guestName} de ${bookingToDelete.startTime} a ${bookingToDelete.endTime} el ${formattedDate}?`)) {
        return;
    }

    setReservations(prevReservations => {
        return prevReservations.map(res => {
            if (res.guestName !== bookingToDelete.guestName) {
                return res;
            }

            const updatedRes = JSON.parse(JSON.stringify(res));

            if (updatedRes.otherServices && updatedRes.otherServices[bookingToDelete.date] && updatedRes.otherServices[bookingToDelete.date][bookingToDelete.serviceId]) {
                const slots = updatedRes.otherServices[bookingToDelete.date][bookingToDelete.serviceId];
                
                if (bookingToDelete.slotIndex < slots.length) {
                    slots.splice(bookingToDelete.slotIndex, 1);
                }
                
                if (slots.length === 0) {
                    delete updatedRes.otherServices[bookingToDelete.date][bookingToDelete.serviceId];
                }

                if (Object.keys(updatedRes.otherServices[bookingToDelete.date]).length === 0) {
                    delete updatedRes.otherServices[bookingToDelete.date];
                }
                if (Object.keys(updatedRes.otherServices).length === 0) {
                    delete updatedRes.otherServices;
                }
            }
            return updatedRes;
        });
    });
  };

  const handleGenerateInvoice = (group: GroupedReservationWithCost) => {
    setInvoiceData(group);
    setView('invoice');
  };

  const handleStartOver = () => {
    setRoomSelection({});
    setBookingDetails(initialDetails);
    setConfirmation(null);
    setEditingGroup(null);
    setBookingStep('options');
    setView('booking');
  };
  
  const handleGoToDashboard = () => {
    setRoomSelection({});
    setBookingDetails(initialDetails);
    setConfirmation(null);
    setEditingGroup(null);
    setBookingStep('options');
    setView('dashboard');
  };

  const handlePrintConfirmation = () => {
    document.querySelectorAll('.printable-area').forEach(el => el.classList.remove('printable-area'));
    const printableElement = document.getElementById('booking-confirmation-area');
    if (printableElement) {
        printableElement.classList.add('printable-area');
        window.print();
    }
  };

  const handleSaveFiscalDetails = (details: FiscalDetails) => {
    setFiscalDetails(details);
    localStorage.setItem('fiscalDetails', JSON.stringify(details));
    alert('Datos fiscales guardados.');
  };

  const handleExportData = () => {
      const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
        JSON.stringify(reservations, null, 2)
      )}`;
      const link = document.createElement("a");
      link.href = jsonString;
      link.download = "reservas_albergue.json";
      link.click();
  };

  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileReader = new FileReader();
    if (event.target.files && event.target.files[0]) {
        fileReader.readAsText(event.target.files[0], "UTF-8");
        fileReader.onload = e => {
            try {
                const importedReservations = JSON.parse(e.target?.result as string);
                // Basic validation could be added here
                if (Array.isArray(importedReservations)) {
                    setReservations(importedReservations);
                    alert('Datos importados correctamente.');
                } else {
                    throw new Error("Invalid format");
                }
            } catch (error) {
                alert('Error al importar el archivo. Asegúrate de que es un JSON válido.');
            }
        };
    }
  };


  const getStepDescription = () => {
    switch (bookingStep) {
        case 'options':
            return 'Paso 1: Elige fechas, responsable y alojamiento';
        case 'dining':
            return 'Paso 2: Selecciona los servicios de comedor';
        case 'schedule':
            return 'Paso 3: Define los horarios de las salas y servicios';
        default:
            return '';
    }
  };

  const renderConfirmationScreen = () => {
    if (!confirmation) return null;

    const selectedItemsSummary = Object.entries(roomSelection)
      .filter(([, count]) => Number(count) > 0)
      .map(([itemId, count]) => {
        const item = allBookableItems.find(i => i.id === itemId);
        return { 
            name: item?.name || 'Unknown', 
            count: Number(count),
            isService: SERVICE_TYPES.some(st => st.id === itemId) 
        };
      });

    const roomItems = selectedItemsSummary.filter(item => !item.isService);
    const serviceItems = selectedItemsSummary.filter(item => item.isService);
    const totalServices = serviceItems.reduce((sum, item) => sum + item.count, 0);

    const otherServicesDates = Object.keys(bookingDetails.otherServices || {}).sort();
    const diningDates = Object.keys(bookingDetails.dining || {}).sort();


    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div id="booking-confirmation-area" className="max-w-3xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center transform transition-all animate-fade-in-up">
          <svg className="w-20 h-20 mx-auto text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
          <h1 className="text-4xl font-extrabold text-slate-800 mt-4">¡Reserva Confirmada!</h1>
          <p className="text-2xl font-semibold text-indigo-600 mt-4">"{confirmation.groupStayName}"</p>
          <p className="text-slate-600 text-lg mt-4">{confirmation.confirmationMessage}</p>

          <div className="mt-8 pt-6 border-t border-slate-200 text-left">
             <h3 className="text-xl font-bold text-slate-700 mb-4">Detalles de la Reserva:</h3>
             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-slate-600">
                <p><strong>A nombre de:</strong> {bookingDetails.name}</p>
                <p><strong>DNI:</strong> {bookingDetails.dni}</p>
                <p><strong>Teléfono:</strong> {bookingDetails.phone}</p>
                <p><strong>Fechas:</strong> {bookingDetails.checkIn} al {bookingDetails.checkOut}</p>
             </div>
             
             {roomItems.length > 0 && (
                <>
                    <h4 className="text-lg font-bold text-slate-700 mt-4 mb-2">Habitaciones:</h4>
                    <ul className="space-y-2">
                        {roomItems.map(item => (
                            <li key={item.name} className="flex justify-between items-center text-slate-600">
                                <span>{item.name}</span>
                                <span className="font-semibold bg-slate-100 px-2 py-1 rounded">x {item.count}</span>
                            </li>
                        ))}
                    </ul>
                </>
             )}
             
             {serviceItems.length > 0 && (
                <>
                    <h4 className="text-lg font-bold text-slate-700 mt-4 mb-2">Salas y Servicios:</h4>
                    <ul className="space-y-2">
                        {serviceItems.map(item => (
                            <li key={item.name} className="flex justify-between items-center text-slate-600">
                                <span>{item.name}</span>
                                <span className="font-semibold bg-slate-100 px-2 py-1 rounded">x {item.count}</span>
                            </li>
                        ))}
                    </ul>
                </>
             )}

            {diningDates.length > 0 && (
                 <>
                    <h4 className="text-lg font-bold text-slate-700 mt-4 mb-2">Servicios de Comedor:</h4>
                    <div className="max-h-40 overflow-y-auto space-y-3 bg-slate-50 p-3 rounded-md">
                    {diningDates.map(date => {
                        const diningDay = bookingDetails.dining?.[date];
                        if (!diningDay) return null;
                        // FIX: Explicitly cast `count` to a number before comparison to resolve a TypeScript type error where `count` was inferred as `unknown`.
                        const services = Object.entries(diningDay).filter(([, count]) => Number(count) > 0);
                        if(services.length === 0) return null;

                        return (
                            <div key={date}>
                                <p className="font-semibold text-slate-600 text-sm">
                                    {new Date(date).toLocaleDateString('es-ES', { weekday: 'short', month: 'long', day: 'numeric', timeZone: 'UTC' })}
                                </p>
                                <ul className="text-sm list-disc list-inside ml-2">
                                {services.map(([serviceId, count]) => {
                                    const serviceLabel = DINING_OPTIONS.find(opt => opt.id === serviceId)?.label || serviceId;
                                    return <li key={serviceId}>{serviceLabel}: {count} comensales</li>
                                })}
                                </ul>
                            </div>
                        )
                    })}
                    </div>
                 </>
            )}

            {otherServicesDates.length > 0 && (
                <>
                <h4 className="text-lg font-bold text-slate-700 mt-4 mb-2">Uso de Salas y Servicios:</h4>
                <div className="max-h-40 overflow-y-auto space-y-3 bg-slate-50 p-3 rounded-md">
                {otherServicesDates.map(date => {
                    if (!bookingDetails.otherServices) return null;
                    const services = Object.entries(bookingDetails.otherServices[date])
                        .filter(([, slots]) => (slots as TimeSlot[]).length > 0);
                    if (services.length === 0) return null;
                    
                    return (
                    <div key={date}>
                        <p className="font-semibold text-slate-600 text-sm">
                        {new Date(date).toLocaleDateString('es-ES', { weekday: 'short', month: 'long', day: 'numeric', timeZone: 'UTC' })}
                        </p>
                        <ul className="text-sm list-disc list-inside ml-2">
                        {services.map(([serviceId, slots]) => {
                            const serviceLabel = SERVICE_TYPES.find(opt => opt.id === serviceId)?.name || serviceId;
                            return (
                                <li key={serviceId}>{serviceLabel}: 
                                    {(slots as TimeSlot[]).map((slot, i) => ` ${slot.startTime}-${slot.endTime}`).join(', ')}
                                </li>
                            )
                        })}
                        </ul>
                    </div>
                    );
                })}
                </div>
                </>
            )}

            <div className="mt-4 pt-4 border-t border-slate-200 space-y-1 font-bold text-lg text-slate-800">
                {totalRooms > 0 && <div className="flex justify-between"><span>Total Habitaciones:</span><span>{totalRooms}</span></div>}
                {totalGuests > 0 && <div className="flex justify-between"><span>Total Huéspedes:</span><span>{totalGuests}</span></div>}
                {totalServices > 0 && <div className="flex justify-between"><span>Total Servicios:</span><span>{totalServices}</span></div>}
             </div>
          </div>
          
          <div className="mt-10 space-y-4 no-print">
            <button 
              onClick={handleStartOver}
              className="w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg text-lg hover:bg-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Hacer Otra Reserva
            </button>
            <button 
              onClick={handlePrintConfirmation}
              className="w-full bg-slate-600 text-white font-bold py-3 px-4 rounded-lg text-lg hover:bg-slate-700 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Imprimir Reserva
            </button>
            <button 
              onClick={handleGoToDashboard}
              className="w-full bg-red-600 text-white font-bold py-3 px-4 rounded-lg text-lg hover:bg-red-700 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              Ir al Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  };
  
  if (bookingStep === 'confirmed') {
    return renderConfirmationScreen();
  }

  const isEditing = editingGroup !== null;

  return (
    <div className="min-h-screen bg-slate-100">
      <Header currentView={view} setView={setView} />
      <div className="container mx-auto p-4 sm:p-6 lg:p-8">
        {view === 'dashboard' && (
            <DashboardView 
                reservations={reservations}
                rooms={ALL_INDIVIDUAL_ITEMS}
                roomTypes={ROOM_TYPES}
                onNewBooking={() => {
                  handleStartOver();
                  setView('booking');
                }}
            />
        )}
        {view === 'booking' && (
          <>
            <header className="text-center mb-12">
              <h1 className="text-5xl font-extrabold text-slate-800">
                {isEditing ? 'Editar Reserva' : 'Crear Reserva'}
              </h1>
              <p className="text-xl text-slate-500 mt-2">
                {isEditing && `Modificando la reserva de ${editingGroup.guestName}. `}
                {getStepDescription()}
              </p>
            </header>

            <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <div className="lg:col-span-2 space-y-12">
                {bookingStep === 'options' && (
                   <>
                    <BookingDetailsForm details={bookingDetails} setDetails={setBookingDetails} />

                    <div>
                        <h2 className="text-3xl font-bold text-slate-700 mb-6 text-center border-t pt-8">Alojamiento</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in-up">
                            {ROOM_TYPES.map(room => (
                            <RoomTypeCard
                                key={room.id}
                                room={room}
                                selectedCount={roomSelection[room.id] || 0}
                                onCountChange={handleCountChange}
                            />
                            ))}
                        </div>
                    </div>

                    <div>
                        <h2 className="text-3xl font-bold text-slate-700 mb-6 text-center border-t pt-8">Salas y Servicios Adicionales</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in-up">
                            {SERVICE_TYPES.map(service => (
                                <RoomTypeCard
                                    key={service.id}
                                    room={service}
                                    selectedCount={roomSelection[service.id] || 0}
                                    onCountChange={handleCountChange}
                                    isService={true}
                                />
                            ))}
                        </div>
                    </div>
                   </>
                )}
                {bookingStep === 'dining' && (
                    <BookingDiningForm details={bookingDetails} setDetails={setBookingDetails} totalGuests={totalGuests} />
                )}
                {bookingStep === 'schedule' && (
                    <BookingOtherServicesForm details={bookingDetails} setDetails={setBookingDetails} roomSelection={roomSelection} />
                )}
                 {(bookingStep === 'loading') && (
                  <div className="h-96 flex items-center justify-center bg-white rounded-xl shadow-lg">
                     <p className="text-2xl text-slate-600 animate-pulse">{isEditing ? 'Actualizando reserva...' : 'Confirmando y asignando habitaciones...'}</p>
                  </div>
                 )}
              </div>

              <div className="lg:col-span-1">
                <BookingSummary 
                  roomSelection={roomSelection} 
                  roomTypes={ROOM_TYPES}
                  serviceTypes={SERVICE_TYPES}
                  totalRooms={totalRooms}
                  totalGuests={totalGuests}
                />
                
                {(bookingStep === 'options' || bookingStep === 'dining') && (
                    <button
                        onClick={handleNextStep}
                        disabled={totalItems === 0 || !bookingDetails.name || !bookingDetails.dni || !bookingDetails.phone}
                        className="w-full mt-8 bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg text-lg hover:bg-indigo-700 transition-all duration-300 disabled:bg-slate-300 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                    >
                        { bookingStep === 'options' && (totalGuests > 0 || totalServices > 0) ? 'Continuar' : (isEditing ? 'Guardar Cambios' : 'Confirmar Reserva')}
                    </button>
                )}

                 {bookingStep === 'schedule' && (
                  <div className="mt-8 flex space-x-4">
                    <button
                      onClick={handlePrevStep}
                      className="w-1/2 bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-lg text-lg hover:bg-slate-300 transition-all duration-300 shadow-md"
                    >
                      Atrás
                    </button>
                    <button
                      onClick={handleSaveBooking}
                      disabled={!bookingDetails.name || !bookingDetails.dni || !bookingDetails.phone}
                      className="w-1/2 bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg text-lg hover:bg-indigo-700 transition-all duration-300 disabled:bg-slate-300 disabled:cursor-not-allowed shadow-md"
                    >
                      {isEditing ? 'Guardar Cambios' : 'Confirmar Reserva'}
                    </button>
                  </div>
                 )}

                {bookingStep !== 'options' && bookingStep !== 'loading' && (
                     <button
                        onClick={handlePrevStep}
                        className="w-full mt-4 bg-slate-200 text-slate-700 font-bold py-2 px-4 rounded-lg text-sm hover:bg-slate-300 transition-all duration-300 shadow-md"
                    >
                        Atrás
                    </button>
                )}

                 {isEditing && bookingStep !== 'loading' && (
                    <button
                        onClick={() => {
                            setEditingGroup(null);
                            handleStartOver();
                            setView('reservations');
                        }}
                        className="w-full mt-4 bg-red-500 text-white font-bold py-2 px-4 rounded-lg text-sm hover:bg-red-600 transition-all duration-300 shadow-md"
                    >
                        Cancelar Edición
                    </button>
                 )}
              </div>
            </main>
          </>
        )}
        {view === 'calendar' && (
           <OccupancyCalendar rooms={ALL_INDIVIDUAL_ITEMS} reservations={reservations} />
        )}
        {view === 'room_status' && (
            <RoomStatusView reservations={reservations} allRooms={ALL_ROOMS_DATA} roomTypes={ROOM_TYPES} />
        )}
        {view === 'reservations' && (
           <ReservationsListView 
              reservations={reservations} 
              onDeleteGroup={handleDeleteGroup}
              onEditGroup={handleStartEdit}
              onGenerateInvoice={handleGenerateInvoice}
            />
        )}
        {view === 'services' && (
           <ServicesListView 
            reservations={reservations} 
            onDeleteService={handleDeleteServiceBooking}
            onEditService={handleEditServiceBooking}
            onNewBooking={() => {
                handleStartOver();
                setView('booking');
            }}
           />
        )}
        {view === 'dining_hall' && (
            <DiningHallView reservations={reservations} />
        )}
        {view === 'settings' && (
            <SettingsView 
                fiscalDetails={fiscalDetails}
                onSave={handleSaveFiscalDetails}
                onExport={handleExportData}
                onImport={handleImportData}
            />
        )}
        {view === 'invoice' && invoiceData && (
          <InvoiceView group={invoiceData} onBack={() => setView('reservations')} fiscalDetails={fiscalDetails} />
        )}
      </div>
    </div>
  );
};

export default App;
