"use client";

import { memo, useEffect, useRef, useState, useId } from "react";

interface TradingViewWidgetProps {
  ticker: string;
  interval?: string;
}

const TradingViewWidgetComponent = ({ ticker, interval = "D" }: TradingViewWidgetProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isScriptAppended = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const containerId = `tradingview-${useId()}`;

  useEffect(() => {
    const createWidget = () => {
      if (!containerRef.current || typeof (window as any).TradingView === 'undefined') {
        return;
      }
      
      setIsLoading(true);
      containerRef.current.innerHTML = '';

      new (window as any).TradingView.widget({
        autosize: true,
        symbol: ticker,
        interval: interval,
        timezone: "Etc/UTC",
        theme: "dark",
        style: "1",
        locale: "en",
        enable_publishing: false,
        hide_side_toolbar: false,
        allow_symbol_change: false,
        container_id: containerId,
        details: true,
        withdateranges: true,
        studies: [],
      });
    };

    if (!isScriptAppended.current) {
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.onload = createWidget;
      document.head.appendChild(script);
      isScriptAppended.current = true;
    } else {
      createWidget();
    }

    let observer: MutationObserver | null = null;
    if (containerRef.current) {
        observer = new MutationObserver(() => {
            if (containerRef.current?.querySelector('iframe')) {
                setIsLoading(false);
                observer?.disconnect();
            }
        });
        observer.observe(containerRef.current, { childList: true, subtree: true });
    }

    const timeout = setTimeout(() => {
        setIsLoading(false);
    }, 5000); // 5s timeout as a fallback

    return () => {
        clearTimeout(timeout);
        observer?.disconnect();
    }

  }, [ticker, interval, containerId]);

  return (
    <div className="relative h-full w-full rounded-lg shadow-md bg-card overflow-hidden transition-all duration-300">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-card">
          <p className="text-muted-foreground animate-pulse">Loading Chart...</p>
        </div>
      )}
      <div id={containerId} ref={containerRef} className="h-full w-full" />
    </div>
  );
};

export const TradingViewWidget = memo(TradingViewWidgetComponent);
