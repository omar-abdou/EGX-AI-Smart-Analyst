import React, { useState, useEffect } from 'react';
import { ScreenType, StockData, ScreenConfig, GroundingSource, MarketInsights, ComparisonResult, LiquidityFlowData } from './types';
import { analyzeMarket, getMarketInsights, compareStocks, getLiquidityFlow, getSmartMoneyReport, getComprehensiveAnalysis } from './services/geminiService';
import StockTable from './components/StockTable';
import AIScoreCard from './components/AIScoreCard';
import StockDetailModal from './components/StockDetailModal';
import MarketInsightsComponent from './components/MarketInsights';
import ComparisonView from './components/ComparisonView';
import TickerTapeWidget from './components/TickerTapeWidget';
import Header from './components/Header'; // Import the Header component
import LiquidityFlowList from './components/LiquidityFlowList'; // Import new component
import SmartMoneyReportComponent from './components/SmartMoneyReport'; // Import SMC component
import ComprehensiveAnalysisComponent from './components/ComprehensiveAnalysisReport'; // Import comprehensive analysis component
import { 
  LineChart, 
  BarChart3, 
  TrendingUp, 
  Zap, 
  Target, 
  Search, 
  Cpu, 
  Loader2,
  AlertTriangle,
  Info,
  Globe,
  RefreshCw,
  PieChart,
  Lightbulb,
  Scale,
  DollarSign, // New icon for liquidity flow
  BriefcaseBusiness, // Icon for SMC
  FileSearch // Icon for comprehensive analysis
} from 'lucide-react';

// Configurable refresh interval in milliseconds (default: 5 minutes)
const REFRESH_INTERVAL = 5 * 60 * 1000;

const screens: ScreenConfig[] = [
  { id: ScreenType.MARKET_INSIGHTS, title: 'رؤى السوق', description: 'تحليل شامل لحالة السوق والقطاعات الرائدة', icon: 'Lightbulb' },
  { id: ScreenType.EGX30, title: 'EGX30 فرص', description: 'أسهم قيادية، اتجاه صاعد، سيولة عالية', icon: 'LineChart' },
  { id: ScreenType.EGX70, title: 'EGX70 فرص', description: 'أسهم صغيرة/متوسطة، تحرك قوي اليوم', icon: 'BarChart3' },
  { id: ScreenType.INVESTMENT, title: 'استثمار', description: 'نمو أرباح، أساسيات قوية، مدى 6-36 شهر', icon: 'TrendingUp' },
  { id: ScreenType.SECTOR_SCAN, title: 'تحليل القطاعات', description: 'أفضل فرصة في كل قطاع (بنوك، عقارات...)', icon: 'PieChart' },
  { id: ScreenType.DAY_TRADING, title: 'مضاربات', description: 'سيولة لحظية عالية، VWAP، مخاطرة مقبولة', icon: 'Zap' },
  { id: ScreenType.BREAKOUT, title: 'اختراقات', description: 'اختراق قمة 5 جلسات مع فوليوم ضخم', icon: 'Target' },
  { id: ScreenType.LIQUIDITY_FLOW, title: 'تدفق السيولة', description: 'أين تذهب السيولة (يومي، شهري، سنوي)', icon: 'DollarSign' }, // New screen
  { id: ScreenType.SMART_MONEY, title: 'Smart Money', description: 'تقرير مؤسسي لمناطق تجميع السيولة', icon: 'BriefcaseBusiness' },
  { id: ScreenType.COMPREHENSIVE_ANALYSIS, title: 'تحليل شامل', description: 'تحليل مالي وفني مفصل لسهم محدد', icon: 'FileSearch' },
  { id: ScreenType.COMPARISON, title: 'مقارنة سهمين', description: 'مقارنة شاملة لتحديد الأفضل للشراء', icon: 'Scale' },
  { id: ScreenType.MANUAL, title: 'تحليل مخصص', description: 'أدخل رمز السهم للحصول على تقرير شامل', icon: 'Search' },
];

const getIcon = (name: string) => {
  switch (name) {
    case 'Lightbulb': return <Lightbulb className="w-5 h-5" />;
    case 'LineChart': return <LineChart className="w-5 h-5" />;
    case 'BarChart3': return <BarChart3 className="w-5 h-5" />;
    case 'TrendingUp': return <TrendingUp className="w-5 h-5" />;
    case 'PieChart': return <PieChart className="w-5 h-5" />;
    case 'Zap': return <Zap className="w-5 h-5" />;
    case 'Target': return <Target className="w-5 h-5" />;
    case 'Search': return <Search className="w-5 h-5" />;
    case 'Scale': return <Scale className="w-5 h-5" />;
    case 'DollarSign': return <DollarSign className="w-5 h-5" />; // New icon
    case 'BriefcaseBusiness': return <BriefcaseBusiness className="w-5 h-5" />;
    case 'FileSearch': return <FileSearch className="w-5 h-5" />;
    default: return <LineChart className="w-5 h-5" />;
  }
};

const App: React.FC = () => {
  const [activeScreen, setActiveScreen] = useState<ScreenType>(ScreenType.MARKET_INSIGHTS);
  const [data, setData] = useState<StockData[]>([]);
  const [insights, setInsights] = useState<MarketInsights | null>(null);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [liquidityFlowData, setLiquidityFlowData] = useState<LiquidityFlowData[]>([]); // New state
  const [smartMoneyReport, setSmartMoneyReport] = useState<any>(null); // SMC state
  const [comprehensiveReport, setComprehensiveReport] = useState<any>(null); // Comprehensive state
  const [activeLiquidityTimeframe, setActiveLiquidityTimeframe] = useState<'daily' | 'monthly' | 'yearly'>('daily'); // New state
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [manualSymbol, setManualSymbol] = useState<string>('');
  const [comprehensiveSymbol, setComprehensiveSymbol] = useState<string>('');
  const [compSymbol1, setCompSymbol1] = useState<string>('');
  const [compSymbol2, setCompSymbol2] = useState<string>('');
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);
  const [refreshingSymbol, setRefreshingSymbol] = useState<string | null>(null);

  const handleError = (err: any) => {
    if (err.message && (err.message.includes('429') || err.message.toLowerCase().includes('quota'))) {
      setError("تم تجاوز حد الطلبات. يرجى الانتظار دقيقة ثم المحاولة مرة أخرى.");
    } else {
      setError("حدث خطأ أثناء الاتصال بنظام التحليل الذكي. يرجى المحاولة مرة أخرى.");
    }
  };

  const fetchInsights = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await getMarketInsights();
      setInsights(result);
      setLastUpdated(new Date());
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };
  
  // New fetch function for liquidity flow
  const fetchLiquidityFlow = async (timeframe: 'daily' | 'monthly' | 'yearly') => {
    setLoading(true);
    setError(null);
    setLiquidityFlowData([]); // Clear previous data
    try {
      const result = await getLiquidityFlow(timeframe);
      setLiquidityFlowData(result.stocks);
      setSources(result.sources);
      setLastUpdated(new Date());
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchSmartMoneyReport = async () => {
    setLoading(true);
    setError(null);
    setSmartMoneyReport(null);
    try {
      const result = await getSmartMoneyReport();
      setSmartMoneyReport(result.report);
      setSources(result.sources);
      setLastUpdated(new Date());
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights(); // Initial fetch for market insights
  }, []);

  useEffect(() => {
    // Set up auto-refresh for certain screens
    // Fix: Changed NodeJS.Timeout to number for browser compatibility
    let intervalId: ReturnType<typeof setInterval> | null = null;
    if (
        (activeScreen !== ScreenType.MANUAL && activeScreen !== ScreenType.COMPARISON && activeScreen !== ScreenType.LIQUIDITY_FLOW && activeScreen !== ScreenType.SMART_MONEY && activeScreen !== ScreenType.COMPREHENSIVE_ANALYSIS) && 
        !loading // Only refresh if not already loading
    ) {
      intervalId = setInterval(() => {
        if (activeScreen === ScreenType.MARKET_INSIGHTS) {
          fetchInsights();
        } else {
          fetchAnalysis(activeScreen);
        }
      }, REFRESH_INTERVAL);
    }
    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [activeScreen, loading]);


  const handleScreenChange = (screenId: ScreenType) => {
    setActiveScreen(screenId);
    setData([]);
    setInsights(null);
    setComparisonResult(null);
    setLiquidityFlowData([]); // Clear liquidity data
    setSmartMoneyReport(null); // Clear SMC data
    setComprehensiveReport(null); // Clear comprehensive data
    setSources([]);
    setError(null);
    if (screenId === ScreenType.MARKET_INSIGHTS) {
      fetchInsights();
    } else if (screenId === ScreenType.LIQUIDITY_FLOW) {
      fetchLiquidityFlow(activeLiquidityTimeframe); // Fetch for current timeframe
    } else if (screenId === ScreenType.SMART_MONEY) {
      fetchSmartMoneyReport();
    }
    else if (screenId !== ScreenType.MANUAL && screenId !== ScreenType.COMPARISON && screenId !== ScreenType.COMPREHENSIVE_ANALYSIS) {
      fetchAnalysis(screenId);
    } else {
      setLoading(false); // For manual/comparison/comprehensive, loading will be triggered by form submit
    }
  };

  const fetchAnalysis = async (screenId: ScreenType, symbol?: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await analyzeMarket(screenId, symbol);
      setData(result.stocks);
      setSources(result.sources);
      setLastUpdated(new Date());
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };
  
  const handleComparisonSearch = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!compSymbol1.trim() || !compSymbol2.trim()) return;
      setLoading(true);
      setError(null);
      setComparisonResult(null);
      try {
          const result = await compareStocks(compSymbol1, compSymbol2);
          setComparisonResult(result);
          setSources(result.sources);
          setLastUpdated(new Date());
      } catch (err) {
          handleError(err);
      } finally {
          setLoading(false);
      }
  };
  
  const handleRefreshStock = async (symbol: string) => {
    if (refreshingSymbol) return;
    setRefreshingSymbol(symbol);
    try {
      const result = await analyzeMarket(ScreenType.MANUAL, symbol); // Re-fetch as a manual analysis
      if (result.stocks && result.stocks.length > 0) {
        setData(currentData => currentData.map(s => (s.symbol === symbol ? result.stocks[0] : s)));
      }
    } catch (err) {
      console.error(`Failed to refresh stock ${symbol}:`, err);
    } finally {
      setRefreshingSymbol(null);
    }
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualSymbol.trim()) return;
    fetchAnalysis(ScreenType.MANUAL, manualSymbol);
  };

  const handleComprehensiveSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!comprehensiveSymbol.trim()) return;
    setLoading(true);
    setError(null);
    setComprehensiveReport(null);
    try {
      const result = await getComprehensiveAnalysis(comprehensiveSymbol);
      setComprehensiveReport(result.report);
      setSources(result.sources);
      setLastUpdated(new Date());
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  };

  const isStockScreen = activeScreen !== ScreenType.MANUAL && activeScreen !== ScreenType.MARKET_INSIGHTS && activeScreen !== ScreenType.COMPARISON && activeScreen !== ScreenType.LIQUIDITY_FLOW && activeScreen !== ScreenType.SMART_MONEY && activeScreen !== ScreenType.COMPREHENSIVE_ANALYSIS;
  const isRateLimitError = error && error.includes('الطلبات');

  return (
    <div className="min-h-screen bg-[#1A1A1A] text-gray-200 flex flex-col" dir="rtl">
      <Header marketCondition={insights} /> {/* Pass market insights to Header */}
      
      <TickerTapeWidget />

      <main className="container mx-auto px-4 py-8 flex-grow">
        <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-9 gap-2 mb-8">
          {screens.map((screen) => (
            <button
              key={screen.id}
              onClick={() => handleScreenChange(screen.id)}
              disabled={loading}
              className={`flex flex-col items-center justify-center p-3 border transition-all duration-200 text-center h-full disabled:opacity-50 disabled:cursor-not-allowed ${
                activeScreen === screen.id
                  ? 'bg-amber-500 border-amber-400 text-black shadow-lg transform scale-105'
                  : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:bg-gray-700/70 hover:border-gray-600'
              }`}
            >
              <div className={`mb-1.5`}>
                {getIcon(screen.icon)}
              </div>
              <span className="text-sm font-semibold block">{screen.title}</span>
              <span className="text-[9px] opacity-70 hidden xl:block leading-tight font-mono">{screen.description}</span>
            </button>
          ))}
        </div>

        {activeScreen === ScreenType.MANUAL && (
          <div className="max-w-xl mx-auto mb-10 animate-fade-in">
            <form onSubmit={handleManualSearch} className="flex gap-2">
              <input
                type="text"
                value={manualSymbol}
                onChange={(e) => setManualSymbol(e.target.value.toUpperCase())}
                placeholder="أدخل رمز السهم (مثال: COMI, ESRS)..."
                className="flex-1 bg-gray-900 border border-gray-700 px-4 py-3 text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent outline-none font-mono text-left placeholder:text-right placeholder:font-sans"
              />
              <button
                type="submit"
                disabled={loading}
                className="bg-amber-600 hover:bg-amber-700 text-black px-6 py-3 font-bold transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Search className="w-5 h-5" />}
                تحليل سريع
              </button>
            </form>
          </div>
        )}

        {activeScreen === ScreenType.COMPREHENSIVE_ANALYSIS && !comprehensiveReport && (
          <div className="max-w-xl mx-auto mb-10 animate-fade-in">
            <div className="bg-gray-900/50 p-6 border border-gray-800 text-center">
              <h2 className="text-xl font-bold mb-4 text-gray-300">تحليل مالي وفني شامل</h2>
              <p className="text-sm text-gray-500 mb-6">أدخل رمز السهم للحصول على تقرير مفصل يشمل التحليل الأساسي، الفني، معنويات السوق، وخطة تداول مقترحة.</p>
              <form onSubmit={handleComprehensiveSearch} className="flex gap-2">
                <input
                  type="text"
                  value={comprehensiveSymbol}
                  onChange={(e) => setComprehensiveSymbol(e.target.value.toUpperCase())}
                  placeholder="أدخل رمز السهم (مثال: COMI)..."
                  className="flex-1 bg-black/50 border border-gray-700 px-4 py-3 text-white focus:ring-2 focus:ring-amber-500 outline-none font-mono text-center placeholder:font-sans"
                />
                <button
                  type="submit"
                  disabled={loading || !comprehensiveSymbol}
                  className="bg-amber-600 hover:bg-amber-700 text-black px-6 py-3 font-bold transition-colors flex items-center gap-2 disabled:opacity-50"
                >
                  {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <FileSearch className="w-5 h-5" />}
                  تحليل شامل
                </button>
              </form>
            </div>
          </div>
        )}

        {activeScreen === ScreenType.COMPARISON && !comparisonResult && (
             <div className="max-w-2xl mx-auto mb-10 animate-fade-in">
                <div className="bg-gray-900/50 p-6 border border-gray-800">
                    <h2 className="text-xl font-bold text-center mb-6 text-gray-300">اختر سهمين للمقارنة</h2>
                    <form onSubmit={handleComparisonSearch} className="flex flex-col md:flex-row gap-4 items-center">
                      <input type="text" value={compSymbol1} onChange={(e) => setCompSymbol1(e.target.value.toUpperCase())} placeholder="السهم الأول (مثال: COMI)"
                        className="w-full bg-black/50 border border-gray-700 px-4 py-3 text-white focus:ring-2 focus:ring-amber-500 outline-none text-center font-mono placeholder:font-sans" />
                      <div className="text-gray-500 font-bold font-mono">VS</div>
                      <input type="text" value={compSymbol2} onChange={(e) => setCompSymbol2(e.target.value.toUpperCase())} placeholder="السهم الثاني (مثال: HRHO)"
                        className="w-full bg-black/50 border border-gray-700 px-4 py-3 text-white focus:ring-2 focus:ring-amber-500 outline-none text-center font-mono placeholder:font-sans" />
                    </form>
                     <button
                        onClick={handleComparisonSearch}
                        disabled={loading || !compSymbol1 || !compSymbol2}
                        className="w-full mt-6 bg-amber-600 hover:bg-amber-700 text-black px-6 py-3 font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin w-5 h-5" /> : <Scale className="w-5 h-5" />}
                        بدء المقارنة الذكية
                    </button>
                </div>
             </div>
        )}

        {activeScreen === ScreenType.LIQUIDITY_FLOW && (
          <div className="mb-10 animate-fade-in">
            <div className="flex justify-center gap-4 mb-6">
              <button 
                onClick={() => { setActiveLiquidityTimeframe('daily'); fetchLiquidityFlow('daily'); }}
                className={`px-6 py-2 border ${activeLiquidityTimeframe === 'daily' ? 'bg-amber-500 text-black border-amber-400' : 'bg-gray-800/50 text-gray-400 border-gray-700 hover:bg-gray-700/70'}`}
                disabled={loading}
              >
                يومي
              </button>
              <button 
                onClick={() => { setActiveLiquidityTimeframe('monthly'); fetchLiquidityFlow('monthly'); }}
                className={`px-6 py-2 border ${activeLiquidityTimeframe === 'monthly' ? 'bg-amber-500 text-black border-amber-400' : 'bg-gray-800/50 text-gray-400 border-gray-700 hover:bg-gray-700/70'}`}
                disabled={loading}
              >
                شهري
              </button>
              <button 
                onClick={() => { setActiveLiquidityTimeframe('yearly'); fetchLiquidityFlow('yearly'); }}
                className={`px-6 py-2 border ${activeLiquidityTimeframe === 'yearly' ? 'bg-amber-500 text-black border-amber-400' : 'bg-gray-800/50 text-gray-400 border-gray-700 hover:bg-gray-700/70'}`}
                disabled={loading}
              >
                سنوي
              </button>
            </div>
            {liquidityFlowData.length > 0 && !loading && (
              <LiquidityFlowList 
                data={liquidityFlowData} 
                timeframe={activeLiquidityTimeframe} 
                onRefresh={() => fetchLiquidityFlow(activeLiquidityTimeframe)} 
                loading={loading}
              />
            )}
          </div>
        )}

        <div className="space-y-8">
          {(data.length > 0 || insights || comparisonResult || liquidityFlowData.length > 0 || smartMoneyReport || comprehensiveReport || loading) && (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-800 pb-4">
              <div>
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  {screens.find(s => s.id === activeScreen)?.title}
                </h2>
                <div className="flex items-center gap-4 mt-1">
                  {lastUpdated && !loading && (
                    <p className="text-xs text-gray-500 font-mono">
                      آخر تحديث: {lastUpdated.toLocaleTimeString('ar-EG')}
                    </p>
                  )}
                  {(isStockScreen || activeScreen === ScreenType.MARKET_INSIGHTS || activeScreen === ScreenType.LIQUIDITY_FLOW || activeScreen === ScreenType.SMART_MONEY) && (
                    <button onClick={() => {
                        if (activeScreen === ScreenType.MARKET_INSIGHTS) fetchInsights();
                        else if (activeScreen === ScreenType.LIQUIDITY_FLOW) fetchLiquidityFlow(activeLiquidityTimeframe);
                        else if (activeScreen === ScreenType.SMART_MONEY) fetchSmartMoneyReport();
                        else fetchAnalysis(activeScreen);
                      }} disabled={loading}
                      className="flex items-center gap-1.5 text-xs text-amber-400 hover:text-amber-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors font-mono" >
                      <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`}/>
                      <span>{loading ? 'تحديث...' : 'تحديث الآن'}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {loading && (
            <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <Loader2 className="w-12 h-12 animate-spin mb-4 text-amber-500" />
              <p className="animate-pulse text-lg font-semibold">تحليل بيانات السوق الحية...</p>
              <p className="text-sm mt-2 opacity-60 font-mono">Connecting to live data feeds...</p>
            </div>
          )}

          {error && !loading && (
            <div className={`p-6 text-center border ${isRateLimitError ? 'bg-yellow-900/20 border-yellow-700/50 text-yellow-300' : 'bg-red-900/20 border-red-800 text-red-300'}`}>
              <AlertTriangle className="w-10 h-10 mx-auto mb-3 opacity-80" />
              <p>{error}</p>
            </div>
          )}

          {!loading && comparisonResult && activeScreen === ScreenType.COMPARISON && (
              <ComparisonView result={comparisonResult} onStockSelect={setSelectedStock} onBack={() => setComparisonResult(null)} />
          )}

          {!loading && insights && activeScreen === ScreenType.MARKET_INSIGHTS && (
             <MarketInsightsComponent insights={insights} />
          )}

          {!loading && smartMoneyReport && activeScreen === ScreenType.SMART_MONEY && (
             <SmartMoneyReportComponent report={smartMoneyReport} />
          )}

          {!loading && comprehensiveReport && activeScreen === ScreenType.COMPREHENSIVE_ANALYSIS && (
             <ComprehensiveAnalysisComponent report={comprehensiveReport} />
          )}

          {!loading && data.length > 0 && isStockScreen && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {data.slice(0, 3).map((stock, idx) => (
                  <AIScoreCard key={stock.symbol} stock={stock} rank={idx + 1} onStockSelect={setSelectedStock} />
                ))}
              </div>
              <div className="mt-8">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span className="w-1 h-6 bg-amber-500"></span>
                  تفاصيل الفرص المتاحة
                </h3>
                <StockTable data={data} onStockSelect={setSelectedStock} onRefreshStock={handleRefreshStock} refreshingSymbol={refreshingSymbol} />
              </div>
            </>
          )}

          {/* Specific feedback for Manual Analysis with no results */}
          {activeScreen === ScreenType.MANUAL && !loading && data.length === 0 && !error && (
              <div className="text-center py-20 text-gray-600 animate-fade-in">
                  <AlertTriangle className="w-16 h-16 mx-auto mb-4 opacity-40 text-amber-500" />
                  <p className="font-semibold text-lg text-gray-300">لم يتم العثور على بيانات للسهم "{manualSymbol}"</p>
                  <p className="text-sm mt-2 text-gray-500">الرجاء التحقق من رمز السهم أو المحاولة مرة أخرى بمدخل آخر.</p>
                  <p className="text-xs mt-1 text-gray-700 font-mono">قد لا تتوفر بيانات تفصيلية لجميع الأسهم أو قد يكون هناك خطأ إملائي.</p>
              </div>
          )}

          {sources.length > 0 && (
            <div className="mt-8 bg-gray-900/50 border border-gray-800 p-4">
              <h4 className="text-sm font-semibold text-gray-300 mb-3 flex items-center gap-2">
                <Globe className="w-4 h-4 text-amber-500" />
                مصادر البيانات المستخدمة
              </h4>
              <div className="flex flex-wrap gap-2 font-mono">
                {sources.slice(0, 5).map((source, idx) => (
                  <a key={idx} href={source.uri} target="_blank" rel="noopener noreferrer"
                    className="text-[10px] bg-gray-800 hover:bg-gray-700 text-amber-400 px-3 py-1.5 transition-colors truncate max-w-[200px]" >
                    {source.title}
                  </a>
                ))}
              </div>
            </div>
          )}

          {!loading && data.length > 0 && isStockScreen && (
            <div className="bg-gray-900/50 p-4 mt-8 flex items-start gap-3 text-xs text-gray-400 border border-gray-800">
              <Info className="w-5 h-5 flex-shrink-0 text-amber-500" />
              <div>
                <strong className="block text-gray-300 mb-1 font-semibold">كيف يتم حساب AI Score؟</strong>
                تعتمد النتيجة على خوارزمية مركبة تزن الزخم الفني (30%)، قوة الاتجاه الحالي (25%)، تدفقات السيولة النسبية (20%)، وجاذبية التقييم المالي (25%). الدرجة الأعلى من 80 تعتبر إشارة قوية جداً.
              </div>
            </div>
          )}

          {/* Generic no data message, only if no specific screen has data and no specific error */}
          {!loading && data.length === 0 && liquidityFlowData.length === 0 && !smartMoneyReport && !comprehensiveReport && !error && !comparisonResult && activeScreen !== ScreenType.MANUAL && activeScreen !== ScreenType.MARKET_INSIGHTS && activeScreen !== ScreenType.COMPARISON && activeScreen !== ScreenType.LIQUIDITY_FLOW && activeScreen !== ScreenType.SMART_MONEY && activeScreen !== ScreenType.COMPREHENSIVE_ANALYSIS && (
            <div className="text-center py-20 text-gray-600">
              <BarChart3 className="w-16 h-16 mx-auto mb-4 opacity-20" />
              <p className="font-semibold">اختر شاشة تحليل لبدء البحث عن الفرص</p>
            </div>
          )}
        </div>
      </main>

      {selectedStock && (
        <StockDetailModal stock={selectedStock} onClose={() => setSelectedStock(null)} />
      )}
      
      <footer className="container mx-auto px-4 py-4 text-center text-xs text-gray-600 border-t border-gray-800/50 font-mono">
        إخلاء مسؤولية: هذا التحليل تم توليده بواسطة الذكاء الاصطناعي بناءً على بيانات عامة ولا يعتبر نصيحة مالية. قم دائمًا بإجراء بحثك الخاص قبل اتخاذ قرارات الاستثمار.
      </footer>
    </div>
  );
};

export default App;