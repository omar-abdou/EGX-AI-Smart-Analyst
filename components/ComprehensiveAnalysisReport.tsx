import React from 'react';
import { ComprehensiveAnalysisReport } from '../types';
import { 
  Building2, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  BarChart4, 
  Globe2, 
  LineChart, 
  Users, 
  ShieldAlert, 
  Target, 
  CheckCircle2 
} from 'lucide-react';

interface Props {
  report: ComprehensiveAnalysisReport;
}

const ComprehensiveAnalysisComponent: React.FC<Props> = ({ report }) => {
  const getRecommendationColor = (rec: string) => {
    switch (rec) {
      case 'شراء': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/30';
      case 'بيع': return 'text-red-400 bg-red-400/10 border-red-400/30';
      default: return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30';
    }
  };

  const getRecommendationIcon = (rec: string) => {
    switch (rec) {
      case 'شراء': return <TrendingUp className="w-6 h-6" />;
      case 'بيع': return <TrendingDown className="w-6 h-6" />;
      default: return <Minus className="w-6 h-6" />;
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="bg-[#111111] border border-white/10 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold text-white font-mono flex items-center gap-3">
            {report.symbol}
            <span className="text-lg font-sans text-gray-400 font-normal">{report.name}</span>
          </h2>
          <p className="text-gray-500 text-sm mt-1">آخر تحديث: {report.dataTimestamp}</p>
        </div>
        <div className="text-right">
          <div className="text-3xl font-bold text-white font-mono">{report.currentPrice.toFixed(2)} EGP</div>
          <div className={`mt-2 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border font-bold ${getRecommendationColor(report.conclusion.recommendation)}`}>
            {getRecommendationIcon(report.conclusion.recommendation)}
            {report.conclusion.recommendation}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Introduction */}
        <div className="bg-[#1A1A1A] border border-white/5 rounded-xl p-5">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
            <Building2 className="w-5 h-5 text-indigo-400" />
            مقدمة عن الشركة
          </h3>
          <div className="space-y-4 text-sm text-gray-300">
            <div>
              <strong className="block text-gray-400 mb-1">نشاط الشركة:</strong>
              <p>{report.introduction.description}</p>
            </div>
            <div>
              <strong className="block text-gray-400 mb-1">مصادر الإيرادات:</strong>
              <p>{report.introduction.revenueSources}</p>
            </div>
            <div>
              <strong className="block text-gray-400 mb-1">السوق والمنافسين:</strong>
              <p>{report.introduction.marketAndCompetitors}</p>
            </div>
          </div>
        </div>

        {/* Fundamental Analysis */}
        <div className="bg-[#1A1A1A] border border-white/5 rounded-xl p-5">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
            <BarChart4 className="w-5 h-5 text-emerald-400" />
            التحليل الأساسي
          </h3>
          <div className="space-y-4 text-sm text-gray-300">
            <div>
              <strong className="block text-gray-400 mb-1">المؤشرات المالية:</strong>
              <p>{report.fundamental.financialMetrics}</p>
            </div>
            <div>
              <strong className="block text-gray-400 mb-1">تحليل الميزانية:</strong>
              <p>{report.fundamental.balanceSheet}</p>
            </div>
            <div>
              <strong className="block text-gray-400 mb-1">توزيعات الأرباح:</strong>
              <p>{report.fundamental.dividends}</p>
            </div>
          </div>
        </div>

        {/* Industry & Economy */}
        <div className="bg-[#1A1A1A] border border-white/5 rounded-xl p-5">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
            <Globe2 className="w-5 h-5 text-blue-400" />
            الصناعة والبيئة الاقتصادية
          </h3>
          <div className="space-y-4 text-sm text-gray-300">
            <div>
              <strong className="block text-gray-400 mb-1">وضع الصناعة:</strong>
              <p>{report.industryAndEconomy.industryStatus}</p>
            </div>
            <div>
              <strong className="block text-gray-400 mb-1">العوامل الاقتصادية:</strong>
              <p>{report.industryAndEconomy.economicFactors}</p>
            </div>
          </div>
        </div>

        {/* Technical Analysis */}
        <div className="bg-[#1A1A1A] border border-white/5 rounded-xl p-5">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
            <LineChart className="w-5 h-5 text-purple-400" />
            التحليل الفني
          </h3>
          <div className="space-y-4 text-sm text-gray-300">
            <div>
              <strong className="block text-gray-400 mb-1">المؤشرات الرئيسية:</strong>
              <p>{report.technical.indicators}</p>
            </div>
            <div>
              <strong className="block text-gray-400 mb-1">الدعم والمقاومة:</strong>
              <p>{report.technical.supportResistance}</p>
            </div>
            <div>
              <strong className="block text-gray-400 mb-1">الاتجاهات:</strong>
              <p>{report.technical.trends}</p>
            </div>
            <div>
              <strong className="block text-gray-400 mb-1">أنماط السعر:</strong>
              <p>{report.technical.pricePatterns}</p>
            </div>
          </div>
        </div>

        {/* Sentiment */}
        <div className="bg-[#1A1A1A] border border-white/5 rounded-xl p-5">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
            <Users className="w-5 h-5 text-pink-400" />
            معنويات السوق
          </h3>
          <div className="space-y-4 text-sm text-gray-300">
            <div>
              <strong className="block text-gray-400 mb-1">آراء المحللين:</strong>
              <p>{report.sentiment.analystRatings}</p>
            </div>
            <div>
              <strong className="block text-gray-400 mb-1">سلوك المستثمرين:</strong>
              <p>{report.sentiment.investorBehavior}</p>
            </div>
          </div>
        </div>

        {/* Risk */}
        <div className="bg-[#1A1A1A] border border-white/5 rounded-xl p-5">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2 border-b border-white/10 pb-2">
            <ShieldAlert className="w-5 h-5 text-orange-400" />
            تقييم المخاطر
          </h3>
          <div className="space-y-4 text-sm text-gray-300">
            <div>
              <strong className="block text-gray-400 mb-1">المخاطر المحتملة:</strong>
              <p>{report.risk.potentialRisks}</p>
            </div>
            <div>
              <strong className="block text-gray-400 mb-1">التحديات التشغيلية:</strong>
              <p>{report.risk.operationalChallenges}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Trading Plan */}
      <div className="bg-blue-900/10 border border-blue-500/20 rounded-2xl p-6">
        <h3 className="text-xl font-bold text-blue-400 mb-4 flex items-center gap-2">
          <Target className="w-6 h-6" />
          خطة التداول المقترحة
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-black/30 p-4 rounded-xl border border-white/5">
            <span className="text-xs text-gray-500 block mb-1">مناطق الدخول</span>
            <p className="text-white font-mono">{report.tradingPlan.entryZones}</p>
          </div>
          <div className="bg-black/30 p-4 rounded-xl border border-white/5">
            <span className="text-xs text-gray-500 block mb-1">وقف الخسارة</span>
            <p className="text-red-400 font-mono">{report.tradingPlan.stopLoss}</p>
          </div>
          <div className="bg-black/30 p-4 rounded-xl border border-white/5">
            <span className="text-xs text-gray-500 block mb-1">الأهداف المتوقعة</span>
            <p className="text-emerald-400 font-mono">{report.tradingPlan.targets}</p>
          </div>
          <div className="bg-black/30 p-4 rounded-xl border border-white/5">
            <span className="text-xs text-gray-500 block mb-1">حجم المخاطرة</span>
            <p className="text-yellow-400 font-mono">{report.tradingPlan.riskSize}</p>
          </div>
        </div>
      </div>

      {/* Conclusion */}
      <div className={`border rounded-2xl p-6 ${
        report.conclusion.recommendation === 'شراء' ? 'bg-emerald-900/10 border-emerald-500/30' :
        report.conclusion.recommendation === 'بيع' ? 'bg-red-900/10 border-red-500/30' :
        'bg-yellow-900/10 border-yellow-500/30'
      }`}>
        <h3 className={`text-xl font-bold mb-3 flex items-center gap-2 ${
          report.conclusion.recommendation === 'شراء' ? 'text-emerald-400' :
          report.conclusion.recommendation === 'بيع' ? 'text-red-400' :
          'text-yellow-400'
        }`}>
          <CheckCircle2 className="w-6 h-6" />
          الخلاصة والتوصية النهائية
        </h3>
        <p className="text-gray-200 leading-relaxed text-lg">
          {report.conclusion.reasoning}
        </p>
      </div>
    </div>
  );
};

export default ComprehensiveAnalysisComponent;
