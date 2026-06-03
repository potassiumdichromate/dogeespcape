import { motion } from 'framer-motion';
import ProfileHeader from '../components/ProfileHeader';
import AICompanionChat from '../components/AICompanionChat';
import GlobalChat from '../components/GlobalChat';
import DashboardScene from '../components/DashboardScene';
import { useGame } from '../context/GameContext';
import { useWallet } from '../context/WalletContext';

const Home = () => {
  const {
    coins, highscore, level, gamesWon, totalKills,
    leaderboard, saveLoading,
  } = useGame();

  // Find own rank from real leaderboard
  const { address } = useWallet();
  const myEntry    = leaderboard.find(e => e.walletAddress?.toLowerCase() === address?.toLowerCase());
  const playerRank = myEntry?.rank ?? (leaderboard.length > 0 ? leaderboard.length + 1 : '—');

  const statCards = [
    { label: 'Coins',      value: saveLoading ? '…' : coins.toLocaleString(),    icon: '💰' },
    { label: 'Best Score', value: saveLoading ? '…' : highscore.toLocaleString(), icon: '🏁' },
    { label: 'Rank',       value: saveLoading ? '…' : `#${playerRank}`,           icon: '🏆' },
    { label: 'Level',      value: saveLoading ? '…' : `Stage ${level + 1}`,       icon: '📊' },
  ];

  return (
    <div className="min-h-screen overflow-x-hidden flex flex-col p-3 md:p-6 relative">
      <DashboardScene />
      <div className="max-w-[1680px] mx-auto w-full flex flex-col min-h-screen relative z-10">
        {/* Profile Header */}
        <ProfileHeader />

        {/* Dashboard Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="home-dashboard-grid flex-1 mt-4 md:mt-5 pb-8"
        >
          <section className="home-stats-strip">
            {statCards.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 + index * 0.06 }}
                className="home-stat-card"
              >
                <span>{stat.icon}</span>
                <div>
                  <strong>{stat.value}</strong>
                  <p>{stat.label}</p>
                </div>
              </motion.div>
            ))}
          </section>

          <section className="home-chat-panel home-ai-panel">
            <AICompanionChat />
          </section>

          <section className="home-chat-panel home-global-panel">
            <GlobalChat />
          </section>
        </motion.div>
      </div>
    </div>
  );
};

export default Home;
