import { GameBoard } from './components/GameBoard';
import { WalletConnect } from './components/WalletConnect';
import { Leaderboard } from './components/Leaderboard';
import { useTelegramWebApp } from './hooks/useTelegramWebApp';

function App() {
  useTelegramWebApp();

  return (
    <div className="min-h-screen bg-[var(--tg-theme-bg-color)]">
      <header className="bg-[var(--tg-theme-secondary-bg-color)] text-[var(--tg-theme-text-color)] p-4 text-center">
        <h1 className="text-2xl font-bold">Pokemon Memory Game</h1>
      </header>
      <main className="container mx-auto">
        <WalletConnect />
        <GameBoard />
        <Leaderboard />
      </main>
    </div>
  );
}

export default App;