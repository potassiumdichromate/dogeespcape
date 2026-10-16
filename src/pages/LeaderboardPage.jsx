import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import ProfileHeader from '../components/ProfileHeader';
import { useGame } from '../context/GameContext';
import { useWallet } from '../context/WalletContext';
import ZkArenaScene from '../components/ZkArenaScene';
import dogeEscapeLogo from '../assets/DogeEscape-logo.png';

const PublicLeaderboardHeader = () => {
  const { connectWallet, isConnecting } = useWallet();

  return (
    <header className="relative z-50 flex items-center justify-between gap-3 border-b border-[rgba(240,180,41,0.22)] bg-[rgba(18,15,9,0.96)] px-3 py-2 min-h-[54px]">
      <Link to="/" className="flex min-w-0 items-center gap-3 hover:opacity-80 transition-opacity" aria-label="Back to Doge Escape">
        <img src={dogeEscapeLogo} alt="" className="h-10 w-10 shrink-0 object-contain" />
        <span className="game-nav-logo truncate">Doge Escape</span>
      </Link>
      <div className="flex shrink-0 items-center gap-3 sm:gap-5">
        <span className="game-nav-link active pointer-events-none">
          <span>🏆</span>
          <span>Ranks</span>
        </span>
        <button
          type="button"
          onClick={() => connectWallet()}
          className="clip-arcade-button font-pixel bg-gradient-to-b from-yellow-200 via-yellow-400 to-amber-500 px-3 py-2 text-[10px] uppercase tracking-[0.06em] text-black sm:px-4 sm:text-[11px]"
        >
          {isConnecting ? 'Connecting...' : 'Connect Wallet'}
        </button>
      </div>
    </header>
  );
};

const LeaderboardPage = () => {
  const { leaderboard, leaderboardStatus } = useGame();
  const { isConnected } = useWallet();

  const rows = leaderboard;
  const podium = rows.slice(0, 3);
  const emptyMessage = leaderboardStatus === 'loading'
    ? 'Loading rankings…'
    : leaderboardStatus === 'error'
      ? 'Could not load the leaderboard. Please try again later.'
      : 'No ranked players yet.';

  return (
    <div className="screen-page leaderboard-screen min-h-screen bg-doge-darker p-3 md:p-4 lg:p-6 relative overflow-x-hidden">
      <ZkArenaScene />
      <div className="max-w-[1920px] mx-auto w-full flex flex-col min-h-screen relative z-10">
        {isConnected ? <ProfileHeader /> : <PublicLeaderboardHeader />}

        <section className="leaderboard-hero-copy">
          <h1>ZK-Proof Leaderboard</h1>
          <p>Top pilots ranked by high score</p>
        </section>

        <motion.main
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="leaderboard-page-body"
        >
          {podium.length > 0 && (
            <section className="podium-stage">
              {/* Podium slots are positional (2nd, 1st, 3rd); labels show the real rank, which can repeat on ties */}
              {[[podium[1], 2], [podium[0], 1], [podium[2], 3]].filter(([player]) => player).map(([player, place]) => (
                <div key={`podium-${player.walletAddress}`} className={`podium-player podium-${place}`}>
                  <div className="podium-medal"> {player.rank}</div>
                  <div className="podium-avatar">
                    <img src={player.avatar} alt={player.username} />
                  </div>
                  <strong>{player.username}</strong>
                  <span>{player.score.toLocaleString()} high score</span>
                  <div className="podium-block">#{player.rank}</div>
                </div>
              ))}
            </section>
          )}

          <section className="rank-table">
            <div className="rank-table-head">
              <span>Rank</span>
              <span>Player</span>
              <span>High Score</span>
              <span>Kills</span>
            </div>
            <div className="rank-table-scroll scrollbar-minecraft">
              {rows.length === 0 && (
                <p className="rank-table-empty">{emptyMessage}</p>
              )}
              {rows.map((player) => (
                <div key={player.walletAddress} className="rank-table-row">
                  <strong>#{player.rank}</strong>
                  <div>
                    <img src={player.avatar} alt={player.username} />
                    <b title={player.walletAddress}>{player.username}</b>
                  </div>
                  <span>{player.score.toLocaleString()}</span>
                  <span>{player.kills.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </section>
        </motion.main>
      </div>
    </div>
  );
};

export default LeaderboardPage;
