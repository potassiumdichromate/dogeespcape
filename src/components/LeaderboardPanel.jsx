import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';

const LeaderboardPanel = () => {
  const { leaderboard, leaderboardStatus } = useGame();

  const activeRows = leaderboard;
  const topRanks = activeRows.slice(0, 3);
  const emptyMessage = leaderboardStatus === 'loading'
    ? 'Loading rankings…'
    : leaderboardStatus === 'error'
      ? 'Leaderboard unavailable'
      : 'No ranked players yet';

  const getRankColor = (rank) => {
    switch (rank) {
      case 1:
        return 'text-doge-gold';
      case 2:
        return 'text-doge-iron';
      case 3:
        return 'text-doge-redstone';
      default:
        return 'text-doge-emerald';
    }
  };

  return (
    <div className="cockpit-panel panel-wood h-full flex flex-col">
      {/* Header */}
      <div className="cockpit-header border-b-2 border-doge-coal p-2">
        <div className="flex items-center gap-2 justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xl">🏆</span>
            <div>
              <h3 className="text-sm font-bold text-doge-gold">Rank</h3>
              <p className="text-xs text-doge-iron">Live standings</p>
            </div>
          </div>
          <motion.span
            animate={{ opacity: [0.45, 1, 0.45] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="h-2 w-2 rounded-full bg-doge-gold"
          />
        </div>
      </div>

      <div className="rank-top-three">
        {/* Positional slots (2nd, 1st, 3rd); the label shows the real rank, which can repeat on ties */}
        {[[topRanks[1], 2], [topRanks[0], 1], [topRanks[2], 3]].filter(([player]) => player).map(([player, place]) => (
          <motion.div
            key={`top-${player.walletAddress}`}
            whileHover={{ y: -2 }}
            className={`rank-podium-card rank-podium-${place}`}
          >
            <span className="rank-crown">{player.rank === 1 ? '👑' : `#${player.rank}`}</span>
            <div className="rank-podium-avatar">
              {player.avatar.startsWith('/') ? (
                <img src={player.avatar} alt={player.username} />
              ) : (
                <span>{player.avatar}</span>
              )}
            </div>
            <strong>{player.username}</strong>
            <p>{player.score.toLocaleString()}</p>
          </motion.div>
        ))}
      </div>

      {/* Rank List */}
      <div className="flex-1 overflow-y-auto p-2 flex flex-col gap-2 scrollbar-minecraft">
        {activeRows.length === 0 && (
          <p className="text-xs text-center text-doge-iron py-4">{emptyMessage}</p>
        )}
        {activeRows.map((player, index) => (
          <motion.div
            key={player.walletAddress}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.06 }}
            className={`leaderboard-row panel-dark p-3 relative ${
              player.rank <= 3 ? 'border-doge-gold' : ''
            }`}
          >
            {/* Rank Badge */}
            <div className="absolute -left-1 -top-1">
              <div className={`w-7 h-7 flex items-center justify-center text-xs rounded-lg font-bold ${
                player.rank <= 3 ? 'bg-doge-gold text-doge-darker' : 'bg-doge-coal text-white'
              }`}>
                {player.rank}
              </div>
            </div>

            <div className="flex items-center gap-2.5 ml-4">
              {/* Avatar */}
              <div className="w-9 h-9 flex items-center justify-center overflow-hidden">
                {player.avatar.startsWith('/') ? (
                  <img src={player.avatar} alt="Doge" className="w-full h-full object-cover rounded-md" />
                ) : (
                  <div className="text-lg">{player.avatar}</div>
                )}
              </div>

              {/* Player Info */}
              <div className="flex-1 min-w-0">
                <h4 className={`text-sm font-bold truncate ${getRankColor(player.rank)}`}>
                  {player.username}
                </h4>
                <p className="text-[11px] text-doge-emerald">
                  {player.score.toLocaleString()} high score • {player.kills.toLocaleString()} kills
                </p>
              </div>
            </div>

            {/* Glow effect for top 3 */}
            {player.rank <= 3 && (
              <motion.div
                className="absolute inset-0 pointer-events-none rounded-2xl"
                animate={{ opacity: [0.1, 0.3, 0.1] }}
                transition={{ duration: 2, repeat: Infinity }}
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(240, 180, 41, 0.2), transparent)',
                }}
              />
            )}
          </motion.div>
        ))}
      </div>

      {/* Footer Stats */}
      <div className="border-t-2 border-doge-coal p-2 bg-doge-wood bg-opacity-30">
        <div className="flex justify-between text-xs items-center">
          <span className="text-doge-iron">All Time</span>
          <div>
            <span className="text-doge-gold">{activeRows.length}</span>
            <span className="text-doge-iron"> racers</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardPanel;
