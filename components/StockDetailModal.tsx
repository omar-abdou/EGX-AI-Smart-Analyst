import React, { useEffect } from 'react';
import { StockData } from '../types';
import { X, TrendingUp, TrendingDown, Target, ShieldAlert, CheckCircle, BarChart, Zap, BrainCircuit, LineChart, Clock, ExternalLink } from 'lucide-react';

interface Props {
  stock: StockData;
  onClose: () => void;
}

const StockDetailModal: React.FC<Props> = ({ stock, onClose }) => {
  useEffect(() => {
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const getDecisionInfo = (decision: string) => {
    switch (decision.toLowerCase()) {
      case 'buy': return {
        label: 'شراء',
        Icon: CheckCircle,
        color: 'text-green-400',
        bgColor: 'bg-green-500/10'
      };
      case 'sell': return {
        label: 'بيع',
        Icon: TrendingDown,
        color: 'text-red-400',
        bgColor: 'bg-red-500/10'
      };
      default: return {
        label: 'احتفاظ',
        Icon: BarChart,
        color: 'text-yellow-400',
        bgColor: 'bg-yellow-500/10'
      };
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

  const decisionInfo = getDecisionInfo(stock.decision);
  const isPositive = stock.change >= 0;
  const formattedDate = formatTimestamp(stock.dataTimestamp);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div
        className="relative w-full max-w-2xl bg-gray-900 border border-gray-700 shadow-2xl shadow-amber-900/20 m-4 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-gray-500 hover:text-white transition-colors"
          aria-label="إغلاق"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Header */}
        <div className="p-6 border-b border-gray-800">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-white font-mono">{stock.symbol}</h2>
              <p className="text-sm text-gray-400">{stock.name}</p>
            </div>
            <div className="text-right">
                <p className="text-3xl font-bold font-mono text-white">{stock.currentPrice.toFixed(2)}</p>
                <p className={`font-mono font-bold ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
                    {isPositive ? '+' : ''}{stock.change.toFixed(2)} ({stock.changePercent.toFixed(2)}%)
                </p>
                {formattedDate && (
                  <p className="text-xs text-gray-500 mt-1 flex items-center justify-end gap-1 font-mono">
                    <Clock className="w-3 h-3"/>
                    <span>البيانات بتاريخ: {formattedDate}</span>
                  </p>
                )}
                {stock.sourceUri && (
                  <a href={stock.sourceUri} target="_blank" rel="noopener noreferrer" className="text-xs text-amber-400 hover:underline mt-1 flex items-center justify-end gap-1 font-mono">
                      <ExternalLink className="w-3 h-3"/>
                      <span>مصدر البيانات</span>
                  </a>
                )}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="p-6 max-h-[70vh] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* AI Analysis */}
            <div className="bg-black/30 p-4 border border-gray-700/50 col-span-1 md:col-span-2">
              <div className="flex justify-between items-center mb-2">
                <h3 className="text-sm font-bold text-amber-400 flex items-center gap-2">
                  <BrainCircuit className="w-4 h-4" />
                  تحليل الذكاء الاصطناعي
                </h3>
                <div className={`px-3 py-1 flex items-center gap-2 text-xs font-bold ${decisionInfo.bgColor} ${decisionInfo.color}`}>
                    <decisionInfo.Icon className="w-4 h-4" />
                    <span>{decisionInfo.label}</span>
                </div>
              </div>
              <p className="text-base text-gray-200 leading-loose">
                {stock.reasoning}
              </p>
            </div>

            {/* Trading Plan */}
            <div className="bg-black/30 p-4 border border-gray-700/50">
              <h3 className="text-sm font-bold text-amber-400 mb-4">خطة التداول</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400 flex items-center gap-2"><CheckCircle className="w-4 h-4 text-amber-300"/>نقطة الدخول</span>
                  <span className="font-mono font-bold text-amber-300">{stock.entryPoint.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400 flex items-center gap-2"><ShieldAlert className="w-4 h-4 text-red-400"/>وقف الخسارة</span>
                  <span className="font-mono font-bold text-red-400">{stock.stopLoss.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400 flex items-center gap-2"><Target className="w-4 h-4 text-green-400"/>هدف أول</span>
                  <span className="font-mono font-bold text-green-400">{stock.target1.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400 flex items-center gap-2"><Target className="w-4 h-4 text-green-300"/>هدف ثاني</span>
                  <span className="font-mono font-bold text-green-300">{stock.target2.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Key Metrics */}
            <div className="bg-black/30 p-4 border border-gray-700/50">
              <h3 className="text-sm font-bold text-amber-400 mb-4">المؤشرات الرئيسية</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400 flex items-center gap-2"><LineChart className="w-4 h-4"/>مؤشر القوة النسبية (RSI)</span>
                  <span className="font-mono font-bold">{stock.rsi.toFixed(1)}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400 flex items-center gap-2"><BarChart className="w-4 h-4"/>نسبة حجم التداول</span>
                  <span className="font-mono font-bold">{stock.volumeRatio.toFixed(1)}x</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400 flex items-center gap-2"><Zap className="w-4 h-4"/>مؤشر مالي</span>
                  <span className="font-bold text-amber-200">{stock.financialMetric}</span>
                </div>
                 <div className="flex justify-between items-center text-sm">
                  <span className="text-gray-400 flex items-center gap-2"><TrendingUp className="w-4 h-4"/>الاتجاه الحالي</span>
                  <span className="font-bold">{stock.trend}</span>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
      <style>{`
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px) scale(0.95); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        .animate-fade-in-up {
          animation: fade-in-up 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};

export default StockDetailModal;