import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import { Web3Provider } from '@ethersproject/providers';

export const useWeb3Wallet = () => {
  const [account, setAccount] = useState<string | null>(null);
  const [provider, setProvider] = useState<Web3Provider | null>(null);

  const connectMetaMask = async () => {
    if (window.ethereum) {
      try {
        const provider = new ethers.BrowserProvider(window.ethereum);
        const accounts = await provider.send("eth_requestAccounts", []);
        setAccount(accounts[0]);
        setProvider(provider);
        return accounts[0];
      } catch (error) {
        console.error('MetaMask connection error:', error);
        throw error;
      }
    } else {
      throw new Error('MetaMask not installed');
    }
  };

  const connectRabby = async () => {
    if (window.rabby) {
      try {
        const provider = new ethers.BrowserProvider(window.rabby);
        const accounts = await provider.send("eth_requestAccounts", []);
        setAccount(accounts[0]);
        setProvider(provider);
        return accounts[0];
      } catch (error) {
        console.error('Rabby connection error:', error);
        throw error;
      }
    } else {
      throw new Error('Rabby wallet not installed');
    }
  };

  const connectCore = async () => {
    if (window.core) {
      try {
        const provider = new ethers.BrowserProvider(window.core);
        const accounts = await provider.send("eth_requestAccounts", []);
        setAccount(accounts[0]);
        setProvider(provider);
        return accounts[0];
      } catch (error) {
        console.error('Core wallet connection error:', error);
        throw error;
      }
    } else {
      throw new Error('Core wallet not installed');
    }
  };

  const disconnect = () => {
    setAccount(null);
    setProvider(null);
  };

  return {
    account,
    provider,
    connectMetaMask,
    connectRabby,
    connectCore,
    disconnect
  };
};