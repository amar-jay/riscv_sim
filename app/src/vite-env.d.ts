/// <reference types="vite/client" />

interface FileStructure {
  [key: string]: string | FileStructure;
}

interface CodeFile {
  id: string;
  name: string;
  content: string;
  issues: LinterIssue[];
  path?: string;
}

interface LinterIssue {
  line: number;
  severity: "error" | "warning";
  message: string;
}
