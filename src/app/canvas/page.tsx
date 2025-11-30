import { Button } from "@/components/ui/button";
import { Share2 } from "lucide-react";
import CodeEditor from "@/components/editor/code-editor";

export default function CanvasPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-headline font-bold">Main Workspace</h1>
        <Button>
          <Share2 className="mr-2 h-4 w-4" />
          Share
        </Button>
      </div>
      <div className="flex-1">
        <CodeEditor />
      </div>
    </div>
  );
}
