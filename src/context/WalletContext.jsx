import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAccount, useWalletConnect, getChains } from '@dogeos/dogeos-sdk';

const WalletContext = createContext();

// DogeOS Chikyū Testnet — make this the default network on connect
// instead of Ethereum mainnet (eip155:1).
const DEFAULT_CHAIN_TYPE = 'evm';
const DEFAULT_CHAIN_NUMERIC_ID = '6281971';
// chainId is reported as CAIP form ("eip155:6281971") by useAccount but as a
// bare numeric id ("6281971") by getChains(), so compare on the numeric tail.
const numericChainId = (value) => String(value ?? '').match(/(\d+)$/)?.[1];

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
  const defaultChainAttemptedRef = useRef(false);

  // After connecting, default the session to DogeOS Chikyū Testnet instead of
  // whatever the wallet picks (Ethereum mainnet). Only attempt once per
  // connection so a user who declines the switch isn't re-prompted in a loop.
  useEffect(() => {
    if (!isConnected || !address || !chainId) {
      defaultChainAttemptedRef.current = false;
      return;
    }

    if (numericChainId(chainId) === DEFAULT_CHAIN_NUMERIC_ID || defaultChainAttemptedRef.current) {
      return;
    }

    defaultChainAttemptedRef.current = true;

    let cancelled = false;
    (async () => {
      try {
        const chains = await getChains();
        const evmChains = chains?.[DEFAULT_CHAIN_TYPE] || [];
        const target = evmChains.find((c) => numericChainId(c.id) === DEFAULT_CHAIN_NUMERIC_ID);
        if (cancelled || !target) return;
        await switchChain({ chainType: DEFAULT_CHAIN_TYPE, chainInfo: target });
      } catch (err) {
        console.warn('Failed to switch to DogeOS Chikyū Testnet by default:', err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isConnected, address, chainId, switchChain]);

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
