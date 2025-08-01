"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Bitcoin, Landmark, Search, History, Clock } from 'lucide-react';

interface TickerSelectorProps {
  onTickerSelect: (ticker: string) => void;
  initialTicker: string;
  onIntervalSelect: (interval: string) => void;
  initialInterval: string;
}

const popularStocks = ['AAPL', 'GOOGL', 'TSLA', 'AMZN', 'MSFT'];
const popularCrypto = ['COINBASE:BTCUSD', 'COINBASE:ETHUSD', 'COINBASE:SOLUSD', 'BINANCE:DOGEUSDT', 'BINANCE:XRPUSDT'];
const timeframes = [
  { value: '1', label: '1m' },
  { value: '5', label: '5m' },
  { value: '15', label: '15m' },
  { value: '60', label: '1H' },
  { value: '240', label: '4H' },
  { value: 'D', label: '1D' },
  { value: 'W', label: '1W' },
];


export function TickerSelector({ onTickerSelect, initialTicker, onIntervalSelect, initialInterval }: TickerSelectorProps) {
  const [manualTicker, setManualTicker] = useState('');
  const [recentTickers, setRecentTickers] = useState<string[]>([]);
  const [activeTicker, setActiveTicker] = useState(initialTicker);
  const [activeInterval, setActiveInterval] = useState(initialInterval);

  useEffect(() => {
    try {
      const storedTickers = localStorage.getItem('recentTickers');
      if (storedTickers) {
        setRecentTickers(JSON.parse(storedTickers));
      }
    } catch (error) {
      console.error("Failed to parse recent tickers from localStorage", error);
    }
  }, []);
  
  useEffect(() => {
    setActiveInterval(initialInterval);
  }, [initialInterval]);

  const handleSelect = (ticker: string) => {
    const formattedTicker = ticker.includes(':') ? ticker : ticker.toUpperCase();
    onTickerSelect(formattedTicker);
    setActiveTicker(formattedTicker);
    try {
      const updatedRecents = [formattedTicker, ...recentTickers.filter(t => t !== formattedTicker)].slice(0, 5);
      setRecentTickers(updatedRecents);
      localStorage.setItem('recentTickers', JSON.stringify(updatedRecents));
    } catch (error) {
      console.error("Failed to save recent tickers to localStorage", error);
    }
  };

  const handleIntervalSelect = (interval: string) => {
    onIntervalSelect(interval);
    setActiveInterval(interval);
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualTicker.trim()) {
      handleSelect(manualTicker.trim());
      setManualTicker('');
    }
  };

  const TickerButton = ({ ticker }: { ticker: string }) => (
    <Button
      size="sm"
      key={ticker}
      variant={activeTicker === ticker ? 'default' : 'outline'}
      onClick={() => handleSelect(ticker)}
      className="transition-all duration-200"
    >
      {ticker.split(':').pop()}
    </Button>
  );

  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <CardTitle>Select Ticker</CardTitle>
        <CardDescription>Choose a ticker and timeframe.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handleManualSubmit} className="flex gap-2">
          <Input 
            placeholder="e.g., NASDAQ:AAPL"
            value={manualTicker}
            onChange={(e) => setManualTicker(e.target.value)}
            aria-label="Enter ticker manually"
          />
          <Button type="submit" variant="secondary" size="icon" aria-label="Search ticker">
            <Search className="h-4 w-4" />
          </Button>
        </form>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2 flex items-center gap-2 text-muted-foreground"><Clock className="h-4 w-4" /> Timeframe</h3>
            <div className="flex flex-wrap gap-2">
              {timeframes.map(({ value, label }) => (
                <Button
                  size="sm"
                  key={value}
                  variant={activeInterval === value ? 'default' : 'outline'}
                  onClick={() => handleIntervalSelect(value)}
                  className="transition-all duration-200"
                >
                  {label}
                </Button>
              ))}
            </div>
          </div>
           {recentTickers.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2 flex items-center gap-2 text-muted-foreground"><History className="h-4 w-4" /> Recently Viewed</h3>
              <div className="flex flex-wrap gap-2">
                {recentTickers.map(ticker => <TickerButton key={ticker} ticker={ticker} />)}
              </div>
            </div>
          )}
          <div>
            <h3 className="text-sm font-medium mb-2 flex items-center gap-2 text-muted-foreground"><Landmark className="h-4 w-4" /> Popular Stocks</h3>
            <div className="flex flex-wrap gap-2">
              {popularStocks.map(ticker => <TickerButton key={ticker} ticker={ticker} />)}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium mb-2 flex items-center gap-2 text-muted-foreground"><Bitcoin className="h-4 w-4" /> Popular Crypto</h3>
            <div className="flex flex-wrap gap-2">
              {popularCrypto.map(ticker => <TickerButton key={ticker} ticker={ticker} />)}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
