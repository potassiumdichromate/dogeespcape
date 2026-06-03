import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useWallet } from './WalletContext';
import {
  getCachedJwt,
  loadBinary,
  deserializeBCSV,
  getDecentralizedLeaderboard,
} from '../api/zerog';

const GameContext = createContext();

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
};

// ── Static / marketplace data (unchanged) ─────────────────────────────────────

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

// Fallback leaderboard shown before real data loads
const FALLBACK_LEADERBOARD = [
  { rank: 1, username: 'DogePilot',   score: 0, avatar: '/images/doge_avatar.png' },
  { rank: 2, username: 'WarpRacer',   score: 0, avatar: '/images/doge_avatar.png' },
  { rank: 3, username: 'BlockHunter', score: 0, avatar: '/images/doge_avatar.png' },
];

// ── Provider ──────────────────────────────────────────────────────────────────

export const GameProvider = ({ children }) => {
  const { account } = useWallet();

  // ── Player identity ────────────────────────────────────────────────────────
  const [username, setUsernameState] = useState('Doge Pilot');
  const [avatar,   setAvatar]        = useState('/images/doge_avatar.png');

  // ── Live save data (loaded from 0G backend) ────────────────────────────────
  const [coins,            setCoins]            = useState(0);
  const [highscore,        setHighscore]         = useState(0);
  const [level,            setLevel]             = useState(0);
  const [totalKills,       setTotalKills]        = useState(0);
  const [gamesPlayed,      setGamesPlayed]       = useState(0);
  const [gamesWon,         setGamesWon]          = useState(0);
  const [gamesLost,        setGamesLost]         = useState(0);
  const [totalCoinsEarned, setTotalCoinsEarned]  = useState(0);
  const [saveLoading,      setSaveLoading]       = useState(false);
  const [saveLoaded,       setSaveLoaded]        = useState(false);

  // ── Marketplace (static for now) ──────────────────────────────────────────
  const [boats,      setBoats]      = useState(DUMMY_BOATS);
  const [companions, setCompanions] = useState(DUMMY_COMPANIONS);
  const [guns,       setGuns]       = useState(DUMMY_GUNS);

  const [selectedBoat,      setSelectedBoat]      = useState(DUMMY_BOATS[0]);
  const [selectedCompanion, setSelectedCompanion] = useState(DUMMY_COMPANIONS[0]);
  const [selectedGun,       setSelectedGun]       = useState(DUMMY_GUNS[0]);

  // ── Social / tasks ─────────────────────────────────────────────────────────
  const [leaderboard, setLeaderboard] = useState(FALLBACK_LEADERBOARD);
  const [dailyTasks,  setDailyTasks]  = useState(DUMMY_TASKS);
  const [chatMessages, setChatMessages] = useState([
    { id: 1, username: 'System', message: 'Welcome to Doge Escape!', timestamp: new Date() },
    { id: 2, username: 'Admin',  message: 'Good luck on your adventure!', timestamp: new Date() },
  ]);

  // ── Username persistence ───────────────────────────────────────────────────
  const getUsernameKey = (addr) =>
    addr ? `dogeescape_username_${addr.toLowerCase()}` : null;

  useEffect(() => {
    const key = getUsernameKey(account);
    if (!key) return;
    const saved = window.localStorage.getItem(key);
    if (saved) setUsernameState(saved);
  }, [account]);

  const setUsername = useCallback((next) => {
    const clean = next.trim();
    if (!clean) return;
    setUsernameState(clean);
    const key = getUsernameKey(account);
    if (key) window.localStorage.setItem(key, clean);
  }, [account]);

  // ── Load save from 0G backend ──────────────────────────────────────────────

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
    console.log('[0G] Save applied to GameContext:', data);
  }, []);

  const loadSaveFromBackend = useCallback(async () => {
    const jwt = getCachedJwt();
    if (!jwt) return;

    setSaveLoading(true);
    try {
      const { buffer } = await loadBinary(jwt);
      const data = deserializeBCSV(buffer);
      if (data) applyBCSV(data);
      else console.warn('[0G] Failed to deserialize BCSV save');
    } catch (err) {
      // 404 = no save yet, that's fine
      if (!err.message?.includes('404')) {
        console.warn('[0G] Load save failed:', err.message);
      }
    } finally {
      setSaveLoading(false);
    }
  }, [applyBCSV]);

  // ── Load leaderboard from 0G backend ──────────────────────────────────────

  const loadLeaderboard = useCallback(async () => {
    try {
      const { leaderboard: rows } = await getDecentralizedLeaderboard();
      if (!rows?.length) return;

      const mapped = rows.map((entry) => ({
        rank:     entry.rank,
        username: entry.displayName || `Pilot_${entry.walletAddress?.slice(2, 8)}`,
        // score = coins snapshot (best metric for ranking)
        score:    entry.coinSnapshot ?? 0,
        // wins = games won if available, fallback to saveIndex as proxy
        wins:     entry.gamesWon     ?? entry.saveIndex ?? 0,
        avatar:   '/images/doge_avatar.png',
        delta:    '—',
        walletAddress: entry.walletAddress,
      }));

      setLeaderboard(mapped);
    } catch (err) {
      console.warn('[0G] Leaderboard load failed:', err.message);
    }
  }, []);

  // ── Boot: load save + leaderboard once wallet connects ────────────────────

  useEffect(() => {
    if (!account) return;

    // Load save (needs JWT — only works after 0G auth)
    loadSaveFromBackend();

    // Load leaderboard (public, no JWT needed)
    loadLeaderboard();
  }, [account, loadSaveFromBackend, loadLeaderboard]);

  // ── Expose a manual refresh ────────────────────────────────────────────────

  const refreshSave = useCallback(() => {
    loadSaveFromBackend();
    loadLeaderboard();
  }, [loadSaveFromBackend, loadLeaderboard]);

  // ── Marketplace actions ────────────────────────────────────────────────────

  const buyItem = useCallback((itemType, itemId) => {
    const map = { boat: [boats, setBoats], companion: [companions, setCompanions], gun: [guns, setGuns] };
    if (!map[itemType]) return;
    const [items, setItems] = map[itemType];
    const item = items.find(i => i.id === itemId);
    if (!item || item.owned) return;
    if (coins >= item.price) {
      setCoins(c => c - item.price);
      setItems(items.map(i => i.id === itemId ? { ...i, owned: true } : i));
      return true;
    }
    return false;
  }, [boats, companions, guns, coins]);

  const rentItem = useCallback((itemType, itemId) => {
    const map = { boat: boats, companion: companions, gun: guns };
    const item = map[itemType]?.find(i => i.id === itemId);
    if (!item) return;
    if (coins >= item.rentPrice) {
      setCoins(c => c - item.rentPrice);
      return true;
    }
    return false;
  }, [boats, companions, guns, coins]);

  const addCoins = useCallback((amount) => setCoins(c => c + amount), []);

  const updateHighscore = useCallback((newScore) => {
    setHighscore(h => newScore > h ? newScore : h);
  }, []);

  const sendGlobalMessage = useCallback((message) => {
    setChatMessages(prev => [...prev, {
      id:        prev.length + 1,
      username,
      message,
      timestamp: new Date(),
    }]);
  }, [username]);

  const completeTask = useCallback((taskId) => {
    setDailyTasks(tasks =>
      tasks.map(t => t.id === taskId ? { ...t, completed: true, progress: t.target } : t)
    );
  }, []);

  // ── Win rate (derived) ────────────────────────────────────────────────────
  const winRate = gamesPlayed > 0 ? Math.round((gamesWon / gamesPlayed) * 100) : 0;

  return (
    <GameContext.Provider
      value={{
        // Identity
        username, setUsername, avatar, setAvatar,

        // Save data (live from backend)
        coins, highscore, level,
        totalKills, gamesPlayed, gamesWon, gamesLost,
        totalCoinsEarned, winRate,
        saveLoading, saveLoaded,
        refreshSave,

        // Marketplace
        boats, companions, guns,
        selectedBoat, selectedCompanion, selectedGun,
        setSelectedBoat, setSelectedCompanion, setSelectedGun,
        buyItem, rentItem, addCoins, updateHighscore,

        // Social
        leaderboard, dailyTasks, chatMessages,
        sendGlobalMessage, completeTask,
      }}
    >
      {children}
    </GameContext.Provider>
  );
};
