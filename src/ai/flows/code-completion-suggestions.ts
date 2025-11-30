'use server';

/**
 * @fileOverview This file defines a Genkit flow for providing code completion suggestions.
 *
 * It takes code context as input and returns a list of code completion suggestions.
 * @interface CodeCompletionInput - Input schema for the code completion flow.
 * @interface CodeCompletionOutput - Output schema for the code completion flow.
 * @function getCodeCompletionSuggestions - The main function to trigger the code completion flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CodeCompletionInputSchema = z.object({
  codeContext: z
    .string()
    .describe("The surrounding code context for which to provide suggestions."),
  language: z.string().describe('The programming language of the code context.'),
});
export type CodeCompletionInput = z.infer<typeof CodeCompletionInputSchema>;

const CodeCompletionOutputSchema = z.object({
  suggestions: z.array(z.string()).describe('A list of code completion suggestions.'),
});
export type CodeCompletionOutput = z.infer<typeof CodeCompletionOutputSchema>;

export async function getCodeCompletionSuggestions(
  input: CodeCompletionInput
): Promise<CodeCompletionOutput> {
  return codeCompletionFlow(input);
}

const codeCompletionPrompt = ai.definePrompt({
  name: 'codeCompletionPrompt',
  input: {schema: CodeCompletionInputSchema},
  output: {schema: CodeCompletionOutputSchema},
  prompt: `You are an AI code completion assistant. Given the following code context and programming language, provide a list of code completion suggestions.

Language: {{{language}}}
Code Context:
{{codeContext}}

Suggestions:`,
});

const codeCompletionFlow = ai.defineFlow(
  {
    name: 'codeCompletionFlow',
    inputSchema: CodeCompletionInputSchema,
    outputSchema: CodeCompletionOutputSchema,
  },
  async input => {
    const {output} = await codeCompletionPrompt(input);
    return output!;
  }
);
