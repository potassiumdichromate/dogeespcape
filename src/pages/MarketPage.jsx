import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../context/GameContext';
import ProfileHeader from '../components/ProfileHeader';
import ItemDetailsModal from '../components/ItemDetailsModal';
import MarketTreasuryScene from '../components/MarketTreasuryScene';
import ItemVisual from '../components/ItemVisual';

const MarketCard = ({ item, type, onBuy, onRent, userCoins, onClick }) => {
  const isOwned = item.owned;
  const canAfford = userCoins >= item.price;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      onClick={onClick}
      className="panel-dark p-4 rounded-xl border-2 border-doge-coal shadow-pixel flex flex-col items-center text-center gap-3 cursor-pointer group"
    >
      <div className="absolute top-2 right-2 text-doge-iron opacity-0 group-hover:opacity-100 transition-opacity">
        ⓘ
      </div>
      <div className="text-5xl mb-2 drop-shadow-lg h-16 w-16 flex items-center justify-center">
        <ItemVisual item={item} imageClassName="h-16 w-16 object-contain" />
      </div>
      <h3 className="text-lg font-bold text-doge-gold leading-tight">{item.name}</h3>
      
      {/* Stats */}
      <div className="w-full space-y-1 text-[10px] md:text-xs">
        {type === 'boats' && (
          <>
            <div className="flex justify-between border-b border-doge-coal pb-1">
              <span className="text-doge-iron">Speed</span>
              <span className="text-doge-emerald font-bold">{item.speed}</span>
            </div>
            <div className="flex justify-between border-b border-doge-coal pb-1">
              <span className="text-doge-iron">Health</span>
              <span className="text-doge-emerald font-bold">{item.health}</span>
            </div>
          </>
        )}
        {type === 'companions' && (
          <>
            <div className="flex justify-between border-b border-doge-coal pb-1">
              <span className="text-doge-iron">Skill</span>
              <span className="text-doge-gold">{item.ability}</span>
            </div>
            <div className="flex justify-between border-b border-doge-coal pb-1">
              <span className="text-doge-iron">Damage</span>
              <span className="text-doge-redstone font-bold">{item.damage}</span>
            </div>
          </>
        )}
        {type === 'guns' && (
          <>
            <div className="flex justify-between border-b border-doge-coal pb-1">
              <span className="text-doge-iron">Damage</span>
              <span className="text-doge-redstone font-bold">{item.damage}</span>
            </div>
            <div className="flex justify-between border-b border-doge-coal pb-1">
              <span className="text-doge-iron">Accuracy</span>
              <span className="text-doge-emerald font-bold">{item.accuracy}%</span>
            </div>
          </>
        )}
      </div>

      <div className="mt-auto w-full pt-2">
        {isOwned ? (
          <div className="w-full py-2 bg-doge-coal/40 text-doge-iron text-sm font-bold rounded-lg border-2 border-doge-coal italic">
            ALREADY OWNED
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <button
              onClick={(e) => { e.stopPropagation(); onBuy(type.slice(0, -1), item.id); }}
              disabled={!canAfford}
              className={`w-full py-2 rounded-lg font-bold text-xs flex items-center justify-center gap-2 shadow-pixel transition-all ${
                canAfford 
                  ? 'bg-doge-gold text-doge-darker hover:scale-105 active:scale-95' 
                  : 'bg-gray-600 text-gray-400 cursor-not-allowed opacity-50'
              }`}
            >
              <span>💰</span> Buy for {item.price}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onRent(type.slice(0, -1), item.id); }}
              disabled={userCoins < item.rentPrice}
              className="w-full py-1.5 bg-doge-wood/40 border-2 border-doge-wood text-doge-stone text-[10px] font-bold rounded-lg hover:bg-doge-wood/60 transition-colors"
            >
              Rent for {item.rentPrice}/day
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

const MarketPage = () => {
  const { boats, companions, guns, buyItem, rentItem, coins } = useGame();
  const [activeTab, setActiveTab] = useState('all');
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedType, setSelectedType] = useState(null);

  const tabs = [
    { 
      id: 'all', 
      label: 'All Items', 
      icon: '🌟', 
      data: [
        ...boats.map(b => ({ ...b, category: 'boats' })),
        ...companions.map(c => ({ ...c, category: 'companions' })),
        ...guns.map(g => ({ ...g, category: 'guns' }))
      ]
    },
    { 
      id: 'purchased', 
      label: 'My Collection', 
      icon: '🎒', 
      data: [
        ...boats.filter(b => b.owned).map(b => ({ ...b, category: 'boats' })),
        ...companions.filter(c => c.owned).map(c => ({ ...c, category: 'companions' })),
        ...guns.filter(g => g.owned).map(g => ({ ...g, category: 'guns' }))
      ]
    },
    { id: 'boats', label: 'Boats', icon: '🚤', data: boats.map(b => ({ ...b, category: 'boats' })) },
    { id: 'companions', label: 'AI Companions', icon: '🤖', data: companions.map(c => ({ ...c, category: 'companions' })) },
    { id: 'guns', label: 'Guns', icon: '🔫', data: guns.map(g => ({ ...g, category: 'guns' })) },
  ];

  const activeTabData = tabs.find(t => t.id === activeTab);

  return (
    <div className="screen-page market-screen min-h-screen bg-doge-darker p-3 md:p-4 lg:p-6 relative overflow-x-hidden">
      <MarketTreasuryScene />
      <div className="max-w-[1920px] mx-auto w-full flex flex-col min-h-screen relative z-10">
        <ProfileHeader />

          <div className="flex-1 flex flex-col mt-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
              <div>
                <h1 className="text-3xl md:text-4xl text-doge-gold font-bold text-shadow-pixel flex items-center gap-3">
                  <img src="/images/marketplace-icon-storefront.svg" alt="" className="market-title-icon" /> DOGE MARKET
                </h1>
                <p className="text-doge-iron text-sm md:text-base">Upgrade your gear and dominate the waters.</p>
              </div>
              
              <div className="panel-wood px-6 py-3 rounded-xl shadow-pixel flex items-center gap-4">
                <span className="text-doge-iron font-bold uppercase tracking-wider text-xs">Your Balance</span>
                <div className="flex items-center gap-2 text-2xl font-bold text-doge-gold">
                  <span>💰</span> {coins.toLocaleString()}
                </div>
              </div>
            </div>

            {/* Market Layout */}
            <div className="flex flex-col lg:flex-row gap-6 flex-1">
              {/* Sidebar Tabs */}
              <div className="lg:w-64 flex flex-row lg:flex-col gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 lg:flex-none flex items-center justify-center lg:justify-start gap-3 px-4 py-4 rounded-xl border-2 transition-all font-bold ${
                      activeTab === tab.id
                        ? 'bg-doge-gold text-doge-darker border-doge-gold shadow-glow'
                        : 'panel-dark border-doge-coal text-doge-iron hover:border-doge-gold/50'
                    }`}
                  >
                    <span className="text-2xl">{tab.icon}</span>
                    <span className="hidden sm:inline-block">{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Grid Content */}
              <div className="flex-1 panel-wood p-4 md:p-6 rounded-2xl shadow-pixel min-h-[500px] relative">
                {/* Coming Soon overlay */}
                <div className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-black/15 backdrop-blur-[1.5px] pointer-events-auto">
                  <div className="coming-soon-badge relative">
                    <div className="coming-soon-badge-glow" />
                    <div className="coming-soon-badge-inner relative overflow-hidden rounded-xl border-2 border-yellow-400/50 bg-black/50 px-8 py-4 backdrop-blur-xl">
                      <div className="coming-soon-shimmer" />
                      <p className="relative z-10 font-pixel text-base tracking-[0.3em] text-yellow-300 drop-shadow-[0_0_18px_rgba(255,200,0,0.6)] sm:text-xl md:text-2xl">
                        COMING SOON
                      </p>
                    </div>
                  </div>
                </div>

                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeTab}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                  >
                    {activeTabData.data.map((item) => (
                      <MarketCard
                        key={`${item.category}-${item.id}`}
                        item={item}
                        type={item.category}
                        onBuy={buyItem}
                        onRent={rentItem}
                        userCoins={coins}
                        onClick={() => {
                          setSelectedItem(item);
                          setSelectedType(item.category);
                        }}
                      />
                    ))}
                  </motion.div>
                </AnimatePresence>
                
                {activeTabData.data.length === 0 && (
                  <div className="h-full flex flex-col items-center justify-center text-doge-iron opacity-50 space-y-4 pt-20">
                      <span className="text-6xl">{activeTab === 'purchased' ? '📦' : '🏜️'}</span>
                      <p className="text-xl">
                        {activeTab === 'purchased' 
                          ? "You haven't purchased anything yet!" 
                          : "Nothing here yet..."}
                      </p>
                      {activeTab === 'purchased' && (
                        <button 
                          onClick={() => setActiveTab('all')}
                          className="text-doge-gold hover:underline font-bold"
                        >
                          Go shopping!
                        </button>
                      )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      {/* Item Details Modal */}
      <AnimatePresence>
        {selectedItem && (
          <ItemDetailsModal
            item={selectedItem}
            itemType={selectedType}
            onClose={() => {
              setSelectedItem(null);
              setSelectedType(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default MarketPage;
