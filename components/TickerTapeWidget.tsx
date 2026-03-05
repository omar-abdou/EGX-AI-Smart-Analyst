import React, { useEffect, useRef, memo } from 'react';

const TickerTapeWidget: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isMounted = useRef(false);

  useEffect(() => {
    if (isMounted.current || !containerRef.current) {
        return;
    }

    const script = document.createElement('script');
    script.src = "https://s3.tradingview.com/external-embedding/embed-widget-ticker-tape.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = `
    {
      "symbols": [
        { "description": "Gold", "proName": "OANDA:XAUUSD" },
        { "description": "COMI", "proName": "EGX:COMI" },
        { "description": "FWRY", "proName": "EGX:FWRY" },
        { "description": "ETEL", "proName": "EGX:ETEL" },
        { "description": "ADIB", "proName": "EGX:ADIB" },
        { "description": "RMDA", "proName": "EGX:RMDA" },
        { "description": "HELI", "proName": "EGX:HELI" }
      ],
      "showSymbolLogo": true,
      "colorTheme": "dark",
      "isTransparent": false,
      "displayMode": "adaptive",
      "locale": "ar_AE"
    }`;
    
    containerRef.current.innerHTML = '';
    containerRef.current.appendChild(script);
    isMounted.current = true;

  }, []);

  return (
    <div className="tradingview-widget-container" ref={containerRef}>
      <div className="tradingview-widget-container__widget"></div>
    </div>
  );
};

export default memo(TickerTapeWidget);
