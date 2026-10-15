import { motion } from 'framer-motion';
import { useGame } from '../context/GameContext';

const DailyTasksPanel = () => {
  const { dailyTasks } = useGame();

  return (
    <div className="panel-wood h-full flex flex-col relative">
      {/* Header */}
      <div className="border-b-2 border-doge-coal p-2 bg-doge-wood bg-opacity-40 rounded-t-2xl">
        <div className="flex items-center gap-2">
          <span className="text-xl">📋</span>
          <div>
            <h3 className="text-sm font-bold text-doge-gold">Daily Tasks</h3>
            <p className="text-xs text-doge-iron">
              {dailyTasks.filter(t => t.completed).length}/{dailyTasks.length}
            </p>
          </div>
        </div>
      </div>

      {/* Tasks List */}
      <div className="flex-1 overflow-hidden p-2 flex flex-col gap-2">
        {dailyTasks.map((task, index) => (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`panel-stone p-2 relative ${
              task.completed ? 'opacity-60' : ''
            }`}
          >
            {/* Completion Badge */}
            {task.completed && (
              <div className="absolute -right-1 -top-1 bg-doge-gold text-doge-darker px-2 py-0.5 rounded-lg text-xs font-bold">
                ✓
              </div>
            )}

            {/* Task Content */}
            <div className="flex items-start gap-2 mb-2">
              <div className="text-lg">{task.completed ? '✅' : '📌'}</div>
              <div className="flex-1 min-w-0">
                <h4 className={`text-xs font-bold mb-1 ${
                  task.completed ? 'text-doge-iron line-through' : 'text-doge-gold'
                }`}>
                  {task.title}
                </h4>
                <div className="text-xs text-doge-emerald">
                  {task.reward}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-doge-iron">Progress</span>
                <span className={task.completed ? 'text-doge-gold' : 'text-white'}>
                  {task.progress}/{task.target}
                </span>
              </div>
              <div className="stat-bar h-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(task.progress / task.target) * 100}%` }}
                  transition={{ duration: 0.5, ease: 'easeOut' }}
                  className={`stat-bar-fill ${
                    task.completed ? 'bg-doge-gold' : 'bg-doge-emerald'
                  }`}
                />
              </div>
            </div>

            {/* Rewards are not live yet — show a disabled placeholder instead of Claim */}
            {task.completed && (
              <button
                type="button"
                disabled
                aria-disabled="true"
                className="btn-primary w-full mt-2 text-xs py-1 opacity-60 cursor-not-allowed"
              >
                Coming Soon
              </button>
            )}
          </motion.div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t-2 border-doge-coal p-2 bg-doge-wood bg-opacity-30 rounded-b-2xl">
        <div className="text-xs text-center text-doge-iron">
          Resets: 23:45:12
        </div>
      </div>
    </div>
  );
};

export default DailyTasksPanel;
