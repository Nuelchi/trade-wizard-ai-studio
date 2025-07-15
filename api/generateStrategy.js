import fs from 'fs/promises';
import path from 'path';
import { OpenAI } from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const { prompt } = req.body;
  if (!prompt) {
    res.status(400).json({ error: 'Missing prompt' });
    return;
  }
  try {
    const systemPromptPath = path.join(process.cwd(), 'prompts', 'systemPrompt.txt');
    const systemPrompt = await fs.readFile(systemPromptPath, 'utf8');
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ];
    const response = await openai.chat.completions.create({
      model: 'gpt-4-1106-preview',
      messages,
      temperature: 0.4,
    });
    const output = response.choices[0].message.content;
    // Try to extract the JSON block at the end
    let jsonBlock = null;
    const jsonMatch = output.match(/```json[\s\S]*?({[\s\S]*?})[\s\S]*?```/i);
    if (jsonMatch) {
      try {
        jsonBlock = JSON.parse(jsonMatch[1]);
      } catch (e) {
        jsonBlock = null;
      }
    }
    if (jsonBlock) {
      res.status(200).json({
        summary: jsonBlock.summary || '',
        pineScript: jsonBlock.pineScript || '',
        mql4: jsonBlock.mql4 || '',
        mql5: jsonBlock.mql5 || '',
        risk: jsonBlock.risk || {},
        jsonLogic: jsonBlock.jsonLogic || {},
        raw: output
      });
    } else {
      // Fallback: extract code blocks as before
      res.status(200).json({
        summary: output,
        pineScript: output.match(/```pine.*?([\s\S]*?)```/i)?.[1] || '',
        mql4: output.match(/```mql4.*?([\s\S]*?)```/i)?.[1] || '',
        mql5: output.match(/```mql5.*?([\s\S]*?)```/i)?.[1] || '',
        risk: {},
        jsonLogic: {},
        raw: output
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'OpenAI error', details: err.message });
  }
} 