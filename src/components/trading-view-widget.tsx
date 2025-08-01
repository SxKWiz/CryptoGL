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
  const widgetRef = useRef<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const [scriptLoaded, setScriptLoaded] = useState(() => {
    // Check if TradingView is already available on initial render
    return typeof window !== 'undefined' && 
           typeof (window as any).TradingView !== 'undefined' && 
           typeof (window as any).TradingView.widget === 'function';
  });
  const containerId = `tradingview-${useId()}`;
  const maxRetries = 3;

  // Check if TradingView script is already loaded
  const isTradingViewAvailable = () => {
    return typeof window !== 'undefined' && 
           typeof (window as any).TradingView !== 'undefined' && 
           typeof (window as any).TradingView.widget === 'function';
  };

  const createWidget = () => {
    try {
      if (!containerRef.current) {
        throw new Error("Container not found");
      }
      
      if (!isTradingViewAvailable()) {
        throw new Error("TradingView library not loaded");
      }
      
      setIsLoading(true);
      setError(null);
      
      // Clear previous widget
      if (widgetRef.current) {
        try {
          widgetRef.current.remove();
        } catch (e) {
          // Ignore removal errors
        }
        widgetRef.current = null;
      }
      
      containerRef.current.innerHTML = '';

      // Create new widget
      widgetRef.current = new (window as any).TradingView.widget({
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
      setIsLoading(true);
      
      if (scriptLoaded && isTradingViewAvailable()) {
        createWidget();
      } else {
        loadTradingViewScript();
      }
    }
  };

  const loadTradingViewScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Check if script is already loaded
      if (isTradingViewAvailable()) {
        setScriptLoaded(true);
        resolve();
        return;
      }

      // Check if script tag already exists
      const existingScript = document.querySelector('script[src="https://s3.tradingview.com/tv.js"]');
      if (existingScript) {
        // Script exists but not loaded yet, wait for it
        const checkInterval = setInterval(() => {
          if (isTradingViewAvailable()) {
            clearInterval(checkInterval);
            setScriptLoaded(true);
            resolve();
          }
        }, 100);
        
        // Timeout after 15 seconds
        setTimeout(() => {
          clearInterval(checkInterval);
          if (!isTradingViewAvailable()) {
            reject(new Error("TradingView script load timeout - please check your internet connection"));
          }
        }, 15000);
        return;
      }

      // Create and load new script
      const script = document.createElement('script');
      script.src = 'https://s3.tradingview.com/tv.js';
      script.async = true;
      script.type = 'text/javascript';
      script.crossOrigin = 'anonymous';
      
      script.onload = () => {
        // Give TradingView a moment to initialize
        setTimeout(() => {
          if (isTradingViewAvailable()) {
            setScriptLoaded(true);
            resolve();
          } else {
            reject(new Error("TradingView library not available after script load"));
          }
        }, 1000); // 1 second delay for TradingView initialization
      };
      
      script.onerror = (error) => {
        reject(new Error("Failed to load TradingView script - please check your internet connection"));
      };
      
      document.head.appendChild(script);
    });
  };

  useEffect(() => {
    let mounted = true;
    
    const initializeWidget = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        if (!scriptLoaded) {
          await loadTradingViewScript();
        }
        
        if (mounted) {
          // Small delay to ensure everything is ready
          setTimeout(() => {
            if (mounted) {
              createWidget();
            }
          }, 100);
        }
      } catch (err) {
        if (mounted) {
          console.error("Failed to initialize TradingView widget:", err);
          setError(err instanceof Error ? err.message : "Failed to load TradingView library");
          setIsLoading(false);
        }
      }
    };

    initializeWidget();

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
      if (mounted && isLoading && !error) {
        setError("Chart loading timeout - please try again");
        setIsLoading(false);
      }
    }, 15000); // 15s timeout

    return () => {
      mounted = false;
      clearTimeout(timeout);
      observer?.disconnect();
      
      // Clean up widget
      if (widgetRef.current) {
        try {
          widgetRef.current.remove();
        } catch (e) {
          // Ignore cleanup errors
        }
        widgetRef.current = null;
      }
    };
  }, [ticker, interval, containerId, retryCount, scriptLoaded]);

  return (
    <div className="relative h-full w-full rounded-lg shadow-md bg-card overflow-hidden chart-transition">
      {isLoading && !error && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-card/90 backdrop-blur-sm">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
            <p className="text-muted-foreground loading-pulse">
              {!scriptLoaded ? 'Loading TradingView library...' : `Loading ${ticker} chart...`}
            </p>
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
