import { generateStrategyName as generateStrategyNameDirect } from './ai-service';

export async function generateStrategyName({ userPrompt, aiSummary, code }: { userPrompt: string, aiSummary: string, code: string }) {
  return await generateStrategyNameDirect({ userPrompt, aiSummary, code });
}

export async function checkStrategyName(name: string): Promise<boolean> {
  // For now, we'll assume the name is available since we're not checking against a database
  // This can be enhanced later if needed
  return true;
} 