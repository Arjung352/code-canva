"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";
import { Bot, Code, Play, Sparkles, Terminal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { explainCode } from "@/ai/flows/code-explanation-on-hover";
import { getCodeCompletionSuggestions } from "@/ai/flows/code-completion-suggestions";
import { executeCode } from "@/ai/flows/code-execution";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "../ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTheme } from "next-themes";

const codeSnippets = {
  javascript: `const a=10;
  const b=20;
  const add=a+b;
  console.log(add)
  `,
  python: `def greet(name):
    # This is a simple Python function
    message = f"Hello, {name}!"
    print(message)
    return message

greet("Code Canvas")
`,
  typescript: `const a:number=10;
  const b:number=20;
  const add:number=a+b;
  console.log(add)
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
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "typescript", label: "TypeScript" },
  { value: "java", label: "Java" },
];

export default function CodeEditor() {
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState(
    codeSnippets[language as keyof typeof codeSnippets]
  );
  const [explanation, setExplanation] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isExplanationLoading, setIsExplanationLoading] = useState(false);
  const [isSuggestionLoading, setIsSuggestionLoading] = useState(false);
  const [isExecutionLoading, setIsExecutionLoading] = useState(false);
  const [executionResult, setExecutionResult] = useState("");
  const { toast } = useToast();
  const { theme } = useTheme();

  const handleLanguageChange = (selectedLanguage: string) => {
    setLanguage(selectedLanguage);
    setCode(codeSnippets[selectedLanguage as keyof typeof codeSnippets]);
  };

  const handleCodeChange = (value: string | undefined) => {
    setCode(value || "");
  };

  const handleExplainCode = async () => {
    setIsExplanationLoading(true);
    try {
      const result = await explainCode({ code });
      setExplanation(result.explanation);
    } catch (error) {
      console.error("Error explaining code:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get code explanation.",
      });
      setExplanation("Sorry, I was unable to explain this code.");
    } finally {
      setIsExplanationLoading(false);
    }
  };

  const handleGetSuggestions = async () => {
    setIsSuggestionLoading(true);
    try {
      const result = await getCodeCompletionSuggestions({
        codeContext: code,
        language,
      });
      setSuggestions(result.suggestions);
    } catch (error) {
      console.error("Error getting suggestions:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to get code suggestions.",
      });
      setSuggestions(["Could not fetch suggestions."]);
    } finally {
      setIsSuggestionLoading(false);
    }
  };

  const handleRunCode = async () => {
    setIsExecutionLoading(true);
    setExecutionResult("");
    try {
      const result = await executeCode({ code, language });
      setExecutionResult(result.output);
    } catch (error) {
      console.error("Error executing code:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to execute code.",
      });
      setExecutionResult("An error occurred while running the code.");
    } finally {
      setIsExecutionLoading(false);
    }
  };

  return (
    <Card className="h-full flex flex-col border border-black shadow-xl rounded-xl shadow-gray-900">
      <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b rounded-xl">
        <div className="flex items-center gap-2">
          <Code className="h-5 w-5 text-muted-foreground" />
          <CardTitle className="text-lg font-medium font-sans">
            app.{language === "python" ? "py" : "tsx"}
          </CardTitle>
        </div>
        <div className="flex flex-wrap items-center gap-2 rounded-xl">
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
                <DialogTitle className="font-headline">
                  Code Explanation
                </DialogTitle>
                <DialogDescription>
                  AI-powered explanation of the code.
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[60vh] rounded-md border p-4">
                {isExplanationLoading ? (
                  <p>Loading...</p>
                ) : (
                  <p className="text-sm">{explanation}</p>
                )}
              </ScrollArea>
            </DialogContent>
          </Dialog>
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={handleGetSuggestions}
              >
                <Sparkles className="mr-2 h-4 w-4" />
                Get Suggestions
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
              <DialogHeader>
                <DialogTitle className="font-headline">
                  Code Suggestions
                </DialogTitle>
                <DialogDescription>
                  AI-powered code completion suggestions.
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[60vh] rounded-md border p-4">
                {isSuggestionLoading ? (
                  <p>Loading...</p>
                ) : (
                  <ul className="space-y-2">
                    {suggestions.map((s, i) => (
                      <li
                        key={i}
                        className="rounded bg-secondary p-2 font-code text-sm"
                      >
                        {s}
                      </li>
                    ))}
                  </ul>
                )}
              </ScrollArea>
            </DialogContent>
          </Dialog>
          <Button
            size="sm"
            onClick={handleRunCode}
            disabled={isExecutionLoading}
          >
            <Play className="mr-2 h-4 w-4" />
            {isExecutionLoading ? "Running..." : "Run"}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 p-0 relative flex flex-col overflow-hidden rounded-xl">
        <div className="flex-1 font-code text-sm overflow-hidden">
          <Editor
            height="100%"
            language={language}
            theme={theme === "dark" ? "vs-dark" : "light"}
            value={code}
            onChange={handleCodeChange}
            options={{
              minimap: { enabled: false },
              fontSize: 17,
              wordWrap: "on",
              scrollBeyondLastLine: false,
            }}
          />
        </div>
        {(isExecutionLoading || executionResult) && (
          <div className="flex-1 border-t max-h-1/3">
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
