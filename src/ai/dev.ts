import { config } from 'dotenv';
config();

import '@/ai/flows/code-completion-suggestions.ts';
import '@/ai/flows/code-explanation-on-hover.ts';
import '@/ai/flows/code-execution.ts';
