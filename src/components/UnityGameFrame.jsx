import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';

const UnityGameFrame = ({ isExpanded = false, onToggleExpanded }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const unityInstanceRef = useRef(null);

  // R2 Bucket URL - set this in your .env file
  const UNITY_BUILD_URL = import.meta.env.VITE_UNITY_BUILD_URL || 'https://your-r2-bucket.r2.dev';

  useEffect(() => {
    const script = document.createElement('script');
    script.src = `${UNITY_BUILD_URL}/build3/doge.loader.js`;
    
    script.onload = () => {
      const canvas = document.querySelector("#unity-canvas");
      
      createUnityInstance(canvas, {
        dataUrl: `${UNITY_BUILD_URL}/build3/doge.data`,
        frameworkUrl: `${UNITY_BUILD_URL}/build3/doge.framework.js`,
        codeUrl: `${UNITY_BUILD_URL}/build3/doge.wasm`,
        streamingAssetsUrl: `${UNITY_BUILD_URL}/StreamingAssets`,
        companyName: "Kult Games",
        productName: "doge escape",
        productVersion: "1.0.5",
      }, (progress) => {
        setLoadingProgress(Math.round(progress * 100));
      }).then((unityInstance) => {
        unityInstanceRef.current = unityInstance;
        setIsLoading(false);
        console.log("✅ Unity loaded from R2!");
      }).catch((error) => {
        console.error("❌ Unity loading error:", error);
        setIsLoading(false);
      });
    };

    script.onerror = () => {
      console.error("❌ Failed to load Unity loader from R2");
      setIsLoading(false);
    };

    document.body.appendChild(script);

    return () => {
      if (unityInstanceRef.current) {
        unityInstanceRef.current.Quit();
      }
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, [UNITY_BUILD_URL]);

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
            <span />
            <span />
          </span>
        </button>
      )}

      {/* Loading Screen */}
      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="unity-loading-scene absolute inset-0 flex flex-col items-center justify-center bg-doge-coal z-10"
        >
          <div className="unity-loader-card">
            <div className="unity-loader-orbit" aria-hidden="true">
              <span>💰</span>
              <span>💎</span>
              <span>⚡</span>
            </div>

            <motion.div
              animate={{ y: [0, -8, 0], rotate: [-2, 2, -2] }}
              transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
              className="unity-loader-doge"
            >
              <img src="/images/doge_avatar.png" alt="Doge pilot loading" />
            </motion.div>

            <div className="unity-loader-boat" aria-hidden="true">
              <span>🚤</span>
              <i />
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

      {/* Unity Canvas - Fixed 960x600 */}
      <canvas 
        id="unity-canvas"
        width="1152"
        height="720"
        style={{ 
          display: 'block',
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
};

export default UnityGameFrame;
