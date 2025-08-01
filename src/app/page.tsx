"use client";

import { useState, useEffect } from 'react';
import { LineChart } from 'lucide-react';
import { TickerSelector } from '@/components/ticker-selector';
import { TradingViewWidget } from '@/components/trading-view-widget';

export default function Home() {
  const [ticker, setTicker] = useState('AAPL');
  const [interval, setInterval] = useState('D');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    try {
      const storedTickers = localStorage.getItem('recentTickers');
      if (storedTickers) {
        const recent = JSON.parse(storedTickers);
        if (recent.length > 0) {
          setTicker(recent[0]);
        }
      }
      const storedInterval = localStorage.getItem('tradingViewInterval');
      if (storedInterval) {
        setInterval(storedInterval);
      }
    } catch (error) {
      console.error("Could not get initial state from localStorage", error);
      setTicker('AAPL'); // fallback
      setInterval('D');
    }
  }, []);

  const handleIntervalChange = (newInterval: string) => {
    setInterval(newInterval);
    try {
      localStorage.setItem('tradingViewInterval', newInterval);
    } catch (error) {
      console.error("Failed to save interval to localStorage", error);
    }
  }

  if (!isMounted) {
    return null; // or a loading spinner
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="p-4 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="container mx-auto flex items-center gap-3">
          <LineChart className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold font-headline tracking-tight">Chart Glance</h1>
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3 xl:col-span-2">
          <div className="sticky top-24">
            <TickerSelector 
              onTickerSelect={setTicker} 
              initialTicker={ticker}
              onIntervalSelect={handleIntervalChange}
              initialInterval={interval}
            />
          </div>
        </div>
        <div className="lg:col-span-9 xl:col-span-10 h-[65vh] lg:h-[calc(100vh-10rem)]">
          <TradingViewWidget ticker={ticker} interval={interval} />
        </div>
      </main>
      
      <footer className="p-4 border-t mt-auto bg-card/30">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>Charting data provided by <a href="https://www.tradingview.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">TradingView</a>.</p>
        </div>
      </footer>
    </div>
  );
}
