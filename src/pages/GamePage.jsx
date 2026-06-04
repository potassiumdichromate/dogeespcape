import { useState } from 'react';
import { motion } from 'framer-motion';
import ProfileHeader from '../components/ProfileHeader';
import UnityGameFrame from '../components/UnityGameFrame';
import LeaderboardPanel from '../components/LeaderboardPanel';
import DailyTasksPanel from '../components/DailyTasksPanel';
import { useGame } from '../context/GameContext';

const GamePage = () => {
  const [isGameExpanded, setIsGameExpanded] = useState(false);
  const { jwt, authLoading } = useGame();

  return (
    <div
      className={`game-stage-bg min-h-screen overflow-x-hidden flex flex-col bg-doge-darker lg:h-screen lg:overflow-hidden ${
        isGameExpanded ? 'p-0 overflow-hidden' : 'p-3 md:p-4'
      }`}
    >
      <div
        className={`mx-auto w-full flex flex-col min-h-screen lg:h-full lg:min-h-0 ${
          isGameExpanded ? 'max-w-none' : 'max-w-[1600px]'
        }`}
      >
        {!isGameExpanded && <ProfileHeader />}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`flex-1 min-h-0 relative z-10 ${
            isGameExpanded
              ? 'game-main-stage flex'
              : 'flex flex-col lg:grid lg:grid-cols-[260px_1fr_260px] gap-3 mt-3 md:mt-4 pb-6 lg:pb-0'
          }`}
        >
          {/* Left: Leaderboard */}
          {!isGameExpanded && (
            <motion.div
              initial={{ x: -50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="hidden lg:block min-h-0"
            >
              <LeaderboardPanel />
            </motion.div>
          )}

          {/* Center: Game — only mount Unity once JWT is in localStorage */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className={`flex items-center justify-center min-h-0 ${
              isGameExpanded ? 'h-screen w-full flex-1' : 'flex-none lg:flex-1'
            }`}
          >
            {authLoading ? (
              // Waiting for SIWE signature before loading Unity
              <div className="flex flex-col items-center justify-center gap-4 text-center w-full aspect-[16/10] max-w-[960px] bg-doge-coal rounded-lg">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1.2, repeat: Infinity, ease: 'linear' }}
                  className="w-10 h-10 border-4 border-doge-gold/30 border-t-doge-gold rounded-full"
                />
                <p className="text-doge-gold font-heading text-sm">
                  Sign the wallet message to enable cloud saves…
                </p>
                <p className="text-doge-iron text-xs">
                  Check your wallet — a signature request is waiting
                </p>
              </div>
            ) : (
              <UnityGameFrame
                isExpanded={isGameExpanded}
                onToggleExpanded={() => setIsGameExpanded(current => !current)}
              />
            )}
          </motion.div>

          {/* Right: Daily Tasks */}
          {!isGameExpanded && (
            <motion.div
              initial={{ x: 50, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="hidden lg:block min-h-0"
            >
              <DailyTasksPanel />
            </motion.div>
          )}

          {/* Mobile panels */}
          {!isGameExpanded && (
            <div className="lg:hidden grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="min-h-[280px]"><LeaderboardPanel /></div>
              <div className="min-h-[280px]"><DailyTasksPanel /></div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default GamePage;
