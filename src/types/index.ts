export interface Card {
  id: number;
  pokemonId: number;
  isFlipped: boolean;
  isMatched: boolean;
}

export interface GameState {
  score: number;
  highScore: number;
  gameStarted: boolean;
}

export interface PlayerState {
  address: string;
  lastPlayedAt: number;
  movesRemaining: number;
  currentDifficulty: number;
  consecutiveWins: number;
}