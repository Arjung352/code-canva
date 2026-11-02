/**
 * Default code snippets for each supported language.
 * Used by the canvas page (new file creation) and the collaborative editor
 * (language-switch placeholder injection).
 */
export const DEFAULT_SNIPPETS: Record<string, string> = {
  javascript: `// CodeCanvas Collaborative Workspace
console.log("Welcome to CodeCanvas!");

function calculateMetrics(items) {
  return items.reduce((acc, curr) => acc + curr, 0);
}
`,
  typescript: `// CodeCanvas TypeScript Workspace
interface Collaborator {
  id: string;
  name: string;
  active: boolean;
}

const team: Collaborator[] = [
  { id: "1", name: "Alice", active: true },
];

console.log("Initialized team workspace:", team);
`,
  python: `# CodeCanvas Python Workspace
def greet(name: str) -> str:
    message = f"Hello from CodeCanvas, {name}!"
    print(message)
    return message

greet("Developer")
`,
  java: `// CodeCanvas Java Workspace
public class Main {
    public static void main(String[] args) {
        System.out.println("Welcome to CodeCanvas!");
    }
}
`,
  html: `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>CodeCanvas</title>
  </head>
  <body>
    <h1>Welcome to CodeCanvas!</h1>
  </body>
</html>
`,
  css: `/* CodeCanvas Styles */
body {
  font-family: sans-serif;
  margin: 0;
  padding: 2rem;
}

h1 {
  color: #6366f1;
}
`,
  json: `{
  "name": "codecanvas-project",
  "version": "1.0.0",
  "description": "CodeCanvas collaborative project"
}
`,
  plaintext: `Welcome to CodeCanvas!

Start typing your notes or documentation here.
`,
};

