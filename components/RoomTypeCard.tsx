
import React from 'react';
import { RoomType } from '../types';
import { BedIcon } from './icons/BedIcon';
import { UserIcon } from './icons/UserIcon';
import { PlusIcon } from './icons/PlusIcon';
import { MinusIcon } from './icons/MinusIcon';

interface RoomTypeCardProps {
  room: RoomType;
  selectedCount: number;
  onCountChange: (roomId: string, newCount: number) => void;
}

const RoomTypeCard: React.FC<RoomTypeCardProps> = ({ room, selectedCount, onCountChange }) => {
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

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
      <img className="w-full h-48 object-cover" src={room.image} alt={room.name} />
      <div className="p-6">
        <h3 className="text-2xl font-bold text-slate-800 mb-2">{room.name}</h3>
        <p className="text-slate-600 mb-4">{room.description}</p>
        <div className="flex justify-between items-center text-slate-500 mb-6">
          <div className="flex items-center space-x-2">
            <UserIcon className="w-5 h-5" />
            <span>{room.capacity} Huéspedes</span>
          </div>
          <div className="flex items-center space-x-2">
            <BedIcon className="w-5 h-5" />
            <span>{room.available} Disponibles</span>
          </div>
        </div>
        <div className="flex items-center justify-center space-x-4">
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
