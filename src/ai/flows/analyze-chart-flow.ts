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
  analysis: z.string().describe('The AI-generated technical analysis of the chart.'),
});
export type AnalyzeChartOutput = z.infer<typeof AnalyzeChartOutputSchema>;

export async function analyzeChart(input: AnalyzeChartInput): Promise<AnalyzeChartOutput> {
  return analyzeChartFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyzeChartPrompt',
  input: {schema: AnalyzeChartInputSchema},
  output: {schema: AnalyzeChartOutputSchema},
  prompt: `You are a professional financial analyst. Provide a concise technical analysis for the stock with ticker {{{ticker}}} on a {{{interval}}} timeframe. Identify key support and resistance levels, current trend, and any notable chart patterns. Provide a neutral, factual summary.`,
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
