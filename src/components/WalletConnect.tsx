import { useState } from 'react';
import { useWeb3Wallet } from '../hooks/useWeb3Wallet';

export const WalletConnect = () => {
  const { account, connectMetaMask, connectRabby, connectCore, disconnect } = useWeb3Wallet();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async (walletType: 'metamask' | 'rabby' | 'core') => {
    setIsConnecting(true);
    try {
      switch (walletType) {
        case 'metamask':
          await connectMetaMask();
          break;
        case 'rabby':
          await connectRabby();
          break;
        case 'core':
          await connectCore();
          break;
      }
    } catch (error) {
      console.error('Wallet connection error:', error);
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      {!account ? (
        <div className="flex flex-col gap-2">
          <button
            onClick={() => handleConnect('metamask')}
            disabled={isConnecting}
            className="px-4 py-2 bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] rounded"
          >
            Connect MetaMask
          </button>
          <button
            onClick={() => handleConnect('rabby')}
            disabled={isConnecting}
            className="px-4 py-2 bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] rounded"
          >
            Connect Rabby
          </button>
          <button
            onClick={() => handleConnect('core')}
            disabled={isConnecting}
            className="px-4 py-2 bg-[var(--tg-theme-button-color)] text-[var(--tg-theme-button-text-color)] rounded"
          >
            Connect Core
          </button>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-2">
          <p className="text-[var(--tg-theme-text-color)]">
            Connected: {account.slice(0, 6)}...{account.slice(-4)}
          </p>
          <button
            onClick={disconnect}
            className="px-4 py-2 bg-red-500 text-white rounded"
          >
            Disconnect
          </button>
        </div>
      )}
    </div>
  );
};