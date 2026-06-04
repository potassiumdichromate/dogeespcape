import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useWallet } from '../context/WalletContext';
import { useGame } from '../context/GameContext';
import ProfileHeader from '../components/ProfileHeader';
import {
  getCachedJwt, authenticate,
  getDashboard, getActivity, getBadge, getSaveHistory,
  getGlobalStats, getRecentSaves, getComputeStats, getNetworkStatus,
  getVerifiedLeaderboard, getProof, getWalletExplorer
} from '../api/zerog';

// ── Helpers ───────────────────────────────────────────────────────────────────

const BADGE_COLORS = {
  PLATINUM:  { bg: 'bg-cyan-500/20',   border: 'border-cyan-400/50',   text: 'text-cyan-300',   glow: 'shadow-cyan-500/20'   },
  GOLD:      { bg: 'bg-yellow-500/20', border: 'border-yellow-400/50', text: 'text-yellow-300', glow: 'shadow-yellow-500/20' },
  SILVER:    { bg: 'bg-slate-400/20',  border: 'border-slate-300/50',  text: 'text-slate-200',  glow: 'shadow-slate-400/20'  },
  BRONZE:    { bg: 'bg-orange-600/20', border: 'border-orange-500/50', text: 'text-orange-300', glow: 'shadow-orange-500/20' },
  UNVERIFIED:{ bg: 'bg-gray-700/20',   border: 'border-gray-600/50',   text: 'text-gray-400',   glow: ''                     },
};

function short(s = '', n = 8) {
  if (!s) return '—';
  return s.length > n * 2 + 3 ? `${s.slice(0, n)}...${s.slice(-6)}` : s;
}

function PipelineBar({ pipeline }) {
  const stages = [
    { key: 'stored',    label: 'Stored',    icon: '📦' },
    { key: 'anchored',  label: 'Anchored',  icon: '⛓️'  },
    { key: 'finalized', label: 'DA Final',  icon: '📡' },
    { key: 'validated', label: 'TEE Valid', icon: '🔐' },
  ];
  return (
    <div className="flex items-center gap-1 flex-wrap">
      {stages.map((s, i) => {
        const done = pipeline?.[s.key]?.done;
        return (
          <div key={s.key} className="flex items-center gap-1">
            <div className={`flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono border ${
              done
                ? 'bg-green-500/20 border-green-500/40 text-green-300'
                : 'bg-gray-700/40 border-gray-600/40 text-gray-500'
            }`}>
              <span>{s.icon}</span>
              <span>{s.label}</span>
            </div>
            {i < stages.length - 1 && (
              <span className={`text-xs ${done ? 'text-green-500' : 'text-gray-600'}`}>›</span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function StatCard({ label, value, sub, icon }) {
  return (
    <div className="bg-doge-coal/60 border border-doge-coal rounded-lg p-4 flex flex-col gap-1">
      <div className="flex items-center gap-2 text-doge-gold text-lg">{icon}</div>
      <div className="text-2xl font-bold text-white font-heading">{value ?? '—'}</div>
      <div className="text-xs text-doge-iron">{label}</div>
      {sub && <div className="text-xs text-doge-iron/60">{sub}</div>}
    </div>
  );
}

function ProofModal({ wallet, saveIndex, onClose }) {
  const [proof, setProof] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProof(wallet, saveIndex)
      .then(setProof)
      .catch(() => setProof(null))
      .finally(() => setLoading(false));
  }, [wallet, saveIndex]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 px-4 py-6" onClick={onClose}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-doge-darker border border-doge-coal rounded-xl w-full max-w-lg p-6 max-h-[80vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-doge-gold font-heading text-lg">Proof Certificate — Save #{saveIndex}</h3>
          <button onClick={onClose} className="text-doge-iron hover:text-white text-xl">×</button>
        </div>
        {loading ? (
          <div className="text-doge-iron text-sm text-center py-8">Loading proof...</div>
        ) : !proof ? (
          <div className="text-red-400 text-sm text-center py-8">Failed to load proof.</div>
        ) : (
          <div className="space-y-3 text-sm font-mono">
            <div className="flex justify-between border-b border-doge-coal pb-2">
              <span className="text-doge-iron">Badge</span>
              <span className="text-doge-gold font-bold">{proof.certificate?.badge}</span>
            </div>
            <div className="flex justify-between border-b border-doge-coal pb-2">
              <span className="text-doge-iron">Root Hash</span>
              <span className="text-white">{short(proof.certificate?.rootHash, 12)}</span>
            </div>
            <div className="flex justify-between border-b border-doge-coal pb-2">
              <span className="text-doge-iron">On-chain Tx</span>
              {proof.onChain?.txUrl ? (
                <a href={proof.onChain.txUrl} target="_blank" rel="noopener noreferrer" className="text-cyan-400 hover:underline">
                  {short(proof.onChain.txHash, 10)}
                </a>
              ) : <span className="text-gray-500">—</span>}
            </div>
            <div className="flex justify-between border-b border-doge-coal pb-2">
              <span className="text-doge-iron">DA Status</span>
              <span className={proof.da?.finalized ? 'text-green-400' : 'text-yellow-400'}>
                {proof.da?.status}
              </span>
            </div>
            <div className="flex justify-between border-b border-doge-coal pb-2">
              <span className="text-doge-iron">Compute</span>
              <span className={proof.compute?.verdict === 'CLEAN' ? 'text-green-400' : 'text-gray-400'}>
                {proof.compute?.verdict || proof.compute?.status || '—'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-doge-iron">Verified</span>
              <span className={proof.certificate?.verified ? 'text-green-400' : 'text-yellow-400'}>
                {proof.certificate?.verified ? '✅ All layers passed' : '⏳ Pending'}
              </span>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

const TABS = ['Overview', 'Activity', 'Leaderboard', 'Explorer'];

export default function OGDashboard() {
  const { address, isConnected, signMessage } = useWallet();
  const { jwt: contextJwt, authLoading: contextAuthLoading,
          coins, level, highscore, gamesPlayed, gamesWon, gamesLost, totalKills } = useGame();
  const [jwt,         setJwt]         = useState(() => getCachedJwt());
  const [authLoading, setAuthLoading] = useState(false);

  // Sync jwt from GameContext (auto-SIWE sets it there first)
  useEffect(() => {
    if (contextJwt && !jwt) setJwt(contextJwt);
  }, [contextJwt]);
  const [tab,          setTab]          = useState('Overview');

  // Data state
  const [dashData,     setDashData]     = useState(null);
  const [badgeData,    setBadgeData]    = useState(null);
  const [globalStats,  setGlobalStats]  = useState(null);
  const [networkData,  setNetworkData]  = useState(null);
  const [computeStats, setComputeStats] = useState(null);
  const [activityData, setActivityData] = useState(null);
  const [activityPage, setActivityPage] = useState(1);
  const [leaderboard,  setLeaderboard]  = useState(null);
  const [lbFilter,     setLbFilter]     = useState('finalized');
  const [history,      setHistory]      = useState(null);
  const [recentSaves,  setRecentSaves]  = useState(null);
  const [explorerData, setExplorerData] = useState(null);
  const [proofTarget,  setProofTarget]  = useState(null); // {saveIndex}
  const [loading,      setLoading]      = useState(false);

  const wallet = address?.toLowerCase() || '';

  // ── Auth ───────────────────────────────────────────────────────────────────

  const doAuth = useCallback(async () => {
    if (!wallet) return;
    if (typeof signMessage !== 'function') {
      alert('Wallet signing not available. Reconnect your wallet and try again.');
      return;
    }
    setAuthLoading(true);
    try {
      const token = await authenticate(wallet, async (msg) => {
        const raw = await signMessage(msg);
        return typeof raw === 'string' ? raw : (raw?.signature || String(raw));
      });
      if (token) setJwt(token);
      else alert('Authentication failed — please try again.');
    } catch (err) {
      console.error('[0G] doAuth error:', err);
      alert(`Authentication error: ${err.message}`);
    } finally {
      setAuthLoading(false);
    }
  }, [wallet, signMessage]);

  // ── Load public data on mount ──────────────────────────────────────────────

  useEffect(() => {
    getGlobalStats().then(setGlobalStats).catch(() => {});
    getNetworkStatus().then(setNetworkData).catch(() => {});
    getComputeStats().then(setComputeStats).catch(() => {});
    getRecentSaves(20).then(d => setRecentSaves(d.saves)).catch(() => {});
    getVerifiedLeaderboard(lbFilter).then(setLeaderboard).catch(() => {});
  }, []);

  useEffect(() => {
    getVerifiedLeaderboard(lbFilter).then(setLeaderboard).catch(() => {});
  }, [lbFilter]);

  // ── Load auth-gated data when JWT is available ─────────────────────────────

  useEffect(() => {
    if (!jwt) return;
    setLoading(true);
    Promise.all([
      getDashboard(jwt).then(setDashData).catch(() => {}),
      getBadge(jwt).then(setBadgeData).catch(() => {}),
      getActivity(jwt, 1, 20).then(setActivityData).catch(() => {}),
      getSaveHistory(jwt, 1, 20).then(setHistory).catch(() => {}),
      wallet && getWalletExplorer(wallet).then(setExplorerData).catch(() => {})
    ]).finally(() => setLoading(false));
  }, [jwt, wallet]);

  const loadMoreActivity = async () => {
    if (!jwt) return;
    const next = activityPage + 1;
    const data = await getActivity(jwt, next, 20).catch(() => null);
    if (data) {
      setActivityData(prev => ({
        ...data,
        events: [...(prev?.events || []), ...(data.events || [])]
      }));
      setActivityPage(next);
    }
  };

  // ── Trust badge ────────────────────────────────────────────────────────────

  const trust  = dashData?.trustScore || badgeData;
  const badge  = trust?.label || 'UNVERIFIED';
  const colors = BADGE_COLORS[badge] || BADGE_COLORS.UNVERIFIED;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-doge-darker text-white">
      <ProfileHeader />

      <div className="max-w-6xl mx-auto px-4 py-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-heading text-doge-gold">0G Decentralized Dashboard</h1>
            <p className="text-sm text-doge-iron mt-1">
              Verifiable game saves powered by 0G Storage · DA · Chain · TEE Compute
            </p>
          </div>
          <div className="flex items-center gap-3">
            {(jwt || contextJwt) ? (
              <span className="px-3 py-1 bg-green-500/20 border border-green-500/40 text-green-300 rounded-full text-xs">
                ✓ Authenticated
              </span>
            ) : (contextAuthLoading || authLoading) ? (
              <span className="px-3 py-1 bg-yellow-500/20 border border-yellow-500/40 text-yellow-300 rounded-full text-xs animate-pulse">
                ⏳ Signing…
              </span>
            ) : (
              <button
                onClick={doAuth}
                disabled={authLoading || !isConnected}
                className="px-4 py-2 bg-doge-gold text-doge-darker rounded-lg text-sm font-bold hover:bg-doge-gold/90 disabled:opacity-50 transition-colors"
              >
                {authLoading ? 'Signing...' : 'Sign In'}
              </button>
            )}
          </div>
        </div>

        {/* Trust score hero */}
        {trust && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className={`rounded-xl border p-6 mb-6 shadow-lg ${colors.bg} ${colors.border} ${colors.glow}`}
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className={`text-4xl font-black font-heading ${colors.text}`}>{trust.score}</span>
                  <span className={`px-3 py-1 rounded-full text-sm font-bold border ${colors.bg} ${colors.border} ${colors.text}`}>
                    {badge}
                  </span>
                </div>
                <p className="text-sm text-doge-iron">{trust.description}</p>
                {trust.score < 100 && (
                  <div className="mt-3 h-2 bg-black/40 rounded-full overflow-hidden w-64">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${trust.score}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className={`h-full rounded-full ${badge === 'PLATINUM' ? 'bg-cyan-400' : badge === 'GOLD' ? 'bg-yellow-400' : badge === 'SILVER' ? 'bg-slate-300' : 'bg-orange-500'}`}
                    />
                  </div>
                )}
              </div>
              {trust.breakdown && (
                <div className="grid grid-cols-2 gap-2 text-xs text-center">
                  <div className="bg-black/30 rounded p-2">
                    <div className="text-white font-bold text-lg">{trust.breakdown.totalSaves}</div>
                    <div className="text-doge-iron">Total Saves</div>
                  </div>
                  <div className="bg-black/30 rounded p-2">
                    <div className="text-green-300 font-bold text-lg">{trust.breakdown.finalizedSaves}</div>
                    <div className="text-doge-iron">DA Finalized</div>
                  </div>
                  <div className="bg-black/30 rounded p-2">
                    <div className="text-blue-300 font-bold text-lg">{trust.breakdown.anchoredSaves}</div>
                    <div className="text-doge-iron">Anchored</div>
                  </div>
                  <div className="bg-black/30 rounded p-2">
                    <div className="text-purple-300 font-bold text-lg">{trust.breakdown.computeValidated}</div>
                    <div className="text-doge-iron">TEE Valid</div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-doge-coal/40 rounded-lg p-1 w-fit">
          {TABS.map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-md text-sm font-heading transition-all duration-200 ${
                tab === t
                  ? 'bg-doge-gold text-doge-darker font-bold'
                  : 'text-doge-iron hover:text-white'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* ── Overview ──────────────────────────────────────────────────────── */}
        {tab === 'Overview' && (
          <div className="space-y-6">

            {/* Player stats from live save */}
            <div>
              <h2 className="text-doge-gold font-heading text-sm uppercase tracking-wider mb-3">Your Stats</h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard icon="🎮" label="Level"       value={`Stage ${level + 1}`} />
                <StatCard icon="💰" label="Coins"       value={coins.toLocaleString()} />
                <StatCard icon="💀" label="Total Kills" value={totalKills.toLocaleString()} />
                <StatCard icon="🏆" label="Best Run"    value={`${highscore} kills`} />
                <StatCard icon="🎯" label="Games Played" value={gamesPlayed.toLocaleString()} />
                <StatCard icon="✅" label="Wins"         value={gamesWon.toLocaleString()} />
                <StatCard icon="❌" label="Losses"       value={gamesLost.toLocaleString()} />
                <StatCard icon="📈" label="Win Rate"     value={gamesPlayed > 0 ? `${Math.round((gamesWon/gamesPlayed)*100)}%` : '—'} />
              </div>
            </div>

            {/* Global stats */}
            {globalStats && (
              <div>
                <h2 className="text-doge-gold font-heading text-sm uppercase tracking-wider mb-3">Global Network</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatCard icon="👥" label="Total Players"    value={(globalStats.players?.total ?? 0).toLocaleString()} />
                  <StatCard icon="💾" label="Total Saves"      value={(globalStats.saves?.total ?? 0).toLocaleString()} />
                  <StatCard icon="✅" label="DA Finalized"     value={(globalStats.saves?.finalized ?? 0).toLocaleString()} />
                  <StatCard icon="📦" label="Data Stored"      value={globalStats.saves?.totalDataStored || '0 B'} />
                </div>
              </div>
            )}

            {/* Compute stats */}
            {computeStats && (
              <div>
                <h2 className="text-doge-gold font-heading text-sm uppercase tracking-wider mb-3">Anti-Cheat (TEE Compute)</h2>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatCard icon="🔐" label="Validations"   value={(computeStats.anticheat?.totalValidations ?? 0).toLocaleString()} />
                  <StatCard icon="✅" label="Clean"          value={(computeStats.anticheat?.clean ?? 0).toLocaleString()} />
                  <StatCard icon="⚠️" label="Suspicious"    value={(computeStats.anticheat?.suspicious ?? 0).toLocaleString()} />
                  <StatCard icon="🛡️" label="TEE Attested"  value={`${((computeStats.anticheat?.teeVerifiedRate ?? 0) * 100).toFixed(1)}%`} />
                </div>
              </div>
            )}

            {/* Network status */}
            {networkData && (
              <div>
                <h2 className="text-doge-gold font-heading text-sm uppercase tracking-wider mb-3">
                  0G Network Status
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${
                    networkData.overall === 'healthy' ? 'bg-green-500/20 text-green-300' : 'bg-yellow-500/20 text-yellow-300'
                  }`}>
                    {networkData.overall}
                  </span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {Object.entries(networkData.services || {}).map(([key, svc]) => (
                    <div key={key} className="bg-doge-coal/60 border border-doge-coal rounded-lg p-3 flex items-center justify-between">
                      <div>
                        <div className="text-sm font-medium text-white">{svc.label || key}</div>
                        <div className="text-xs text-doge-iron mt-0.5">{svc.endpoint}</div>
                      </div>
                      <div className="flex items-center gap-2">
                        {svc.latencyMs && <span className="text-xs text-doge-iron">{svc.latencyMs}ms</span>}
                        <span className={`px-2 py-0.5 rounded-full text-xs ${
                          svc.status === 'online'      ? 'bg-green-500/20 text-green-300' :
                          svc.status === 'configured'  ? 'bg-blue-500/20 text-blue-300'  :
                                                         'bg-red-500/20 text-red-300'
                        }`}>
                          {svc.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Latest save pipeline */}
            {dashData?.latestSave && (
              <div>
                <h2 className="text-doge-gold font-heading text-sm uppercase tracking-wider mb-3">Latest Save Pipeline</h2>
                <div className="bg-doge-coal/60 border border-doge-coal rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-doge-iron">Save #{dashData.latestSave.saveIndex}</span>
                    <span className="text-doge-iron">{dashData.latestSave.fileSize}</span>
                  </div>
                  <PipelineBar pipeline={dashData.latestSave.pipeline} />
                  <div className="text-xs text-doge-iron font-mono">{short(dashData.latestSave.rootHash, 16)}</div>
                </div>
              </div>
            )}

            {/* Recent saves feed */}
            {recentSaves && recentSaves.length > 0 && (
              <div>
                <h2 className="text-doge-gold font-heading text-sm uppercase tracking-wider mb-3">Recent Saves (All Players)</h2>
                <div className="space-y-2">
                  {recentSaves.slice(0, 5).map((s, i) => (
                    <div key={i} className="bg-doge-coal/40 border border-doge-coal/60 rounded-lg px-4 py-2 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-3">
                        <span className="text-doge-iron font-mono">{s.wallet}</span>
                        <span className={`px-2 py-0.5 rounded-full ${
                          s.badge === 'FULLY_VERIFIED' ? 'bg-green-500/20 text-green-300' :
                          s.badge === 'DA_VERIFIED'    ? 'bg-blue-500/20 text-blue-300'   :
                                                         'bg-gray-700/40 text-gray-400'
                        }`}>{s.badge}</span>
                      </div>
                      <div className="flex items-center gap-3 text-doge-iron">
                        <span>Lv.{s.levelSnapshot ?? '?'}</span>
                        <span>💰 {s.coinSnapshot?.toLocaleString()}</span>
                        <span>{s.fileSize}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Not authenticated hint */}
            {!jwt && (
              <div className="bg-doge-coal/40 border border-doge-gold/20 rounded-xl p-6 text-center">
                <div className="text-4xl mb-3">🔐</div>
                <h3 className="text-doge-gold font-heading text-lg mb-2">Sign in to see your personal stats</h3>
                <p className="text-doge-iron text-sm mb-4">
                  Trust score, save pipeline, activity feed, and proof certificates require wallet authentication.
                </p>
                <button
                  onClick={doAuth}
                  disabled={authLoading || !isConnected}
                  className="px-6 py-2 bg-doge-gold text-doge-darker rounded-lg font-bold hover:bg-doge-gold/90 disabled:opacity-50 transition-colors"
                >
                  {authLoading ? 'Signing...' : 'Sign In'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ── Activity ──────────────────────────────────────────────────────── */}
        {tab === 'Activity' && (
          <div className="space-y-4">
            {!jwt ? (
              <div className="text-center py-16 text-doge-iron">Sign in to see your activity feed.</div>
            ) : !activityData ? (
              <div className="text-center py-16 text-doge-iron">Loading...</div>
            ) : activityData.events?.length === 0 ? (
              <div className="text-center py-16 text-doge-iron">No activity yet. Play the game to generate events!</div>
            ) : (
              <>
                {activityData.events.map((ev) => (
                  <div key={ev.id} className={`bg-doge-coal/60 border rounded-lg p-4 ${
                    ev.status === 'success' ? 'border-green-500/20' :
                    ev.status === 'warn'    ? 'border-yellow-500/20' :
                    ev.status === 'error'   ? 'border-red-500/20'    :
                                             'border-doge-coal'
                  }`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-mono ${
                            ev.status === 'success' ? 'bg-green-500/20 text-green-300' :
                            ev.status === 'warn'    ? 'bg-yellow-500/20 text-yellow-300' :
                                                     'bg-gray-700/40 text-gray-400'
                          }`}>{ev.type}</span>
                          <span className="text-doge-iron text-xs">Save #{ev.saveIndex}</span>
                        </div>
                        <p className="text-sm text-white mt-1">{ev.title}</p>
                        <p className="text-xs text-doge-iron mt-0.5">{ev.description}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <div className="text-xs text-doge-iron">{new Date(ev.timestamp).toLocaleTimeString()}</div>
                        {ev.explorerUrl && (
                          <a href={ev.explorerUrl} target="_blank" rel="noopener noreferrer"
                            className="text-xs text-cyan-400 hover:underline">
                            Explorer ↗
                          </a>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {activityData.hasMore && (
                  <button onClick={loadMoreActivity} className="w-full py-2 text-doge-iron text-sm hover:text-white border border-doge-coal rounded-lg transition-colors">
                    Load more
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {/* ── Leaderboard ───────────────────────────────────────────────────── */}
        {tab === 'Leaderboard' && (
          <div className="space-y-4">
            {/* Filter */}
            <div className="flex gap-2">
              {['finalized', 'anchored', 'validated'].map(f => (
                <button
                  key={f}
                  onClick={() => setLbFilter(f)}
                  className={`px-3 py-1 rounded text-xs font-mono capitalize transition-colors ${
                    lbFilter === f ? 'bg-doge-gold text-doge-darker font-bold' : 'bg-doge-coal/60 text-doge-iron hover:text-white'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* My rank banner */}
            {leaderboard && wallet && (
              (() => {
                const mine = leaderboard.leaderboard?.find(e => e.walletAddress === wallet);
                if (!mine) return null;
                return (
                  <div className="bg-doge-gold/10 border border-doge-gold/30 rounded-lg px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-doge-gold font-bold text-lg">#{mine.rank}</span>
                      <span className="text-white text-sm">You</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-doge-iron">Lv.{mine.levelSnapshot}</span>
                      <span className="text-doge-gold">💰 {mine.coinSnapshot?.toLocaleString()}</span>
                    </div>
                  </div>
                );
              })()
            )}

            {/* Table */}
            {!leaderboard ? (
              <div className="text-center py-16 text-doge-iron">Loading...</div>
            ) : (
              <div className="bg-doge-coal/40 border border-doge-coal rounded-xl overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-doge-coal text-doge-iron text-xs uppercase">
                      <th className="px-4 py-3 text-left">Rank</th>
                      <th className="px-4 py-3 text-left">Player</th>
                      <th className="px-4 py-3 text-right">Level</th>
                      <th className="px-4 py-3 text-right">Coins</th>
                      <th className="px-4 py-3 text-right">Saves</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(leaderboard.leaderboard || []).map((entry) => (
                      <tr
                        key={entry.walletAddress}
                        className={`border-b border-doge-coal/40 transition-colors ${
                          entry.walletAddress === wallet ? 'bg-doge-gold/10' : 'hover:bg-doge-coal/60'
                        }`}
                      >
                        <td className="px-4 py-3 font-bold text-doge-gold">#{entry.rank}</td>
                        <td className="px-4 py-3 font-mono text-xs text-white">
                          {entry.walletAddress === wallet ? '⭐ ' : ''}
                          {short(entry.walletAddress, 6)}
                        </td>
                        <td className="px-4 py-3 text-right text-doge-iron">{entry.levelSnapshot ?? '—'}</td>
                        <td className="px-4 py-3 text-right text-doge-gold">💰 {(entry.coinSnapshot ?? 0).toLocaleString()}</td>
                        <td className="px-4 py-3 text-right text-doge-iron">{entry.verifiedSaves ?? entry.saveIndex ?? '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ── Explorer ──────────────────────────────────────────────────────── */}
        {tab === 'Explorer' && (
          <div className="space-y-4">
            {!jwt ? (
              <div className="text-center py-16 text-doge-iron">Sign in to explore your save history.</div>
            ) : !history ? (
              <div className="text-center py-16 text-doge-iron">Loading...</div>
            ) : (history.saves || []).length === 0 ? (
              <div className="text-center py-16 text-doge-iron">No saves yet. Play the game to create your first save!</div>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <span className="text-doge-iron text-sm">{history.totalSaves} total saves</span>
                  {history.trustScore && (
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${BADGE_COLORS[history.trustScore.label]?.text || 'text-gray-400'}`}>
                      {history.trustScore.label} · {history.trustScore.score}
                    </span>
                  )}
                </div>
                <div className="space-y-3">
                  {(history.saves || []).map((save) => (
                    <div key={save.saveIndex} className="bg-doge-coal/60 border border-doge-coal rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-doge-coal border border-doge-gold/30 flex items-center justify-center text-sm font-bold text-doge-gold">
                            {save.saveIndex}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-white">Save #{save.saveIndex}</div>
                            <div className="text-xs text-doge-iron">{new Date(save.createdAt).toLocaleString()}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className="text-right text-xs text-doge-iron">
                            <div>Lv.{save.levelSnapshot ?? '?'} · 💰{(save.coinSnapshot ?? 0).toLocaleString()}</div>
                            <div>{save.fileSize}</div>
                          </div>
                          <button
                            onClick={() => setProofTarget({ saveIndex: save.saveIndex })}
                            className="px-3 py-1 bg-doge-gold/20 border border-doge-gold/30 text-doge-gold text-xs rounded hover:bg-doge-gold/30 transition-colors"
                          >
                            Proof
                          </button>
                        </div>
                      </div>
                      <PipelineBar pipeline={save.pipeline} />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        )}
      </div>

      {/* Proof modal */}
      <AnimatePresence>
        {proofTarget && (
          <ProofModal
            wallet={wallet}
            saveIndex={proofTarget.saveIndex}
            onClose={() => setProofTarget(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
