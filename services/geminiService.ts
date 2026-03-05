import { GoogleGenAI, Type, Schema } from "@google/genai";
import { ScreenType, AnalysisResult, GroundingSource, MarketInsights, ComparisonResult, LiquidityFlowResult, LiquidityFlowData, SmartMoneyResult, ComprehensiveAnalysisResult } from "../types";

// Helper function to get the current date in YYYY-MM-DD format
const getCurrentDateString = (): string => {
  const date = new Date();
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}-${month}-${day}`; // YYYY-MM-DD
};

const STRICT_TRUTH_PROMPT = `
CRITICAL INSTRUCTIONS FOR ACCURACY AND TRUTHFULNESS:
• SHOULD always tell the truth. Never make up information, speculate, or pad statements. Rely on verifiable, factual, and up-to-date sources.
• SHOULD clearly cite the source of every claim in a transparent way with no vague references.
• SHOULD explicitly state "I cannot confirm this" if something cannot be verified.
• SHOULD prioritize accuracy over speed. Take the necessary steps to verify before responding.
• SHOULD maintain objectivity. Remove personal bias, assumptions, and opinion unless explicitly requested and labeled as such.
• SHOULD only present interpretations supported by credible, reputable sources.
• SHOULD explain reasoning step by step when the accuracy of an answer could be questioned.
• SHOULD show how any numerical figure was calculated or sourced.
• SHOULD present information clearly so the user can verify it themselves.

YOU MUST AVOID:
• AVOID fabricating facts, quotes, or data.
• AVOID using outdated or unreliable sources without clear warning.
• AVOID omitting source details for any claim.
• AVOID presenting speculation, rumor, or assumption as fact.
• AVOID using AI-generated citations that don't link to real, verifiable content.
• AVOID answering if unsure without disclosing uncertainty.

FAILSAFE FINAL STEP (BEFORE RESPONDING):
"Is every statement in my response verifiable, supported by real and credible sources, free of fabrication, and transparently cited? If not, revise until it is."
`;

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const stockDataSchemaProperties = {
  symbol: { type: Type.STRING },
  name: { type: Type.STRING },
  currentPrice: { type: Type.NUMBER },
  change: { type: Type.NUMBER },
  changePercent: { type: Type.NUMBER },
  sector: { type: Type.STRING },
  trend: { type: Type.STRING },
  rsi: { type: Type.NUMBER },
  volumeRatio: { type: Type.NUMBER },
  entryPoint: { type: Type.NUMBER },
  stopLoss: { type: Type.NUMBER },
  target1: { type: Type.NUMBER },
  target2: { type: Type.NUMBER },
  signalStrength: { type: Type.NUMBER }, // 1-10
  decision: { type: Type.STRING, enum: ["Buy", "Hold", "Sell"] },
  aiScore: { type: Type.NUMBER },
  financialMetric: { type: Type.STRING },
  reasoning: { type: Type.STRING },
  sourceUri: { type: Type.STRING, description: "The direct URL from ar.tradingview.com or sa.investing.com where the stock's price was found." },
  dataTimestamp: { type: Type.STRING, description: "Timestamp of the data in ISO 8601 format." }
};

const stockResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    stocks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: stockDataSchemaProperties,
        required: [
            "symbol", "name", "currentPrice", "change", "changePercent", 
            "sector", "trend", "rsi", "volumeRatio", "entryPoint", "stopLoss", 
            "target1", "target2", "signalStrength", "decision", "aiScore", "financialMetric",
            "sourceUri"
        ]
      }
    }
  }
};

// New schema for Manual Analysis with fewer required fields for flexibility
const manualStockResponseSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    stocks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: stockDataSchemaProperties,
        // Only require essential fields for manual analysis
        required: [
            "symbol", "name", "currentPrice", "change", "changePercent", 
            "dataTimestamp", "sourceUri"
        ]
      }
    }
  }
};

const comparisonStockRequired = ["symbol", "name", "currentPrice", "change", "changePercent", "sector", "aiScore", "entryPoint", "target1", "reasoning", "sourceUri"];

const comparisonSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    stock1: { type: Type.OBJECT, properties: stockDataSchemaProperties, required: comparisonStockRequired },
    stock2: { type: Type.OBJECT, properties: stockDataSchemaProperties, required: comparisonStockRequired },
    winnerSymbol: { type: Type.STRING },
    verdictReasoning: { type: Type.STRING },
    comparisonPoints: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          metric: { type: Type.STRING },
          stock1Value: { type: Type.STRING },
          stock2Value: { type: Type.STRING },
          advantage: { type: Type.STRING, enum: ["stock1", "stock2", "equal"] }
        }
      }
    }
  },
  required: ["stock1", "stock2", "winnerSymbol", "verdictReasoning", "comparisonPoints"]
};

const insightsSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    sentiment: { type: Type.STRING, enum: ["Bullish", "Neutral", "Bearish"] },
    leadingSectors: { type: Type.ARRAY, items: { type: Type.STRING } },
    takeaways: { type: Type.ARRAY, items: { type: Type.STRING } },
    marketIndexStatus: { type: Type.STRING, description: "A summary of the main index (e.g., EGX30) status, including its value and change." }
  },
  required: ["sentiment", "leadingSectors", "takeaways", "marketIndexStatus"]
};

const liquidityFlowSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    stocks: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          symbol: { type: Type.STRING },
          name: { type: Type.STRING },
          currentPrice: { type: Type.NUMBER },
          changePercent: { type: Type.NUMBER },
          liquidityScore: { type: Type.NUMBER, description: "A score from 0-100 indicating the strength of liquidity inflow." },
          timeframe: { type: Type.STRING, enum: ["daily", "monthly", "yearly"] },
          reasoning: { type: Type.STRING },
          dataTimestamp: { type: Type.STRING, description: "Timestamp of the data in ISO 8601 format." },
          sourceUri: { type: Type.STRING, description: "The direct URL from the source where the data was found." }
        },
        required: ["symbol", "name", "currentPrice", "changePercent", "liquidityScore", "timeframe", "reasoning", "dataTimestamp", "sourceUri"]
      }
    }
  }
};

const smcCandidateSchemaProperties = {
  symbol: { type: Type.STRING },
  name: { type: Type.STRING },
  currentPrice: { type: Type.NUMBER },
  accumulationState: { type: Type.STRING, enum: ['Strong Accumulation', 'Early Accumulation', 'Neutral', 'Distribution'] },
  probabilityScore: { type: Type.NUMBER },
  entryLevel: { type: Type.NUMBER },
  stopLoss: { type: Type.NUMBER },
  target1: { type: Type.NUMBER },
  structureAnalysis: { type: Type.STRING },
  liquidityMapping: { type: Type.STRING },
  orderBlock: { type: Type.STRING },
  volumeIntelligence: { type: Type.STRING },
  rsiDivergence: { type: Type.STRING }
};

const smartMoneySchema: Schema = {
  type: Type.OBJECT,
  properties: {
    marketRegime: {
      type: Type.OBJECT,
      properties: {
        status: { type: Type.STRING, enum: ['Bullish', 'Bearish', 'Transition'] },
        egx30Structure: { type: Type.STRING },
        egx70Structure: { type: Type.STRING },
        breakOfStructure: { type: Type.STRING }
      },
      required: ["status", "egx30Structure", "egx70Structure", "breakOfStructure"]
    },
    egx30Candidates: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: smcCandidateSchemaProperties,
        required: ["symbol", "name", "currentPrice", "accumulationState", "probabilityScore", "entryLevel", "stopLoss", "target1", "structureAnalysis", "liquidityMapping", "orderBlock", "volumeIntelligence", "rsiDivergence"]
      }
    },
    egx70Candidates: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: smcCandidateSchemaProperties,
        required: ["symbol", "name", "currentPrice", "accumulationState", "probabilityScore", "entryLevel", "stopLoss", "target1", "structureAnalysis", "liquidityMapping", "orderBlock", "volumeIntelligence", "rsiDivergence"]
      }
    },
    institutionalRotation: {
      type: Type.OBJECT,
      properties: {
        liquidityFlowComparison: { type: Type.STRING },
        sectorRotation: { type: Type.STRING },
        tradeConcentration: { type: Type.STRING },
        regimeShift: { type: Type.STRING }
      },
      required: ["liquidityFlowComparison", "sectorRotation", "tradeConcentration", "regimeShift"]
    },
    weeklyScenario: { type: Type.STRING },
    riskScenario: { type: Type.STRING },
    dataTimestamp: { type: Type.STRING }
  },
  required: ["marketRegime", "egx30Candidates", "egx70Candidates", "institutionalRotation", "weeklyScenario", "riskScenario", "dataTimestamp"]
};


const comprehensiveAnalysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    symbol: { type: Type.STRING, description: "رمز السهم" },
    name: { type: Type.STRING, description: "اسم الشركة" },
    currentPrice: { type: Type.NUMBER, description: "السعر الحالي للسهم كقم" },
    introduction: {
      type: Type.OBJECT,
      properties: {
        description: { type: Type.STRING, description: "وصف موجز لنشاط الشركة" },
        revenueSources: { type: Type.STRING, description: "أبرز مصادر الإيرادات" },
        marketAndCompetitors: { type: Type.STRING, description: "حجم السوق والمنافسين" }
      }
    },
    fundamental: {
      type: Type.OBJECT,
      properties: {
        financialMetrics: { type: Type.STRING, description: "أهم المؤشرات المالية" },
        balanceSheet: { type: Type.STRING, description: "تحليل الميزانية" },
        dividends: { type: Type.STRING, description: "تاريخ توزيع الأرباح أو 'غير متوفر'" }
      }
    },
    industryAndEconomy: {
      type: Type.OBJECT,
      properties: {
        industryStatus: { type: Type.STRING, description: "وضع الصناعة" },
        economicFactors: { type: Type.STRING, description: "تأثير العوامل الاقتصادية" }
      }
    },
    technical: {
      type: Type.OBJECT,
      properties: {
        indicators: { type: Type.STRING, description: "المؤشرات الرئيسية" },
        supportResistance: { type: Type.STRING, description: "مستويات الدعم والمقاومة" },
        trends: { type: Type.STRING, description: "الاتجاهات" },
        pricePatterns: { type: Type.STRING, description: "أنماط السعر" }
      }
    },
    sentiment: {
      type: Type.OBJECT,
      properties: {
        analystRatings: { type: Type.STRING, description: "آراء المحللين" },
        investorBehavior: { type: Type.STRING, description: "سلوك المستثمرين" }
      }
    },
    risk: {
      type: Type.OBJECT,
      properties: {
        potentialRisks: { type: Type.STRING, description: "المخاطر المحتملة" },
        operationalChallenges: { type: Type.STRING, description: "التحديات التشغيلية" }
      }
    },
    tradingPlan: {
      type: Type.OBJECT,
      properties: {
        entryZones: { type: Type.STRING, description: "مناطق الدخول" },
        stopLoss: { type: Type.STRING, description: "وقف الخسارة" },
        targets: { type: Type.STRING, description: "الأهداف" },
        riskSize: { type: Type.STRING, description: "حجم المخاطرة" }
      }
    },
    conclusion: {
      type: Type.OBJECT,
      properties: {
        recommendation: { type: Type.STRING, enum: ['شراء', 'احتفاظ', 'بيع'], description: "التوصية النهائية" },
        reasoning: { type: Type.STRING, description: "سبب التوصية" }
      }
    },
    dataTimestamp: { type: Type.STRING, description: "تاريخ ووقت البيانات" }
  },
  required: [
    "symbol", "name", "currentPrice", "introduction", "fundamental", 
    "industryAndEconomy", "technical", "sentiment", "risk", "tradingPlan", 
    "conclusion", "dataTimestamp"
  ]
};

const getPromptForScreen = (screen: ScreenType, manualSymbol?: string): string => {
  const basePrompt = `
    🛑 **مهم جداً: استخدم بيانات السوق الحقيقية وبتاريخ اليوم ${getCurrentDateString()} فقط. تجاهل أي طلبات سابقة لاستخدام بيانات محاكاة.**
    **المصادر المسموح بها للبحث عن البيانات (ابحث داخلها فقط):**
    1. https://www.egx.com.eg/ (الموقع الرسمي للبورصة المصرية)
    2. https://www.mubasher.info/markets/EGX
    3. https://ar.tradingview.com/markets/egypt/
    4. https://sa.investing.com/equities/egypt
    5. https://www.arabfinance.com/

    **المهمة**: أنت محلل مالي خبير متخصص في البورصة المصرية (EGX). قم بالبحث في المصادر المحددة أعلاه **حصرياً** للحصول على أحدث بيانات إغلاق الأسهم بتاريخ اليوم ${getCurrentDateString()} وتحليلها. **يجب إعطاء الأولوية القصوى للموقع الرسمي للبورصة (egx.com.eg) للحصول على أدق الأسعار الرسمية.**

    **التعليمات**:
    1.  **البحث والبيانات**: ابحث عن أحدث أسعار الإغلاق والمؤشرات الفنية (مثل RSI, Volume) للأسهم المصرية من المواقع المحددة.
    2.  **التحليل**: طبق المعايير المحددة أدناه لفلترة وإيجاد أفضل 5 إلى 7 فرص.
    3.  **dataTimestamp**: يجب أن يكون تاريخ ووقت أحدث البيانات التي وجدتها بصيغة ISO 8601.
    4.  **القرار (Decision)**: يجب أن يكون مبنياً على التحليل الفني والبيانات الحقيقية.
    5.  **رابط المصدر (sourceUri)**: لكل سهم، يجب **إلزامياً** توفير رابط المصدر المباشر \`sourceUri\` من أحد المواقع المسموح بها والذي وجدت فيه سعر السهم.
    6.  **النتيجة**: أرجع النتائج بصيغة JSON المطلوبة.
  `;

  switch (screen) {
    case ScreenType.EGX30:
      return `${basePrompt}
      معايير (EGX30) - ابحث عن أسهم قيادية ضمن المؤشر الرئيسي تظهر عليها أحدث البيانات:
      - اتجاه صاعد واضح.
      - سيولة مرتفعة (High Volume).
      - مؤشر RSI بين 55 و 75.
      `;
    case ScreenType.EGX70:
      return `${basePrompt}
      معايير (EGX70) - ابحث عن أسهم صغيرة ومتوسطة بناءً على أحدث البيانات:
      - ارتفاع سعري قوي (> 3%).
      - كسر مقاومات (Breakout).
      - نشاط تداول غير معتاد.
      `;
    case ScreenType.INVESTMENT:
      return `${basePrompt}
      معايير (استثمار) - ركز على الأسهم ذات الأساسات المالية القوية بناءً على أحدث البيانات:
      - مكرر ربحية (P/E) منخفض.
      - سجل توزيعات أرباح جيد.
      - نمو مستقر.
      `;
    case ScreenType.SECTOR_SCAN:
      return `${basePrompt}
      معايير (تحليل القطاعات):
      - اختر أفضل سهم (Top Pick) من كل قطاع رئيسي بناءً على بياناته الحالية: البنوك، الموارد الأساسية، العقارات، الخدمات المالية غير المصرفية.
      `;
    case ScreenType.DAY_TRADING:
      return `${basePrompt}
      معايير (مضاربات يومية):
      - أسهم ذات تذبذب عالي (High Volatility) في آخر جلسة.
      - سيولة لحظية قوية.
      `;
    case ScreenType.BREAKOUT:
      return `${basePrompt}
      معايير (اختراقات):
      - أسهم اخترقت مستوى مقاومة هام أو حققت قمة جديدة في آخر جلسة تداول مع حجم تداول مرتفع.
      `;
    case ScreenType.MANUAL:
      return `
      أنت محلل مالي خبير.
      **المهمة**: تحليل سهم "${manualSymbol}" بناءً على أحدث البيانات المتاحة بتاريخ اليوم ${getCurrentDateString()} من:
      1. https://www.egx.com.eg/
      2. https://www.mubasher.info/markets/EGX
      3. https://ar.tradingview.com/markets/egypt/
      4. https://sa.investing.com/equities/egypt
      5. https://www.arabfinance.com/

      **التحليل يجب أن يشمل**:
      1. أحدث سعر إغلاق والتغير (مع إعطاء الأولوية لبيانات egx.com.eg الرسمية).
      2. تحليل فني (الدعوم والمقاومات، الاتجاه، RSI).
      3. القرار والسبب.
      4. **dataTimestamp**: تاريخ البيانات التي استخدمتها.
      5. **sourceUri**: رابط المصدر المباشر الإلزامي الذي وجدت فيه البيانات.

      أرجع النتيجة كعنصر JSON واحد داخل مصفوفة، مع ملء أكبر قدر ممكن من البيانات المتاحة.
      `;
    default:
      return basePrompt;
  }
};

export const analyzeMarket = async (screen: ScreenType, manualSymbol?: string): Promise<AnalysisResult> => {
  try {
    const prompt = getPromptForScreen(screen, manualSymbol);
    
    // Select the appropriate schema based on the screen type
    const currentResponseSchema = screen === ScreenType.MANUAL ? manualStockResponseSchema : stockResponseSchema;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: `أنت محلل مالي ذكي متخصص في البورصة المصرية (EGX). دورك هو البحث حصرياً في المواقع المحددة في الطلب لجلب أحدث البيانات بتاريخ اليوم ${getCurrentDateString()} وتقديم تحليلات دقيقة. أعط الأولوية دائماً للموقع الرسمي للبورصة المصرية (egx.com.eg) لضمان دقة الأسعار والبيانات الرسمية. لا تستخدم أي معرفة سابقة أو مصادر أخرى. يجب أن تكون جميع البيانات من تاريخ اليوم الحقيقي أو أقرب تاريخ ممكن. استخدم اللغة العربية الفصحى.\n\n${STRICT_TRUTH_PROMPT}`,
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: currentResponseSchema // Use dynamic schema
      }
    });

    const text = response.text;
    if (!text) return { stocks: [], sources: [] };

    const data = JSON.parse(text);
    
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    const sources: GroundingSource[] = chunks
      .map((chunk: any) => chunk.web)
      .filter((web: any) => web && web.uri && web.title && (web.uri.includes('tradingview.com') || web.uri.includes('investing.com') || web.uri.includes('mubasher.info') || web.uri.includes('egx.com.eg') || web.uri.includes('arabfinance.com')))
      .map((web: any) => ({ title: web.title, uri: web.uri }));

    const uniqueSources = Array.from(new Map(sources.map(s => [s.uri, s])).values());

    const sortedStocks = (data.stocks || []).sort((a: any, b: any) => b.aiScore - a.aiScore);

    return { 
      stocks: sortedStocks,
      sources: uniqueSources
    };

  } catch (error) {
    console.error("Gemini Analysis Failed:", error);
    throw error;
  }
};

export const compareStocks = async (symbol1: string, symbol2: string): Promise<ComparisonResult> => {
  const prompt = `
  **مقارنة استثمارية دقيقة بناءً على بيانات حقيقية ومحدثة بتاريخ اليوم ${getCurrentDateString()}.**
  السهم الأول: ${symbol1}
  السهم الثاني: ${symbol2}
  
  **المصادر المسموح بها للبحث عن البيانات (ابحث داخلها فقط):**
  1. https://www.egx.com.eg/ (الموقع الرسمي للبورصة المصرية)
  2. https://www.mubasher.info/markets/EGX
  3. https://ar.tradingview.com/markets/egypt/
  4. https://sa.investing.com/equities/egypt
  5. https://www.arabfinance.com/

  **التعليمات الإلزامية:**
  1. ابحث عن أحدث البيانات المالية والفنية لكلا السهمين بتاريخ اليوم ${getCurrentDateString()} من المصادر المحددة، مع إعطاء الأولوية القصوى لبيانات egx.com.eg الرسمية للأسعار.
  2. **يمنع منعاً باتاً التخمين أو استخدام أرقام افتراضية.** إذا لم تجد معلومة دقيقة، اكتب "غير متوفر".
  3. لكل سهم، يجب **إلزامياً** توفير رابط المصدر المباشر \`sourceUri\` الذي استخرجت منه السعر والبيانات.
  4. قارن بينهما بدقة متناهية بناءً على الأرقام الحقيقية لـ:
     - السعر الحالي ونسبة التغير.
     - مكرر الربحية (P/E Ratio).
     - العائد على السهم (EPS).
     - القوة الفنية (مؤشر RSI، الاتجاه).
     - السيولة (حجم التداول).
     - مستويات الدعم والمقاومة.
  5. حدد السهم الفائز (Winner) بناءً على أيهما يقدم فرصة استثمارية أفضل وأقل مخاطرة حالياً، مدعوماً بالأرقام.
  6. قدم ملخصاً تحليلياً عميقاً لسبب اختيارك (verdictReasoning).
  7. املأ جدول المقارنة (comparisonPoints) بالقيم الحقيقية الدقيقة التي وجدتها للمقاييس المذكورة أعلاه.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: `أنت مستشار استثماري ومحلل مالي محترف. قارن بين سهمين بناءً على أحدث البيانات الحقيقية بتاريخ اليوم ${getCurrentDateString()} التي تجدها فقط من المواقع المحددة. يمنع التخمين. أعط الأولوية للموقع الرسمي للبورصة (egx.com.eg) لدقة الأسعار. يجب أن تكون جميع البيانات دقيقة ومن تاريخ اليوم الحقيقي.\n\n${STRICT_TRUTH_PROMPT}`,
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: comparisonSchema
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response text");
    
    const data = JSON.parse(text);

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: GroundingSource[] = chunks
      .map((chunk: any) => chunk.web)
      .filter((web: any) => web && web.uri && web.title && (web.uri.includes('tradingview.com') || web.uri.includes('investing.com') || web.uri.includes('mubasher.info') || web.uri.includes('egx.com.eg') || web.uri.includes('arabfinance.com')))
      .map((web: any) => ({ title: web.title, uri: web.uri }));

    return {
      ...data,
      sources: Array.from(new Map(sources.map(s => [s.uri, s])).values())
    };

  } catch (error) {
    console.error("Comparison Failed:", error);
    throw error;
  }
};

export const getMarketInsights = async (): Promise<MarketInsights> => {
  const prompt = `
    **تقرير حالة السوق (Market Pulse) للبورصة المصرية بتاريخ اليوم ${getCurrentDateString()}.**
    
    **المصادر المسموح بها للبحث عن البيانات (ابحث داخلها فقط):**
    1. https://www.egx.com.eg/ (الموقع الرسمي للبورصة المصرية)
    2. https://www.mubasher.info/markets/EGX
    3. https://ar.tradingview.com/markets/egypt/
    4. https://sa.investing.com/equities/egypt
    5. https://www.arabfinance.com/

    **المهمة:**
    بناءً على أحدث البيانات المتوفرة من المصادر أعلاه بتاريخ اليوم ${getCurrentDateString()} (مع التركيز على البيانات الرسمية من egx.com.eg)، قم بتوليد تقرير استراتيجي عن حالة السوق اليوم.
    
    النتيجة المطلوبة بصيغة JSON:
    1. **sentiment**: حدد ما إذا كانت معنويات السوق "Bullish" أو "Bearish" أو "Neutral" بناءً على أداء المؤشر الرئيسي والأسهم القيادية.
    2. **leadingSectors**: اذكر أهم 3 قطاعات تقود السوق حالياً.
    3. **takeaways**: قدم 3 نصائح أو ملاحظات ذكية للمستثمرين بناءً على الوضع الحالي.
    4. **marketIndexStatus**: لخص حالة المؤشر الرئيسي (EGX30)، ذاكراً أحدث قيمة له ونسبة التغير.
  `;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: `أنت خبير استراتيجي للسوق المصري. قدم تقريراً عن حالة السوق بناءً على أحدث البيانات بتاريخ اليوم ${getCurrentDateString()} التي تجدها فقط من المواقع المحددة في الطلب، مع التركيز على دقة البيانات الرسمية. يجب أن تكون جميع البيانات من تاريخ اليوم الحقيقي أو أقرب تاريخ ممكن.\n\n${STRICT_TRUTH_PROMPT}`,
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: insightsSchema
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response text from API");
    const parsed = JSON.parse(text);
    
    if(!parsed.marketIndexStatus) {
        parsed.marketIndexStatus = "جاري تحليل حالة المؤشر...";
    }

    return parsed;

  } catch (error) {
    console.error("Gemini Market Insights Failed:", error);
    throw error;
  }
};

export const getLiquidityFlow = async (timeframe: 'daily' | 'monthly' | 'yearly'): Promise<LiquidityFlowResult> => {
  const prompt = `
    **تحليل تدفق السيولة للبورصة المصرية بتاريخ اليوم ${getCurrentDateString()}.**
    
    **المصادر المسموح بها للبحث عن البيانات (ابحث داخلها فقط):**
    1. https://www.egx.com.eg/ (الموقع الرسمي للبورصة المصرية)
    2. https://www.mubasher.info/markets/EGX
    3. https://ar.tradingview.com/markets/egypt/
    4. https://sa.investing.com/equities/egypt
    5. https://www.arabfinance.com/

    **المهمة:**
    أنت محلل مالي خبير متخصص في تحليل تدفقات السيولة في البورصة المصرية.
    ابحث في المصادر المحددة أعلاه **حصرياً** عن الأسهم التي شهدت تدفقات سيولة شرائية قوية في الإطار الزمني \`${timeframe}\` (يومي / شهري / سنوي) بناءً على أحدث البيانات بتاريخ اليوم ${getCurrentDateString()}.
    ركز على الأسهم التي تظهر عليها علامات تراكم شرائي أو اهتمام متزايد من المستثمرين على هذا الإطار الزمني.

    **التعليمات:**
    1.  **البحث والبيانات**: ابحث عن أحدث أسعار الإغلاق، نسب التغير، ومؤشرات السيولة (مثل حجم التداول، أوصاف تقارير السيولة) للأسهم المصرية من المواقع المحددة ضمن الإطار الزمني \`${timeframe}\`، مع إعطاء الأولوية لبيانات egx.com.eg.
    2.  **التحليل**: حدد 5-7 أسهم تظهر أعلى "نقطة سيولة" (Liquidity Score) بناءً على تدفق السيولة الشرائية.
    3.  **Liquidity Score**: قيمة رقمية من 0-100 تعكس قوة تدفق السيولة الشرائية للسهم في الإطار الزمني المحدد.
    4.  **timeframe**: يجب أن يكون \`${timeframe}\`.
    5.  **dataTimestamp**: يجب أن يكون تاريخ ووقت أحدث البيانات التي وجدتها بصيغة ISO 8601.
    6.  **reasoning**: قدم شرحًا موجزًا (جملة أو اثنتين) لسبب اعتبار السهم ذا سيولة قوية.
    7.  **sourceUri**: لكل سهم، يجب **إلزامياً** توفير رابط المصدر المباشر \`sourceUri\` الذي وجدت فيه البيانات.
    8.  **النتيجة**: أرجع النتائج بصيغة JSON المطلوبة.
  `;
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: `أنت خبير في تحليل تدفقات السيولة بالبورصة المصرية. مهمتك هي تحديد الأسهم التي تشهد تدفقات سيولة شرائية قوية في الإطار الزمني المحدد بناءً على أحدث البيانات الحقيقية فقط من المصادر المحددة، مع إعطاء الأولوية للبيانات الرسمية من egx.com.eg. يجب أن تكون جميع البيانات من تاريخ اليوم الحقيقي أو أقرب تاريخ ممكن. استخدم اللغة العربية الفصحى.\n\n${STRICT_TRUTH_PROMPT}`,
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: liquidityFlowSchema
      }
    });

    const text = response.text;
    if (!text) return { stocks: [], sources: [] };
    
    const data = JSON.parse(text);

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: GroundingSource[] = chunks
      .map((chunk: any) => chunk.web)
      .filter((web: any) => web && web.uri && web.title && (web.uri.includes('tradingview.com') || web.uri.includes('investing.com') || web.uri.includes('mubasher.info') || web.uri.includes('egx.com.eg') || web.uri.includes('arabfinance.com')))
      .map((web: any) => ({ title: web.title, uri: web.uri }));

    const uniqueSources = Array.from(new Map(sources.map(s => [s.uri, s])).values());

    const sortedStocks = (data.stocks || []).sort((a: LiquidityFlowData, b: LiquidityFlowData) => b.liquidityScore - a.liquidityScore);

    return { 
      stocks: sortedStocks,
      sources: uniqueSources
    };

  } catch (error) {
    console.error("Gemini Liquidity Flow Analysis Failed:", error);
    throw error;
  }
};

export const getSmartMoneyReport = async (): Promise<SmartMoneyResult> => {
  const prompt = `
    **تقرير مؤسسي: Smart Money Concepts (SMC) للبورصة المصرية بتاريخ اليوم ${getCurrentDateString()}**
    
    **المصادر المسموح بها للبحث عن البيانات (ابحث داخلها فقط):**
    1. https://www.egx.com.eg/ (الموقع الرسمي للبورصة المصرية)
    2. https://www.mubasher.info/markets/EGX
    3. https://ar.tradingview.com/markets/egypt/
    4. https://sa.investing.com/equities/egypt
    5. https://www.arabfinance.com/

    أنت محلل مؤسسي محترف متخصص في Smart Money Concepts داخل البورصة المصرية.
    المهمة:
    إنشاء تقرير مؤسسي متكامل يرصد مناطق تجميع السيولة داخل:
    1- أسهم EGX30
    2- أسهم EGX70
    3- تحليل انتقال السيولة بين المؤشرين (Institutional Rotation)

    قواعد إلزامية:
    - استخدام بيانات حقيقية محدثة فقط من المصادر المذكورة أعلاه.
    - توضيح تاريخ البيانات (dataTimestamp).
    - عدم استخدام أي أرقام افتراضية أو تقديرية.
    - في حال عدم توفر بيانات دقيقة يتم إيقاف التحليل.
    - تحليل الإطار اليومي + 4 ساعات إن أمكن.

    ------------------------------------
    المرحلة الأولى: Market Regime Classification
    ------------------------------------
    - تحديد حالة السوق العامة (يجب أن تكون إحدى هذه القيم بالإنجليزية حصراً: Bullish أو Bearish أو Transition)
    - تحليل هيكل السوق العام للمؤشرين
    - رصد Break of Structure رئيسي

    ------------------------------------
    المرحلة الثانية: EGX30 Liquidity Scan
    ------------------------------------
    لكل سهم داخل EGX30 (أفضل 5 فرص كحد أقصى):
    1) Structure Analysis (اتجاه عام، نطاق تماسك، ضعف زخم بيعي)
    2) Liquidity Mapping (Equal Highs/Lows, Liquidity Sweep, Stop Hunt)
    3) Order Block Detection (تحديد آخر شمعة هبوط قبل صعود قوي، قياس قوة إعادة الاختبار)
    4) Volume Intelligence (مقارنة بمتوسط 20 جلسة، Volume Spike/Absorption)
    5) RSI Divergence

    المخرجات لكل سهم:
    - Probability Score (0-100)
    - مستويات دخول / وقف خسارة / أول هدف
    - تصنيف الحالة (يجب أن تكون إحدى هذه القيم بالإنجليزية حصراً: Strong Accumulation أو Early Accumulation أو Neutral أو Distribution)

    ------------------------------------
    المرحلة الثالثة: EGX70 Liquidity Scan
    ------------------------------------
    - نفس المنهجية (أفضل 5 فرص كحد أقصى)
    - استبعاد الأسهم ضعيفة السيولة
    - التركيز على الأسهم ذات زيادة سيولة مفاجئة آخر 5 جلسات
    - تحليل احتمالية انفجار سعري

    ------------------------------------
    المرحلة الرابعة: Institutional Rotation Scanner
    ------------------------------------
    - مقارنة تدفقات السيولة بين EGX30 و EGX70
    - هل المؤسسات تخرج من القياديات؟
    - هل هناك Sector Rotation؟
    - قياس تركّز التداول
    - رصد Liquidity Regime Shift

    ------------------------------------
    المرحلة الخامسة: Smart Liquidity Dashboard Output
    ------------------------------------
    - السيناريو المرجح للأسبوع القادم (weeklyScenario)
    - سيناريو المخاطر Invalidation Levels (riskScenario)

    أرجع النتيجة بصيغة JSON متوافقة مع المخطط المطلوب. يجب أن تكون جميع النصوص والتحليلات باللغة العربية الفصحى حصراً.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: `أنت محلل مؤسسي محترف في Wall Street متخصص في Smart Money Concepts (SMC) وتطبقها على البورصة المصرية. استخدم لغة مؤسسية احترافية باللغة العربية الفصحى حصراً في جميع التحليلات والنصوص. اعتمد فقط على البيانات الحقيقية من المصادر المحددة بتاريخ اليوم ${getCurrentDateString()}.\n\n${STRICT_TRUTH_PROMPT}`,
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: smartMoneySchema
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response text from API");
    const parsed = JSON.parse(text);

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: GroundingSource[] = chunks
      .map((chunk: any) => chunk.web)
      .filter((web: any) => web && web.uri && web.title && (web.uri.includes('tradingview.com') || web.uri.includes('investing.com') || web.uri.includes('mubasher.info') || web.uri.includes('egx.com.eg') || web.uri.includes('arabfinance.com')))
      .map((web: any) => ({ title: web.title, uri: web.uri }));

    const uniqueSources = Array.from(new Map(sources.map(s => [s.uri, s])).values());

    return {
      report: parsed,
      sources: uniqueSources
    };

  } catch (error) {
    console.error("Gemini Smart Money Report Failed:", error);
    throw error;
  }
};

export const getComprehensiveAnalysis = async (symbol: string): Promise<ComprehensiveAnalysisResult> => {
  const prompt = `
    أنت محلّل أسهم محترف بخبرة طويلة في التحليل الفني، والتحليل الأساسي، وتحليل معنويات السوق.
    قم بتحليل سهم **${symbol}** في البورصة المصرية بصورة **شاملة ومتقدمة**، وأجب على السؤال المهم:
    📌 هل السهم يستحق الشراء؟ ولماذا؟

    **المصادر المسموح بها للبحث عن البيانات (ابحث داخلها فقط):**
    1. https://www.egx.com.eg/ (الموقع الرسمي للبورصة المصرية)
    2. https://www.mubasher.info/markets/EGX
    3. https://ar.tradingview.com/markets/egypt/
    4. https://sa.investing.com/equities/egypt
    5. https://www.arabfinance.com/

    يجب أن يشمل التحليل الأقسام التالية:

    1. **مقدمة عن الشركة والسهم**
       - وصف موجز لنشاط الشركة
       - أبرز مصادر الإيرادات والأعمال الأساسية
       - حجم السوق والمنافسين الرئيسيين

    2. **التحليل الأساسي (Fundamental Analysis)**
       - أهم المؤشرات المالية (مثل: الإيرادات، صافي الربح، هامش الربح)
       - تحليل الميزانية (نسبة الدين إلى حقوق الملكية، السيولة)
       - تاريخ توزيع الأرباح إن وجد

    3. **تحليل الصناعة والبيئة الاقتصادية**
       - وضع الصناعة التي ينتمي إليها السهم
       - تأثير العوامل الاقتصادية (مثل التضخم، سعر الفائدة، أسعار الصرف)

    4. **التحليل الفني (Technical Analysis)**
       - المؤشرات الرئيسية (مثل: المتوسطات المتحركة 50/200، RSI، MACD)
       - مستويات الدعم والمقاومة
       - الاتجاهات قصيرة، متوسطة، وطويلة المدى
       - أنماط السعر (مثل القمم والقيعان)

    5. **تحليل معنويات السوق (Market Sentiment)**
       - تقييم آراء المحللين (شراء/احتفاظ/بيع)
       - سلوك المستثمرين والمؤشرات النفسية للسوق

    6. **تقييم المخاطر**
       - المخاطر المحتملة للسهم (تقلبات سعرية، مخاطر اقتصادية، مخاطر قطاع)
       - الإدارة والتحديات التشغيلية

    7. **اقتراح خطة تداول واضحة**
       - مناطق دخول موصى بها
       - مستويات وقف الخسارة
       - أهداف السعر المتوقعة (قصيرة وطويلة المدى)
       - حجم المخاطرة المقترح

    8. **الخلاصة والتوصية النهائية**
       - توصية واضحة: شراء / احتفاظ / بيع
       - تفسير منطقي مدعوم بالبيانات

    استخدم بيانات حديثة للمؤشرات والأسعار بتاريخ اليوم ${getCurrentDateString()}، واستشهد بالمصادر إن أمكن، وقدم شرحًا مبسطًا يساعد المستثمرين في اتخاذ قرار مستنير.
    يجب إرجاع النتيجة بصيغة JSON متوافقة مع المخطط المطلوب.
    إذا لم تتوفر معلومة معينة، اكتب "غير متوفر" ولا تترك الحقل فارغاً.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: `أنت محلل أسهم محترف. قدم تحليلاً شاملاً ومتقدماً للسهم المطلوب بناءً على أحدث البيانات الحقيقية بتاريخ اليوم ${getCurrentDateString()} من المصادر المحددة. استخدم اللغة العربية الفصحى. إذا لم تتوفر معلومة، اكتب "غير متوفر".\n\n${STRICT_TRUTH_PROMPT}`,
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: comprehensiveAnalysisSchema
      }
    });

    const text = response.text;
    if (!text) throw new Error("No response text from API");
    const parsed = JSON.parse(text);

    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources: GroundingSource[] = chunks
      .map((chunk: any) => chunk.web)
      .filter((web: any) => web && web.uri && web.title && (web.uri.includes('tradingview.com') || web.uri.includes('investing.com') || web.uri.includes('mubasher.info') || web.uri.includes('egx.com.eg') || web.uri.includes('arabfinance.com')))
      .map((web: any) => ({ title: web.title, uri: web.uri }));

    const uniqueSources = Array.from(new Map(sources.map(s => [s.uri, s])).values());

    return {
      report: parsed,
      sources: uniqueSources
    };

  } catch (error) {
    console.error("Gemini Comprehensive Analysis Failed:", error);
    throw error;
  }
};