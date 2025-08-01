"use client";

import { memo, useEffect, useRef, useState, useId } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TradingViewWidgetProps {
  ticker: string;
  interval?: string;
}

const TradingViewWidgetComponent = ({ ticker, interval = "D" }: TradingViewWidgetProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isScriptAppended = useRef(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const containerId = `tradingview-${useId()}`;
  const maxRetries = 3;

  const createWidget = () => {
    try {
      if (!containerRef.current) {
        throw new Error("Container not found");
      }
      
      if (typeof (window as any).TradingView === 'undefined') {
        throw new Error("TradingView library not loaded");
      }
      
      setIsLoading(true);
      setError(null);
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
        onChartReady: () => {
          setIsLoading(false);
          setError(null);
          setRetryCount(0);
        }
      });
    } catch (err) {
      console.error("TradingView widget error:", err);
      setError(err instanceof Error ? err.message : "Failed to load chart");
      setIsLoading(false);
    }
  };

  const handleRetry = () => {
    if (retryCount < maxRetries) {
      setRetryCount(prev => prev + 1);
      setError(null);
      createWidget();
    }
  };

  useEffect(() => {
    const loadScript = () => {
      if (!isScriptAppended.current) {
        const script = document.createElement('script');
        script.src = 'https://s3.tradingview.com/tv.js';
        script.async = true;
        script.onload = () => {
          // Wait a bit for TradingView to initialize
          setTimeout(createWidget, 100);
        };
        script.onerror = () => {
          setError("Failed to load TradingView library");
          setIsLoading(false);
        };
        document.head.appendChild(script);
        isScriptAppended.current = true;
      } else {
        createWidget();
      }
    };

    loadScript();

    // Set up MutationObserver to detect when chart is loaded
    let observer: MutationObserver | null = null;
    if (containerRef.current) {
      observer = new MutationObserver(() => {
        if (containerRef.current?.querySelector('iframe')) {
          setIsLoading(false);
          setError(null);
          observer?.disconnect();
        }
      });
      observer.observe(containerRef.current, { childList: true, subtree: true });
    }

    // Fallback timeout
    const timeout = setTimeout(() => {
      if (isLoading && !error) {
        setError("Chart loading timeout - please try again");
        setIsLoading(false);
      }
    }, 10000); // 10s timeout

    return () => {
      clearTimeout(timeout);
      observer?.disconnect();
    }

  }, [ticker, interval, containerId, retryCount]);

  return (
    <div className="relative h-full w-full rounded-lg shadow-md bg-card overflow-hidden chart-transition">
      {isLoading && !error && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-card/90 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
            <p className="text-muted-foreground loading-pulse">Loading {ticker} chart...</p>
          </div>
        </div>
      )}
      
      {error && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-card/90 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-4 p-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive" />
            <div className="space-y-2">
              <h3 className="font-semibold text-lg">Chart Loading Error</h3>
              <p className="text-muted-foreground text-sm max-w-md">
                {error}
              </p>
              {retryCount < maxRetries && (
                <Button 
                  onClick={handleRetry} 
                  variant="outline" 
                  size="sm"
                  className="mt-3"
                >
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry ({maxRetries - retryCount} attempts left)
                </Button>
              )}
              {retryCount >= maxRetries && (
                <p className="text-xs text-muted-foreground mt-2">
                  Please check your internet connection and refresh the page.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div 
        id={containerId} 
        ref={containerRef} 
        className="h-full w-full"
        style={{ opacity: isLoading || error ? 0.3 : 1 }}
      />
    </div>
  );
};

export const TradingViewWidget = memo(TradingViewWidgetComponent);
