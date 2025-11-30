'use client';

import { useState, useEffect } from 'react';
import { Bot, Code, Play, Sparkles, Terminal } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { explainCode } from '@/ai/flows/code-explanation-on-hover';
import { getCodeCompletionSuggestions } from '@/ai/flows/code-completion-suggestions';
import { executeCode } from '@/ai/flows/code-execution';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '../ui/scroll-area';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select";
  
const codeSnippets = {
  javascript: `import React from 'react';

function HelloWorld() {
  // This is a simple React component
  const message = 'Hello, Code Canvas!';

  console.log(message);

  return (
    <div className="container">
      <h1>{message}</h1>
      <p>Welcome to your collaborative coding environment.</p>
    </div>
  );
}

export default HelloWorld;
`,
  python: `def greet(name):
    # This is a simple Python function
    message = f"Hello, {name}!"
    print(message)
    return message

greet("Code Canvas")
`,
  typescript: `import React from 'react';

type Props = {
  message: string;
};

function HelloWorld({ message }: Props): React.ReactElement {
  // This is a simple TypeScript React component
  console.log(message);

  return (
    <div className="container">
      <h1>{message}</h1>
      <p>Welcome to your collaborative coding environment.</p>
    </div>
  );
}

export default HelloWorld;
`,
  java: `public class HelloWorld {
    // This is a simple Java class
    public static void main(String[] args) {
        String message = "Hello, Code Canvas!";
        System.out.println(message);
    }
}
`,
};

const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'python', label: 'Python' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'java', label: 'Java' },
];

export default function CodeEditor() {
  const [language, setLanguage] = useState('javascript');
  const [code, setCode] = useState(codeSnippets[language as keyof typeof codeSnippets]);
  const [explanation, setExplanation] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isExplanationLoading, setIsExplanationLoading] = useState(false);
  const [isSuggestionLoading, setIsSuggestionLoading] = useState(false);
  const [isExecutionLoading, setIsExecutionLoading] = useState(false);
  const [executionResult, setExecutionResult] = useState('');
  const { toast } = useToast();

  const handleLanguageChange = (selectedLanguage: string) => {
    setLanguage(selectedLanguage);
    setCode(codeSnippets[selectedLanguage as keyof typeof codeSnippets]);
  };

  const handleExplainCode = async () => {
    setIsExplanationLoading(true);
    try {
      const result = await explainCode({ code });
      setExplanation(result.explanation);
    } catch (error) {
      console.error('Error explaining code:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to get code explanation.',
      });
      setExplanation('Sorry, I was unable to explain this code.');
    } finally {
      setIsExplanationLoading(false);
    }
  };

  const handleGetSuggestions = async () => {
    setIsSuggestionLoading(true);
    try {
      const result = await getCodeCompletionSuggestions({ codeContext: code, language });
      setSuggestions(result.suggestions);
    } catch (error) {
      console.error('Error getting suggestions:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to get code suggestions.',
      });
      setSuggestions(['Could not fetch suggestions.']);
    } finally {
      setIsSuggestionLoading(false);
    }
  };

  const handleRunCode = async () => {
    setIsExecutionLoading(true);
    setExecutionResult('');
    try {
      const result = await executeCode({ code, language });
      setExecutionResult(result.output);
    } catch (error) {
      console.error('Error executing code:', error);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to execute code.',
      });
      setExecutionResult('An error occurred while running the code.');
    } finally {
      setIsExecutionLoading(false);
    }
  };

  const lineCount = code.split('\n').length;

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b">
        <div className="flex items-center gap-2">
            <Code className="h-5 w-5 text-muted-foreground"/>
            <CardTitle className="text-lg font-medium font-sans">app.tsx</CardTitle>
        </div>
        <div className="flex flex-wrap items-center gap-2">
        <Select value={language} onValueChange={handleLanguageChange}>
            <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue placeholder="Select Language" />
            </SelectTrigger>
            <SelectContent>
                {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" onClick={handleExplainCode}>
                <Bot className="mr-2 h-4 w-4" />
                Explain Code
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
              <DialogHeader>
                <DialogTitle className="font-headline">Code Explanation</DialogTitle>
                <DialogDescription>AI-powered explanation of the code.</DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[60vh] rounded-md border p-4">
                {isExplanationLoading ? <p>Loading...</p> : <p className="text-sm">{explanation}</p>}
              </ScrollArea>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm" onClick={handleGetSuggestions}>
                    <Sparkles className="mr-2 h-4 w-4" />
                    Get Suggestions
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
              <DialogHeader>
                <DialogTitle className="font-headline">Code Suggestions</DialogTitle>
                <DialogDescription>AI-powered code completion suggestions.</DialogDescription>
              </DialogHeader>
               <ScrollArea className="max-h-[60vh] rounded-md border p-4">
                {isSuggestionLoading ? (
                  <p>Loading...</p>
                ) : (
                  <ul className="space-y-2">
                    {suggestions.map((s, i) => (
                      <li key={i} className="rounded bg-secondary p-2 font-code text-sm">{s}</li>
                    ))}
                  </ul>
                )}
              </ScrollArea>
            </DialogContent>
          </Dialog>
          <Button size="sm" onClick={handleRunCode} disabled={isExecutionLoading}>
            <Play className="mr-2 h-4 w-4" />
            {isExecutionLoading ? 'Running...' : 'Run'}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 relative flex flex-col">
        <div className="flex h-2/3 font-code text-sm">
          <div className="w-12 select-none bg-muted/50 p-2 text-right text-muted-foreground">
            {Array.from({ length: lineCount }, (_, i) => (
              <div key={i}>{i + 1}</div>
            ))}
          </div>
          <div className="relative flex-1">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              spellCheck="false"
              className="absolute inset-0 h-full w-full resize-none border-0 bg-transparent p-2 font-code text-transparent caret-foreground outline-none"
            />
             <pre className="pointer-events-none h-full w-full overflow-auto p-2">
                <code
                    dangerouslySetInnerHTML={{
                    __html: code
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;')
                        .replace(/(import|from|function|const|return|export|default|console|def|class|public|static|void)/g, '<span class="text-primary font-semibold">$1</span>')
                        .replace(/(\/\/.+)|(#.+)/g, '<span class="text-green-600">$1</span>')
                        .replace(/(['"].+['"])/g, '<span class="text-accent-foreground/80">$1</span>'),
                    }}
                />
            </pre>
          </div>
        </div>
        {(isExecutionLoading || executionResult) && (
          <div className="flex-1 border-t">
            <div className="flex h-full flex-col">
              <div className="flex items-center gap-2 border-b bg-muted/50 px-4 py-2">
                <Terminal className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-medium font-sans">Output</h3>
              </div>
              <ScrollArea className="flex-1 p-4">
                {isExecutionLoading ? (
                  <p>Running code...</p>
                ) : (
                  <pre className="text-sm font-code">{executionResult}</pre>
                )}
              </ScrollArea>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
