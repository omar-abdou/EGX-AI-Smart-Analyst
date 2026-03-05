import React from 'react';
import { StockData } from '../types';

interface Props {
  stock: StockData;
  rank: number;
  onStockSelect: (stock: StockData) => void;
}

const AIScoreCard: React.FC<Props> = ({ stock, rank, onStockSelect }) => {
  const isPositive = stock.change >= 0;
  return (
    <div 
      className="relative group bg-gray-900/50 border border-gray-700 p-4 hover:border-amber-500/50 transition-all duration-300 cursor-pointer flex flex-col justify-between"
      onClick={() => onStockSelect(stock)}
    >
      <div className="absolute -top-3 -right-3 w-8 h-8 bg-amber-600 text-black flex items-center justify-center font-bold shadow-lg font-mono">
        {rank}
      </div>
      
      <div>
        <div className="flex justify-between items-start mb-2">
          <div>
              <h3 className="text-lg font-bold text-white font-mono">{stock.symbol}</h3>
              <p className="text-xs text-gray-400 mt-1 truncate max-w-36 font-sans">{stock.name}</p>
          </div>
          <div className="text-right">
              <div className="text-xs text-gray-400 mb-1 font-mono">AI Score</div>
              <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-amber-400 font-mono">
                  {stock.aiScore}
              </div>
          </div>
        </div>

        <div className="flex justify-between items-baseline mb-4">
            <span className="text-2xl font-bold font-mono text-white">{stock.currentPrice.toFixed(2)}</span>
            <span className={`text-sm font-bold font-mono ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                {isPositive ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
            </span>
        </div>

        <div className="space-y-2 mb-4">
           <div className="flex justify-between text-xs font-mono">
              <span className="text-gray-500">الزخم (30%)</span>
               <div className="w-2/3 h-1.5 bg-gray-700 mt-1.5">
                  <div className="h-full bg-green-500" style={{ width: `${Math.min(100, stock.rsi > 50 ? (stock.rsi-50)*5 : 0 )}%` }}></div>
              </div>
          </div>
          <div className="flex justify-between text-xs font-mono">
              <span className="text-gray-500">الاتجاه (25%)</span>
               <div className="w-2/3 h-1.5 bg-gray-700 mt-1.5">
                  <div className="h-full bg-amber-500" style={{ width: `${stock.signalStrength*10}%` }}></div>
              </div>
          </div>
           <div className="flex justify-between text-xs font-mono">
              <span className="text-gray-500">الحجم (20%)</span>
               <div className="w-2/3 h-1.5 bg-gray-700 mt-1.5">
                   <div className="h-full bg-red-500" style={{ width: `${Math.min(100, stock.volumeRatio * 20)}%` }}></div>
              </div>
          </div>
        </div>
      </div>
      
      <div>
        <div className="mt-3 pt-3 border-t border-gray-700/50 text-xs text-gray-300 leading-relaxed truncate font-sans">
          {stock.reasoning || "مطابق لمعايير الفلترة الفنية والمالية بدقة عالية."}
        </div>
        
        <div className="mt-4 grid grid-cols-2 gap-2 text-center">
            <div className="bg-black/40 p-1">
                <span className="block text-[10px] text-gray-500 font-mono">دخول</span>
                <span className="text-amber-400 font-mono font-bold">{stock.entryPoint.toFixed(2)}</span>
            </div>
            <div className="bg-black/40 p-1">
                <span className="block text-[10px] text-gray-500 font-mono">هدف أول</span>
                <span className="text-green-400 font-mono font-bold">{stock.target1.toFixed(2)}</span>
            </div>
        </div>
      </div>
    </div>
  );
};

export default AIScoreCard;