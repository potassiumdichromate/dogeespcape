import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ProfileHeader from '../components/ProfileHeader';
import { useGame } from '../context/GameContext';
import { useWallet } from '../context/WalletContext';
import ItemDetailsModal from '../components/ItemDetailsModal';
import PlayerHubScene from '../components/PlayerHubScene';
import { AnimatePresence } from 'framer-motion';
import ItemVisual from '../components/ItemVisual';

const ProfilePage = () => {
  const {
    username,
    coins,
    highscore,
    level,
    gamesPlayed,
    gamesWon,
    gamesLost,
    totalKills,
    totalCoinsEarned,
    winRate,
    leaderboard,
    avatar,
    boats,
    companions,
    guns,
    selectedBoat,
    selectedCompanion,
    selectedGun,
    setUsername,
    refreshSave,
  } = useGame();
  const { account, getShortAddress } = useWallet();
  const [isEditingName, setIsEditingName] = useState(false);
  const [draftName, setDraftName] = useState(username);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState(null);
  const [selectedInventoryType, setSelectedInventoryType] = useState(null);

  useEffect(() => {

    refreshSave();
  }, [refreshSave]);

  useEffect(() => {
    setDraftName(username);
  }, [username]);

  const handleSaveName = () => {
    const nextName = draftName.trim();
    if (!nextName) return;

    setUsername(nextName);
    setIsEditingName(false);
  };

  const equippedItems = [
    { title: selectedBoat?.name || 'None', subtitle: 'Boat', visual: selectedBoat || '🚤' },
    { title: selectedCompanion?.name || 'None', subtitle: 'Companion', visual: selectedCompanion || '🧔' },
    { title: selectedGun?.name || 'None', subtitle: 'Weapon', visual: selectedGun || '🔫' },
  ];

  const ownedBoats = boats.filter(b => b.owned);
  const ownedCompanions = companions.filter(c => c.owned);
  const ownedGuns = guns.filter(g => g.owned);
  const ownedCount = ownedBoats.length + ownedCompanions.length + ownedGuns.length;
  // Stats derived from real save data
  const killRate = gamesPlayed > 0 ? Math.min(100, Math.round((totalKills / Math.max(gamesPlayed, 1)) * 2)) : 0;
  const surviveRate = gamesPlayed > 0 ? Math.min(100, winRate) : 0;
  const coinRate = Math.min(100, Math.round((coins / 10000) * 100));
  const xpRate = Math.min(100, Math.round(((level + 1) / 9) * 100));

  const stats = [
    { label: 'Kill Rate', value: killRate, color: '#f0b429' },
    { label: 'Win Rate', value: surviveRate, color: '#e04040' },
    { label: 'Coin Power', value: coinRate, color: '#10b981' },
    { label: 'Level', value: xpRate, color: '#f7c948' },
  ];

  // Rank from real leaderboard
  const myEntry = leaderboard.find(e => e.walletAddress?.toLowerCase() === account?.toLowerCase());
  const playerRank = myEntry?.rank ?? '—';

  // Achievements driven by real save data
  const achievements = [
    { icon: '🎮', title: 'First Game', text: 'Play your first session', unlocked: gamesPlayed >= 1 },
    { icon: '🏆', title: 'First Win', text: 'Win your first level', unlocked: gamesWon >= 1 },
    { icon: '💀', title: 'Monster Slayer', text: 'Kill 10 enemies', unlocked: totalKills >= 10 },
    { icon: '⚔️', title: 'Warrior', text: 'Kill 100 enemies total', unlocked: totalKills >= 100 },
    { icon: '💰', title: 'Coin Collector', text: 'Earn 1,000 coins total', unlocked: totalCoinsEarned >= 1000 },
    { icon: '👑', title: 'Veteran', text: 'Play 10 or more games', unlocked: gamesPlayed >= 10 },
  ];

  // Session summary derived from save — real row data lives in 0G dashboard
  const games = gamesPlayed > 0 ? [
    { mode: 'Session', result: `${gamesWon} won / ${gamesLost} lost`, time: 'career total', score: totalCoinsEarned, badge: '🎮' },
    { mode: 'Best Run', result: `${highscore} kills`, time: 'all time high', score: highscore, badge: '🏆' },
    { mode: 'Level', result: `Stage ${level + 1}`, time: 'current', score: coins, badge: '📊' },
  ] : [
    { mode: 'No games yet', result: 'Play to see stats', time: '—', score: 0, badge: '🎮' },
  ];

  return (
    <div className="screen-page profile-screen min-h-screen bg-doge-darker p-3 md:p-4 lg:p-6 relative overflow-x-hidden">
      <PlayerHubScene />
      <div className="max-w-[1920px] mx-auto w-full flex flex-col min-h-screen relative z-10">
        <ProfileHeader />

        <section className="profile-hero">
          <div className="profile-hero-avatar">
            {avatar?.startsWith('/') ? <img src={avatar} alt="Profile" /> : <span>{avatar}</span>}
          </div>
          <div className="min-w-0 flex-1">
            <div className="profile-name-row">
              {isEditingName ? (
                <>
                  <input
                    type="text"
                    value={draftName}
                    onChange={(event) => setDraftName(event.target.value)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') handleSaveName();
                      if (event.key === 'Escape') {
                        setDraftName(username);
                        setIsEditingName(false);
                      }
                    }}
                    className="profile-name-input"
                    maxLength={16}
                    autoFocus
                  />
                  <button type="button" onClick={handleSaveName} className="profile-name-save">
                    Save
                  </button>
                </>
              ) : (
                <>
                  <h1>{username}</h1>
                  <button
                    type="button"
                    onClick={() => setIsEditingName(true)}
                    className="profile-name-edit"
                    aria-label="Edit player name"
                    title="Edit player name"
                  >
                    ✏️
                  </button>
                </>
              )}
            </div>
            <p>Level {level} • {getShortAddress(account) || 'Guest Racer'}</p>
            <div className="profile-pills">
              <span>🏆 Rank #{playerRank}</span>
              <span>{gamesWon} Wins</span>
              <span>{ownedCount} Items</span>
            </div>
          </div>
          <div className="profile-score">
            <strong>{coins.toLocaleString()}</strong>
            <span>Coins</span>
          </div>
        </section>

        <motion.main
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="profile-grid"
        >
          <section className="profile-column">
            <h2>Player Stats</h2>
            <div className="space-y-4">
              {stats.map((stat) => (
                <div key={stat.label} className="profile-stat-line">
                  <div>
                    <span>{stat.label}</span>
                    <strong>{stat.value} / 100</strong>
                  </div>
                  <div className="profile-stat-track">
                    <div style={{ width: `${stat.value}%`, background: stat.color }} />
                  </div>
                </div>
              ))}
            </div>

            <h2 className="mt-8">Equipped Items</h2>
            <div className="equipped-grid">
              {equippedItems.map((item) => (
                <div key={item.title} className="equipped-tile">
                  <ItemVisual item={item.visual} imageClassName="h-10 w-10 object-contain" />
                  <div>
                    <strong>{item.title}</strong>
                    <p>{item.subtitle}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="profile-column">
            <h2>Achievements <span>({achievements.filter(a => a.unlocked).length}/{achievements.length})</span></h2>
            <div className="achievement-grid">
              {achievements.map((item) => (
                <div key={item.title} className={`achievement-card ${item.unlocked ? 'unlocked' : 'locked'}`}>
                  <span>{item.icon}</span>
                  <strong>{item.title}</strong>
                  <p>{item.text}</p>
                  {item.unlocked && <em>✓ Unlocked</em>}
                </div>
              ))}
            </div>
          </section>

          <section className="profile-column">
            <h2>Recent Games</h2>
            <div className="space-y-3">
              {games.map((game) => (
                <div key={`${game.mode}-${game.time}`} className="recent-game-row">
                  <span>{game.badge}</span>
                  <div>
                    <strong>{game.mode}</strong>
                    <p>{game.result}</p>
                  </div>
                  <div>
                    <small>{game.time}</small>
                    <strong>{game.score.toLocaleString()} pts</strong>
                  </div>
                </div>
              ))}
            </div>
            <div className="win-rate-card mt-6">
              <span>Win Rate</span>
              <strong>{winRate}%</strong>
              <div><i /></div>
            </div>
          </section>
        </motion.main>

        {/* New Inventory Section */}
        <section className="px-5 pb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl text-doge-gold font-bold text-shadow-pixel">My Collection ({ownedCount})</h2>
            <div className="h-0.5 flex-1 bg-doge-gold/10 mx-6"></div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Boats */}
            {ownedBoats.map(item => (
              <InventoryItemCard
                key={`boat-${item.id}`}
                item={item}
                type="boats"
                onClick={() => { setSelectedInventoryItem(item); setSelectedInventoryType('boats'); }}
              />
            ))}
            {/* Companions */}
            {ownedCompanions.map(item => (
              <InventoryItemCard
                key={`comp-${item.id}`}
                item={item}
                type="companions"
                onClick={() => { setSelectedInventoryItem(item); setSelectedInventoryType('companions'); }}
              />
            ))}
            {/* Guns */}
            {ownedGuns.map(item => (
              <InventoryItemCard
                key={`gun-${item.id}`}
                item={item}
                type="guns"
                onClick={() => { setSelectedInventoryItem(item); setSelectedInventoryType('guns'); }}
              />
            ))}
          </div>
        </section>
      </div>

      {/* Item Details Modal */}
      <AnimatePresence mode="wait">
        {selectedInventoryItem && (
          <ItemDetailsModal
            item={selectedInventoryItem}
            itemType={selectedInventoryType}
            onClose={() => {
              setSelectedInventoryItem(null);
              setSelectedInventoryType(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

// Subcomponent for Inventory Cards
const InventoryItemCard = ({ item, type, onClick }) => (
  <motion.div
    whileHover={{ scale: 1.02, y: -4 }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className="panel-dark p-4 flex items-center gap-4 cursor-pointer border-2 border-transparent hover:border-doge-gold/40 transition-all shadow-pixel"
  >
    <div className="hotbar-slot w-14 h-14 text-4xl shrink-0">
      <ItemVisual item={item} imageClassName="h-12 w-12 object-contain" />
    </div>
    <div className="min-w-0">
      <h3 className="text-sm font-bold text-doge-gold truncate">{item.name}</h3>
      <p className="text-[10px] text-doge-iron uppercase tracking-widest">
        {type.slice(0, -1)}
      </p>
    </div>
    <div className="ml-auto text-doge-gold opacity-30">ⓘ</div>
  </motion.div>
);

export default ProfilePage;
