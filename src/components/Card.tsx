import { motion } from 'framer-motion';

interface CardProps {
  id: number;
  pokemonId: number;
  isFlipped: boolean;
  isMatched: boolean;
  onClick: () => void;
}

export const Card = ({ pokemonId, isFlipped, isMatched, onClick }: CardProps) => {
  return (
    <motion.div
      className={`relative w-20 h-28 cursor-pointer ${isMatched ? 'invisible' : ''}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      <div className={`w-full h-full transition-transform duration-500 transform-gpu ${isFlipped ? 'rotate-y-180' : ''}`}>
        <div className="absolute w-full h-full bg-[var(--tg-theme-button-color)] rounded-lg flex items-center justify-center">
          <span className="text-2xl text-[var(--tg-theme-button-text-color)]">?</span>
        </div>
        <div className="absolute w-full h-full backface-hidden rotate-y-180">
          <img
            src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`}
            alt={`Pokemon ${pokemonId}`}
            className="w-full h-full object-contain bg-[var(--tg-theme-bg-color)] rounded-lg p-2"
          />
        </div>
      </div>
    </motion.div>
  );
};