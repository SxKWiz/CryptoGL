
"use client";

import { useState, useEffect } from 'react';
import { LineChart, Sparkles, TrendingUp, TrendingDown, Minus, Landmark, Newspaper, Shapes } from 'lucide-react';
import { TickerSelector } from '@/components/ticker-selector';
import { TradingViewWidget } from '@/components/trading-view-widget';
import { Watchlist } from '@/components/watchlist';
import { PortfolioTracker } from '@/components/portfolio-tracker';
import { ExportAnalysis } from '@/components/export-analysis';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { analyzeChart, AnalyzeChartOutput } from '@/ai/flows/analyze-chart-flow';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ThemeToggle } from '@/components/ui/theme-toggle';

export default function Home() {
  const [ticker, setTicker] = useState('AAPL');
  const [interval, setInterval] = useState('D');
  const [isMounted, setIsMounted] = useState(false);
  const [analysis, setAnalysis] = useState<AnalyzeChartOutput | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    setError(null);
  }

  const handleAnalysis = async () => {
    setIsLoadingAnalysis(true);
    setAnalysis(null);
    setError(null);
    try {
      const result = await analyzeChart({ ticker, interval });
      setAnalysis(result);
    } catch (error) {
      console.error("Failed to analyze chart", error);
      setError("Sorry, I was unable to analyze the chart at this time.");
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const SentimentBadge = ({ sentiment }: { sentiment: string }) => {
    const sentimentLower = sentiment.toLowerCase();
    let variant: "default" | "destructive" | "secondary" = "secondary";
    if (sentimentLower === 'positive') variant = 'default';
    if (sentimentLower === 'negative') variant = 'destructive';

    return <Badge variant={variant}>{sentiment}</Badge>;
  };

  if (!isMounted) {
    return null; // or a loading spinner
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <header className="p-4 border-b bg-card/50 backdrop-blur-sm sticky top-0 z-20">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LineChart className="h-7 w-7 text-primary" />
            <h1 className="text-2xl font-bold font-headline tracking-tight">Chart Glance</h1>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="flex-1 container mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-4 xl:col-span-3">
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
            <Watchlist currentTicker={ticker} onTickerSelect={handleTickerChange} />
            <PortfolioTracker currentTicker={ticker} onTickerSelect={handleTickerChange} />
          </div>
        </div>
        <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-6">
          <div className="h-[65vh] lg:h-[calc(100vh-10rem)]">
            <TradingViewWidget ticker={ticker} interval={interval} />
          </div>
          {(isLoadingAnalysis || error || analysis) && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>AI Analysis for {ticker}</CardTitle>
                    <CardDescription>A comprehensive overview powered by AI.</CardDescription>
                  </div>
                  {analysis && !isLoadingAnalysis && (
                    <ExportAnalysis analysis={analysis} ticker={ticker} interval={interval} />
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {isLoadingAnalysis && <p className="animate-pulse">Analyzing chart...</p>}
                {error && <p className="text-destructive">{error}</p>}
                {analysis && !isLoadingAnalysis && (
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-lg mb-2">Summary</h3>
                      <p className="text-muted-foreground">{analysis.summary}</p>
                    </div>

                    <Separator />

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg flex items-center"><TrendingUp className="mr-2" /> Technicals</h3>
                        <div className="text-sm space-y-2">
                           <div className="flex items-center gap-2"><strong>Trend:</strong> <Badge variant={analysis.technicalAnalysis.trend.toLowerCase() === 'bullish' ? 'default' : analysis.technicalAnalysis.trend.toLowerCase() === 'bearish' ? 'destructive' : 'secondary'}>{analysis.technicalAnalysis.trend}</Badge></div>
                          <p><strong>Support:</strong> {analysis.technicalAnalysis.support}</p>
                          <p><strong>Resistance:</strong> {analysis.technicalAnalysis.resistance}</p>
                          {analysis.technicalAnalysis.patterns.length > 0 && (
                            <div>
                               <h4 className="font-medium flex items-center mt-2"><Shapes className="mr-2 h-4 w-4" /> Patterns</h4>
                               <div className="flex flex-wrap gap-2 mt-1">
                                {analysis.technicalAnalysis.patterns.map(p => <Badge key={p} variant="outline">{p}</Badge>)}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="space-y-4">
                        <h3 className="font-semibold text-lg flex items-center"><Landmark className="mr-2" /> Fundamentals</h3>
                         <div className="text-sm space-y-2">
                          <p><strong>Market Cap:</strong> {analysis.fundamentalAnalysis.marketCap}</p>
                          <p><strong>P/E Ratio:</strong> {analysis.fundamentalAnalysis.peRatio}</p>
                           <div>
                              <h4 className="font-medium mt-2">Earnings</h4>
                              <p className="text-muted-foreground">{analysis.fundamentalAnalysis.earningsSummary}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <Separator />

                    <div>
                      <h3 className="font-semibold text-lg flex items-center mb-2"><Newspaper className="mr-2" /> News Sentiment</h3>
                      <div className="flex items-center gap-4 mb-2">
                         <SentimentBadge sentiment={analysis.newsSentiment.sentiment} />
                      </div>
                      <p className="text-muted-foreground text-sm">{analysis.newsSentiment.summary}</p>
                    </div>

                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </main>
      
      <footer className="p-4 border-t mt-auto bg-card/30">
        <div className="container mx-auto text-center text-sm text-muted-foreground">
          <p>Charting data provided by <a href="https://www.tradingview.com/" target="_blank" rel="noopener noreferrer" className="underline hover:text-primary">TradingView</a>. AI analysis is for informational purposes only and should not be considered financial advice.</p>
        </div>
      </footer>
    </div>
  );
}
