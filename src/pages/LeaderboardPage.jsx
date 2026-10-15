import { motion } from 'framer-motion';
import ProfileHeader from '../components/ProfileHeader';
import { useGame } from '../context/GameContext';
import ZkArenaScene from '../components/ZkArenaScene';

const LeaderboardPage = () => {
  const { leaderboard, leaderboardStatus } = useGame();

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
        <ProfileHeader />

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
