"use client";

import { useState, useEffect } from 'react';
import { PlusCircle, Trash2, DollarSign, TrendingUp, TrendingDown, Briefcase } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface PortfolioItem {
  ticker: string;
  quantity: number;
  averagePrice: number;
  currentPrice?: number;
  addedAt: string;
  notes?: string;
}

interface PortfolioTrackerProps {
  currentTicker: string;
  onTickerSelect: (ticker: string) => void;
}

export function PortfolioTracker({ currentTicker, onTickerSelect }: PortfolioTrackerProps) {
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newPosition, setNewPosition] = useState({
    ticker: '',
    quantity: '',
    averagePrice: '',
    notes: ''
  });

  useEffect(() => {
    try {
      const storedPortfolio = localStorage.getItem('chart-glance-portfolio');
      if (storedPortfolio) {
        const parsed = JSON.parse(storedPortfolio);
        setPortfolio(parsed);
      }
    } catch (error) {
      console.error("Failed to load portfolio from localStorage", error);
    }
  }, []);

  const savePortfolio = (updatedPortfolio: PortfolioItem[]) => {
    try {
      localStorage.setItem('chart-glance-portfolio', JSON.stringify(updatedPortfolio));
    } catch (error) {
      console.error("Failed to save portfolio to localStorage", error);
    }
  };

  const addPosition = () => {
    if (!newPosition.ticker || !newPosition.quantity || !newPosition.averagePrice) {
      return;
    }

    const position: PortfolioItem = {
      ticker: newPosition.ticker.toUpperCase(),
      quantity: parseFloat(newPosition.quantity),
      averagePrice: parseFloat(newPosition.averagePrice),
      addedAt: new Date().toISOString(),
      notes: newPosition.notes || undefined
    };

    // Check if ticker already exists and update if so
    const existingIndex = portfolio.findIndex(item => item.ticker === position.ticker);
    let updatedPortfolio: PortfolioItem[];

    if (existingIndex >= 0) {
      // Update existing position with weighted average
      const existing = portfolio[existingIndex];
      const totalQuantity = existing.quantity + position.quantity;
      const totalValue = (existing.quantity * existing.averagePrice) + (position.quantity * position.averagePrice);
      const newAveragePrice = totalValue / totalQuantity;

      updatedPortfolio = [...portfolio];
      updatedPortfolio[existingIndex] = {
        ...existing,
        quantity: totalQuantity,
        averagePrice: newAveragePrice,
        notes: position.notes || existing.notes
      };
    } else {
      updatedPortfolio = [position, ...portfolio];
    }

    setPortfolio(updatedPortfolio);
    savePortfolio(updatedPortfolio);
    
    setNewPosition({ ticker: '', quantity: '', averagePrice: '', notes: '' });
    setIsAddDialogOpen(false);
  };

  const removePosition = (ticker: string) => {
    const updatedPortfolio = portfolio.filter(item => item.ticker !== ticker);
    setPortfolio(updatedPortfolio);
    savePortfolio(updatedPortfolio);
  };

  const getTotalValue = (): number => {
    return portfolio.reduce((total, item) => total + (item.quantity * item.averagePrice), 0);
  };

  const getPositionValue = (item: PortfolioItem): number => {
    return item.quantity * item.averagePrice;
  };

  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
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
              <Briefcase className="h-5 w-5 text-primary" />
              Portfolio
            </CardTitle>
            <CardDescription>Track your holdings</CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="transition-all duration-200">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Add Position</DialogTitle>
                <DialogDescription>
                  Add a new position to your portfolio.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="ticker" className="text-right">
                    Ticker
                  </Label>
                  <Input
                    id="ticker"
                    placeholder="AAPL"
                    value={newPosition.ticker}
                    onChange={(e) => setNewPosition(prev => ({ ...prev, ticker: e.target.value }))}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="quantity" className="text-right">
                    Quantity
                  </Label>
                  <Input
                    id="quantity"
                    type="number"
                    step="0.01"
                    placeholder="10"
                    value={newPosition.quantity}
                    onChange={(e) => setNewPosition(prev => ({ ...prev, quantity: e.target.value }))}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="averagePrice" className="text-right">
                    Avg Price
                  </Label>
                  <Input
                    id="averagePrice"
                    type="number"
                    step="0.01"
                    placeholder="150.00"
                    value={newPosition.averagePrice}
                    onChange={(e) => setNewPosition(prev => ({ ...prev, averagePrice: e.target.value }))}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="notes" className="text-right">
                    Notes
                  </Label>
                  <Input
                    id="notes"
                    placeholder="Optional notes"
                    value={newPosition.notes}
                    onChange={(e) => setNewPosition(prev => ({ ...prev, notes: e.target.value }))}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button onClick={addPosition}>Add Position</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {portfolio.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            <Briefcase className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No positions tracked yet</p>
            <p className="text-xs">Add your holdings to track your portfolio</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Total Portfolio Value</span>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <span className="font-semibold">{formatCurrency(getTotalValue())}</span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {portfolio.length} position{portfolio.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <ScrollArea className="h-[250px]">
              <div className="space-y-2">
                {portfolio.map((item, index) => (
                  <div key={item.ticker}>
                    {index > 0 && <Separator className="my-2" />}
                    <div className="group hover:bg-muted/50 rounded-md p-2 transition-colors">
                      <div className="flex items-center justify-between">
                        <div 
                          className="flex-1 cursor-pointer"
                          onClick={() => onTickerSelect(item.ticker)}
                        >
                          <div className="flex items-center gap-2">
                            <Badge 
                              variant={item.ticker === currentTicker ? "default" : "outline"} 
                              className="font-mono text-xs"
                            >
                              {item.ticker}
                            </Badge>
                          </div>
                          <div className="mt-1 space-y-1">
                            <div className="flex items-center justify-between text-sm">
                              <span>{item.quantity} shares @ {formatCurrency(item.averagePrice)}</span>
                              <span className="font-medium">{formatCurrency(getPositionValue(item))}</span>
                            </div>
                            {item.notes && (
                              <p className="text-xs text-muted-foreground">{item.notes}</p>
                            )}
                            <p className="text-xs text-muted-foreground">{getRelativeTime(item.addedAt)}</p>
                          </div>
                        </div>
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            removePosition(item.ticker);
                          }}
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity ml-2"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
}