import React, { useState, useMemo } from 'react';
import { RoomSelection, BookingDetails, Reservation, GroupedReservation } from './types';
import { ROOM_TYPES, INDIVIDUAL_ROOMS, MOCK_RESERVATIONS, DINING_OPTIONS } from './constants';
import RoomTypeCard from './components/RoomTypeCard';
import BookingSummary from './components/BookingSummary';
import { generateBookingConfirmation } from './services/geminiService';
import Header from './components/Header';
import OccupancyCalendar from './components/OccupancyCalendar';
import BookingDetailsForm from './components/BookingDetailsForm';
import BookingDiningForm from './components/BookingDiningForm';
import DiningHallView from './components/DiningHallView';
import ReservationsListView from './components/ReservationsListView';
import DashboardView from './components/DashboardView';

type View = 'dashboard' | 'booking' | 'calendar' | 'reservations' | 'dining';
type BookingStep = 'rooms' | 'details' | 'dining' | 'loading' | 'confirmed';

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
    dining: {},
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
  const [bookingStep, setBookingStep] = useState<BookingStep>('rooms');
  
  const [roomSelection, setRoomSelection] = useState<RoomSelection>({});
  const [bookingDetails, setBookingDetails] = useState<BookingDetails>(initialDetails);
  
  const [reservations, setReservations] = useState<Reservation[]>(MOCK_RESERVATIONS);
  const [editingGroup, setEditingGroup] = useState<GroupedReservation | null>(null);

  const [confirmation, setConfirmation] = useState<{ groupStayName: string; confirmationMessage: string; } | null>(null);

  const handleCountChange = (roomId: string, newCount: number) => {
    setRoomSelection(prev => ({ ...prev, [roomId]: newCount }));
  };
  
  const { totalRooms, totalGuests } = useMemo(() => {
    const rooms = Object.values(roomSelection).reduce((sum: number, count: number) => sum + count, 0);
    const guests = Object.entries(roomSelection).reduce((sum, [roomId, count]) => {
      const room = ROOM_TYPES.find(r => r.id === roomId);
      return sum + (room ? room.capacity * Number(count) : 0);
    }, 0);
    return { totalRooms: rooms, totalGuests: guests };
  }, [roomSelection]);
  
  const handleProceedToDining = () => {
    const stayDates = getDatesInRange(bookingDetails.checkIn, bookingDetails.checkOut);
    const newDining = { ...bookingDetails.dining };
    
    for (const date of stayDates) {
      const daySelection = newDining[date] || {
          breakfast: 0, lunch: 0, dinner: 0, morningSnack: 0, afternoonSnack: 0
      };
      // Auto-populate breakfast with the total number of guests
      daySelection.breakfast = totalGuests;
      newDining[date] = daySelection;
    }
    
    setBookingDetails(prev => ({
      ...prev,
      dining: newDining
    }));
    
    setBookingStep('dining');
  };

  const handleSaveBooking = async () => {
    setBookingStep('loading');

    const baseReservations = editingGroup
        ? reservations.filter(res => !editingGroup.reservations.some(orig => orig.id === res.id))
        : reservations;

    const newReservations: Reservation[] = [];
    let roomsAssigned = true;

    for (const [roomTypeId, count] of Object.entries(roomSelection)) {
      if (Number(count) === 0) continue;

      const availableRooms = INDIVIDUAL_ROOMS.filter(room => room.type === roomTypeId)
        .filter(room => !baseReservations.some(res => 
          res.roomId === room.id &&
          bookingDetails.checkIn < res.checkOut &&
          bookingDetails.checkOut > res.checkIn
        ));
      
      if (availableRooms.length < Number(count)) {
        alert(`No hay suficientes habitaciones de tipo "${ROOM_TYPES.find(rt => rt.id === roomTypeId)?.name}" para las fechas seleccionadas.`);
        roomsAssigned = false;
        break;
      }
      
      const roomsToBook = availableRooms.slice(0, Number(count));
      roomsToBook.forEach(room => {
        newReservations.push({
          id: `res_${Date.now()}_${Math.random()}`,
          roomId: room.id,
          roomType: room.type,
          guestName: bookingDetails.name,
          dni: bookingDetails.dni,
          phone: bookingDetails.phone,
          observations: bookingDetails.observations,
          checkIn: bookingDetails.checkIn,
          checkOut: bookingDetails.checkOut,
          dining: bookingDetails.dining,
        });
      });
    }

    if (roomsAssigned) {
      setReservations([...baseReservations, ...newReservations]);
      
      if (editingGroup) {
        alert('Reserva actualizada correctamente.');
        setEditingGroup(null);
        handleStartOver();
        setView('reservations');
      } else {
        const fullBooking = { roomSelection, details: bookingDetails };
        const confirmationData = await generateBookingConfirmation(fullBooking, ROOM_TYPES, totalRooms, totalGuests);
        setConfirmation(confirmationData);
        setBookingStep('confirmed');
      }
    } else {
       setBookingStep(editingGroup ? 'details' : 'rooms');
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

  const handleStartEdit = (group: GroupedReservation) => {
    setEditingGroup(group);

    const initialSelection: RoomSelection = {};
    Object.entries(group.roomSummary).forEach(([roomType, count]) => {
      initialSelection[roomType] = count;
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
        dining: group.diningSummary,
      });
    }

    setView('booking');
    setBookingStep('rooms');
  };

  const handleStartOver = () => {
    setRoomSelection({});
    setBookingDetails(initialDetails);
    setConfirmation(null);
    setEditingGroup(null);
    setBookingStep('rooms');
    setView('booking');
  };
  
  const getStepDescription = () => {
    switch (bookingStep) {
        case 'rooms':
            return 'Paso 1: Selecciona tus habitaciones';
        case 'details':
            return 'Paso 2: Fechas y datos del huésped';
        case 'dining':
            return 'Paso 3: Servicios de comedor y observaciones';
        default:
            return '';
    }
  };

  const renderConfirmationScreen = () => {
    if (!confirmation) return null;

    const selectedRoomsSummary = Object.entries(roomSelection)
      .filter(([, count]) => Number(count) > 0)
      .map(([roomId, count]) => {
        const room = ROOM_TYPES.find(r => r.id === roomId);
        return { name: room?.name || 'Unknown', count };
      });
    
    const diningDates = Object.keys(bookingDetails.dining).sort();

    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
        <div className="max-w-3xl w-full bg-white rounded-2xl shadow-2xl p-8 md:p-12 text-center transform transition-all animate-fade-in-up">
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
             <h4 className="text-lg font-bold text-slate-700 mt-4 mb-2">Habitaciones:</h4>
             <ul className="space-y-2">
                {selectedRoomsSummary.map(item => (
                    <li key={item.name} className="flex justify-between items-center text-slate-600">
                        <span>{item.name}</span>
                        <span className="font-semibold bg-slate-100 px-2 py-1 rounded">x {item.count}</span>
                    </li>
                ))}
             </ul>

             {diningDates.length > 0 && (
                <>
                <h4 className="text-lg font-bold text-slate-700 mt-4 mb-2">Servicios de Comedor:</h4>
                <div className="max-h-40 overflow-y-auto space-y-3 bg-slate-50 p-3 rounded-md">
                {diningDates.map(date => {
                    const services = Object.entries(bookingDetails.dining[date])
                        .filter(([, diners]) => (diners as number) > 0);
                    if (services.length === 0) return null;
                    
                    return (
                    <div key={date}>
                        <p className="font-semibold text-slate-600 text-sm">
                        {new Date(date).toLocaleDateString('es-ES', { weekday: 'short', month: 'long', day: 'numeric', timeZone: 'UTC' })}
                        </p>
                        <ul className="text-sm list-disc list-inside ml-2">
                        {services.map(([service, diners]) => {
                            const serviceLabel = DINING_OPTIONS.find(opt => opt.id === service)?.label || service;
                            return <li key={service}>{serviceLabel}: {diners} comensales</li>
                        })}
                        </ul>
                    </div>
                    );
                })}
                </div>
                </>
            )}

             <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between font-bold text-lg text-slate-800">
                <span>Total Habitaciones: {totalRooms}</span>
                <span>Total Huéspedes: {totalGuests}</span>
             </div>
          </div>
          
          <button 
            onClick={handleStartOver}
            className="mt-10 w-full bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg text-lg hover:bg-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            Hacer Otra Reserva
          </button>
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
                rooms={INDIVIDUAL_ROOMS}
                roomTypes={ROOM_TYPES}
                onNewBooking={() => setView('booking')}
            />
        )}
        {view === 'booking' && (
          <>
            <header className="text-center mb-12">
              <h1 className="text-5xl font-extrabold text-slate-800">
                {isEditing ? 'Editar Reserva' : 'Reserva de Habitaciones'}
              </h1>
              <p className="text-xl text-slate-500 mt-2">
                {isEditing && `Modificando la reserva de ${editingGroup.guestName}. `}
                {getStepDescription()}
              </p>
            </header>

            <main className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
              <div className="lg:col-span-2">
                {bookingStep === 'rooms' && (
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
                )}
                {bookingStep === 'details' && (
                  <BookingDetailsForm details={bookingDetails} setDetails={setBookingDetails} />
                )}
                {bookingStep === 'dining' && (
                  <BookingDiningForm details={bookingDetails} setDetails={setBookingDetails} totalGuests={totalGuests} />
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
                  totalRooms={totalRooms}
                  totalGuests={totalGuests}
                />
                {bookingStep === 'rooms' && (
                  <button
                    onClick={() => setBookingStep('details')}
                    disabled={totalRooms === 0}
                    className="w-full mt-8 bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg text-lg hover:bg-indigo-700 transition-all duration-300 disabled:bg-slate-300 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
                  >
                    Continuar
                  </button>
                )}
                 {bookingStep === 'details' && (
                  <div className="mt-8 flex space-x-4">
                    <button
                      onClick={() => setBookingStep('rooms')}
                      className="w-1/2 bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-lg text-lg hover:bg-slate-300 transition-all duration-300 shadow-md"
                    >
                      Atrás
                    </button>
                    <button
                      onClick={handleProceedToDining}
                      disabled={!bookingDetails.name || !bookingDetails.dni || !bookingDetails.phone}
                      className="w-1/2 bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg text-lg hover:bg-indigo-700 transition-all duration-300 disabled:bg-slate-300 disabled:cursor-not-allowed shadow-md"
                    >
                     Continuar
                    </button>
                  </div>
                 )}
                 {bookingStep === 'dining' && (
                  <div className="mt-8 flex space-x-4">
                    <button
                      onClick={() => setBookingStep('details')}
                      className="w-1/2 bg-slate-200 text-slate-700 font-bold py-3 px-4 rounded-lg text-lg hover:bg-slate-300 transition-all duration-300 shadow-md"
                    >
                      Atrás
                    </button>
                    <button
                      onClick={handleSaveBooking}
                      className="w-1/2 bg-indigo-600 text-white font-bold py-3 px-4 rounded-lg text-lg hover:bg-indigo-700 transition-all duration-300 disabled:bg-slate-300 disabled:cursor-not-allowed shadow-md"
                    >
                      {isEditing ? 'Guardar Cambios' : 'Confirmar Reserva'}
                    </button>
                  </div>
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
           <OccupancyCalendar rooms={INDIVIDUAL_ROOMS} reservations={reservations} />
        )}
        {view === 'reservations' && (
           <ReservationsListView 
              reservations={reservations} 
              onDeleteGroup={handleDeleteGroup}
              onEditGroup={handleStartEdit}
            />
        )}
        {view === 'dining' && (
           <DiningHallView reservations={reservations} />
        )}
      </div>
    </div>
  );
};

export default App;