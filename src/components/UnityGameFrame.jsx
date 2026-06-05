import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { WALLET_KEY } from '../api/zerog';

const UnityGameFrame = ({ isExpanded = false, onToggleExpanded, jwt, walletAddress }) => {
  const [isLoading,       setIsLoading]       = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const unityInstanceRef = useRef(null);
  const jwtRef           = useRef(jwt);

  useEffect(() => { jwtRef.current = jwt; }, [jwt]);

  const UNITY_BUILD_URL = import.meta.env.VITE_UNITY_BUILD_URL || 'https://your-r2-bucket.r2.dev';

  // ── Load Unity ────────────────────────────────────────────────────────────
  useEffect(() => {

    const script = document.createElement('script');
    script.src = `${UNITY_BUILD_URL}/build8/doge.loader.js`;

    script.onload = () => {
      const canvas = document.querySelector('#unity-canvas');
      if (!canvas) { setIsLoading(false); return; }

      createUnityInstance(canvas, {
        dataUrl:            `${UNITY_BUILD_URL}/build8/doge.data`,
        frameworkUrl:       `${UNITY_BUILD_URL}/build8/doge.framework.js`,
        codeUrl:            `${UNITY_BUILD_URL}/build8/doge.wasm`,
        streamingAssetsUrl: `${UNITY_BUILD_URL}/StreamingAssets`,
        companyName:        'Kult Games',
        productName:        'doge escape',
        productVersion:     '1.0.5',
      }, (p) => setLoadingProgress(Math.round(p * 100)))
      .then((instance) => {
        unityInstanceRef.current = instance;
        setIsLoading(false);
        console.log('[0G] Unity loaded');

        // Send JWT after 3s — gives Unity time to fully initialize all scenes
        // NOTE: Unity scene GameObject is named 'GameBootstrapper ' (trailing space)
        setTimeout(() => {
          const j = jwtRef.current || localStorage.getItem('ZGJwt') || '';
          console.log('[0G] SendMessage attempt — JWT:', j ? 'present' : 'missing');
          if (j) {
            try {
              instance.SendMessage('GameBootstrapper ', 'SetJwtToken', j);
              console.log('[0G] JWT sent to GameBootstrapper.SetJwtToken');
            } catch (e) {
              console.warn('[0G] SendMessage failed:', e.message);
            }
          }
        }, 3000);
      })
      .catch((err) => { console.error('[0G] Unity load error:', err); setIsLoading(false); });
    };

    script.onerror = () => { console.error('[0G] Loader failed'); setIsLoading(false); };
    document.body.appendChild(script);

    return () => {
      if (unityInstanceRef.current) { unityInstanceRef.current.Quit().catch(() => {}); unityInstanceRef.current = null; }
      if (document.body.contains(script)) document.body.removeChild(script);
    };
  }, [UNITY_BUILD_URL]); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-send JWT to GameBootstrapper if it arrives after Unity loads
  useEffect(() => {
    if (!jwt || !unityInstanceRef.current || isLoading) return;
    try { unityInstanceRef.current.SendMessage('GameBootstrapper ', 'SetJwtToken', jwt); }
    catch (e) {}
  }, [jwt, isLoading]);

  return (
    <div className={`unity-stage-frame relative w-full overflow-hidden bg-doge-coal ${
      isExpanded ? 'h-[100svh] max-w-none rounded-none' : 'max-w-[960px] aspect-[16/10] rounded-lg'
    }`}>
      {onToggleExpanded && (
        <button type="button" onClick={onToggleExpanded} className="game-screen-toggle"
          aria-label={isExpanded ? 'Reduce' : 'Fullscreen'}>
          <span className={`screen-size-icon ${isExpanded ? 'screen-size-icon--shrink' : 'screen-size-icon--expand'}`} aria-hidden="true">
            <span /><span />
          </span>
        </button>
      )}
      {isLoading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="unity-loading-scene absolute inset-0 flex flex-col items-center justify-center bg-doge-coal z-10">
          <div className="unity-loader-card">
            <div className="unity-loader-orbit" aria-hidden="true"><span>💰</span><span>💎</span><span>⚡</span></div>
            <motion.div animate={{ y: [0,-8,0], rotate: [-2,2,-2] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }} className="unity-loader-doge">
              <img src="/images/doge_avatar.png" alt="Loading" />
            </motion.div>
            <div className="unity-loader-boat" aria-hidden="true"><span>🚤</span><i /></div>
            <div className="unity-loader-copy"><p>Booting Doge Escape</p><h3>Loading Game...</h3></div>
            <div className="unity-loader-progress">
              <div className="unity-loader-track">
                <motion.div animate={{ width: `${loadingProgress}%` }}
                  transition={{ duration: 0.25, ease: 'easeOut' }} className="unity-loader-fill" />
              </div>
              <div className="unity-loader-percent"><span>Syncing blocks</span><strong>{loadingProgress}%</strong></div>
            </div>
          </div>
        </motion.div>
      )}
      {isExpanded && (
        <div className="mobile-rotate-overlay" aria-live="polite">
          <div className="mobile-rotate-backdrop" aria-hidden="true" />
          <div className="mobile-rotate-content">
            <div className="mobile-rotate-phone" aria-hidden="true">
              <span />
              <i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i /><i />
            </div>
            <h2>Rotate Your Device</h2>
            <p>Please rotate your device to landscape mode for the best gaming experience.</p>
          </div>
        </div>
      )}
      <canvas id="unity-canvas" width="1152" height="720"
        style={{ display: 'block', width: '100%', height: '100%' }} />
    </div>
  );
};

export default UnityGameFrame;
