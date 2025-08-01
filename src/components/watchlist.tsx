"use client";

import { useState, useEffect } from 'react';
import { Star, X, TrendingUp, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

interface WatchlistProps {
  currentTicker: string;
  onTickerSelect: (ticker: string) => void;
}

interface WatchlistItem {
  ticker: string;
  name?: string;
  addedAt: string;
}

export function Watchlist({ currentTicker, onTickerSelect }: WatchlistProps) {
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [isInWatchlist, setIsInWatchlist] = useState(false);

  useEffect(() => {
    try {
      const storedWatchlist = localStorage.getItem('chart-glance-watchlist');
      if (storedWatchlist) {
        const parsed = JSON.parse(storedWatchlist);
        setWatchlist(parsed);
        setIsInWatchlist(parsed.some((item: WatchlistItem) => item.ticker === currentTicker));
      }
    } catch (error) {
      console.error("Failed to load watchlist from localStorage", error);
    }
  }, [currentTicker]);

  const addToWatchlist = () => {
    const newItem: WatchlistItem = {
      ticker: currentTicker,
      name: getTickerDisplayName(currentTicker),
      addedAt: new Date().toISOString(),
    };

    const updatedWatchlist = [newItem, ...watchlist.filter(item => item.ticker !== currentTicker)];
    setWatchlist(updatedWatchlist);
    setIsInWatchlist(true);
    
    try {
      localStorage.setItem('chart-glance-watchlist', JSON.stringify(updatedWatchlist));
    } catch (error) {
      console.error("Failed to save watchlist to localStorage", error);
    }
  };

  const removeFromWatchlist = (ticker: string) => {
    const updatedWatchlist = watchlist.filter(item => item.ticker !== ticker);
    setWatchlist(updatedWatchlist);
    
    if (ticker === currentTicker) {
      setIsInWatchlist(false);
    }
    
    try {
      localStorage.setItem('chart-glance-watchlist', JSON.stringify(updatedWatchlist));
    } catch (error) {
      console.error("Failed to save watchlist to localStorage", error);
    }
  };

  const getTickerDisplayName = (ticker: string): string => {
    // Extract ticker symbol from exchange prefixed tickers
    const symbol = ticker.includes(':') ? ticker.split(':')[1] : ticker;
    
    // Common ticker names mapping
    const tickerNames: { [key: string]: string } = {
      'AAPL': 'Apple Inc.',
      'GOOGL': 'Alphabet Inc.',
      'TSLA': 'Tesla Inc.',
      'AMZN': 'Amazon.com Inc.',
      'MSFT': 'Microsoft Corp.',
      'BTCUSD': 'Bitcoin',
      'ETHUSD': 'Ethereum',
      'SOLUSD': 'Solana',
      'DOGEUSDT': 'Dogecoin',
      'XRPUSDT': 'Ripple XRP',
    };

    return tickerNames[symbol] || symbol;
  };

  const getRelativeTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just added';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <Card className="w-full shadow-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-accent" />
              Watchlist
            </CardTitle>
            <CardDescription>Your favorite tickers</CardDescription>
          </div>
          <Button
            onClick={isInWatchlist ? () => removeFromWatchlist(currentTicker) : addToWatchlist}
            variant={isInWatchlist ? "outline" : "default"}
            size="sm"
            className="transition-all duration-200"
          >
            <Star className={`h-4 w-4 mr-2 ${isInWatchlist ? 'fill-current' : ''}`} />
            {isInWatchlist ? 'Remove' : 'Add'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {watchlist.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Star className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No items in watchlist yet</p>
            <p className="text-xs">Add your favorite tickers to keep track of them</p>
          </div>
        ) : (
          <ScrollArea className="h-[200px]">
            <div className="space-y-2">
              {watchlist.map((item, index) => (
                <div key={item.ticker}>
                  {index > 0 && <Separator className="my-2" />}
                  <div className="flex items-center justify-between group hover:bg-muted/50 rounded-md p-2 transition-colors">
                    <div 
                      className="flex-1 cursor-pointer"
                      onClick={() => onTickerSelect(item.ticker)}
                    >
                      <div className="flex items-center gap-2">
                        <Badge variant={item.ticker === currentTicker ? "default" : "outline"} className="font-mono text-xs">
                          {item.ticker.includes(':') ? item.ticker.split(':')[1] : item.ticker}
                        </Badge>
                        {item.ticker === currentTicker && (
                          <Eye className="h-3 w-3 text-primary" />
                        )}
                      </div>
                      <p className="text-sm font-medium mt-1">{item.name}</p>
                      <p className="text-xs text-muted-foreground">{getRelativeTime(item.addedAt)}</p>
                    </div>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromWatchlist(item.ticker);
                      }}
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  );
}