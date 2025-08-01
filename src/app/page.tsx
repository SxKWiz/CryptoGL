"use client";

import { useState, useEffect } from 'react';
import { LineChart, Sparkles } from 'lucide-react';
import { TickerSelector } from '@/components/ticker-selector';
import { TradingViewWidget } from '@/components/trading-view-widget';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { analyzeChart } from '@/ai/flows/analyze-chart-flow';

export default function Home() {
  const [ticker, setTicker] = useState('AAPL');
  const [interval, setInterval] = useState('D');
  const [isMounted, setIsMounted] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);

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
  };
  
  const handleTickerChange = (newTicker: string) => {
    setTicker(newTicker);
    setAnalysis(null);
  }

  const handleAnalysis = async () => {
    setIsLoadingAnalysis(true);
    setAnalysis(null);
    try {
      const result = await analyzeChart({ ticker, interval });
      setAnalysis(result.analysis);
    } catch (error) {
      console.error("Failed to analyze chart", error);
      setAnalysis("Sorry, I was unable to analyze the chart at this time.");
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

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
          <div className="sticky top-24 space-y-4">
            <TickerSelector 
              onTickerSelect={handleTickerChange} 
              initialTicker={ticker}
              onIntervalSelect={handleIntervalChange}
              initialInterval={interval}
            />
            <Button onClick={handleAnalysis} disabled={isLoadingAnalysis} className="w-full">
              <Sparkles className="mr-2 h-4 w-4" />
              {isLoadingAnalysis ? 'Analyzing...' : 'Analyze with AI'}
            </Button>
          </div>
        </div>
        <div className="lg:col-span-9 xl:col-span-10 flex flex-col gap-6">
          <div className="h-[65vh] lg:h-[calc(100vh-10rem)]">
            <TradingViewWidget ticker={ticker} interval={interval} />
          </div>
          {isLoadingAnalysis && (
            <Card>
              <CardHeader>
                <CardTitle>AI Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="animate-pulse">Analyzing chart...</p>
              </CardContent>
            </Card>
          )}
          {analysis && !isLoadingAnalysis && (
            <Card>
              <CardHeader>
                <CardTitle>AI Analysis for {ticker}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{analysis}</p>
              </CardContent>
            </Card>
          )}
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
