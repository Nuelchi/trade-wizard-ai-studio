import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// AI Strategy Generation Utility
export async function generateStrategyWithAI(prompt: string, imageBase64?: string): Promise<{
  summary: string;
  pineScript: string;
  mql4?: string;
  mql5?: string;
  risk?: any;
  jsonLogic?: any;
}> {
  // Use the Supabase Edge Function endpoint
  const res = await fetch('https://kgfzbkwyepchbysaysky.functions.supabase.co/image-ai', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt, imageBase64 })
  });
  if (!res.ok) throw new Error('AI API error');
  return await res.json();
}
