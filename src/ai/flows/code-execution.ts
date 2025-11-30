'use server';

/**
 * @fileOverview This file defines a Genkit flow for executing code and returning the output.
 *
 * It uses an AI model to safely predict the output of a given code snippet.
 * @interface CodeExecutionInput - Input schema for the code execution flow.
 * @interface CodeExecutionOutput - Output schema for the code execution flow.
 * @function executeCode - The main function to trigger the code execution flow.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const CodeExecutionInputSchema = z.object({
  code: z.string().describe("The code to execute."),
  language: z.string().describe('The programming language of the code.'),
});
export type CodeExecutionInput = z.infer<typeof CodeExecutionInputSchema>;

const CodeExecutionOutputSchema = z.object({
  output: z.string().describe('The predicted output or result of the code execution.'),
});
export type CodeExecutionOutput = z.infer<typeof CodeExecutionOutputSchema>;

export async function executeCode(
  input: CodeExecutionInput
): Promise<CodeExecutionOutput> {
  return codeExecutionFlow(input);
}

const codeExecutionPrompt = ai.definePrompt({
  name: 'codeExecutionPrompt',
  input: {schema: CodeExecutionInputSchema},
  output: {schema: CodeExecutionOutputSchema},
  prompt: `You are a code execution engine. Given the following code in the specified language, predict its output as if it were run in a console. Only provide the output, with no explanations.

Language: {{{language}}}
Code:
\`\`\`
{{{code}}}
\`\`\`
`,
});

const codeExecutionFlow = ai.defineFlow(
  {
    name: 'codeExecutionFlow',
    inputSchema: CodeExecutionInputSchema,
    outputSchema: CodeExecutionOutputSchema,
  },
  async input => {
    const {output} = await codeExecutionPrompt(input);
    return output!;
  }
);
