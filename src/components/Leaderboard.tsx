import { useEffect, useState } from 'react';
import { gameService, GameScore } from '../services/gameService';

export const Leaderboard = () => {
  const [scores, setScores] = useState<GameScore[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHighScores();
  }, []);

  const loadHighScores = async () => {
    try {
      const highScores = await gameService.getHighScores();
      setScores(highScores);
    } catch (error) {
      console.error('Error loading high scores:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="text-center">Loading...</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4 text-[var(--tg-theme-text-color)]">Leaderboard</h2>
      <div className="space-y-2">
        {scores.map((score, index) => (
          <div 
            key={index}
            className="flex justify-between items-center p-2 bg-[var(--tg-theme-secondary-bg-color)] rounded"
          >
            <span className="text-[var(--tg-theme-text-color)]">
              {score.address.slice(0, 6)}...{score.address.slice(-4)}
            </span>
            <span className="text-[var(--tg-theme-text-color)]">
              Score: {score.score} (Moves: {score.moves})
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};