import React from 'react';
import { StockData } from '../types';
import { TrendingUp, TrendingDown, Minus, RefreshCw, Loader2, ExternalLink } from 'lucide-react';

interface Props {
  data: StockData[];
  onStockSelect: (stock: StockData) => void;
  onRefreshStock: (symbol: string) => void;
  refreshingSymbol: string | null;
}

const StockTable: React.FC<Props> = ({ data, onStockSelect, onRefreshStock, refreshingSymbol }) => {
  const getDecisionColor = (decision: string) => {
    switch (decision.toLowerCase()) {
      case 'buy': return 'bg-green-500/10 text-green-400 border-green-500/30';
      case 'sell': return 'bg-red-500/10 text-red-400 border-red-500/30';
      default: return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
    }
  };

  const getDecisionLabel = (decision: string) => {
    switch (decision.toLowerCase()) {
        case 'buy': return 'شراء';
        case 'sell': return 'بيع';
        default: return 'احتفاظ';
    }
  }

  return (
    <div className="overflow-x-auto border border-gray-700 bg-gray-900/50 backdrop-blur-sm">
      <table className="w-full text-sm text-right text-gray-300">
        <thead className="text-xs uppercase bg-black/30 text-gray-400 font-sans">
          <tr>
            <th scope="col" className="px-4 py-3">السهم</th>
            <th scope="col" className="px-4 py-3">السعر</th>
            <th scope="col" className="px-4 py-3">التغير</th>
            <th scope="col" className="px-4 py-3">الاتجاه</th>
            <th scope="col" className="px-4 py-3">RSI</th>
            <th scope="col" className="px-4 py-3">الحجم %</th>
            <th scope="col" className="px-4 py-3">دخول</th>
            <th scope="col" className="px-4 py-3 text-red-400">وقف خسارة</th>
            <th scope="col" className="px-4 py-3 text-green-400">هدف 1</th>
            <th scope="col" className="px-4 py-3 text-green-400">هدف 2</th>
            <th scope="col" className="px-4 py-3">القوة /10</th>
            <th scope="col" className="px-4 py-3 text-center">القرار</th>
            <th scope="col" className="px-2 py-3"><span className="sr-only">تحديث</span></th>
          </tr>
        </thead>
        <tbody>
          {data.map((stock, index) => {
            const isPositive = stock.change >= 0;
            return (
              <tr 
                  key={index} 
                  className="border-b border-gray-800/70 hover:bg-gray-700/30 transition-colors group cursor-pointer"
                  onClick={() => onStockSelect(stock)}
              >
                <td className="px-4 py-4 font-bold text-white">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-1.5 font-mono">
                        <span>{stock.symbol}</span>
                        {stock.sourceUri && (
                            <a href={stock.sourceUri} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="text-gray-500 hover:text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" title="عرض المصدر">
                                <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                        )}
                    </div>
                    <span className="text-[11px] text-gray-400 font-sans font-normal truncate max-w-24">{stock.name}</span>
                  </div>
                </td>
                <td className="px-4 py-4 font-mono font-bold text-white">{stock.currentPrice.toFixed(2)}</td>
                <td className={`px-4 py-4 font-mono font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    <div className="flex flex-col">
                        <span>{isPositive ? '+' : ''}{stock.change.toFixed(2)}</span>
                        <span className="text-xs">({stock.changePercent.toFixed(2)}%)</span>
                    </div>
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-1 font-sans">
                    {stock.trend.includes('Up') || stock.trend.includes('Bull') || stock.trend.includes('صاعد') ? (
                      <TrendingUp className="w-4 h-4 text-green-400" />
                    ) : stock.trend.includes('Down') || stock.trend.includes('Bear') || stock.trend.includes('هابط') ? (
                      <TrendingDown className="w-4 h-4 text-red-400" />
                    ) : (
                      <Minus className="w-4 h-4 text-yellow-400" />
                    )}
                    <span>{stock.trend}</span>
                  </div>
                </td>
                <td className="px-4 py-4 font-mono">{stock.rsi.toFixed(1)}</td>
                <td className="px-4 py-4 font-mono">{stock.volumeRatio.toFixed(1)}x</td>
                <td className="px-4 py-4 font-mono text-amber-300">{stock.entryPoint.toFixed(2)}</td>
                <td className="px-4 py-4 font-mono text-red-400">{stock.stopLoss.toFixed(2)}</td>
                <td className="px-4 py-4 font-mono text-green-400">{stock.target1.toFixed(2)}</td>
                <td className="px-4 py-4 font-mono text-green-300">{stock.target2.toFixed(2)}</td>
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                      <span className="font-bold font-mono">{stock.signalStrength}</span>
                      <div className="w-16 h-1.5 bg-gray-700 overflow-hidden">
                          <div 
                              className="h-full bg-amber-500" 
                              style={{ width: `${stock.signalStrength * 10}%`}}
                          ></div>
                      </div>
                  </div>
                </td>
                <td className="px-4 py-4 text-center">
                  <span className={`px-3 py-1 text-xs font-bold border ${getDecisionColor(stock.decision)}`}>
                    {getDecisionLabel(stock.decision)}
                  </span>
                </td>
                <td className="px-2 py-4">
                  <button
                      onClick={(e) => {
                          e.stopPropagation();
                          onRefreshStock(stock.symbol);
                      }}
                      disabled={!!refreshingSymbol}
                      className="p-1 text-gray-500 hover:text-amber-400 hover:bg-gray-700 transition-colors disabled:cursor-wait disabled:opacity-30"
                      title={`تحديث بيانات ${stock.symbol}`}
                  >
                      {refreshingSymbol === stock.symbol ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                          <RefreshCw className="w-4 h-4" />
                      )}
                  </button>
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  );
};

export default StockTable;