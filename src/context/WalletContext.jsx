import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useAccount, useWalletConnect } from '@dogeos/dogeos-sdk';

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within WalletProvider');
  }
  return context;
};

export const WalletProvider = ({ children }) => {
  const {
    address,
    balance,
    chainType,
    chainId,
    currentWallet,
    currentProvider,
    switchChain,
    signMessage,
    signInWithWallet,
  } = useAccount();
  const {
    isOpenModal,
    isConnected,
    isConnecting,
    error,
    connect,
    disconnect: disconnectDogeOS,
    openModal,
    closeModal,
  } = useWalletConnect();
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    if (typeof window === 'undefined') {
      setIsInitializing(false);
      return undefined;
    }

    const hasSavedWallet = Boolean(localStorage.getItem('doge_wallet_address'));

    if (!hasSavedWallet || address || isConnected) {
      setIsInitializing(false);
      return undefined;
    }

    const reconnectGraceTimer = window.setTimeout(() => {
      setIsInitializing(false);
    }, 3000);

    return () => window.clearTimeout(reconnectGraceTimer);
  }, [address, isConnected]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (address) {
      localStorage.setItem('doge_wallet_address', address);
    } else if (!isConnected && !isInitializing) {
      localStorage.removeItem('doge_wallet_address');
    }
  }, [address, isConnected, isInitializing]);

  const connectWallet = useCallback(async () => {
    if (isConnected && address) {
      return address;
    }

    try {
      openModal();
      return null;
    } catch (error) {
      console.error('Error opening DogeOS wallet modal:', error);
      alert('Failed to open DogeOS wallet connection. Please try again.');
      return null;
    }
  }, [address, isConnected, openModal]);

  const disconnect = useCallback(async () => {
    try {
      await disconnectDogeOS();
    } catch (error) {
      console.error('Error disconnecting DogeOS wallet:', error);
    } finally {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('doge_wallet_address');
      }
    }
  }, [disconnectDogeOS]);

  const getShortAddress = useCallback((address) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  }, []);

  const account = address || null;

  const value = useMemo(() => ({
    account,
    address: account,
    balance,
    chainType,
    chainId,
    currentWallet,
    currentProvider,
    isOpenModal,
    isConnecting,
    isInitializing,
    isConnected: Boolean(isConnected && account),
    error,
    connect,
    connectWallet,
    disconnect,
    openModal,
    closeModal,
    switchChain,
    signMessage,
    signInWithWallet,
    getShortAddress,
  }), [
    account,
    balance,
    chainType,
    chainId,
    currentWallet,
    currentProvider,
    isOpenModal,
    isConnecting,
    isInitializing,
    isConnected,
    error,
    connect,
    switchChain,
    signMessage,
    signInWithWallet,
    connectWallet,
    disconnect,
    openModal,
    closeModal,
    getShortAddress,
  ]);

  return (
    <WalletContext.Provider
      value={value}
    >
      {children}
    </WalletContext.Provider>
  );
};
