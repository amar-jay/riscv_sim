import { useEffect, useMemo, useState } from "react";
import RISCVCodeEditor from "@/components/ui/codeeditor";
import "./App.css";
import files from "./assets/code.json";
import { useAlfa } from "./hooks/use-alfa";
import { memorySample, registerSample } from "./lib/sample";

/*
const flattenFileStructure = (
  structure: FileStructure,
  basePath: string = "",
): File[] => {
  const files: File[] = [];

  const traverse = (obj: FileStructure, currentPath: string) => {
    Object.entries(obj).forEach(([key, value]) => {
      const fullPath = currentPath ? `${currentPath}/${key}` : key;
      if (typeof value === "string") {
        files.push({
          id: fullPath,
          name: key,
          content: value,
          issues: [],
          path: fullPath,
        });
      } else {
        traverse(value, fullPath);
      }
    });
  };

  traverse(structure, basePath);
  return files;
};


const _files: FileStructure = {
  "main.s": `# RISC-V Assembly Example
.text
.globl _start

_start:
    li a0, 1        # File descriptor: 1 is stdout
    la a1, message  # Load address of message
    li a2, 13       # Length of message
    li a7, 64       # System call: write
    ecall

    li a7, 93       # System call: exit
    li a0, 0        # Exit code: 0
    ecall

.data
message:
    .string "Hello, RISC-V"
`,
  "functions.s": `# RISC-V Assembly Functions
.text
.globl add_numbers

add_numbers:
    add a0, a0, a1
    ret
`,
  examples: {
    "loop.s": `# RISC-V Assembly Loop Example
.text
.globl _start

_start:
    li t0, 0       # Initialize counter
    li t1, 10      # Set loop limit

loop:
    addi t0, t0, 1 # Increment counter
    blt t0, t1, loop # Branch if less than limit

    li a7, 93      # System call: exit
    li a0, 0       # Exit code: 0
    ecall
`,
  },
};
*/

const fetchInitialFiles = (basepath = ""): CodeFile[] => {
  return files.map(
    (v, idx) =>
      ({
        id: idx.toString(),
        name: v.file,
        content: v.content,
        issues: [] as LinterIssue[],
        path: basepath + "/" + v.file,
      }) satisfies CodeFile,
  );
};
function App() {
  const [execOutput, setExecOutput] = useState("");
  const initialFiles = fetchInitialFiles();
  const [files, setFiles] = useState<CodeFile[]>(initialFiles);
  const [activeFile, setActiveFile] = useState<CodeFile>(initialFiles[0]);
  const [instructionContent, setInstructionContent] = useState("");
  const [errorContent, setErrorContent] = useState("");
  const [outputContent, setOutputContent] = useState("");
  const code = useMemo(() => {
  console.log("changed files");
  return activeFile.content
  }, [activeFile]);

  const { onRunKiteWasm, wasmRequestStatus } = useAlfa({
    codeState: code,
    registerState: registerSample, // NOTE: temporary until we figure something out
    memoryState: memorySample, // NOTE: temporary until we figure something out
    setExecOutput,
  });

  useEffect(() => {
    if (execOutput.startsWith("ERROR:")) {
      setErrorContent(execOutput);
    } else {
      setOutputContent(execOutput);
    }
    setInstructionContent("SUCCESSFULL RUN. Unimplemented yet!");
  }, [execOutput]);

  const clearTerminal = () => {
    setErrorContent("")
    setOutputContent("")
    setInstructionContent("")
    setActiveFile({})
  }
  const handleCompile = () => {
    onRunKiteWasm();
  };

  return (
    <RISCVCodeEditor
      clearTerminal={clearTerminal}
      setActiveFile={setActiveFile}
      activeFile={activeFile}
      handleCompile={handleCompile}
      setFiles={setFiles}
      files={files}
      instructionContent={instructionContent}
      errorContent={errorContent}
      outputContent={outputContent}
    />
  );
  // {WasmRequestStatus != WasmRequestStatus.LOADING && <RISCVCodeEditor />}
  /*
  return (
    <div>
      <div className="grid grid-cols-3">
        <div>
          <h1>Code</h1>
          <textarea
            className="h-64 w-full ring-1"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
        </div>
        <div>
          <h1>Memory state</h1>
          <textarea
            className="h-64 w-full ring-1"
            value={memory}
            onChange={(e) => setMemory(e.target.value)}
          />
        </div>
        <div>
          <h1>Register</h1>
          <textarea
            className="h-64 w-full ring-1"
            value={register}
            onChange={(e) => setRegiter(e.target.value)}
          />
        </div>
      </div>
      <p>
        {wasmRequestStatus}
        <Button onClick={onRunKiteWasm}>Run</Button>
      </p>
      <pre>{execOutput}</pre>
    </div>
  );
    */
}

export default App;
