import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { supabase } from '@/integrations/supabase/client';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// AI Strategy Generation Utility
export async function generateStrategyWithAI(prompt: string, imageBase64?: string, messages: any[] = []): Promise<{
  summary: string;
  pineScript: string;
  mql4?: string;
  mql5?: string;
  risk?: any;
  jsonLogic?: any;
}> {
  // Get the current user's access token
  const session = (await supabase.auth.getSession()).data.session;
  const accessToken = session?.access_token;
  // Use the Supabase Edge Function endpoint
  const res = await fetch('https://kgfzbkwyepchbysaysky.functions.supabase.co/image-ai', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {})
    },
    body: JSON.stringify({ prompt, imageBase64, messages: messages || [] })
  });
  if (!res.ok) {
    const errorText = await res.text();
    console.error('AI API error response:', errorText);
    throw new Error(`AI API error: ${errorText}`);
  }
  return await res.json();
}
