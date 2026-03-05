import React from 'react';
import { ComparisonResult, StockData } from '../types';
import { Trophy, ArrowRight, ArrowLeft, Minus, Target, AlertTriangle } from 'lucide-react';
import AIScoreCard from './AIScoreCard';

interface Props {
  result: ComparisonResult;
  onStockSelect: (stock: StockData) => void;
  onBack: () => void;
}

const ComparisonView: React.FC<Props> = ({ result, onStockSelect, onBack }) => {
  const { stock1, stock2, winnerSymbol, comparisonPoints, verdictReasoning } = result;
  
  const winner = winnerSymbol === stock1.symbol ? stock1 : (winnerSymbol === stock2.symbol ? stock2 : null);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header & Back */}
      <div className="flex items-center gap-4">
        <button 
          onClick={onBack}
          className="p-2 bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-colors"
        >
          <ArrowRight className="w-5 h-5 rotate-180" /> {/* Rotated for RTL back button */}
        </button>
        <h2 className="text-2xl font-bold text-white">مقارنة شاملة: <span className="font-mono">{stock1.symbol}</span> vs <span className="font-mono">{stock2.symbol}</span></h2>
      </div>

      {/* Winner Banner */}
      {winner && (
        <div className="bg-gradient-to-r from-green-900/50 via-gray-900 to-transparent border border-green-500/30 p-6 relative overflow-hidden">
          <div className="absolute top-0 left-0 p-4 opacity-10">
            <Trophy className="w-32 h-32 text-green-400" />
          </div>
          <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center">
            <div className="bg-green-500/20 p-4 border border-green-500/50 shadow-lg shadow-green-500/20">
               <Trophy className="w-8 h-8 text-green-400" />
            </div>
            <div className="flex-1 text-center md:text-right">
              <h3 className="text-sm font-bold text-green-500 uppercase tracking-wider mb-1 font-mono">THE WINNER</h3>
              <p className="text-3xl font-bold text-white mb-2">{winner.symbol} - {winner.name}</p>
              <p className="text-gray-300 text-sm leading-relaxed max-w-2xl">
                {verdictReasoning}
              </p>
            </div>
            <div className="text-center">
               <span className="block text-xs text-gray-400 mb-1 font-mono">AI Score</span>
               <span className="text-4xl font-bold text-green-400 font-mono">{winner.aiScore}</span>
            </div>
          </div>
        </div>
      )}

      {/* Side by Side Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className={`relative ${winnerSymbol === stock1.symbol ? 'ring-2 ring-green-500/50' : ''}`}>
           {winnerSymbol === stock1.symbol && (
             <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-black text-xs font-bold px-3 py-1 flex items-center gap-1 z-10 shadow-lg">
               <Trophy className="w-3 h-3" /> الفائز
             </div>
           )}
           <AIScoreCard stock={stock1} rank={1} onStockSelect={onStockSelect} />
        </div>
        <div className={`relative ${winnerSymbol === stock2.symbol ? 'ring-2 ring-green-500/50' : ''}`}>
            {winnerSymbol === stock2.symbol && (
             <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-500 text-black text-xs font-bold px-3 py-1 flex items-center gap-1 z-10 shadow-lg">
               <Trophy className="w-3 h-3" /> الفائز
             </div>
           )}
           <AIScoreCard stock={stock2} rank={2} onStockSelect={onStockSelect} />
        </div>
      </div>

      {/* Comparison Table */}
      <div className="bg-gray-900/50 border border-gray-700 overflow-hidden mt-4">
        <div className="p-4 bg-black/30 border-b border-gray-700 font-bold text-white flex items-center gap-2">
            <Target className="w-5 h-5 text-amber-400" />
            جدول المقارنة التفصيلي
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right text-gray-300">
            <thead className="text-xs uppercase bg-black/20 text-gray-400 border-b border-gray-700/50">
              <tr>
                <th className="px-6 py-4 w-1/3">وجه المقارنة</th>
                <th className={`px-6 py-4 w-1/4 font-mono ${winnerSymbol === stock1.symbol ? 'text-green-400 font-bold' : 'text-white'}`}>
                  {stock1.symbol}
                </th>
                <th className="px-6 py-4 w-1/12 text-center text-[10px] text-gray-500">الأفضلية</th>
                <th className={`px-6 py-4 w-1/4 font-mono ${winnerSymbol === stock2.symbol ? 'text-green-400 font-bold' : 'text-white'}`}>
                  {stock2.symbol}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800/70">
              {comparisonPoints.map((point, idx) => {
                  const s1Win = point.advantage === 'stock1';
                  const s2Win = point.advantage === 'stock2';
                  
                  return (
                    <tr key={idx} className="hover:bg-gray-700/20 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-200">{point.metric}</td>
                      
                      {/* Stock 1 Value */}
                      <td className={`px-6 py-4 font-mono transition-colors ${s1Win ? 'text-green-400 font-bold bg-green-500/5' : ''}`}>
                        {point.stock1Value}
                      </td>
                      
                      {/* Advantage Indicator */}
                      <td className="px-6 py-4 text-center flex justify-center items-center">
                        {s1Win ? (
                            <ArrowRight className="w-5 h-5 text-green-500" /> 
                        ) : s2Win ? (
                             <ArrowLeft className="w-5 h-5 text-green-500" /> 
                        ) : (
                            <Minus className="w-4 h-4 text-gray-600" />
                        )}
                      </td>
                      
                      {/* Stock 2 Value */}
                      <td className={`px-6 py-4 font-mono transition-colors ${s2Win ? 'text-green-400 font-bold bg-green-500/5' : ''}`}>
                        {point.stock2Value}
                      </td>
                    </tr>
                  );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Disclaimers */}
      <div className="bg-yellow-900/10 border border-yellow-700/30 p-4 flex items-start gap-3 text-xs text-yellow-500/80">
          <AlertTriangle className="w-5 h-5 flex-shrink-0" />
          <p>
            هذه المقارنة مبنية على خوارزميات الذكاء الاصطناعي بناءً على أحدث البيانات المتاحة من السوق. الأداء السابق لا يضمن النتائج المستقبلية. يرجى مراجعة مستشارك المالي قبل اتخاذ القرار.
          </p>
      </div>
      
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default ComparisonView;