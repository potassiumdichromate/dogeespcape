import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { WALLET_KEY } from '../api/zerog';

/**
 * UnityGameFrame — loads Unity WebGL and delivers JWT + wallet via two methods:
 *
 *  1. URL params (?jwt=...&walletAddress=...) — read by ZGBridge.jslib on startup
 *  2. SendMessage after load             — fallback if URL params were missed
 *
 * Accepts jwt + walletAddress as props (passed from GamePage) so we don't have
 * to read from localStorage after-the-fact.
 */
const UnityGameFrame = ({ isExpanded = false, onToggleExpanded, jwt, walletAddress }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const unityInstanceRef = useRef(null);

  const UNITY_BUILD_URL = import.meta.env.VITE_UNITY_BUILD_URL || 'https://your-r2-bucket.r2.dev';

  // ── Inject into URL before Unity boots ────────────────────────────────────
  useEffect(() => {
    if (!jwt && !walletAddress) return;
    try {
      const url = new URL(window.location.href);
      if (jwt)           url.searchParams.set('jwt',           jwt);
      if (walletAddress) url.searchParams.set('walletAddress', walletAddress);
      window.history.replaceState({}, '', url.toString());
      console.log('[0G] JWT injected into URL params for Unity');
    } catch (e) {
      console.warn('[0G] URL injection failed:', e.message);
    }
  }, [jwt, walletAddress]);

  // ── Load Unity ─────────────────────────────────────────────────────────────
  useEffect(() => {
    const script = document.createElement('script');
    script.src = `${UNITY_BUILD_URL}/build5/doge.loader.js`;

    script.onload = () => {
      const canvas = document.querySelector('#unity-canvas');
      if (!canvas) { console.error('[0G] unity-canvas not found'); return; }

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

        // ── SendMessage fallback: deliver JWT after Unity is fully ready ──────
        // This covers the case where ZGBridge.jslib couldn't read URL params
        // (e.g., old build without jslib, or timing issue).
        setTimeout(() => {
          const activeJwt    = jwt    || localStorage.getItem('ZGJwt')    || '';
          const activeWallet = walletAddress || localStorage.getItem(WALLET_KEY) || '';
          if (activeJwt) {
            try {
              // 'ZGManager' is the GameObject name, 'ReceiveCredentials' is the method
              unityInstance.SendMessage('ZGManager', 'ReceiveCredentials', `${activeJwt}|${activeWallet}`);
              console.log('[0G] Credentials sent to Unity via SendMessage');
            } catch (e) {
              console.warn('[0G] SendMessage failed (ZGManager may not exist in build):', e.message);
            }
          }
        }, 2000); // 2s delay — give Unity time to finish scene initialization
      })
      .catch((error) => {
        console.error('[0G] Unity load error:', error);
        setIsLoading(false);
      });
    };

    script.onerror = () => {
      console.error('[0G] Unity loader script failed to load from R2');
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

  // ── Re-deliver credentials if JWT arrives after Unity loads ───────────────
  useEffect(() => {
    if (!jwt || !unityInstanceRef.current || isLoading) return;
    try {
      const activeWallet = walletAddress || localStorage.getItem(WALLET_KEY) || '';
      unityInstanceRef.current.SendMessage('ZGManager', 'ReceiveCredentials', `${jwt}|${activeWallet}`);
      console.log('[0G] JWT updated in Unity via SendMessage');
    } catch (e) {
      // Unity may not have ZGManager — silent fail
    }
  }, [jwt, walletAddress, isLoading]);

  return (
    <div
      className={`unity-stage-frame relative w-full overflow-hidden bg-doge-coal ${
        isExpanded
          ? 'h-[100svh] max-w-none rounded-none'
          : 'max-w-[960px] aspect-[16/10] rounded-lg'
      }`}
    >
      {onToggleExpanded && (
        <button
          type="button"
          onClick={onToggleExpanded}
          className="game-screen-toggle"
          aria-label={isExpanded ? 'Reduce game screen' : 'Make game full screen'}
          title={isExpanded ? 'Reduce game screen' : 'Make game full screen'}
        >
          <span
            className={`screen-size-icon ${isExpanded ? 'screen-size-icon--shrink' : 'screen-size-icon--expand'}`}
            aria-hidden="true"
          >
            <span /><span />
          </span>
        </button>
      )}

      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="unity-loading-scene absolute inset-0 flex flex-col items-center justify-center bg-doge-coal z-10"
        >
          <div className="unity-loader-card">
            <div className="unity-loader-orbit" aria-hidden="true">
              <span>💰</span><span>💎</span><span>⚡</span>
            </div>
            <motion.div
              animate={{ y: [0, -8, 0], rotate: [-2, 2, -2] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              className="unity-loader-doge"
            >
              <img src="/images/doge_avatar.png" alt="Doge pilot loading" />
            </motion.div>
            <div className="unity-loader-boat" aria-hidden="true">
              <span>🚤</span><i />
            </div>
            <div className="unity-loader-copy">
              <p>Booting Doge Escape</p>
              <h3>Loading Game...</h3>
            </div>
            <div className="unity-loader-progress">
              <div className="unity-loader-track">
                <motion.div
                  animate={{ width: `${loadingProgress}%` }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  className="unity-loader-fill"
                />
              </div>
              <div className="unity-loader-percent">
                <span>Syncing blocks</span>
                <strong>{loadingProgress}%</strong>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      <canvas
        id="unity-canvas"
        width="1152"
        height="720"
        style={{ display: 'block', width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default UnityGameFrame;
