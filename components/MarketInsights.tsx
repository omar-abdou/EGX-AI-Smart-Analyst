import React from 'react';
import { MarketInsights } from '../types';
import { TrendingUp, TrendingDown, Minus, ArrowLeft, Layers, CheckCircle, BarChart3 } from 'lucide-react';

interface Props {
  insights: MarketInsights;
}

const MarketInsightsComponent: React.FC<Props> = ({ insights }) => {
  const getSentimentInfo = (sentiment: MarketInsights['sentiment']) => {
    switch (sentiment) {
      case 'Bullish':
        return {
          label: 'صاعدة',
          Icon: TrendingUp,
          color: 'text-green-400',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/50',
        };
      case 'Bearish':
        return {
          label: 'هابطة',
          Icon: TrendingDown,
          color: 'text-red-400',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/50',
        };
      default:
        return {
          label: 'محايدة',
          Icon: Minus,
          color: 'text-yellow-400',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/50',
        };
    }
  };

  const sentimentInfo = getSentimentInfo(insights.sentiment);

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Market Sentiment */}
        <div className={`p-6 border ${sentimentInfo.borderColor} ${sentimentInfo.bgColor}`}>
          <h3 className="text-base font-bold text-gray-300 mb-3">معنويات السوق</h3>
          <div className="flex items-center gap-3">
            <sentimentInfo.Icon className={`w-10 h-10 ${sentimentInfo.color}`} />
            <div>
              <p className={`text-3xl font-bold ${sentimentInfo.color}`}>{sentimentInfo.label}</p>
              <p className="text-xs text-gray-400 font-mono">Market overview</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-700/50">
            <h4 className="text-xs text-gray-400 mb-1 flex items-center gap-1.5 font-mono"><BarChart3 className="w-4 h-4" /> MAIN INDEX STATUS</h4>
            <p className="text-sm font-semibold text-white font-mono">{insights.marketIndexStatus}</p>
          </div>
        </div>

        {/* Leading Sectors */}
        <div className="p-6 border border-gray-700 bg-gray-900/50 md:col-span-2">
          <h3 className="text-base font-bold text-gray-300 mb-4 flex items-center gap-2">
            <Layers className="w-5 h-5 text-amber-400" />
            القطاعات الرائدة
          </h3>
          <div className="flex flex-wrap gap-3">
            {insights.leadingSectors.map((sector, index) => (
              <div key={index} className="bg-gray-800/70 border border-gray-700 text-amber-300 px-4 py-2 text-sm font-semibold">
                {sector}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Key Takeaways */}
      <div className="p-6 border border-gray-700 bg-gray-900/50">
        <h3 className="text-base font-bold text-gray-300 mb-4 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            أهم التوصيات والملاحظات
        </h3>
        <ul className="space-y-3">
          {insights.takeaways.map((takeaway, index) => (
            <li key={index} className="flex items-start gap-3">
              <ArrowLeft className="w-4 h-4 text-amber-400 mt-1.5 flex-shrink-0" />
              <p className="text-gray-200 leading-relaxed">{takeaway}</p>
            </li>
          ))}
        </ul>
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

export default MarketInsightsComponent;