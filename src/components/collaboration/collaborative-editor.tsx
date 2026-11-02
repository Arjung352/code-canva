"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Editor, { OnMount } from "@monaco-editor/react";
import * as Y from "yjs";
import { MonacoBinding } from "@/lib/y-monaco";
import {
  Bot,
  Code,
  Play,
  Sparkles,
  Terminal,
  Save,
  CheckCircle2,
  CloudOff,
  Radio,
  Eye,
  Loader2,
} from "lucide-react";
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
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useTheme } from "next-themes";
import { useYjsDocument, Collaborator } from "@/hooks/use-yjs-document";
import { explainCode } from "@/ai/flows/code-explanation-on-hover";
import { getCodeCompletionSuggestions } from "@/ai/flows/code-completion-suggestions";
import { executeCode } from "@/ai/flows/code-execution";
import { DEFAULT_SNIPPETS } from "@/lib/code-snippets";

interface CollaborativeEditorProps {
  projectId: string;
  documentId: string;
  documentName: string;
  initialLanguage: string;
  initialBase64State?: string | null;
  initialContent?: string;
  canEdit: boolean;
  currentUser?: {
    id: string;
    username: string;
    avatarUrl?: string | null;
  } | null;
  onLanguageChange?: (language: string) => void;
  onCollaboratorsChange?: (collaborators: Collaborator[]) => void;
}

const languages = [
  { value: "javascript", label: "JavaScript" },
  { value: "typescript", label: "TypeScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
  { value: "html", label: "HTML" },
  { value: "css", label: "CSS" },
  { value: "json", label: "JSON" },
  { value: "plaintext", label: "Plain Text" },
];

export function CollaborativeEditor({
  projectId,
  documentId,
  documentName,
  initialLanguage,
  initialBase64State,
  initialContent,
  canEdit,
  currentUser,
  onLanguageChange,
  onCollaboratorsChange,
}: CollaborativeEditorProps) {
  const [language, setLanguage] = useState(initialLanguage || "javascript");
  const [editorInstance, setEditorInstance] = useState<any>(null);
  const [explanation, setExplanation] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isExplanationLoading, setIsExplanationLoading] = useState(false);
  const [isSuggestionLoading, setIsSuggestionLoading] = useState(false);
  const [isExecutionLoading, setIsExecutionLoading] = useState(false);
  const [executionResult, setExecutionResult] = useState("");
  const { toast } = useToast();
  const { theme } = useTheme();

  const bindingRef = useRef<MonacoBinding | null>(null);

  const {
    ydoc,
    provider,
    collaborators,
    saveStatus,
    connectionStatus,
    reconnect,
    persistNow,
  } = useYjsDocument({
    projectId,
    documentId,
    initialBase64State,
    initialTextContent: initialContent,
    canEdit,
    currentUser,
  });

  // Track serialized collaborators to avoid triggering parent re-render loops
  const lastNotifiedCollabsRef = useRef<string>("");

  useEffect(() => {
    if (onCollaboratorsChange) {
      const serialized = collaborators
        .map((c) => `${c.clientId}:${c.user.id}:${c.user.name}`)
        .join(",");
      if (lastNotifiedCollabsRef.current !== serialized) {
        lastNotifiedCollabsRef.current = serialized;
        onCollaboratorsChange(collaborators);
      }
    }
  }, [collaborators, onCollaboratorsChange]);

  // Handle Monaco mount and bind with Yjs
  const handleEditorDidMount: OnMount = (editor) => {
    setEditorInstance(editor);

    if (ydoc && provider) {
      const type = ydoc.getText("monaco");
      const model = editor.getModel();
      if (model) {
        if (bindingRef.current) {
          bindingRef.current.destroy();
        }
        bindingRef.current = new MonacoBinding(
          type,
          model,
          new Set([editor]),
          provider.awareness,
        );
      }
    }
  };

  // Re-bind when ydoc or provider changes
  useEffect(() => {
    if (editorInstance && ydoc && provider) {
      const type = ydoc.getText("monaco");
      const model = editorInstance.getModel();
      if (model) {
        if (bindingRef.current) {
          bindingRef.current.destroy();
        }
        bindingRef.current = new MonacoBinding(
          type,
          model,
          new Set([editorInstance]),
          provider.awareness,
        );
      }
    }

    return () => {
      if (bindingRef.current) {
        bindingRef.current.destroy();
        bindingRef.current = null;
      }
    };
  }, [editorInstance, ydoc, provider]);

  const getCurrentCode = useCallback(() => {
    if (editorInstance) {
      return editorInstance.getValue() as string;
    }
    if (ydoc) {
      return ydoc.getText("monaco").toString();
    }
    return "";
  }, [editorInstance, ydoc]);

  const handleLanguageSelect = (selectedLanguage: string) => {
    setLanguage(selectedLanguage);
    if (onLanguageChange) {
      onLanguageChange(selectedLanguage);
    }

    // When changing format (e.g. from js to ts), update sample code if empty or currently a template
    if (canEdit && ydoc) {
      const ytext = ydoc.getText("monaco");
      const currentCode = ytext.toString().trim();
      const isSampleOrEmpty =
        !currentCode ||
        Object.values(DEFAULT_SNIPPETS).some(
          (snippet) => snippet.trim() === currentCode,
        );

      if (isSampleOrEmpty && DEFAULT_SNIPPETS[selectedLanguage]) {
        ydoc.transact(() => {
          ytext.delete(0, ytext.length);
          ytext.insert(0, DEFAULT_SNIPPETS[selectedLanguage]);
        });
      }
    }
  };

  // AI: Explain Code
  const handleExplainCode = async () => {
    const code = getCurrentCode();
    if (!code.trim()) {
      toast({ title: "No code to explain" });
      return;
    }
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

  // AI: Code Suggestions
  const handleGetSuggestions = async () => {
    const code = getCurrentCode();
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

  // AI: Code Execution
  const handleRunCode = async () => {
    const code = getCurrentCode();
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
    <Card className="h-full flex flex-col border shadow-lg rounded-xl overflow-hidden bg-card">
      <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3 border-b py-2.5 px-4 bg-muted/20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Code className="h-5 w-5 text-primary" />
            <CardTitle className="text-base font-semibold font-mono">
              {documentName}
            </CardTitle>
          </div>

          {!canEdit && (
            <Badge
              variant="outline"
              className="text-xs text-amber-500 border-amber-500/30 flex items-center gap-1"
            >
              <Eye className="h-3 w-3" />
              Read-Only
            </Badge>
          )}

          {/* Sync & Connection status */}
          <div className="flex items-center gap-2 text-xs">
            {connectionStatus === "connected" ? (
              <span className="flex items-center gap-1 text-emerald-500 font-medium">
                <Radio className="h-3.5 w-3.5 animate-pulse" />
                Live Sync
              </span>
            ) : connectionStatus === "connecting" ? (
              <span className="flex items-center gap-1 text-amber-500 font-medium">
                <Loader2 className="h-3 w-3 animate-spin" />
                Connecting...
              </span>
            ) : (
              <button
                type="button"
                onClick={reconnect}
                className="flex items-center gap-1 text-rose-500 hover:text-rose-600 font-medium cursor-pointer transition-colors"
                title="Click to reconnect WebSocket"
              >
                <CloudOff className="h-3.5 w-3.5" />
                Disconnected (Retry)
              </button>
            )}

            <span className="text-muted-foreground">|</span>

            {saveStatus === "saving" ? (
              <span className="flex items-center gap-1 text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Saving...
              </span>
            ) : saveStatus === "saved" ? (
              <span className="flex items-center gap-1 text-emerald-500">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Saved
              </span>
            ) : (
              <span className="text-amber-500">Unsaved</span>
            )}
          </div>
        </div>

        {/* Right side: Collaborators and action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Active Collaborators Avatars */}
          {collaborators.length > 0 && (
            <div className="flex items-center -space-x-2 mr-2">
              {collaborators.slice(0, 5).map((collab) => (
                <div
                  key={`collab-${collab.clientId}-${collab.user.id}`}
                  className="relative group"
                  title={`${collab.user.name} (editing)`}
                >
                  <Avatar
                    className="h-7 w-7 border-2"
                    style={{ borderColor: collab.user.color }}
                  >
                    {collab.user.avatarUrl ? (
                      <AvatarImage
                        src={collab.user.avatarUrl}
                        alt={collab.user.name}
                      />
                    ) : null}
                    <AvatarFallback
                      className="text-[10px] font-bold text-white"
                      style={{ backgroundColor: collab.user.color }}
                    >
                      {collab.user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </div>
              ))}
              {collaborators.length > 5 && (
                <span className="text-xs text-muted-foreground pl-3">
                  +{collaborators.length - 5}
                </span>
              )}
            </div>
          )}

          {/* Language selector */}
          <Select value={language} onValueChange={handleLanguageSelect}>
            <SelectTrigger className="w-[125px] h-8 text-xs">
              <SelectValue placeholder="Language" />
            </SelectTrigger>
            <SelectContent>
              {languages.map((lang) => (
                <SelectItem
                  key={lang.value}
                  value={lang.value}
                  className="text-xs"
                >
                  {lang.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* AI Explain Code */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={handleExplainCode}
              >
                <Bot className="mr-1.5 h-3.5 w-3.5 text-primary" />
                Explain
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
              <DialogHeader>
                <DialogTitle>Code Explanation</DialogTitle>
                <DialogDescription>
                  AI-powered analysis of your current code.
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[60vh] rounded-md border p-4 text-sm leading-relaxed">
                {isExplanationLoading ? (
                  <div className="flex items-center gap-2 py-6 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Analyzing code with Gemini...
                  </div>
                ) : (
                  <p className="whitespace-pre-wrap">{explanation}</p>
                )}
              </ScrollArea>
            </DialogContent>
          </Dialog>

          {/* AI Suggestions */}
          <Dialog>
            <DialogTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                className="h-8 text-xs"
                onClick={handleGetSuggestions}
              >
                <Sparkles className="mr-1.5 h-3.5 w-3.5 text-amber-500" />
                Suggest
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[625px]">
              <DialogHeader>
                <DialogTitle>Code Suggestions</DialogTitle>
                <DialogDescription>
                  AI-powered completions based on your code context.
                </DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[60vh] rounded-md border p-4">
                {isSuggestionLoading ? (
                  <div className="flex items-center gap-2 py-6 text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating suggestions...
                  </div>
                ) : (
                  <ul className="space-y-2">
                    {suggestions.map((s, i) => (
                      <li
                        key={i}
                        className="rounded bg-secondary p-2.5 font-mono text-xs whitespace-pre-wrap border"
                      >
                        {s}
                      </li>
                    ))}
                  </ul>
                )}
              </ScrollArea>
            </DialogContent>
          </Dialog>

          {/* AI Run Code */}
          <Button
            size="sm"
            className="h-8 text-xs"
            onClick={handleRunCode}
            disabled={isExecutionLoading}
          >
            {isExecutionLoading ? (
              <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <Play className="mr-1.5 h-3.5 w-3.5 text-emerald-400" />
            )}
            Run
          </Button>

          {/* Manual Save */}
          {canEdit && (
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              onClick={persistNow}
              title="Save document"
            >
              <Save className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 relative flex flex-col overflow-hidden">
        <div className="flex-1 overflow-hidden">
          <Editor
            height="100%"
            language={language}
            theme={theme === "dark" ? "vs-dark" : "light"}
            onMount={handleEditorDidMount}
            options={{
              minimap: { enabled: false },
              fontSize: 15,
              wordWrap: "on",
              readOnly: !canEdit,
              scrollBeyondLastLine: false,
              automaticLayout: true,
            }}
          />
        </div>

        {/* Console / Execution output drawer */}
        {(isExecutionLoading || executionResult) && (
          <div className="border-t max-h-[35%] flex flex-col bg-muted/30">
            <div className="flex items-center gap-2 border-b bg-muted/60 px-4 py-1.5">
              <Terminal className="h-4 w-4 text-primary" />
              <h3 className="text-xs font-semibold uppercase tracking-wider">
                Console Output
              </h3>
            </div>
            <ScrollArea className="flex-1 p-4">
              {isExecutionLoading ? (
                <p className="text-xs text-muted-foreground flex items-center gap-2">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Executing code...
                </p>
              ) : (
                <pre className="text-xs font-mono whitespace-pre-wrap text-foreground">
                  {executionResult}
                </pre>
              )}
            </ScrollArea>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
