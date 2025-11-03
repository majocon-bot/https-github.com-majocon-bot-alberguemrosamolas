

import React from 'react';
import { CalendarIcon } from './icons/CalendarIcon';
import { ListIcon } from './icons/ListIcon';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { HomeIcon } from './icons/HomeIcon';
import { BriefcaseIcon } from './icons/BriefcaseIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { ClipboardCheckIcon } from './icons/ClipboardCheckIcon';
import { UserPlusIcon } from './icons/UserPlusIcon';

type View = 'dashboard' | 'booking' | 'individual_reservation' | 'calendar' | 'reservations' | 'services' | 'settings' | 'room_status';

interface HeaderProps {
  currentView: View;
  setView: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setView }) => {
  const baseClasses = "flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-colors duration-200";
  const activeClasses = "bg-indigo-600 text-white shadow";
  const inactiveClasses = "bg-white text-slate-600 hover:bg-slate-200";

  return (
    <header className="bg-white shadow-md no-print">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        <div className="text-2xl font-bold text-slate-800">
          Albergue Mª Rosa Molas
        </div>
        <div className="flex space-x-1 md:space-x-2">
          <button
            onClick={() => setView('dashboard')}
            className={`${baseClasses} ${currentView === 'dashboard' ? activeClasses : inactiveClasses}`}
            aria-current={currentView === 'dashboard' ? 'page' : undefined}
          >
            <HomeIcon className="w-5 h-5" />
            <span className="hidden md:inline">Dashboard</span>
          </button>
          <button
            onClick={() => setView('booking')}
            className={`${baseClasses} ${currentView === 'booking' ? activeClasses : inactiveClasses}`}
            aria-current={currentView === 'booking' ? 'page' : undefined}
          >
            <ListIcon className="w-5 h-5" />
            <span className="hidden md:inline">Reserva Grupal</span>
          </button>
           <button
            onClick={() => setView('individual_reservation')}
            className={`${baseClasses} ${currentView === 'individual_reservation' ? activeClasses : inactiveClasses}`}
            aria-current={currentView === 'individual_reservation' ? 'page' : undefined}
          >
            <UserPlusIcon className="w-5 h-5" />
            <span className="hidden md:inline">Reserva Individual</span>
          </button>
           <button
            onClick={() => setView('room_status')}
            className={`${baseClasses} ${currentView === 'room_status' ? activeClasses : inactiveClasses}`}
            aria-current={currentView === 'room_status' ? 'page' : undefined}
          >
            <ClipboardCheckIcon className="w-5 h-5" />
            <span className="hidden md:inline">Estado</span>
          </button>
          <button
            onClick={() => setView('calendar')}
            className={`${baseClasses} ${currentView === 'calendar' ? activeClasses : inactiveClasses}`}
            aria-current={currentView === 'calendar' ? 'page' : undefined}
          >
            <CalendarIcon className="w-5 h-5" />
            <span className="hidden md:inline">Ver Calendario</span>
          </button>
          <button
            onClick={() => setView('reservations')}
            className={`${baseClasses} ${currentView === 'reservations' ? activeClasses : inactiveClasses}`}
            aria-current={currentView === 'reservations' ? 'page' : undefined}
          >
            <ClipboardIcon className="w-5 h-5" />
            <span className="hidden md:inline">Reservas</span>
          </button>
          <button
            onClick={() => setView('services')}
            className={`${baseClasses} ${currentView === 'services' ? activeClasses : inactiveClasses}`}
            aria-current={currentView === 'services' ? 'page' : undefined}
          >
            <BriefcaseIcon className="w-5 h-5" />
            <span className="hidden md:inline">Salas</span>
          </button>
          <button
            onClick={() => setView('settings')}
            className={`${baseClasses} ${currentView === 'settings' ? activeClasses : inactiveClasses}`}
            aria-current={currentView === 'settings' ? 'page' : undefined}
          >
            <SettingsIcon className="w-5 h-5" />
            <span className="hidden md:inline">Ajustes</span>
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Header;