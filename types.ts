
export interface StockData {
  symbol: string;
  name: string;
  currentPrice: number;
  change: number;
  changePercent: number;
  sector: string;
  trend: string;
  rsi: number;
  volumeRatio: number;
  entryPoint: number;
  stopLoss: number;
  target1: number;
  target2: number;
  signalStrength: number; // 1-10
  decision: 'Buy' | 'Hold' | 'Sell';
  aiScore: number; // 0-100
  financialMetric: string; // Key financial metric (e.g. P/E, ROE)
  reasoning?: string; // Short text explaining why it fits
  dataTimestamp?: string; // ISO 8601 string for data freshness
  sourceUri?: string; // The direct URL from the source where the data was found
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface AnalysisResult {
  stocks: StockData[];
  sources: GroundingSource[];
}

export interface ComparisonPoint {
  metric: string;
  stock1Value: string;
  stock2Value: string;
  advantage: 'stock1' | 'stock2' | 'equal';
}

export interface ComparisonResult {
  stock1: StockData;
  stock2: StockData;
  winnerSymbol: string;
  verdictReasoning: string;
  comparisonPoints: ComparisonPoint[];
  sources: GroundingSource[];
}

export interface MarketInsights {
  sentiment: 'Bullish' | 'Neutral' | 'Bearish';
  leadingSectors: string[];
  takeaways: string[];
  marketIndexStatus: string;
}

export interface LiquidityFlowData {
  symbol: string;
  name: string;
  currentPrice: number; // To provide context
  changePercent: number; // To provide context
  liquidityScore: number; // A score indicating the strength of liquidity inflow (e.g., 0-100)
  timeframe: 'daily' | 'monthly' | 'yearly';
  reasoning: string; // Explanation of why this stock has liquidity flow
  dataTimestamp: string; // ISO 8601 string for data freshness
  sourceUri?: string; // The direct URL from the source where the data was found
}

export interface LiquidityFlowResult {
  stocks: LiquidityFlowData[];
  sources: GroundingSource[];
}

export enum ScreenType {
  EGX30 = 'EGX30',
  EGX70 = 'EGX70',
  INVESTMENT = 'INVESTMENT',
  DAY_TRADING = 'DAY_TRADING',
  BREAKOUT = 'BREAKOUT',
  SECTOR_SCAN = 'SECTOR_SCAN',
  MARKET_INSIGHTS = 'MARKET_INSIGHTS',
  MANUAL = 'MANUAL',
  COMPARISON = 'COMPARISON',
  LIQUIDITY_FLOW = 'LIQUIDITY_FLOW', // New screen type
  SMART_MONEY = 'SMART_MONEY', // SMC screen type
  COMPREHENSIVE_ANALYSIS = 'COMPREHENSIVE_ANALYSIS' // New comprehensive analysis screen
}

export interface ScreenConfig {
  id: ScreenType;
  title: string;
  description: string;
  icon: string;
}

export interface SMCCandidate {
  symbol: string;
  name: string;
  currentPrice: number;
  accumulationState: 'Strong Accumulation' | 'Early Accumulation' | 'Neutral' | 'Distribution';
  probabilityScore: number; // 0-100
  entryLevel: number;
  stopLoss: number;
  target1: number;
  structureAnalysis: string;
  liquidityMapping: string;
  orderBlock: string;
  volumeIntelligence: string;
  rsiDivergence: string;
}

export interface SmartMoneyReportData {
  marketRegime: {
    status: 'Bullish' | 'Bearish' | 'Transition';
    egx30Structure: string;
    egx70Structure: string;
    breakOfStructure: string;
  };
  egx30Candidates: SMCCandidate[];
  egx70Candidates: SMCCandidate[];
  institutionalRotation: {
    liquidityFlowComparison: string;
    sectorRotation: string;
    tradeConcentration: string;
    regimeShift: string;
  };
  weeklyScenario: string;
  riskScenario: string;
  dataTimestamp: string;
}

export interface SmartMoneyResult {
  report: SmartMoneyReportData;
  sources: GroundingSource[];
}

export interface ComprehensiveAnalysisReport {
  symbol: string;
  name: string;
  currentPrice: number;
  introduction: {
    description: string;
    revenueSources: string;
    marketAndCompetitors: string;
  };
  fundamental: {
    financialMetrics: string;
    balanceSheet: string;
    dividends: string;
  };
  industryAndEconomy: {
    industryStatus: string;
    economicFactors: string;
  };
  technical: {
    indicators: string;
    supportResistance: string;
    trends: string;
    pricePatterns: string;
  };
  sentiment: {
    analystRatings: string;
    investorBehavior: string;
  };
  risk: {
    potentialRisks: string;
    operationalChallenges: string;
  };
  tradingPlan: {
    entryZones: string;
    stopLoss: string;
    targets: string;
    riskSize: string;
  };
  conclusion: {
    recommendation: 'شراء' | 'احتفاظ' | 'بيع';
    reasoning: string;
  };
  dataTimestamp: string;
}

export interface ComprehensiveAnalysisResult {
  report: ComprehensiveAnalysisReport;
  sources: GroundingSource[];
}
