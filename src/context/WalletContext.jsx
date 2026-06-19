import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useAccount, useWalletConnect, getChains } from '@dogeos/dogeos-sdk';

const WalletContext = createContext();

// EVM-only wallets (e.g. MetaMask) can't connect to Dogecoin L1, so default
// them to DogeOS Chikyū Testnet (eip155:6281971) instead of Ethereum.
// Dogecoin-capable wallets default to Dogecoin L1 via defaultConnectChain and
// are intentionally left untouched here.
const DOGEOS_TESTNET_CHAIN_TYPE = 'evm';
const DOGEOS_TESTNET_NUMERIC_ID = '6281971';
// chainId is CAIP form ("eip155:6281971") from useAccount but a bare numeric id
// ("6281971") from getChains(), so compare on the numeric tail.
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
  const dogeosSwitchAttemptedRef = useRef(false);

  // For EVM-only wallets (e.g. MetaMask) that land on Ethereum, switch to
  // DogeOS Chikyū Testnet. Gated on chainType === 'evm' so Dogecoin-connected
  // wallets (which default to Dogecoin L1) are never disturbed. Attempted once
  // per connection so declining the switch doesn't re-prompt in a loop.
  useEffect(() => {
    if (!isConnected || !address || chainType !== DOGEOS_TESTNET_CHAIN_TYPE || !chainId) {
      dogeosSwitchAttemptedRef.current = false;
      return;
    }

    if (numericChainId(chainId) === DOGEOS_TESTNET_NUMERIC_ID || dogeosSwitchAttemptedRef.current) {
      return;
    }

    dogeosSwitchAttemptedRef.current = true;

    let cancelled = false;
    (async () => {
      try {
        const chains = await getChains();
        const evmChains = chains?.[DOGEOS_TESTNET_CHAIN_TYPE] || [];
        const target = evmChains.find((c) => numericChainId(c.id) === DOGEOS_TESTNET_NUMERIC_ID);
        if (cancelled || !target) return;
        await switchChain({ chainType: DOGEOS_TESTNET_CHAIN_TYPE, chainInfo: target });
      } catch (err) {
        console.warn('Failed to switch EVM wallet to DogeOS Chikyū Testnet by default:', err);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isConnected, address, chainType, chainId, switchChain]);

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
