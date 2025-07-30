import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { generateStrategyWithAI as generateStrategyWithAIDirect } from './ai-service';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// AI Strategy Generation Utility - Now uses direct OpenRouter integration
export async function generateStrategyWithAI(prompt: string, imageBase64?: string, messages: any[] = []): Promise<{
  summary: string;
  pineScript: string;
  mql4?: string;
  mql5?: string;
  risk?: any;
  jsonLogic?: any;
}> {
  return await generateStrategyWithAIDirect(prompt, imageBase64, messages);
}
