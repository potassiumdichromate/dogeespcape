import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import { useGame } from '../context/GameContext';
import { useWallet } from '../context/WalletContext';
import TopBarScene from './TopBarScene';
import AICompanionChat from './AICompanionChat';
import ItemVisual from './ItemVisual';

const ProfileHeader = ({ showBack }) => {
  const { coins, avatar, username, selectedCompanion } = useGame();
  const { disconnect } = useWallet();
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [showAiCompanion, setShowAiCompanion] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { label: 'Home',    path: '/Home',         icon: '🏠' },
    { label: 'Game',    path: '/play',          icon: '🎮' },
    { label: 'Market',  path: '/market',        iconImage: '/images/marketplace-icon-storefront.svg', iconAlt: 'Market' },
    { label: 'Ranks',   path: '/leaderboard',   icon: '🏆' },
    { label: '0G',      path: '/og-dashboard',  icon: '🛡️' },
    { label: 'Profile', path: '/profile',       icon: '👤' },
  ];

  const confirmDisconnect = () => {
    setShowDisconnectModal(false);
    disconnect();
    navigate('/');
  };

  return (
    <motion.header
      initial={{ y: -42, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="game-nav-shell relative z-50"
    >
      <TopBarScene />
      <div className="game-mobile-header game-compact-header relative z-10">
        <div className="game-mobile-main-row">
          <div className="game-mobile-player">
            {showBack && (
              <button
                type="button"
                onClick={() => navigate('/Home')}
                className="game-mobile-back"
                aria-label="Back to Home"
              >
                ←
              </button>
            )}
            <button type="button" onClick={() => navigate('/profile')} className="game-nav-avatar game-mobile-avatar" aria-label="Open profile">
              {avatar?.startsWith('/') ? <img src={avatar} alt="Profile" /> : <span>{avatar}</span>}
            </button>
            <button type="button" onClick={() => navigate('/profile')} className="game-mobile-player-name">
              {username}
            </button>
          </div>

          <div className="game-mobile-top-actions">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="game-mobile-menu-button"
              aria-label="Toggle menu"
            >
              <div className="flex flex-col items-center justify-center gap-[4px]">
                <span className={`block w-5 h-[2px] bg-doge-gold transition-all duration-300 ${mobileMenuOpen ? 'rotate-45 translate-y-[6px]' : ''}`} />
                <span className={`block w-5 h-[2px] bg-doge-gold transition-all duration-300 ${mobileMenuOpen ? 'opacity-0' : ''}`} />
                <span className={`block w-5 h-[2px] bg-doge-gold transition-all duration-300 ${mobileMenuOpen ? '-rotate-45 -translate-y-[6px]' : ''}`} />
              </div>
            </button>
            <button
              type="button"
              onClick={() => setShowDisconnectModal(true)}
              className="game-nav-disconnect game-mobile-disconnect"
              aria-label="Disconnect wallet"
              title="Disconnect wallet"
            >
              <span className="disconnect-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" focusable="false">
                  <path d="M9 5H5v14h4" />
                  <path d="M14 8l4 4-4 4" />
                  <path d="M18 12H8" />
                </svg>
              </span>
            </button>
          </div>
        </div>

        <div className="game-mobile-info-row">

          <button
            type="button"
            onClick={() => setShowAiCompanion(true)}
            className="game-nav-ai-button"
            aria-label="Open AI companion"
            title="AI Companion"
          >
            <ItemVisual item={selectedCompanion} className="text-2xl" imageClassName="h-6 w-6 object-contain" alt="AI Companion" />
          </button>
          <div className="game-nav-currency game-mobile-currency">
            <span>💰</span>
            <strong>{coins.toLocaleString()}</strong>
          </div>
          <div className="game-nav-currency game-mobile-currency">
            <span>💎</span>
            <strong>42</strong>
          </div>
        </div>
      </div>

      <div className="game-nav-brand game-desktop-nav relative z-10">
        {showBack && (
          <button type="button" onClick={() => navigate('/Home')} className="game-nav-back">
            ←
          </button>
        )}
        <button type="button" onClick={() => navigate('/profile')} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
          <div className="game-nav-avatar">
            {avatar?.startsWith('/') ? <img src={avatar} alt="Profile" /> : <span>{avatar}</span>}
          </div>
          <span className="game-nav-logo">
            {username}
          </span>
        </button>
      </div>

      {/* Desktop Navigation Links */}
      <nav className="game-nav-links game-desktop-nav relative z-10" aria-label="Game navigation">
        {navItems.map((item) => (
          <button
            key={item.path}
            type="button"
            onClick={() => navigate(item.path)}
            className={`game-nav-link ${location.pathname === item.path ? 'active' : ''}`}
          >
            {item.iconImage ? (
              <img src={item.iconImage} alt={item.iconAlt || item.label} className="game-nav-link-icon" />
            ) : (
              <span>{item.icon}</span>
            )}
            <span>{item.label}</span>
          </button>
        ))}
      </nav>

      <div className="game-nav-actions game-desktop-nav relative z-10">

        <button
          type="button"
          onClick={() => setShowAiCompanion(true)}
          className="game-nav-ai-button"
          aria-label="Open AI companion"
          title="AI Companion"
        >
          <ItemVisual item={selectedCompanion} className="text-2xl" imageClassName="h-6 w-6 object-contain" alt="AI Companion" />
        </button>
        <div className="game-nav-currency">
          <span>💰</span>
          <strong>{coins.toLocaleString()}</strong>
        </div>
        <div className="game-nav-currency">
          <span>💎</span>
          <strong>42</strong>
        </div>
      </div>

      <div className="game-nav-disconnect-slot game-desktop-nav relative z-10">
        <button
          type="button"
          onClick={() => setShowDisconnectModal(true)}
          className="game-nav-disconnect"
          aria-label="Disconnect wallet"
          title="Disconnect wallet"
        >
          <span className="disconnect-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" focusable="false">
              <path d="M9 5H5v14h4" />
              <path d="M14 8l4 4-4 4" />
              <path d="M18 12H8" />
            </svg>
          </span>
        </button>
      </div>

      {/* Mobile Dropdown Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="game-compact-dropdown absolute top-full left-0 w-full bg-doge-darker/95 backdrop-blur-md border-b-2 border-doge-coal/60 shadow-pixel-lg z-40"
          >
            <div className="flex flex-col p-4 gap-2 max-w-5xl mx-auto">
              {navItems.map((item) => (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    setMobileMenuOpen(false);
                  }}
                  className={`flex items-center gap-3 p-3 rounded-lg border border-transparent transition-all duration-200 ${
                    location.pathname === item.path 
                      ? 'bg-doge-gold/20 border-doge-gold/50 text-doge-gold' 
                      : 'text-doge-iron hover:bg-doge-gold/10 hover:text-doge-gold'
                  }`}
                >
                  {item.iconImage ? (
                    <img src={item.iconImage} alt={item.iconAlt || item.label} className="game-mobile-menu-icon" />
                  ) : (
                    <span className="text-xl">{item.icon}</span>
                  )}
                  <span className="font-heading text-sm">{item.label}</span>
                </button>
              ))}
              
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showAiCompanion && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-3 py-5 sm:px-5"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAiCompanion(false)}
          >
            <motion.div
              initial={{ scale: 0.9, y: 24, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.94, y: 12, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 240, damping: 22 }}
              className="ai-companion-modal"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="ai-companion-modal-bar">
                <div>
                  <p>AI Companion</p>
                  <strong>Open comms from anywhere</strong>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAiCompanion(false)}
                  aria-label="Close AI companion"
                >
                  ×
                </button>
              </div>
              <div className="ai-companion-modal-body">
                <AICompanionChat />
              </div>
            </motion.div>
          </motion.div>
        )}

        {showDisconnectModal && (
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.86, y: 24, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.92, y: 12, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 250, damping: 20 }}
              className="disconnect-modal panel-dark w-full max-w-md p-5 text-center"
            >
              <motion.div
                animate={{ rotate: [-6, 6, -6] }}
                transition={{ duration: 1.2, repeat: Infinity, ease: 'easeInOut' }}
                className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-lg border-2 border-doge-redstone bg-doge-darker text-3xl shadow-pixel"
              >
                🛡️
              </motion.div>
              <h3 className="text-xl text-doge-gold text-shadow-pixel">Disconnect Wallet?</h3>
              <p className="mt-2 text-sm text-doge-iron">
                Your session will end and you will return to the landing page.
              </p>
              <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setShowDisconnectModal(false)}
                  className="btn-secondary flex-1 text-sm"
                >
                  Stay Connected
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.96 }}
                  onClick={confirmDisconnect}
                  className="btn-danger flex-1 text-sm"
                >
                  Disconnect
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default ProfileHeader;
