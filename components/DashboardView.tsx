import React, { useMemo } from 'react';
import { Reservation, IndividualRoom, RoomType, DiningSelection, GroupedReservation } from '../types';
import { DINING_OPTIONS } from '../constants';
import { UserIcon } from './icons/UserIcon';
import { BedIcon } from './icons/BedIcon';
import { PlusIcon } from './icons/PlusIcon';

interface DashboardViewProps {
  reservations: Reservation[];
  rooms: IndividualRoom[];
  roomTypes: RoomType[];
  onNewBooking: () => void;
}

const formatDate = (date: Date) => date.toISOString().split('T')[0];

const DashboardView: React.FC<DashboardViewProps> = ({ reservations, rooms, roomTypes, onNewBooking }) => {
  const todayStr = useMemo(() => formatDate(new Date()), []);

  const {
    guestsToday,
    occupiedRooms,
    checkInsToday,
    checkOutsToday
  } = useMemo(() => {
    let guests = 0;
    const occupiedRoomIds = new Set<string>();

    const checkInGuests = new Set<string>();
    const checkOutGuests = new Set<string>();

    reservations.forEach(res => {
      const room = roomTypes.find(rt => rt.id === res.roomType);
      if (!room) return;

      // Active today
      if (res.checkIn <= todayStr && res.checkOut > todayStr) {
        guests += room.capacity;
        occupiedRoomIds.add(res.roomId);
      }
      
      // Check-ins today
      if (res.checkIn === todayStr) {
        checkInGuests.add(res.guestName);
      }

      // Check-outs today
      if (res.checkOut === todayStr) {
        checkOutGuests.add(res.guestName);
      }
    });

    return {
      guestsToday: guests,
      occupiedRooms: occupiedRoomIds.size,
      checkInsToday: checkInGuests.size,
      checkOutsToday: checkOutGuests.size
    };
  }, [reservations, todayStr, roomTypes]);

  const occupancyRate = useMemo(() => {
    if (rooms.length === 0) return 0;
    return Math.round((occupiedRooms / rooms.length) * 100);
  }, [occupiedRooms, rooms]);

  const dailyDiningTotals = useMemo(() => {
    const totals: DiningSelection = {
      breakfast: 0, lunch: 0, dinner: 0, morningSnack: 0, afternoonSnack: 0,
    };
    reservations.forEach(res => {
      if (res.checkIn <= todayStr && res.checkOut > todayStr) {
        if (res.dining && res.dining[todayStr]) {
          const dailyDining = res.dining[todayStr];
          totals.breakfast += dailyDining.breakfast || 0;
          totals.lunch += dailyDining.lunch || 0;
          totals.dinner += dailyDining.dinner || 0;
          totals.morningSnack += dailyDining.morningSnack || 0;
          totals.afternoonSnack += dailyDining.afternoonSnack || 0;
        }
      }
    });
    return totals;
  }, [reservations, todayStr]);

  const upcomingReservations = useMemo((): GroupedReservation[] => {
    const groups: { [key: string]: GroupedReservation } = reservations.reduce((acc, res) => {
      if (new Date(res.checkIn) < new Date(todayStr)) return acc;

      if (!acc[res.guestName] || res.checkIn < acc[res.guestName].minCheckIn) {
        acc[res.guestName] = {
          guestName: res.guestName,
          minCheckIn: res.checkIn,
          maxCheckOut: res.checkOut,
          roomSummary: {}, diningSummary: {}, totalGuests: 0, reservations: [],
        };
      }
      
      const group = acc[res.guestName];
      if (res.checkOut > group.maxCheckOut) group.maxCheckOut = res.checkOut;
      group.roomSummary[res.roomType] = (group.roomSummary[res.roomType] || 0) + 1;
      group.reservations.push(res);
      return acc;
    }, {} as { [key: string]: GroupedReservation });

    return Object.values(groups)
      .filter(group => group.minCheckIn >= todayStr)
      .map(group => {
        const totalGuests = group.reservations.reduce((sum, res) => {
            const roomType = roomTypes.find(rt => rt.id === res.roomType);
            return sum + (roomType?.capacity || 0);
        }, 0);
        return { ...group, totalGuests };
      })
      .sort((a, b) => a.minCheckIn.localeCompare(b.minCheckIn))
      .slice(0, 5);
  }, [reservations, todayStr, roomTypes]);

  const StatCard: React.FC<{ title: string; value: string | number; subtext: string; icon: React.ReactNode }> = ({ title, value, subtext, icon }) => (
      <div className="bg-white p-6 rounded-xl shadow-lg flex items-start space-x-4">
          <div className="bg-indigo-100 text-indigo-600 p-3 rounded-lg">
            {icon}
          </div>
          <div>
              <p className="text-sm font-medium text-slate-500">{title}</p>
              <p className="text-3xl font-bold text-slate-800">{value}</p>
              <p className="text-sm text-slate-400">{subtext}</p>
          </div>
      </div>
  );

  return (
    <div className="space-y-8 animate-fade-in-up">
        <header className="flex flex-wrap justify-between items-center gap-4">
            <div>
                <h1 className="text-4xl font-extrabold text-slate-800">Dashboard</h1>
                <p className="text-lg text-slate-500 mt-1">
                    Resumen del albergue para hoy, {new Date().toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}.
                </p>
            </div>
            <button 
                onClick={onNewBooking}
                className="flex items-center space-x-2 bg-indigo-600 text-white font-bold py-3 px-6 rounded-lg text-lg hover:bg-indigo-700 transition-all duration-300 shadow-md hover:shadow-lg"
            >
                <PlusIcon className="w-6 h-6"/>
                <span>Nueva Reserva</span>
            </button>
        </header>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard title="Huéspedes Hoy" value={guestsToday} subtext="Capacidad total de habitaciones ocupadas" icon={<UserIcon className="w-6 h-6"/>} />
            <StatCard title="Tasa de Ocupación" value={`${occupancyRate}%`} subtext={`${occupiedRooms} de ${rooms.length} habitaciones`} icon={<BedIcon className="w-6 h-6"/>} />
            <StatCard title="Check-ins Hoy" value={checkInsToday} subtext="Grupos que llegan hoy" icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4M10 17l5-5-5-5M15 12H3"/></svg>} />
            <StatCard title="Check-outs Hoy" value={checkOutsToday} subtext="Grupos que se van hoy" icon={<svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M14 17l5-5-5-5M19 12H9"/></svg>} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upcoming Reservations */}
            <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Próximas Reservas</h2>
                {upcomingReservations.length > 0 ? (
                    <ul className="divide-y divide-slate-200">
                        {upcomingReservations.map(group => (
                            <li key={group.guestName + group.minCheckIn} className="py-3 flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-indigo-700">{group.guestName}</p>
                                    <p className="text-sm text-slate-500">
                                        {new Date(group.minCheckIn).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', timeZone: 'UTC' })} &rarr; {new Date(group.maxCheckOut).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric', timeZone: 'UTC' })}
                                    </p>
                                </div>
                                <div className="flex items-center space-x-2 text-slate-600 font-bold bg-slate-100 px-3 py-1 rounded-full">
                                    <UserIcon className="w-5 h-5"/>
                                    <span>{group.totalGuests}</span>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-slate-500 text-center py-8">No hay próximas reservas.</p>
                )}
            </div>

            {/* Dining Summary */}
            <div className="bg-white p-6 rounded-xl shadow-lg">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">Comedor Hoy</h2>
                 <div className="space-y-3">
                    {DINING_OPTIONS.map(option => (
                        <div key={option.id} className="flex justify-between items-center bg-slate-50 p-3 rounded-md">
                            <p className="font-semibold text-slate-600">{option.label}</p>
                            <p className="text-xl font-bold text-indigo-600">{dailyDiningTotals[option.id]}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>

    </div>
  );
};

export default DashboardView;
