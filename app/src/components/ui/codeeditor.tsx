"use client";

import React, { useState, useRef, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarRail,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  SidebarGroup,
  SidebarGroupContent,
  SidebarInput,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  Save,
  Terminal,
  AlertTriangle,
  Check,
  Cpu,
  File,
  XIcon,
  Search,
  Plus,
  Minus,
  Folder,
  GalleryVerticalEndIcon,
} from "lucide-react";
import { lintRISCVAssembly } from "@/lib/linter";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@radix-ui/react-separator";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbPage,
} from "./breadcrumb";
import { Label } from "recharts";
import { Dialog } from "@radix-ui/react-dialog";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import { Editor } from "@/components/ui/editor.tsx";

interface EditorProps {
  files: CodeFile[];
  activeFile: CodeFile;
  setActiveFile: React.Dispatch<React.SetStateAction<CodeFile>>;
  clearTerminal: ()=>void;
  handleCompile: () => void;
  setFiles: React.Dispatch<React.SetStateAction<CodeFile[]>>;
  instructionContent: string;
  outputContent: string;
  errorContent: string;
}
export const RISCVCodeEditor: React.FC<EditorProps> = ({
  activeFile,
  setActiveFile,
  files,
  setFiles,
  handleCompile,
  clearTerminal,
  instructionContent,
  outputContent,
  errorContent,
}) => {
  // Convert file structure to initial files with unique IDs and paths
  //const initialFiles = flattenFileStructure(_files);
  //const [files, setFiles] = useState<CodeFile[]>(initialFiles);
  const [newFileName, setNewFileName] = useState("");
  const [showTerminal, setShowTerminal] = useState<
    "Output" | "Instructions" | "Errors" | ""
  >("");
  const [showLinter, setShowLinter] = useState(true);
  const textareaRefs = useRef<{ [key: string]: HTMLTextAreaElement | null }>(
    {},
  );

  useEffect(() => {
    const updatedFiles = files.map((file) => ({
      ...file,
      issues: lintRISCVAssembly(file.content),
    }));
    if (JSON.stringify(updatedFiles) !== JSON.stringify(files)) {
      setFiles(updatedFiles);
    }
  }, [files, setFiles]);

  const renderFileTree = (structure: FileStructure, path: string = "") => {
    const openFile = (filePath: string) => {
      const fileToOpen = files.find((f) => f.path === filePath);
      if (fileToOpen) {
        setActiveFile(fileToOpen);
      }
    };

    return Object.entries(structure).map(([key, value]) => {
      const fullPath = path ? `${path}/${key}` : key;
      if (typeof value === "string") {
        return (
          <div key={fullPath} className="flex items-center space-x-2 py-1">
            <File className="h-4 w-4" />
            <button
              onClick={() => openFile(fullPath)}
              className={`text-sm focus:underline focus:outline-none ${
                activeFile.path === fullPath ? "font-bold" : ""
              }`}
            >
              {key}
            </button>
          </div>
        );
      } else {
        return (
          <div key={fullPath}>
            <div className="flex items-center space-x-2 py-1">
              <Folder className="h-4 w-4" />
              <span className="text-sm font-medium">{key}</span>
            </div>
            <div className="pl-4">{renderFileTree(value, fullPath)}</div>
          </div>
        );
      }
    });
  };

  const addNewFile = () => {
    if (newFileName) {
      const filename = newFileName.endsWith(".s")
        ? newFileName
        : `${newFileName}.s`;
      const newFile: CodeFile = {
        id: String(Date.now()),
        name: filename,
        content: "# New RISC-V File - " + newFileName + "\n",
        issues: [],
        path: filename, // should be a path right, fix it?
      };
      const updatedFiles = [...files, newFile];
      setFiles(updatedFiles);
      setActiveFile(newFile);
      setNewFileName("");
    }
  };

  const removeFile = (fileToRemovePath: string) => {
    const updatedFiles = files.filter((file) => file.path !== fileToRemovePath);
    setFiles(updatedFiles);

    if (updatedFiles.length > 0) {
      setActiveFile(updatedFiles[0]);
    }
  };

  const updateFileContent = (fileId: string, newContent: string) => {
    setFiles((prevFiles: CodeFile[]) =>
      prevFiles.map((file) =>
        file.id === fileId ? { ...file, content: newContent } : file,
      ),
    );
  };

  const renderEditorWithIssues = (file: CodeFile) => {
    return (
      <div className="flex h-full">
        <div className="flex-1 relative">
          <Editor
            ref={(el) => (textareaRefs.current[file.id] = el)}
            theme="tomorrow"
            className="w-full h-full font-mono text-sm border-none outline-none resize-none p-0"
            width="100%"
            height="100%"
            code={file.content}
            setCode={(e: string) => updateFileContent(file.id, e)}
            name="riscv"
          />
          {showLinter &&
            file.issues.map((issue, idx) => (
              <div
                key={idx}
                className={`absolute right-0 top-0 border-r-4 ${
                  issue.severity === "error"
                    ? "bg-red-50 border-red-500"
                    : "bg-yellow-50 border-yellow-500"
                }`}
                style={{
                  top: `${(issue.line - 1) * 1.5}em`,
                  maxWidth: "50%",
                }}
              >
                <div className="text-xs p-1 flex items-center justify-end">
                  {issue.severity === "error" ? (
                    <XIcon className="ml-1 text-red-500 h-3 w-3" />
                  ) : (
                    <AlertTriangle className="ml-1 text-yellow-500 h-3 w-3" />
                  )}
                  <span className="truncate">{issue.message}</span>
                </div>
              </div>
            ))}
        </div>
      </div>
    );
  };

  return (
    <Dialog>
      <SidebarProvider>
        <AppSidebar
          files={files}
          createFile={addNewFile}
          deleteFile={removeFile}
          newFileName={newFileName}
          setNewFileName={setNewFileName}
          searchFile={() => {}}
          renderFileTree={renderFileTree}
        />

        <SidebarInset>
          <header className="flex h-14 shrink-0 items-center gap-2">
            <div className="flex flex-1 items-center gap-2 px-3">
              <SidebarTrigger />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem>
                    <BreadcrumbPage className="line-clamp-1">
                      {activeFile.name ?? "unknown"}
                    </BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </div>
            <div className="ml-auto px-3">
              <div className="flex items-center space-x-2">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant={showLinter ? "default" : "outline"}
                        onClick={() => setShowLinter(!showLinter)}
                        className="h-6 w-6"
                      >
                        <Check className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Linter</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant={
                          showTerminal == "Output" ? "default" : "outline"
                        }
                        onClick={() =>
                          showTerminal == "Output"
                            ? setShowTerminal("")
                            : setShowTerminal("Output")
                        }
                        className="h-6 w-6"
                      >
                        <Terminal className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Output</p>
                    </TooltipContent>
                  </Tooltip>

                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant={
                          showTerminal == "Instructions" ? "default" : "outline"
                        }
                        onClick={() =>
                          showTerminal == "Instructions"
                            ? setShowTerminal("")
                            : setShowTerminal("Instructions")
                        }
                        className="h-6 w-6"
                      >
                        <Cpu className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Instructions</p>
                    </TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        size="icon"
                        variant={
                          showTerminal == "Errors" ? "destructive" : "outline"
                        }
                        onClick={() =>
                          showTerminal == "Errors"
                            ? setShowTerminal("")
                            : setShowTerminal("Errors")
                        }
                        className="h-6 w-6"
                      >
                        <AlertTriangle className="h-3 w-3" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p className="text-xs">Errors</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </div>
            </div>
          </header>

          <div className="flex flex-col w-full flex-1 border border-primary-500">
            <div className="flex-1 flex flex-col overflow-hidden">
              <Tabs
                value={activeFile.id}
                className="flex flex-col h-full flex-start"
              >
                <div className="bg-gray-100 w-full">
                  <TabsList className="mr-auto py-0 my-0">
                    {files.map((file) => (
                      <TabsTrigger
                        key={file.id}
                        value={file.id}
                        className="px-3 text-sm rounded-none data-[state=active]:bg-white data-[state=active]:shadow-none border-b-2 data-[state=active]:border-blue-500 border-transparent"
                        onClick={(e) => {
                          e.preventDefault();
                          clearTerminal()
                          setShowTerminal("")
                          setActiveFile(file);
                        }}
                      >
                        {file.name}
                        {showLinter && file.issues.length > 0 && (
                          <span className="ml-2 px-1 bg-red-500 text-white text-xs rounded-full">
                            {file.issues.length}
                          </span>
                        )}
                      </TabsTrigger>
                    ))}
                  </TabsList>
                </div>

                {files.map((file) => (
                  <TabsContent
                    key={file.id}
                    value={file.id}
                    className="flex-1 p-0 mt-0"
                  >
                    <Card className="h-full flex flex-col border rounded-none">
                      <CardContent className="flex-1 p-0 overflow-hidden">
                        {renderEditorWithIssues(file)}
                      </CardContent>
                      <div className="p-2 bg-gray-50 flex justify-between">
                        <div>
                          {showLinter && file.issues.length > 0 && (
                            <div className="text-sm text-yellow-600">
                              {file.issues.length} issue
                              {file.issues.length !== 1 ? "s" : ""} detected
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            className="h-7 px-2 text-xs font-medium flex items-center"
                            variant="outline"
                            onClick={() => {
                              handleCompile();
                              if (errorContent.length > 4) {
                                setShowTerminal("Errors");
                              } else {
                                setShowTerminal("Output");
                              }
                            }}
                          >
                            Compile & Run
                          </Button>
                          <Button
                            size="sm"
                            className="h-7 px-2 text-xs font-medium flex items-center"
                            onClick={() => {
                              // Placeholder for save functionality
                              console.log("File saved:", activeFile.name);
                            }}
                          >
                            <Save className="mr-1 h-3 w-3" /> Save File
                          </Button>
                        </div>
                      </div>
                    </Card>
                  </TabsContent>
                ))}
              </Tabs>
            </div>

            {showTerminal === "Instructions" && (
              <div className="bg-black text-white p-4 h-[168px] overflow-y-auto text-xs">
                <h3 className="text-lg font-semibold mb-2">Instructions</h3>
                <pre>{instructionContent}</pre>
              </div>
            )}
            {showTerminal === "Output" && (
              <div className="bg-black text-white p-4 h-[168px] overflow-y-auto  text-xs">
                <h3 className="text-lg font-semibold mb-2">Output</h3>
                <pre>{outputContent}</pre>
              </div>
            )}
            {showTerminal === "Errors" && (
              <div className="bg-red-100 text-red-900 p-4 h-[168px] overflow-y-auto text-xs">
                <h3 className="text-lg font-semibold mb-2">Errors</h3>
                <pre>{errorContent}</pre>
              </div>
            )}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </Dialog>
  );
};

export function AppSidebar({
  files,
  createFile,
  deleteFile,
  newFileName,
  setNewFileName,
  searchFile,
  renderFileTree,
  ...props
}: {
  files: CodeFile[];
  createFile: () => void;
  deleteFile: (filename: string) => void;
  newFileName: string;
  setNewFileName: (name: string) => void;
  renderFileTree: (structure: FileStructure, path?: string) => JSX.Element[];
  searchFile: () => void;
} & React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar className="border-r-0" {...props}>
      <SidebarHeader>
        <SidebarMenuButton className="w-fit px-1.5">
          <div className="flex aspect-square size-5 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground">
            <GalleryVerticalEndIcon className="size-3" />
          </div>
          <span className="truncate font-semibold">RISCV Editor</span>
        </SidebarMenuButton>
        <SearchForm setNewFileName={setNewFileName} newFileName={newFileName} />

        <div className="space-x-1 ml-auto">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant={"outline"}
                disabled={!newFileName}
                onClick={createFile}
                className="h-6 w-6 rounded-none "
              >
                <Plus className="w-3 h-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Create</p>
            </TooltipContent>
          </Tooltip>

          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant={"outline"}
                disabled={!newFileName}
                onClick={() => deleteFile(newFileName)}
                className="h-6 w-6 rounded-none "
              >
                <Minus className="w-3 h-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Create</p>
            </TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                size="icon"
                variant={"outline"}
                onClick={() => searchFile()}
                disabled={!newFileName}
                className="h-6 w-6 rounded-none bg-primary text-primary-foreground"
              >
                <Search className="w-3 h-3" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">Search</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <ScrollArea className="h-[calc(100vh-300px)]">
          <div className="px-4 py-1">
            {renderFileTree(
              files.reduce((acc, file) => {
                const pathParts = file.path?.split("/") || [];
                let current = acc;
                pathParts.forEach((part, index) => {
                  if (index === pathParts.length - 1) {
                    current[part] = file.content;
                  } else {
                    current[part] = current[part] || {};
                    current = current[part] as FileStructure;
                  }
                });
                return acc;
              }, {} as FileStructure),
              "",
            )}
          </div>
        </ScrollArea>
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  );
}

export function SearchForm({
  setNewFileName,
  newFileName,
  ...props
}: {
  setNewFileName: (name: string) => void;
  newFileName: string;
} & React.ComponentProps<"form">) {
  return (
    <form {...props}>
      <SidebarGroup className="py-0">
        <SidebarGroupContent className="relative">
          <Label className="sr-only">Search</Label>
          <SidebarInput
            id="search"
            placeholder="Search"
            className="px-8  focus-visible:outline-none"
            value={newFileName}
            onChange={(e) => setNewFileName(e.target.value)}
          />
          <Search className="pointer-events-none absolute left-2 top-1/2 size-4 -translate-y-1/2 select-none opacity-50" />
        </SidebarGroupContent>
      </SidebarGroup>
    </form>
  );
}

export default RISCVCodeEditor;
