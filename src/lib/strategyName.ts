import { supabase } from '@/integrations/supabase/client';

export async function generateStrategyName({ userPrompt, aiSummary, code }: { userPrompt: string, aiSummary: string, code: string }) {
  const session = (await supabase.auth.getSession()).data.session;
  const accessToken = session?.access_token;
  const res = await fetch('https://kgfzbkwyepchbysaysky.functions.supabase.co/generate-strategy-name', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {})
    },
    body: JSON.stringify({ userPrompt, aiSummary, code }),
  });
  const data = await res.json();
  return data.name;
}

export async function checkStrategyName(name: string): Promise<boolean> {
  const session = (await supabase.auth.getSession()).data.session;
  const accessToken = session?.access_token;
  const res = await fetch('https://kgfzbkwyepchbysaysky.functions.supabase.co/generate-strategy-name', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(accessToken ? { 'Authorization': `Bearer ${accessToken}` } : {})
    },
    body: JSON.stringify({ checkName: name }),
  });
  const data = await res.json();
  return data.available;
} 