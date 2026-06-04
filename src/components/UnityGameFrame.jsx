import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { WALLET_KEY, saveBinary } from '../api/zerog';

// ── BCSV builder (mirrors BackendSyncManager.cs Serialize) ───────────────────
function buildBCSV(payload) {
  const json      = JSON.stringify(payload);
  const jsonBytes = new TextEncoder().encode(json);
  const buf       = new Uint8Array(5 + jsonBytes.length);
  buf[0] = 0x42; buf[1] = 0x43; buf[2] = 0x53; buf[3] = 0x56; // "BCSV"
  buf[4] = 0x01; // version
  buf.set(jsonBytes, 5);
  return buf.buffer;
}

/**
 * UnityGameFrame — loads Unity WebGL and handles the full 0G save/load bridge.
 *
 * JWT delivery to Unity (two methods):
 *   1. URL params (?jwt=...&walletAddress=...) — ZGBridge.jslib reads these on boot
 *   2. SendMessage after load                  — fallback if URL params were missed
 *
 * Save flow (Unity → React → Backend):
 *   Unity calls ZG_SendSaveData(json) via jslib
 *   → dispatches 'zg_save' CustomEvent
 *   → this component listens, wraps JSON in BCSV header, POSTs to backend
 *   React handles the HTTP because it holds the JWT reliably.
 */

const UnityGameFrame = ({ isExpanded = false, onToggleExpanded, jwt, walletAddress }) => {
  const [isLoading,       setIsLoading]       = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const unityInstanceRef = useRef(null);
  const jwtRef           = useRef(jwt);   // always-current jwt without re-running Unity effect

  // Keep jwtRef in sync so the save listener always uses the latest token
  useEffect(() => { jwtRef.current = jwt; }, [jwt]);

  const UNITY_BUILD_URL = import.meta.env.VITE_UNITY_BUILD_URL || 'https://your-r2-bucket.r2.dev';

  // ── 1. Inject JWT into URL so ZGBridge.jslib can read it on boot ──────────
  useEffect(() => {
    if (!jwt && !walletAddress) return;
    try {
      const url = new URL(window.location.href);
      if (jwt)           url.searchParams.set('jwt',           jwt);
      if (walletAddress) url.searchParams.set('walletAddress', walletAddress);
      window.history.replaceState({}, '', url.toString());
      console.log('[0G] JWT injected into page URL for Unity jslib');
    } catch (e) {
      console.warn('[0G] URL injection failed:', e.message);
    }
  }, [jwt, walletAddress]);

  // ── 2. Listen for DOGE_GAME_SAVE postMessage from Unity ──────────────────
  // Unity fires ZG_PostGameSave(json) via jslib → window.postMessage
  // This component catches it and calls saveBinary — the actual HTTP upload.
  useEffect(() => {
    const onMessage = async (e) => {
      if (e.data?.type !== 'DOGE_GAME_SAVE') return;

      const activeJwt = jwtRef.current || localStorage.getItem('ZGJwt');
      if (!activeJwt) {
        console.warn('[0G] DOGE_GAME_SAVE received but no JWT — save skipped');
        return;
      }

      const payload = {
        level:            e.data.level            ?? 0,
        coins:            e.data.coins            ?? 0,
        firstTimeDone:    e.data.firstTimeDone    ?? false,
        totalKills:       e.data.totalKills       ?? 0,
        highScore:        e.data.highScore        ?? 0,
        gamesPlayed:      e.data.gamesPlayed      ?? 0,
        gamesWon:         e.data.gamesWon         ?? 0,
        gamesLost:        e.data.gamesLost        ?? 0,
        totalCoinsEarned: e.data.totalCoinsEarned ?? 0,
      };

      console.log('[0G] DOGE_GAME_SAVE received from Unity — uploading:', payload);

      try {
        const result = await saveBinary(buildBCSV(payload), activeJwt);
        console.log(`[0G] Save #${result.saveIndex} uploaded. rootHash: ${result.rootHash}`);
      } catch (err) {
        console.error('[0G] saveBinary failed:', err.message);
      }
    };

    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []); // uses jwtRef — no need to re-run when jwt changes

  // ── 3. Load Unity ─────────────────────────────────────────────────────────
  useEffect(() => {
    const script = document.createElement('script');
    script.src = `${UNITY_BUILD_URL}/build5/doge.loader.js`;

    script.onload = () => {
      const canvas = document.querySelector('#unity-canvas');
      if (!canvas) { console.error('[0G] #unity-canvas not found'); return; }

      createUnityInstance(canvas, {
        dataUrl:            `${UNITY_BUILD_URL}/build5/doge.data`,
        frameworkUrl:       `${UNITY_BUILD_URL}/build5/doge.framework.js`,
        codeUrl:            `${UNITY_BUILD_URL}/build5/doge.wasm`,
        streamingAssetsUrl: `${UNITY_BUILD_URL}/StreamingAssets`,
        companyName:        'Kult Games',
        productName:        'doge escape',
        productVersion:     '1.0.5',
      }, (progress) => {
        setLoadingProgress(Math.round(progress * 100));
      })
      .then((unityInstance) => {
        unityInstanceRef.current = unityInstance;
        setIsLoading(false);
        console.log('[0G] Unity loaded');

        // ── 4. SendMessage fallback: deliver JWT 2s after Unity is ready ─────
        setTimeout(() => {
          const activeJwt    = jwtRef.current || localStorage.getItem('ZGJwt') || '';
          const activeWallet = walletAddress   || localStorage.getItem(WALLET_KEY) || '';
          if (activeJwt) {
            try {
              unityInstance.SendMessage('ZGManager', 'ReceiveCredentials', `${activeJwt}|${activeWallet}`);
              console.log('[0G] Credentials sent to Unity via SendMessage');
            } catch (e) {
              console.warn('[0G] SendMessage failed (ZGManager may not exist in this build):', e.message);
            }
          }
        }, 2000);
      })
      .catch((err) => {
        console.error('[0G] Unity load error:', err);
        setIsLoading(false);
      });
    };

    script.onerror = () => {
      console.error('[0G] Unity loader failed to load from R2');
      setIsLoading(false);
    };

    document.body.appendChild(script);

    return () => {
      if (unityInstanceRef.current) {
        unityInstanceRef.current.Quit().catch(() => {});
        unityInstanceRef.current = null;
      }
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, [UNITY_BUILD_URL]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── 5. Re-deliver JWT whenever it changes (e.g., re-auth) ────────────────
  useEffect(() => {
    if (!jwt || !unityInstanceRef.current || isLoading) return;
    const activeWallet = walletAddress || localStorage.getItem(WALLET_KEY) || '';
    try {
      unityInstanceRef.current.SendMessage('ZGManager', 'ReceiveCredentials', `${jwt}|${activeWallet}`);
      console.log('[0G] Updated JWT sent to Unity');
    } catch (e) { /* Unity may not have ZGManager */ }
  }, [jwt, walletAddress, isLoading]);

  return (
    <div
      className={`unity-stage-frame relative w-full overflow-hidden bg-doge-coal ${
        isExpanded ? 'h-[100svh] max-w-none rounded-none' : 'max-w-[960px] aspect-[16/10] rounded-lg'
      }`}
    >
      {onToggleExpanded && (
        <button type="button" onClick={onToggleExpanded} className="game-screen-toggle"
          aria-label={isExpanded ? 'Reduce game screen' : 'Make game full screen'}
          title={isExpanded ? 'Reduce game screen' : 'Make game full screen'}
        >
          <span className={`screen-size-icon ${isExpanded ? 'screen-size-icon--shrink' : 'screen-size-icon--expand'}`} aria-hidden="true">
            <span /><span />
          </span>
        </button>
      )}

      {isLoading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="unity-loading-scene absolute inset-0 flex flex-col items-center justify-center bg-doge-coal z-10"
        >
          <div className="unity-loader-card">
            <div className="unity-loader-orbit" aria-hidden="true">
              <span>💰</span><span>💎</span><span>⚡</span>
            </div>
            <motion.div animate={{ y: [0, -8, 0], rotate: [-2, 2, -2] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              className="unity-loader-doge"
            >
              <img src="/images/doge_avatar.png" alt="Doge pilot loading" />
            </motion.div>
            <div className="unity-loader-boat" aria-hidden="true"><span>🚤</span><i /></div>
            <div className="unity-loader-copy">
              <p>Booting Doge Escape</p>
              <h3>Loading Game...</h3>
            </div>
            <div className="unity-loader-progress">
              <div className="unity-loader-track">
                <motion.div animate={{ width: `${loadingProgress}%` }}
                  transition={{ duration: 0.25, ease: 'easeOut' }} className="unity-loader-fill" />
              </div>
              <div className="unity-loader-percent">
                <span>Syncing blocks</span>
                <strong>{loadingProgress}%</strong>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <canvas id="unity-canvas" width="1152" height="720"
        style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  );
};

export default UnityGameFrame;
