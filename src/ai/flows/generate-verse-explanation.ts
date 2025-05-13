'use server';
/**
 * @fileOverview Explains a verse from the Bhagavad Gita.
 *
 * - explainVerse - A function that generates an explanation, and direct translation for a given verse.
 * - ExplainVerseInput - The input type for the explainVerse function.
 * - ExplainVerseOutput - The return type for the explainVerse function.
 */

import {ai, ai_openai, ai_gemini, ai_claude} from '@/ai/ai-instance';
import {z} from 'genkit';
import {Verse} from '@/services/bhagavad-gita';

const chapterDescription = z.number().describe('The chapter number of the verse.');
const verseDescription = z.number().describe('The verse number within the chapter.');
const verseTextDescription = z.string().describe('The text of the verse in Sanskrit.');
const languageDescription = z.string().describe('The language to generate the explanation in. Can be US English, or Japanese.');
const explanationDescription = z.string().describe('A one-to-two paragraph explanation of the verse.');
const directTranslationDescription = z.string().describe('A translation of the verse.');
const wordtowordTranslationDescription = z.string().describe('A direct translation of some of important keywords in the verse.');

const verseObject = z.object({
  chapter: chapterDescription,
  verse: verseDescription,
  text: verseTextDescription,
}).describe('The verse to explain.');

const inputSchemaObject = z.object({
  verseText: verseTextDescription,
  chapter: chapterDescription,
  verse: verseDescription,
  language: languageDescription
});

const outputSchemaObject_with_Translation = z.object({
  explanation: explanationDescription,
  directTranslation: directTranslationDescription,
  wordtowordTranslation: wordtowordTranslationDescription,
});

const outputSchemaObject_without_Translation = z.object({
  explanation: explanationDescription,
  wordtowordTranslation: wordtowordTranslationDescription,
});

const promptText_with_Translation = `You are a knowledgeable interpreter of the Bhagavad Gita.
Please provide a translation of the following verse, a direct translation of some of important keywords in the verse, followed by a concise and insightful one-to-two paragraph explanation of the verse:
Chapter: {{{chapter}}}
Verse: {{{verse}}}
Text: {{{verseText}}}
The translation and explanation should be in {{{language}}} and should help the user quickly grasp the verse's meaning and relevance.
`.replace(/\n/g, '') // Remove *all* newline characters
  .replace(/\s+/g, ' ') // Reduce multiple spaces to single spaces
  .trim(); // Remove leading/trailing spaces

const promptText_without_Translation = `You are a knowledgeable interpreter of the Bhagavad Gita.
Please provide a direct translation of some of important keywords in the verse, followed by a concise and insightful one-to-two paragraph explanation of the verse:
Chapter: {{{chapter}}}
Verse: {{{verse}}}
Text: {{{verseText}}}
The translation and explanation should be in {{{language}}} and should help the user quickly grasp the verse's meaning and relevance.
`.replace(/\n/g, '') // Remove *all* newline characters
  .replace(/\s+/g, ' ') // Reduce multiple spaces to single spaces
  .trim(); // Remove leading/trailing spaces

const ExplainVerseInputSchema = z.object({
  verse: verseObject,
  language: languageDescription, 
});
export type ExplainVerseInput = z.infer<typeof ExplainVerseInputSchema>;

const ExplainVerseOutputSchema_with_Translation = z.object({
  explanation: explanationDescription,
  directTranslation: directTranslationDescription,
  wordtowordTranslation: wordtowordTranslationDescription,
});
export type ExplainVerseOutput_with_Translation = z.infer<typeof ExplainVerseOutputSchema_with_Translation>;

export async function explainVerse(input: ExplainVerseInput): Promise<ExplainVerseOutput_with_Translation> {
  return explainVerseFlow_gemini(input);
}

export async function explainVerse_gemini(input: ExplainVerseInput): Promise<ExplainVerseOutput_with_Translation> {
  return explainVerseFlow_gemini(input);
}

const ExplainVerseOutputSchema_without_Translation = z.object({
  explanation: explanationDescription,
  wordtowordTranslation: wordtowordTranslationDescription,
});
export type ExplainVerseOutput_without_Translation = z.infer<typeof ExplainVerseOutputSchema_without_Translation>;

export async function explainVerse_without_Translation(input: ExplainVerseInput): Promise<ExplainVerseOutput_without_Translation> {
  return explainVerseFlow_without_Translation_gemini(input);
}

export async function explainVerse_without_Translation_gemini(input: ExplainVerseInput): Promise<ExplainVerseOutput_without_Translation> {
  return explainVerseFlow_without_Translation_gemini(input);
}

export async function explainVerse_claude(input: ExplainVerseInput): Promise<ExplainVerseOutput_with_Translation> {
  return explainVerseFlow_claude(input);
}

export async function explainVerse_openai(input: ExplainVerseInput): Promise<ExplainVerseOutput_with_Translation> {
  return explainVerseFlow_openai(input);
}

/* Gemini with Translation */
const prompt_gemini = ai_gemini.definePrompt({
  name: 'explainVersePrompt',
  input: { schema: inputSchemaObject, },
  output: { schema: outputSchemaObject_with_Translation, },
  prompt: promptText_with_Translation,
});

const explainVerseFlow_gemini = ai_gemini.defineFlow<
  typeof ExplainVerseInputSchema,
  typeof ExplainVerseOutputSchema_with_Translation
>({
  name: 'explainVerseFlow',
  inputSchema: ExplainVerseInputSchema,
  outputSchema: ExplainVerseOutputSchema_with_Translation,
}, async input => {
  const {output} = await prompt_gemini({
    verseText: input.verse.text,
    chapter: input.verse.chapter,
    verse: input.verse.verse,
    language: input.language
  });
  return output!;
});

/* Gemini without Translation */
const prompt_without_Translation_gemini = ai_gemini.definePrompt({
  name: 'explainVersePrompt_without_Translation',
  input: { schema: inputSchemaObject, },
  output: { schema: outputSchemaObject_without_Translation, },
  prompt: promptText_without_Translation,
});

const explainVerseFlow_without_Translation_gemini = ai_gemini.defineFlow<
  typeof ExplainVerseInputSchema,
  typeof ExplainVerseOutputSchema_without_Translation
>({
  name: 'explainVerseFlow_without_Translation',
  inputSchema: ExplainVerseInputSchema,
  outputSchema: ExplainVerseOutputSchema_without_Translation,
}, async input => {
  const {output} = await prompt_without_Translation_gemini({
    verseText: input.verse.text,
    chapter: input.verse.chapter,
    verse: input.verse.verse,
    language: input.language
  });
  return output!;
});

/* Claude */
const prompt_claude = ai_claude.definePrompt({
  name: 'explainVersePrompt',
  input: { schema: inputSchemaObject, },
  output: { schema: outputSchemaObject_with_Translation, },
  prompt: promptText_with_Translation,
});

const explainVerseFlow_claude = ai_claude.defineFlow<
  typeof ExplainVerseInputSchema,
  typeof ExplainVerseOutputSchema_with_Translation
>({
  name: 'explainVerseFlow',
  inputSchema: ExplainVerseInputSchema,
  outputSchema: ExplainVerseOutputSchema_with_Translation,
}, async input => {
  const {output} = await prompt_claude({
    verseText: input.verse.text,
    chapter: input.verse.chapter,
    verse: input.verse.verse,
    language: input.language
  });
  return output!;
});

/* OpenAI */
const prompt_openai = ai_openai.definePrompt({
  name: 'explainVersePrompt',
  input: { schema: inputSchemaObject, },
  output: { schema: outputSchemaObject_with_Translation, },
  prompt: promptText_with_Translation,
});

const explainVerseFlow_openai = ai_openai.defineFlow<
  typeof ExplainVerseInputSchema,
  typeof ExplainVerseOutputSchema_with_Translation
>({
  name: 'explainVerseFlow_openai',
  inputSchema: ExplainVerseInputSchema,
  outputSchema: ExplainVerseOutputSchema_with_Translation,
}, async input => {
  const {output} = await prompt_openai({
    verseText: input.verse.text,
    chapter: input.verse.chapter,
    verse: input.verse.verse,
    language: input.language
  });
  return output!;
});

