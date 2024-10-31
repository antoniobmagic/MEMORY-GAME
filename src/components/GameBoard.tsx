import { useState, useEffect } from 'react';
import { Card as CardType, PlayerState } from '../types';
import { Card } from './Card';
import { useTelegramWebApp } from '../hooks/useTelegramWebApp';
import { useWeb3Wallet } from '../hooks/useWeb3Wallet';
import { gameService } from '../services/gameService';

const POKEMON_COUNT = 6;
const BASE_POINTS = 10;

export const GameBoard = () => {
  const [cards, setCards] = useState<CardType[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [score, setScore] = useState(0);
  const [playerState, setPlayerState] = useState<PlayerState | null>(null);
  const { showAlert } = useTelegramWebApp();
  const { account } = useWeb3Wallet();

  useEffect(() => {
    if (account) {
      loadPlayerState();
    }
  }, [account]);

  const loadPlayerState = async () => {
    if (!account) return;
    try {
      const state = await gameService.getPlayerState(account);
      setPlayerState(state);
      
      const { canPlay, timeRemaining } = gameService.canPlayerPlay(state);
      if (!canPlay && timeRemaining) {
        const hoursRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60));
        showAlert(`You need to wait ${hoursRemaining} hours before playing again.`);
      }
    } catch (error) {
      console.error('Error loading player state:', error);
      showAlert('Error loading game state. Please try again.');
    }
  };

  const initializeGame = () => {
    if (!playerState) return;
    
    const pokemonIds = Array.from({ length: POKEMON_COUNT }, (_, i) => i + 1);
    const pairedPokemon = [...pokemonIds, ...pokemonIds];
    const shuffledCards = pairedPokemon
      .sort(() => Math.random() - 0.5)
      .map((pokemonId, index) => ({
        id: index,
        pokemonId,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(shuffledCards);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setScore(0);

    const maxMoves = gameService.getMovesForDifficulty(playerState.currentDifficulty);
    showAlert(`Difficulty Level ${playerState.currentDifficulty}: Complete the game in ${maxMoves} moves!`);
  };

  const handleCardClick = async (cardId: number) => {
    if (!account || !playerState) {
      showAlert('Please connect your wallet to play!');
      return;
    }

    const { canPlay, timeRemaining } = gameService.canPlayerPlay(playerState);
    if (!canPlay) {
      if (timeRemaining) {
        const hoursRemaining = Math.ceil(timeRemaining / (1000 * 60 * 60));
        showAlert(`You need to wait ${hoursRemaining} hours before playing again.`);
      }
      return;
    }

    if (flippedCards.length === 2 || flippedCards.includes(cardId)) return;

    const newFlippedCards = [...flippedCards, cardId];
    setFlippedCards(newFlippedCards);

    if (newFlippedCards.length === 2) {
      const newMoves = moves + 1;
      setMoves(newMoves);

      const [firstCard, secondCard] = newFlippedCards.map(id => 
        cards.find(card => card.id === id)!
      );

      if (firstCard.pokemonId === secondCard.pokemonId) {
        const multiplier = gameService.calculateScoreMultiplier(playerState.currentDifficulty);
        const newScore = score + (BASE_POINTS * multiplier);
        setScore(newScore);
        setMatches(prev => prev + 1);
        setCards(cards.map(card => 
          newFlippedCards.includes(card.id) 
            ? { ...card, isMatched: true }
            : card
        ));
        setFlippedCards([]);

        if (matches + 1 === POKEMON_COUNT) {
          try {
            const { newDifficulty, newConsecutiveWins } = await gameService.handleGameCompletion(
              account,
              playerState.currentDifficulty,
              playerState.consecutiveWins,
              newMoves
            );

            await gameService.saveScore(account, newScore, newMoves, playerState.currentDifficulty);
            await gameService.updatePlayerState(
              account,
              gameService.getMovesForDifficulty(newDifficulty),
              newDifficulty,
              newConsecutiveWins
            );

            if (newDifficulty > playerState.currentDifficulty) {
              showAlert(`Congratulations! You've advanced to difficulty level ${newDifficulty}!`);
            } else if (newDifficulty < playerState.currentDifficulty) {
              showAlert(`Game completed, but you've exceeded the move limit. Returning to level 1.`);
            } else {
              showAlert(`Congratulations! You won with ${newScore} points in ${newMoves} moves!`);
            }

            await loadPlayerState();
            initializeGame();
          } catch (error) {
            console.error('Error saving game result:', error);
            showAlert('Error saving your score. Please try again.');
          }
        }
      } else {
        setTimeout(() => {
          setFlippedCards([]);
        }, 1000);
      }

      const maxMoves = gameService.getMovesForDifficulty(playerState.currentDifficulty);
      if (newMoves >= maxMoves && matches < POKEMON_COUNT) {
        showAlert(`You've exceeded the ${maxMoves} move limit! Starting over at level 1.`);
        await gameService.resetPlayerDifficulty(account);
        await loadPlayerState();
        initializeGame();
      }
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      <div className="flex gap-4 text-[var(--tg-theme-text-color)]">
        <span className="text-lg">Score: {score}</span>
        <span className="text-lg">Moves: {moves}</span>
        <span className="text-lg">Matches: {matches}/{POKEMON_COUNT}</span>
        {playerState && (
          <>
            <span className="text-lg">Level: {playerState.currentDifficulty}</span>
            <span className="text-lg">Max Moves: {gameService.getMovesForDifficulty(playerState.currentDifficulty)}</span>
          </>
        )}
      </div>
      <button 
        onClick={initializeGame}
        className="px-4 py-2 bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] rounded"
      >
        New Game
      </button>
      <div className="grid grid-cols-3 gap-3">
        {cards.map(card => (
          <Card
            key={card.id}
            {...card}
            isFlipped={flippedCards.includes(card.id) || card.isMatched}
            onClick={() => handleCardClick(card.id)}
          />
        ))}
      </div>
    </div>
  );
};