import React from 'react';
import { SmartMoneyReportData, SMCCandidate } from '../types';
import { ShieldAlert, TrendingUp, TrendingDown, Activity, Layers, Target, Crosshair, BarChart2, BriefcaseBusiness } from 'lucide-react';

interface Props {
  report: SmartMoneyReportData;
}

const CandidateCard: React.FC<{ candidate: SMCCandidate }> = ({ candidate }) => {
  const getAccumulationColor = (state: string) => {
    switch (state) {
      case 'Strong Accumulation': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
      case 'Early Accumulation': return 'text-blue-400 bg-blue-400/10 border-blue-400/20';
      case 'Neutral': return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
      case 'Distribution': return 'text-red-400 bg-red-400/10 border-red-400/20';
      default: return 'text-gray-400 bg-gray-400/10 border-gray-400/20';
    }
  };

  const getAccumulationText = (state: string) => {
    switch (state) {
      case 'Strong Accumulation': return 'تجميع قوي';
      case 'Early Accumulation': return 'بداية تجميع';
      case 'Neutral': return 'محايد';
      case 'Distribution': return 'تصريف';
      default: return state;
    }
  };

  return (
    <div className="bg-[#1A1A1A] border border-white/5 rounded-xl p-5 hover:border-white/10 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="text-xl font-bold text-white font-mono">{candidate.symbol}</h4>
          <p className="text-sm text-gray-400">{candidate.name}</p>
        </div>
        <div className="text-right">
          <div className="text-lg font-bold text-white">{candidate.currentPrice.toFixed(2)} EGP</div>
          <div className={`text-xs px-2 py-1 rounded-full border mt-1 inline-block ${getAccumulationColor(candidate.accumulationState)}`}>
            {getAccumulationText(candidate.accumulationState)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4 bg-black/20 p-3 rounded-lg border border-white/5">
        <div>
          <div className="text-xs text-gray-500 mb-1">دخول</div>
          <div className="font-mono text-emerald-400">{candidate.entryLevel.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">الهدف</div>
          <div className="font-mono text-blue-400">{candidate.target1.toFixed(2)}</div>
        </div>
        <div>
          <div className="text-xs text-gray-500 mb-1">وقف الخسارة</div>
          <div className="font-mono text-red-400">{candidate.stopLoss.toFixed(2)}</div>
        </div>
      </div>

      <div className="space-y-3 text-sm">
        <div>
          <span className="text-gray-500 block mb-1 text-xs uppercase tracking-wider">تحليل الهيكل السعري</span>
          <p className="text-gray-300">{candidate.structureAnalysis}</p>
        </div>
        <div>
          <span className="text-gray-500 block mb-1 text-xs uppercase tracking-wider">خريطة السيولة</span>
          <p className="text-gray-300">{candidate.liquidityMapping}</p>
        </div>
        <div>
          <span className="text-gray-500 block mb-1 text-xs uppercase tracking-wider">الكتلة الشرائية (Order Block)</span>
          <p className="text-gray-300">{candidate.orderBlock}</p>
        </div>
        <div>
          <span className="text-gray-500 block mb-1 text-xs uppercase tracking-wider">تحليل أحجام التداول</span>
          <p className="text-gray-300">{candidate.volumeIntelligence}</p>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-white/5">
          <div className="text-xs text-gray-400">RSI: {candidate.rsiDivergence}</div>
          <div className="text-xs font-bold text-white bg-white/10 px-2 py-1 rounded">التقييم: {candidate.probabilityScore}%</div>
        </div>
      </div>
    </div>
  );
};

const SmartMoneyReport: React.FC<Props> = ({ report }) => {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <BriefcaseBusiness className="w-6 h-6 text-indigo-400" />
          تقرير الأموال الذكية (SMC)
        </h2>
        <div className="text-sm text-gray-400 font-mono bg-black/30 px-3 py-1 rounded-full border border-white/5">
          {report.dataTimestamp}
        </div>
      </div>

      {/* Market Regime */}
      <div className="bg-[#111111] border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
          <Activity className="w-5 h-5 text-blue-400" />
          تصنيف حالة السوق
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <div className="mb-4">
              <span className="text-sm text-gray-500 block mb-1">الحالة العامة</span>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border font-bold ${
                report.marketRegime.status === 'Bullish' ? 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10' :
                report.marketRegime.status === 'Bearish' ? 'text-red-400 border-red-400/30 bg-red-400/10' :
                'text-yellow-400 border-yellow-400/30 bg-yellow-400/10'
              }`}>
                {report.marketRegime.status === 'Bullish' ? <TrendingUp className="w-4 h-4" /> :
                 report.marketRegime.status === 'Bearish' ? <TrendingDown className="w-4 h-4" /> :
                 <Activity className="w-4 h-4" />}
                {report.marketRegime.status === 'Bullish' ? 'إيجابي (Bullish)' :
                 report.marketRegime.status === 'Bearish' ? 'سلبي (Bearish)' :
                 'انتقالي (Transition)'}
              </div>
            </div>
            <div>
              <span className="text-sm text-gray-500 block mb-1">كسر الهيكل السعري (BoS)</span>
              <p className="text-gray-300 text-sm">{report.marketRegime.breakOfStructure}</p>
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-black/20 p-3 rounded-lg border border-white/5">
              <span className="text-xs text-gray-500 block mb-1 font-mono">هيكل EGX30</span>
              <p className="text-gray-300 text-sm">{report.marketRegime.egx30Structure}</p>
            </div>
            <div className="bg-black/20 p-3 rounded-lg border border-white/5">
              <span className="text-xs text-gray-500 block mb-1 font-mono">هيكل EGX70</span>
              <p className="text-gray-300 text-sm">{report.marketRegime.egx70Structure}</p>
            </div>
          </div>
        </div>
      </div>

      {/* EGX30 Candidates */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Layers className="w-5 h-5 text-indigo-400" />
          مسح سيولة EGX30
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {report.egx30Candidates.map((candidate, idx) => (
            <CandidateCard key={idx} candidate={candidate} />
          ))}
          {report.egx30Candidates.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500 bg-[#111111] rounded-xl border border-white/5">
              لا توجد فرص تجميع قوية في EGX30 حالياً
            </div>
          )}
        </div>
      </div>

      {/* EGX70 Candidates */}
      <div>
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
          <Target className="w-5 h-5 text-emerald-400" />
          مسح سيولة EGX70
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {report.egx70Candidates.map((candidate, idx) => (
            <CandidateCard key={idx} candidate={candidate} />
          ))}
          {report.egx70Candidates.length === 0 && (
            <div className="col-span-full text-center py-8 text-gray-500 bg-[#111111] rounded-xl border border-white/5">
              لا توجد فرص تجميع قوية في EGX70 حالياً
            </div>
          )}
        </div>
      </div>

      {/* Institutional Rotation */}
      <div className="bg-[#111111] border border-white/10 rounded-2xl p-6">
        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
          <BarChart2 className="w-5 h-5 text-purple-400" />
          دوران السيولة المؤسسية (Institutional Rotation)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-black/20 p-4 rounded-xl border border-white/5">
            <span className="text-xs text-gray-500 block mb-2 uppercase tracking-wider">تدفق السيولة</span>
            <p className="text-gray-300 text-sm">{report.institutionalRotation.liquidityFlowComparison}</p>
          </div>
          <div className="bg-black/20 p-4 rounded-xl border border-white/5">
            <span className="text-xs text-gray-500 block mb-2 uppercase tracking-wider">دوران القطاعات</span>
            <p className="text-gray-300 text-sm">{report.institutionalRotation.sectorRotation}</p>
          </div>
          <div className="bg-black/20 p-4 rounded-xl border border-white/5">
            <span className="text-xs text-gray-500 block mb-2 uppercase tracking-wider">تركّز التداول</span>
            <p className="text-gray-300 text-sm">{report.institutionalRotation.tradeConcentration}</p>
          </div>
          <div className="bg-black/20 p-4 rounded-xl border border-white/5">
            <span className="text-xs text-gray-500 block mb-2 uppercase tracking-wider">تغير حالة السوق (Regime Shift)</span>
            <p className="text-gray-300 text-sm">{report.institutionalRotation.regimeShift}</p>
          </div>
        </div>
      </div>

      {/* Scenarios */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-blue-900/10 border border-blue-500/20 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-blue-400 mb-3 flex items-center gap-2">
            <Crosshair className="w-5 h-5" />
            السيناريو المرجح للأسبوع القادم
          </h3>
          <p className="text-gray-300 text-sm leading-relaxed">{report.weeklyScenario}</p>
        </div>
        <div className="bg-red-900/10 border border-red-500/20 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-red-400 mb-3 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5" />
            سيناريو المخاطر (Invalidation Levels)
          </h3>
          <p className="text-gray-300 text-sm leading-relaxed">{report.riskScenario}</p>
        </div>
      </div>
    </div>
  );
};

export default SmartMoneyReport;
