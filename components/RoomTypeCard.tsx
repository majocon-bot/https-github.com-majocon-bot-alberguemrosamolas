import React from 'react';
import { RoomType } from '../types';
import { BedIcon } from './icons/BedIcon';
import { UserIcon } from './icons/UserIcon';
import { PlusIcon } from './icons/PlusIcon';
import { MinusIcon } from './icons/MinusIcon';
import { BriefcaseIcon } from './icons/BriefcaseIcon';

interface RoomTypeCardProps {
  room: RoomType;
  selectedCount: number;
  onCountChange: (roomId: string, newCount: number) => void;
  isService?: boolean;
}

const RoomTypeCard: React.FC<RoomTypeCardProps> = ({ room, selectedCount, onCountChange, isService }) => {
  const handleIncrement = () => {
    if (selectedCount < room.available) {
      onCountChange(room.id, selectedCount + 1);
    }
  };

  const handleDecrement = () => {
    if (selectedCount > 0) {
      onCountChange(room.id, selectedCount - 1);
    }
  };

  const cardBgClass = isService ? 'bg-indigo-50' : 'bg-white';
  const capacityLabel = isService ? 'Capacidad' : 'Huéspedes';
  const availableLabel = isService ? 'Unidades' : 'Disponibles';
  const AvailableIcon = isService ? BriefcaseIcon : BedIcon;

  const getPriceUnitText = (unit: RoomType['priceUnit']) => {
    switch (unit) {
      case 'per_day': return 'día';
      case 'per_hour': return 'hora';
      case 'one_time': return 'pago único';
      default: return '';
    }
  };

  const formatPrice = (price: number) => {
    const options: Intl.NumberFormatOptions = {
        style: 'currency',
        currency: 'EUR',
    };
    if (price > 0 && price < 0.1) { // use more precision for small fractional prices
        options.minimumFractionDigits = 3;
    }
    return price.toLocaleString('es-ES', options);
  }

  return (
    <div className={`${cardBgClass} rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] flex flex-col`}>
      <img className="w-full h-48 object-cover" src={room.image} alt={room.name} />
      <div className="p-6 flex flex-col flex-grow">
        <h3 className="text-2xl font-bold text-slate-800 mb-2">{room.name}</h3>
        <p className="text-slate-600 mb-4 flex-grow">{room.description}</p>
        <div className="flex justify-between items-center text-slate-500">
          <div className="flex items-center space-x-2">
            <UserIcon className="w-5 h-5" />
            <span>{room.capacity} {capacityLabel}</span>
          </div>
          <div className="flex items-center space-x-2">
            <AvailableIcon className="w-5 h-5" />
            <span>{room.available} {availableLabel}</span>
          </div>
        </div>

        {room.price !== undefined && (
            <div className="my-4 text-center">
                <span className="text-3xl font-bold text-slate-800">
                    {formatPrice(room.price)}
                </span>
                {room.priceUnit && <span className="text-base text-slate-500"> / {getPriceUnitText(room.priceUnit)}</span>}
            </div>
        )}

        <div className="flex items-center justify-center space-x-4 mt-auto pt-2">
          <button
            onClick={handleDecrement}
            disabled={selectedCount === 0}
            className="p-2 rounded-full bg-slate-200 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300 transition-colors"
            aria-label={`Reduce room count for ${room.name}`}
          >
            <MinusIcon className="w-6 h-6" />
          </button>
          <span className="text-3xl font-bold text-slate-800 w-12 text-center">{selectedCount}</span>
          <button
            onClick={handleIncrement}
            disabled={selectedCount >= room.available}
            className="p-2 rounded-full bg-slate-200 text-slate-700 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300 transition-colors"
            aria-label={`Increase room count for ${room.name}`}
          >
            <PlusIcon className="w-6 h-6" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoomTypeCard;