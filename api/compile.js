import path from 'path';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const { strategyId, format } = req.body;
  if (!strategyId || !format || !['PINESCRIPT', 'MQL4', 'MQL5'].includes(format.toUpperCase())) {
    res.status(400).json({ error: 'Missing or invalid strategyId/format' });
    return;
  }
  try {
    // Fetch strategy from Supabase
    const { data: strategy, error } = await supabase
      .from('strategies')
      .select('*')
      .eq('id', strategyId)
      .single();
    if (error || !strategy) {
      res.status(404).json({ error: 'Strategy not found' });
      return;
    }
    let code = '';
    if (format.toUpperCase() === 'PINESCRIPT') {
      code = strategy.code?.pineScript || '';
    } else if (format.toUpperCase() === 'MQL4') {
      code = strategy.code?.mql4 || '';
    } else if (format.toUpperCase() === 'MQL5') {
      code = strategy.code?.mql5 || '';
    }
    if (!code) {
      res.status(400).json({ error: 'No code found for this strategy/format' });
      return;
    }
    // Simulate compilation for MQL4/MQL5
    if (format.toUpperCase() === 'MQL4' || format.toUpperCase() === 'MQL5') {
      const compiledExtension = format.toUpperCase() === 'MQL4' ? 'ex4' : 'ex5';
      const compiledFileName = `strategy_${strategyId}.${compiledExtension}`;
      // Simulate binary content as base64 string
      const compiledContent = Buffer.from(`Compiled ${format} code for: \n${code}`).toString('base64');
      res.status(200).json({
        success: true,
        code,
        compiledFileName,
        compiledContent,
      });
      return;
    }
    // For Pine Script, just return the code
    res.status(200).json({
      success: true,
      code,
      compiledFileName: null,
      compiledContent: null,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Compile error', details: err.message });
  }
} 