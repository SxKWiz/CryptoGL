"use client";

import { useState } from 'react';
import { Download, FileText, FileJson, Share } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { AnalyzeChartOutput } from '@/ai/flows/analyze-chart-flow';
import { useToast } from '@/hooks/use-toast';

interface ExportAnalysisProps {
  analysis: AnalyzeChartOutput;
  ticker: string;
  interval: string;
}

export function ExportAnalysis({ analysis, ticker, interval }: ExportAnalysisProps) {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const generateAnalysisText = (): string => {
    return `Chart Glance - AI Analysis Report
=====================================

Ticker: ${ticker}
Timeframe: ${interval}
Generated: ${new Date().toLocaleString()}

SUMMARY
-------
${analysis.summary}

TECHNICAL ANALYSIS
------------------
Trend: ${analysis.technicalAnalysis.trend}
Support Level: ${analysis.technicalAnalysis.support}
Resistance Level: ${analysis.technicalAnalysis.resistance}
${analysis.technicalAnalysis.patterns.length > 0 ? `Chart Patterns: ${analysis.technicalAnalysis.patterns.join(', ')}` : 'No notable chart patterns identified'}

FUNDAMENTAL ANALYSIS
--------------------
Market Cap: ${analysis.fundamentalAnalysis.marketCap}
P/E Ratio: ${analysis.fundamentalAnalysis.peRatio}
Earnings Summary: ${analysis.fundamentalAnalysis.earningsSummary}

NEWS SENTIMENT
--------------
Overall Sentiment: ${analysis.newsSentiment.sentiment}
Summary: ${analysis.newsSentiment.summary}

=====================================
Disclaimer: This analysis is for informational purposes only and should not be considered financial advice.
Generated by Chart Glance - https://chart-glance.com`;
  };

  const downloadTextFile = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const exportAsText = async () => {
    setIsExporting(true);
    try {
      const textContent = generateAnalysisText();
      const filename = `chart-analysis-${ticker}-${interval}-${new Date().toISOString().split('T')[0]}.txt`;
      downloadTextFile(textContent, filename);
      
      toast({
        title: "Analysis Exported",
        description: "Text file has been downloaded successfully.",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const exportAsJSON = async () => {
    setIsExporting(true);
    try {
      const jsonData = {
        ticker,
        interval,
        timestamp: new Date().toISOString(),
        analysis,
        disclaimer: "This analysis is for informational purposes only and should not be considered financial advice."
      };
      
      const jsonString = JSON.stringify(jsonData, null, 2);
      const filename = `chart-analysis-${ticker}-${interval}-${new Date().toISOString().split('T')[0]}.json`;
      downloadTextFile(jsonString, filename);
      
      toast({
        title: "Analysis Exported",
        description: "JSON file has been downloaded successfully.",
      });
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "Failed to export analysis. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const copyToClipboard = async () => {
    try {
      const textContent = generateAnalysisText();
      await navigator.clipboard.writeText(textContent);
      
      toast({
        title: "Copied to Clipboard",
        description: "Analysis has been copied to your clipboard.",
      });
    } catch (error) {
      console.error("Copy error:", error);
      toast({
        title: "Copy Failed",
        description: "Failed to copy analysis. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isExporting}>
          <Download className="h-4 w-4 mr-2" />
          {isExporting ? 'Exporting...' : 'Export'}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={exportAsText} className="cursor-pointer">
          <FileText className="mr-2 h-4 w-4" />
          <span>Export as Text</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={exportAsJSON} className="cursor-pointer">
          <FileJson className="mr-2 h-4 w-4" />
          <span>Export as JSON</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={copyToClipboard} className="cursor-pointer">
          <Share className="mr-2 h-4 w-4" />
          <span>Copy to Clipboard</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}