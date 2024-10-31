import { 
  collection, 
  addDoc, 
  query, 
  where, 
  getDocs, 
  orderBy, 
  limit,
  updateDoc,
  doc,
  getDoc,
  setDoc
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { PlayerState } from '../types';

const INITIAL_MOVES = 20;
const MEDIUM_MOVES = 18;
const HARD_MOVES = 15;
const COOLDOWN_HOURS = 24;

export interface GameScore {
  address: string;
  score: number;
  moves: number;
  difficulty: number;
  timestamp: number;
}

export const gameService = {
  async saveScore(address: string, score: number, moves: number, difficulty: number): Promise<void> {
    try {
      await addDoc(collection(db, 'scores'), {
        address,
        score,
        moves,
        difficulty,
        timestamp: Date.now()
      });
    } catch (error) {
      console.error('Error saving score:', error);
      throw error;
    }
  },

  async getHighScores(limit = 10): Promise<GameScore[]> {
    try {
      const q = query(
        collection(db, 'scores'),
        orderBy('score', 'desc'),
        orderBy('difficulty', 'desc'),
        orderBy('moves', 'asc'),
        limit(limit)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as GameScore);
    } catch (error) {
      console.error('Error getting high scores:', error);
      throw error;
    }
  },

  async getUserScores(address: string): Promise<GameScore[]> {
    try {
      const q = query(
        collection(db, 'scores'),
        where('address', '==', address),
        orderBy('score', 'desc'),
        limit(10)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => doc.data() as GameScore);
    } catch (error) {
      console.error('Error getting user scores:', error);
      throw error;
    }
  },

  getMovesForDifficulty(difficulty: number): number {
    switch (difficulty) {
      case 1: return INITIAL_MOVES;
      case 2: return MEDIUM_MOVES;
      case 3: return HARD_MOVES;
      default: return INITIAL_MOVES;
    }
  },

  calculateScoreMultiplier(difficulty: number): number {
    switch (difficulty) {
      case 1: return 1;
      case 2: return 1.5;
      case 3: return 2;
      default: return 1;
    }
  },

  async getPlayerState(address: string): Promise<PlayerState> {
    try {
      const playerRef = doc(db, 'players', address);
      const playerDoc = await getDoc(playerRef);

      if (!playerDoc.exists()) {
        const newPlayerState: PlayerState = {
          address,
          lastPlayedAt: 0,
          movesRemaining: INITIAL_MOVES,
          currentDifficulty: 1,
          consecutiveWins: 0
        };
        await setDoc(playerRef, newPlayerState);
        return newPlayerState;
      }

      return playerDoc.data() as PlayerState;
    } catch (error) {
      console.error('Error getting player state:', error);
      throw error;
    }
  },

  async updatePlayerState(
    address: string, 
    moves: number, 
    difficulty: number, 
    consecutiveWins: number
  ): Promise<void> {
    try {
      const playerRef = doc(db, 'players', address);
      await updateDoc(playerRef, {
        lastPlayedAt: Date.now(),
        movesRemaining: moves,
        currentDifficulty: difficulty,
        consecutiveWins
      });
    } catch (error) {
      console.error('Error updating player state:', error);
      throw error;
    }
  },

  async handleGameCompletion(
    address: string, 
    currentDifficulty: number, 
    consecutiveWins: number, 
    usedMoves: number
  ): Promise<{ newDifficulty: number; newConsecutiveWins: number }> {
    const maxMovesForDifficulty = this.getMovesForDifficulty(currentDifficulty);
    
    if (usedMoves <= maxMovesForDifficulty) {
      // Player succeeded within move limit
      const newConsecutiveWins = consecutiveWins + 1;
      if (newConsecutiveWins >= 2 && currentDifficulty < 3) {
        // Increase difficulty after 2 consecutive wins
        return {
          newDifficulty: currentDifficulty + 1,
          newConsecutiveWins: 0 // Reset consecutive wins after difficulty increase
        };
      }
      return {
        newDifficulty: currentDifficulty,
        newConsecutiveWins
      };
    } else {
      // Player failed to complete within move limit
      return {
        newDifficulty: 1, // Reset to initial difficulty
        newConsecutiveWins: 0
      };
    }
  },

  async resetPlayerDifficulty(address: string): Promise<void> {
    try {
      const playerRef = doc(db, 'players', address);
      await updateDoc(playerRef, {
        currentDifficulty: 1,
        consecutiveWins: 0,
        movesRemaining: INITIAL_MOVES
      });
    } catch (error) {
      console.error('Error resetting player difficulty:', error);
      throw error;
    }
  },

  canPlayerPlay(playerState: PlayerState): { canPlay: boolean; timeRemaining?: number } {
    const now = Date.now();
    const cooldownPeriod = COOLDOWN_HOURS * 60 * 60 * 1000;
    const timeSinceLastPlay = now - playerState.lastPlayedAt;

    if (playerState.lastPlayedAt === 0) {
      return { canPlay: true };
    }

    if (timeSinceLastPlay < cooldownPeriod) {
      const timeRemaining = cooldownPeriod - timeSinceLastPlay;
      return { canPlay: false, timeRemaining };
    }

    return { canPlay: true };
  }
};