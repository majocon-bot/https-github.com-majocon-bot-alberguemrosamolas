import React from 'react';
import { CalendarIcon } from './icons/CalendarIcon';
import { ListIcon } from './icons/ListIcon';
import { DiningIcon } from './icons/DiningIcon';
import { ClipboardIcon } from './icons/ClipboardIcon';
import { HomeIcon } from './icons/HomeIcon';

type View = 'dashboard' | 'booking' | 'calendar' | 'reservations' | 'dining';

interface HeaderProps {
  currentView: View;
  setView: (view: View) => void;
}

const Header: React.FC<HeaderProps> = ({ currentView, setView }) => {
  const baseClasses = "flex items-center space-x-2 px-4 py-2 rounded-lg font-semibold transition-colors duration-200";
  const activeClasses = "bg-indigo-600 text-white shadow";
  const inactiveClasses = "bg-white text-slate-600 hover:bg-slate-200";

  return (
    <header className="bg-white shadow-md">
      <nav className="container mx-auto px-6 py-3 flex justify-between items-center">
        <div className="text-2xl font-bold text-slate-800">
          Albergue Mª Rosa Molas
        </div>
        <div className="flex space-x-2 md:space-x-4">
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
            <span className="hidden md:inline">Hacer Reserva</span>
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
            onClick={() => setView('dining')}
            className={`${baseClasses} ${currentView === 'dining' ? activeClasses : inactiveClasses}`}
            aria-current={currentView === 'dining' ? 'page' : undefined}
          >
            <DiningIcon className="w-5 h-5" />
            <span className="hidden md:inline">Comedor</span>
          </button>
        </div>
      </nav>
    </header>
  );
};

export default Header;