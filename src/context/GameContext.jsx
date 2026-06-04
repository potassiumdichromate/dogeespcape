import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { useWallet } from './WalletContext';
import {
  getCachedJwt,
  getJwtForWallet,
  getNonce,
  login,
  walletLogin,
  clearJwt,
  loadBinary,
  deserializeBCSV,
  getDecentralizedLeaderboard,
  JWT_KEY,
  WALLET_KEY,
} from '../api/zerog';

const GameContext = createContext();

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
};

// ── Static marketplace data ───────────────────────────────────────────────────

const DUMMY_BOATS = [
  { id: 1, name: 'Speedster',    health: 100, agility: 90,  speed: 95,  price: 500,  rentPrice: 50,  owned: true,  image: '🚤' },
  { id: 2, name: 'Tank Cruiser', health: 150, agility: 60,  speed: 70,  price: 800,  rentPrice: 80,  owned: false, image: '⛵' },
  { id: 3, name: 'Ghost Rider',  health: 80,  agility: 100, speed: 100, price: 1200, rentPrice: 120, owned: false, image: '🛥️' },
];
const DUMMY_COMPANIONS = [
  { id: 1, name: 'DogeOS Captain', ability: 'Combat Kernel', damage: 85, defense: 70, price: 600,  rentPrice: 60,  owned: true,  image: '/images/dogeos-captain.svg' },
  { id: 2, name: 'DogeOS Racer',   ability: 'Speed Daemon',  damage: 70, defense: 60, price: 550,  rentPrice: 55,  owned: false, image: '/images/dogeos-racer.svg'   },
  { id: 3, name: 'DogeOS Oracle',  ability: 'Warp Blink',    damage: 95, defense: 50, price: 1000, rentPrice: 100, owned: false, image: '/images/dogeos-oracle.svg'  },
];
const DUMMY_GUNS = [
  { id: 1, name: 'Pistol',  damage: 50,  fireRate: 90, accuracy: 80,  price: 300,  rentPrice: 30,  owned: true,  image: '/images/game-pistol.svg' },
  { id: 2, name: 'Shotgun', damage: 90,  fireRate: 50, accuracy: 60,  price: 650,  rentPrice: 65,  owned: false, image: '💣' },
  { id: 3, name: 'Sniper',  damage: 100, fireRate: 40, accuracy: 100, price: 1500, rentPrice: 150, owned: false, image: '🎯' },
];
const DUMMY_TASKS = [
  { id: 1, title: 'Win 3 Races',       progress: 2,  target: 3,  reward: '100 Coins', completed: false },
  { id: 2, title: 'Survive 5 Minutes', progress: 5,  target: 5,  reward: '150 Coins', completed: true  },
  { id: 3, title: 'Collect 50 Blocks', progress: 35, target: 50, reward: '200 Coins', completed: false },
  { id: 4, title: 'Defeat 10 Enemies', progress: 7,  target: 10, reward: '250 Coins', completed: false },
];
const FALLBACK_LEADERBOARD = [
  { rank: 1, username: 'DogePilot',   score: 0, avatar: '/images/doge_avatar.png' },
  { rank: 2, username: 'WarpRacer',   score: 0, avatar: '/images/doge_avatar.png' },
  { rank: 3, username: 'BlockHunter', score: 0, avatar: '/images/doge_avatar.png' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function isEvmAddress(addr)  { return /^0x[0-9a-fA-F]{40}$/.test(addr); }
function isDogeAddress(addr) { return /^[DA][1-9A-HJ-NP-Za-km-z]{24,33}$/.test(addr); }

/** Extract plain string from whatever signMessage returns (string | object) */
function extractSignature(raw) {
  if (!raw) return null;
  if (typeof raw === 'string') return raw;
  // DogeOS / some wallets return { signature: '...' }
  if (raw.signature) return raw.signature;
  if (raw.sig)       return raw.sig;
  return String(raw);
}

// ── Provider ──────────────────────────────────────────────────────────────────

export const GameProvider = ({ children }) => {
  const { account, signMessage, currentProvider } = useWallet();

  // ── Auth ───────────────────────────────────────────────────────────────────
  const [jwt,         setJwt]         = useState(() => getCachedJwt());
  const [authLoading, setAuthLoading] = useState(false);
  const authAttempted = useRef(false);
  const prevAccount   = useRef(null);   // track wallet switches

  // ── Identity ───────────────────────────────────────────────────────────────
  const [username, setUsernameState] = useState('Doge Pilot');
  const [avatar,   setAvatar]        = useState('/images/doge_avatar.png');

  // ── Save data ──────────────────────────────────────────────────────────────
  const [coins,            setCoins]           = useState(0);
  const [highscore,        setHighscore]        = useState(0);
  const [level,            setLevel]            = useState(0);
  const [totalKills,       setTotalKills]       = useState(0);
  const [gamesPlayed,      setGamesPlayed]      = useState(0);
  const [gamesWon,         setGamesWon]         = useState(0);
  const [gamesLost,        setGamesLost]        = useState(0);
  const [totalCoinsEarned, setTotalCoinsEarned] = useState(0);
  const [saveLoading,      setSaveLoading]      = useState(false);
  const [saveLoaded,       setSaveLoaded]       = useState(false);

  // ── Marketplace ────────────────────────────────────────────────────────────
  const [boats,      setBoats]      = useState(DUMMY_BOATS);
  const [companions, setCompanions] = useState(DUMMY_COMPANIONS);
  const [guns,       setGuns]       = useState(DUMMY_GUNS);
  const [selectedBoat,      setSelectedBoat]      = useState(DUMMY_BOATS[0]);
  const [selectedCompanion, setSelectedCompanion] = useState(DUMMY_COMPANIONS[0]);
  const [selectedGun,       setSelectedGun]       = useState(DUMMY_GUNS[0]);

  // ── Social ─────────────────────────────────────────────────────────────────
  const [leaderboard,  setLeaderboard]  = useState(FALLBACK_LEADERBOARD);
  const [dailyTasks,   setDailyTasks]   = useState(DUMMY_TASKS);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, username: 'System', message: 'Welcome to Doge Escape!', timestamp: new Date() },
    { id: 2, username: 'Admin',  message: 'Good luck on your adventure!', timestamp: new Date() },
  ]);

  // ── Username persistence ───────────────────────────────────────────────────
  useEffect(() => {
    if (!account) return;
    const key = `dogeescape_username_${account.toLowerCase()}`;
    const saved = localStorage.getItem(key);
    if (saved) setUsernameState(saved);
  }, [account]);

  const setUsername = useCallback((next) => {
    const clean = next.trim();
    if (!clean || !account) return;
    setUsernameState(clean);
    localStorage.setItem(`dogeescape_username_${account.toLowerCase()}`, clean);
  }, [account]);

  // ── BCSV apply ─────────────────────────────────────────────────────────────
  const applyBCSV = useCallback((data) => {
    if (!data) return;
    if (data.coins            !== undefined) setCoins(data.coins);
    if (data.highScore        !== undefined) setHighscore(data.highScore);
    if (data.level            !== undefined) setLevel(data.level);
    if (data.totalKills       !== undefined) setTotalKills(data.totalKills);
    if (data.gamesPlayed      !== undefined) setGamesPlayed(data.gamesPlayed);
    if (data.gamesWon         !== undefined) setGamesWon(data.gamesWon);
    if (data.gamesLost        !== undefined) setGamesLost(data.gamesLost);
    if (data.totalCoinsEarned !== undefined) setTotalCoinsEarned(data.totalCoinsEarned);
    setSaveLoaded(true);
    console.log('[0G] Save applied:', data);
  }, []);

  // ── Load save ──────────────────────────────────────────────────────────────
  const loadSaveFromBackend = useCallback(async (token) => {
    const activeJwt = token || getCachedJwt();
    if (!activeJwt) { console.warn('[0G] No JWT for load'); return; }
    setSaveLoading(true);
    try {
      const { buffer } = await loadBinary(activeJwt);
      const data = deserializeBCSV(buffer);
      if (data) applyBCSV(data);
      else console.warn('[0G] BCSV parse returned null');
    } catch (err) {
      if (!err.message?.includes('404')) console.warn('[0G] Load failed:', err.message);
      else console.log('[0G] No save yet — fresh start');
    } finally {
      setSaveLoading(false);
    }
  }, [applyBCSV]);

  // ── Load leaderboard ───────────────────────────────────────────────────────
  const loadLeaderboard = useCallback(async () => {
    try {
      const { leaderboard: rows } = await getDecentralizedLeaderboard();
      if (!rows?.length) return;
      setLeaderboard(rows.map(e => ({
        rank: e.rank,
        username: e.displayName || `Pilot_${e.walletAddress?.slice(2, 8)}`,
        score: e.coinSnapshot ?? 0,
        wins:  e.gamesWon ?? e.saveIndex ?? 0,
        avatar: '/images/doge_avatar.png',
        delta: '—',
        walletAddress: e.walletAddress,
      })));
    } catch (err) {
      console.warn('[0G] Leaderboard failed:', err.message);
    }
  }, []);

  // ── SIWE sign helper ───────────────────────────────────────────────────────
  const doSign = useCallback(async (message) => {
    console.log('[0G] Signing message for wallet:', account);

    const isDoge = isDogeAddress(account || '');

    // For EVM wallets only — personal_sign via raw provider
    // Skip for Dogecoin: currentProvider.request triggers reconnect, not signing
    if (!isDoge && currentProvider?.request) {
      try {
        const raw = await currentProvider.request({
          method: 'personal_sign',
          params: [message, account],
        });
        const sig = extractSignature(raw);
        if (sig) { console.log('[0G] Signed via personal_sign (EVM)'); return sig; }
      } catch (e) {
        console.warn('[0G] personal_sign failed:', e.message);
      }
    }

    // DogeOS signMessage — works for both Dogecoin and EVM fallback
    if (typeof signMessage === 'function') {
      try {
        const raw = await signMessage(message);
        const sig = extractSignature(raw);
        if (sig) { console.log('[0G] Signed via DogeOS signMessage'); return sig; }
      } catch (e) {
        console.warn('[0G] signMessage failed:', e.message);
        throw new Error(`Signing failed: ${e.message}`);
      }
    }

    throw new Error('No signing method available. Is your wallet unlocked?');
  }, [account, currentProvider, signMessage]);

  // ── AUTO-AUTH ──────────────────────────────────────────────────────────────
  // Fires when account connects OR changes (wallet switch).
  // Uses wallet-specific JWT check so different wallets never share tokens.

  useEffect(() => {
    // Wallet switched or logged out
    if (account !== prevAccount.current) {
      prevAccount.current = account;
      authAttempted.current = false;   // reset so new wallet can authenticate

      if (!account) {
        // Logged out — clear JWT and reset all stats
        clearJwt();
        setJwt(null);
        setCoins(0); setHighscore(0); setLevel(0);
        setTotalKills(0); setGamesPlayed(0); setGamesWon(0);
        setGamesLost(0); setTotalCoinsEarned(0);
        setSaveLoaded(false);
        return;
      }
    }

    if (!account) return;

    // Always refresh leaderboard (public)
    loadLeaderboard();

    // Check for valid cached JWT that belongs to THIS wallet
    const cached = getJwtForWallet(account);
    if (cached) {
      console.log('[0G] JWT cached for this wallet — loading save');
      setJwt(cached);
      loadSaveFromBackend(cached);
      return;
    }

    // Avoid double-sign
    if (authAttempted.current) return;
    authAttempted.current = true;

    if (!isEvmAddress(account) && !isDogeAddress(account)) {
      console.warn('[0G] Unrecognized address format, skipping auth:', account);
      return;
    }

    setAuthLoading(true);

    (async () => {
      try {
        let token;

        if (isDogeAddress(account)) {
          // DogeOS / Dogecoin wallet — no signature needed
          console.log('[0G] DogeOS wallet — using wallet-login');
          const result = await walletLogin(account);
          token = result.token;
        } else {
          // EVM wallet — full SIWE flow
          console.log('[0G] EVM wallet — starting SIWE for:', account);
          const { message, nonce } = await getNonce(account);
          console.log('[0G] Nonce received:', nonce);
          const signature = await doSign(message);
          console.log('[0G] Signature obtained');
          const result = await login(account, signature, nonce);
          token = result.token;
        }

        console.log('[0G] JWT received');
        const stored = isEvmAddress(account) ? account.toLowerCase() : account;
        localStorage.setItem(JWT_KEY,    token);
        localStorage.setItem(WALLET_KEY, stored);

        setJwt(token);
        loadSaveFromBackend(token);
      } catch (err) {
        console.error('[0G] Auth failed:', err.message);
        authAttempted.current = false;
      } finally {
        setAuthLoading(false);
      }
    })();

  }, [account]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Manual refresh ─────────────────────────────────────────────────────────
  const refreshSave = useCallback(() => {
    loadSaveFromBackend();
    loadLeaderboard();
  }, [loadSaveFromBackend, loadLeaderboard]);

  // ── Marketplace ────────────────────────────────────────────────────────────
  const buyItem = useCallback((itemType, itemId) => {
    const map = { boat: [boats, setBoats], companion: [companions, setCompanions], gun: [guns, setGuns] };
    if (!map[itemType]) return;
    const [items, setItems] = map[itemType];
    const item = items.find(i => i.id === itemId);
    if (!item || item.owned || coins < item.price) return false;
    setCoins(c => c - item.price);
    setItems(items.map(i => i.id === itemId ? { ...i, owned: true } : i));
    return true;
  }, [boats, companions, guns, coins]);

  const rentItem = useCallback((itemType, itemId) => {
    const map = { boat: boats, companion: companions, gun: guns };
    const item = map[itemType]?.find(i => i.id === itemId);
    if (!item || coins < item.rentPrice) return false;
    setCoins(c => c - item.rentPrice);
    return true;
  }, [boats, companions, guns, coins]);

  const addCoins        = useCallback((n) => setCoins(c => c + n), []);
  const updateHighscore = useCallback((n) => setHighscore(h => n > h ? n : h), []);

  const sendGlobalMessage = useCallback((message) => {
    setChatMessages(prev => [...prev, { id: prev.length + 1, username, message, timestamp: new Date() }]);
  }, [username]);

  const completeTask = useCallback((taskId) => {
    setDailyTasks(t => t.map(task => task.id === taskId ? { ...task, completed: true, progress: task.target } : task));
  }, []);

  const winRate = gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0;

  return (
    <GameContext.Provider value={{
      jwt, authLoading,
      username, setUsername, avatar, setAvatar,
      coins, highscore, level,
      totalKills, gamesPlayed, gamesWon, gamesLost,
      totalCoinsEarned, winRate,
      saveLoading, saveLoaded, refreshSave,
      boats, companions, guns,
      selectedBoat, selectedCompanion, selectedGun,
      setSelectedBoat, setSelectedCompanion, setSelectedGun,
      buyItem, rentItem, addCoins, updateHighscore,
      leaderboard, dailyTasks, chatMessages,
      sendGlobalMessage, completeTask,
    }}>
      {children}
    </GameContext.Provider>
  );
};
