import React from 'react';
import { MarketInsights } from '../types';
import { TrendingUp, TrendingDown, Minus, Key } from 'lucide-react';

declare global {
  interface Window {
    aistudio?: {
      openSelectKey: () => Promise<void>;
      hasSelectedApiKey: () => Promise<boolean>;
    };
  }
}

interface Props {
  marketCondition: MarketInsights | null;
}

const Header: React.FC<Props> = ({ marketCondition }) => {
  const getSentimentInfo = (sentiment: MarketInsights['sentiment']) => {
    switch (sentiment) {
      case 'Bullish': return { Icon: TrendingUp, color: 'text-green-500' };
      case 'Bearish': return { Icon: TrendingDown, color: 'text-red-500' };
      default: return { Icon: Minus, color: 'text-yellow-500' };
    }
  };

  const handleKeySelect = async () => {
    if (window.aistudio && typeof window.aistudio.openSelectKey === 'function') {
      await window.aistudio.openSelectKey();
    } else {
      console.warn("API Key selection is only available within the AI Studio environment.");
    }
  };

  const sentimentInfo = marketCondition ? getSentimentInfo(marketCondition.sentiment) : null;

  return (
    <header className="bg-black/50 border-b-2 border-gray-800 sticky top-0 z-40">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 border-2 border-[#D4AF37] bg-black flex items-center justify-center">
            <h1 className="text-xl font-bold text-[#D4AF37] tracking-tighter font-mono">EAX</h1>
          </div>
          <div>
            <h1 className="text-lg font-bold text-white uppercase tracking-widest leading-none">EGX AI Trading Desk</h1>
            <p className="text-[10px] text-gray-500 font-mono mt-1">Institutional Analysis Platform</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4 md:gap-8">
          {marketCondition && sentimentInfo && (
            <div className="hidden lg:flex items-center gap-6 text-right">
               <div>
                  <p className="text-[10px] text-gray-500 font-mono uppercase">EGX30 Index</p>
                  <p className="text-sm font-semibold text-white font-mono">{marketCondition.marketIndexStatus}</p>
               </div>
               <div className="w-px h-8 bg-gray-700"></div>
               <div>
                  <p className="text-[10px] text-gray-500 font-mono uppercase">Sentiment</p>
                  <div className="flex items-center justify-end gap-2">
                      <sentimentInfo.Icon className={`w-3 h-3 ${sentimentInfo.color}`} />
                      <p className={`text-sm font-semibold font-mono ${sentimentInfo.color}`}>{marketCondition.sentiment.toUpperCase()}</p>
                  </div>
               </div>
            </div>
          )}

          <div className="flex items-center gap-2">
            <button 
              onClick={handleKeySelect}
              className="flex items-center gap-2 px-3 py-1.5 border border-[#D4AF37] bg-black hover:bg-[#D4AF37] text-[#D4AF37] hover:text-black transition-all duration-200 text-[10px] font-bold font-mono uppercase tracking-tighter shadow-[0_0_10px_rgba(212,175,55,0.1)]"
            >
              <Key className="w-3 h-3" />
              <span className="hidden sm:inline">API MGMT</span>
              <span className="sm:hidden">KEY</span>
            </button>
            
            <div className="text-[10px] text-green-400 bg-green-900/20 border border-green-800/50 px-2 py-1.5 hidden sm:flex items-center gap-1.5 font-mono">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
              <span className="tracking-tighter uppercase">Live</span>
            </div>
          </div>
        </div>
      </div>
      <div className="h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent opacity-30"></div>
    </header>
  );
};

export default Header;