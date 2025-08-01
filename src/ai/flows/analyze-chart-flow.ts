
'use server';
/**
 * @fileOverview An AI flow for analyzing stock charts.
 *
 * - analyzeChart - A function that handles the chart analysis process.
 * - AnalyzeChartInput - The input type for the analyzeChart function.
 * - AnalyzeChartOutput - The return type for the analyzeChart function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const AnalyzeChartInputSchema = z.object({
  ticker: z.string().describe('The stock ticker symbol.'),
  interval: z.string().describe('The chart interval (e.g., D for daily, 60 for 1-hour).'),
});
export type AnalyzeChartInput = z.infer<typeof AnalyzeChartInputSchema>;

const AnalyzeChartOutputSchema = z.object({
  summary: z.string().describe('A concise summary of the overall analysis.'),
  technicalAnalysis: z.object({
    trend: z.string().describe('The current trend (e.g., Bullish, Bearish, Neutral).'),
    support: z.string().describe('Key support level.'),
    resistance: z.string().describe('Key resistance level.'),
    patterns: z.array(z.string()).describe('Notable chart patterns identified (e.g., Head and Shoulders, Double Top).'),
  }),
  fundamentalAnalysis: z.object({
    marketCap: z.string().describe('The market capitalization.'),
    peRatio: z.string().describe('The P/E ratio.'),
    earningsSummary: z.string().describe('A brief summary of recent earnings reports.'),
  }),
  newsSentiment: z.object({
    sentiment: z.string().describe('The overall news sentiment (e.g., Positive, Negative, Neutral).'),
    summary: z.string().describe('A summary of recent news driving the sentiment. This is a simulated summary.'),
  }),
});
export type AnalyzeChartOutput = z.infer<typeof AnalyzeChartOutputSchema>;


export async function analyzeChart(input: AnalyzeChartInput): Promise<AnalyzeChartOutput> {
  return analyzeChartFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeChartPrompt',
  input: {schema: AnalyzeChartInputSchema},
  output: {schema: AnalyzeChartOutputSchema},
  prompt: `You are a professional financial analyst. Provide a comprehensive analysis for the stock with ticker {{{ticker}}} on a {{{interval}}} timeframe.

Your analysis must include the following sections:
1.  **Technical Analysis**: Identify the current trend, key support and resistance levels, and any notable chart patterns (like Head and Shoulders, Double Bottom, etc.).
2.  **Fundamental Analysis**: Provide the market capitalization, P/E ratio, and a brief summary of the latest earnings report.
3.  **News Sentiment**: Generate a plausible summary of recent news affecting the stock and determine if the overall sentiment is Positive, Negative, or Neutral. Preface this summary with "Based on recent simulated news...".

Finally, provide a concise overall summary of your findings.
`,
});

const analyzeChartFlow = ai.defineFlow(
  {
    name: 'analyzeChartFlow',
    inputSchema: AnalyzeChartInputSchema,
    outputSchema: AnalyzeChartOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
