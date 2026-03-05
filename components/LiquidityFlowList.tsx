import React from 'react';
import { LiquidityFlowData, GroundingSource } from '../types';
// Fix: Import Info icon from lucide-react
import { RefreshCw, Loader2, DollarSign, ExternalLink, Clock, Info } from 'lucide-react';

interface Props {
  data: LiquidityFlowData[];
  timeframe: 'daily' | 'monthly' | 'yearly';
  onRefresh: (timeframe: 'daily' | 'monthly' | 'yearly') => void;
  loading: boolean;
  sources?: GroundingSource[]; // Optional sources to display
}

const LiquidityFlowList: React.FC<Props> = ({ data, timeframe, onRefresh, loading, sources }) => {
  const getTableHeader = (tf: typeof timeframe) => {
    switch (tf) {
      case 'daily': return 'تدفق السيولة اليومي';
      case 'monthly': return 'تدفق السيولة الشهري';
      case 'yearly': return 'تدفق السيولة السنوي';
    }
  };

  const formatTimestamp = (timestamp?: string) => {
    if (!timestamp) return null;
    try {
      return new Date(timestamp).toLocaleString('ar-EG', {
        day: 'numeric',
        month: 'long',
        hour: 'numeric',
        minute: '2-digit',
      });
    } catch (e) {
      return null;
    }
  };

  return (
    <div className="overflow-x-auto border border-gray-700 bg-gray-900/50 backdrop-blur-sm">
      <div className="p-4 bg-black/30 border-b border-gray-700 flex items-center justify-between">
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-green-400" />
          {getTableHeader(timeframe)}
        </h3>
        <button 
          onClick={() => onRefresh(timeframe)}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-1.5 border border-amber-500 bg-black hover:bg-amber-500 text-amber-500 hover:text-black transition-all duration-200 text-xs font-bold font-mono uppercase disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
          تحديث
        </button>
      </div>
      
      {data.length === 0 && !loading && (
        <div className="text-center py-10 text-gray-500">
          <p>لا توجد بيانات تدفق سيولة متاحة حالياً لهذا الإطار الزمني.</p>
        </div>
      )}

      {data.length > 0 && (
        <table className="w-full text-sm text-right text-gray-300">
          <thead className="text-xs uppercase bg-black/30 text-gray-400 font-sans">
            <tr>
              <th scope="col" className="px-4 py-3">السهم</th>
              <th scope="col" className="px-4 py-3">السعر</th>
              <th scope="col" className="px-4 py-3">التغير اليومي %</th>
              <th scope="col" className="px-4 py-3">نقطة السيولة (0-100)</th>
              <th scope="col" className="px-4 py-3">السبب</th>
              <th scope="col" className="px-4 py-3">البيانات بتاريخ</th>
            </tr>
          </thead>
          <tbody>
            {data.map((stock, index) => {
              const isPositiveChange = stock.changePercent >= 0;
              return (
                <tr key={index} className="border-b border-gray-800/70 hover:bg-gray-700/30 transition-colors group">
                  <td className="px-4 py-4 font-bold text-white">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-1.5 font-mono">
                          <span>{stock.symbol}</span>
                          {stock.sourceUri && (
                              <a href={stock.sourceUri} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" title="عرض المصدر">
                                  <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                          )}
                      </div>
                      <span className="text-[11px] text-gray-400 font-sans font-normal truncate max-w-24">{stock.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 font-mono font-bold text-white">{stock.currentPrice.toFixed(2)}</td>
                  <td className={`px-4 py-4 font-mono font-bold ${isPositiveChange ? 'text-green-400' : 'text-red-400'}`}>
                      {isPositiveChange ? '+' : ''}{stock.changePercent.toFixed(2)}%
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                        <span className="font-bold font-mono text-green-400">{stock.liquidityScore}</span>
                        <div className="w-16 h-1.5 bg-gray-700 overflow-hidden">
                            <div 
                                className="h-full bg-green-500" 
                                style={{ width: `${stock.liquidityScore}%`}}
                            ></div>
                        </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-gray-400 leading-relaxed max-w-xs">{stock.reasoning}</td>
                  <td className="px-4 py-4 text-xs text-gray-500 font-mono">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3"/>
                      <span>{formatTimestamp(stock.dataTimestamp)}</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      
      {sources && sources.length > 0 && (
        <div className="mt-4 bg-gray-900/50 border-t border-gray-800 p-4">
          <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
            <ExternalLink className="w-4 h-4 text-amber-500" />
            مصادر البيانات
          </h4>
          <div className="flex flex-wrap gap-2 font-mono">
            {sources.map((source, idx) => (
              <a key={idx} href={source.uri} target="_blank" rel="noopener noreferrer"
                className="text-[10px] bg-gray-800 hover:bg-gray-700 text-amber-400 px-3 py-1.5 transition-colors truncate max-w-[200px]" >
                {source.title}
              </a>
            ))}
          </div>
        </div>
      )}

      {!loading && data.length > 0 && (
        <div className="bg-gray-900/50 p-4 mt-4 flex items-start gap-3 text-xs text-gray-400 border-t border-gray-800">
          <Info className="w-5 h-5 flex-shrink-0 text-green-500" />
          <div>
            <strong className="block text-gray-300 mb-1 font-semibold">كيف يتم حساب نقطة السيولة؟</strong>
            تعتمد نقطة السيولة على تحليل حجم التداول، اتجاه السعر، ومؤشرات السيولة النسبية خلال الإطار الزمني المحدد (يومي/شهري/سنوي). تشير النتيجة الأعلى إلى تدفق سيولة شرائية أقوى.
          </div>
        </div>
      )}
    </div>
  );
};

export default LiquidityFlowList;