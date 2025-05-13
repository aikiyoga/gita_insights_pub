import {genkit} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';
import openAI, { gpt4oMini } from 'genkitx-openai';
import { anthropic, claude37Sonnet } from 'genkitx-anthropic';
import { GenkitPlugin } from 'genkit/plugin';
//import { GenkitPlugin } from 'genkit/plugin';

export const ai = genkit({
  promptDir: './prompts',
  plugins: [
    googleAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY }),
    anthropic({ apiKey: process.env.ANTHROPIC_API_KEY }),
    openAI({ apiKey: process.env.OPENAI_API_KEY }),
  ],
  //model: 'googleai/gemini-2.0-flash',
  //model: 'claude37Sonnet',
  //model: gpt4oMini,
});

export const ai_gemini = genkit({
  promptDir: './prompts',
  plugins: [googleAI({ apiKey: process.env.GOOGLE_GENAI_API_KEY })],
  //model: 'googleai/gemini-1.5-pro',
  model: 'googleai/gemini-2.0-flash',
});

export const ai_claude = genkit({
  promptDir: './prompts',
  plugins: [anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })],
  model: claude37Sonnet,
  //model: 'claude-3-7-sonnet-20250219',
});

export const ai_openai = genkit({
  promptDir: './prompts',
  plugins: [openAI({ apiKey: process.env.OPENAI_API_KEY})],
  // specify a default model if not provided in generate params
  model: gpt4oMini,
});