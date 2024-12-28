export interface LinterIssue {
  line: number;
  severity: "error" | "warning";
  message: string;
}

export const lintRISCVAssembly = (content: string): LinterIssue[] => {
  const issues: LinterIssue[] = [];
  const lines = content.split("\n");

  // Comprehensive set of valid RISC-V base integer instruction set (RV32I)
  const validInstructions = new Set([
    // Arithmetic and Logical Instructions
    "add",
    "addi",
    "sub",
    "and",
    "andi",
    "or",
    "ori",
    "xor",
    "xori",

    // Shift Instructions
    "sll",
    "slli",
    "srl",
    "srli",
    "sra",
    "srai",

    // Memory Instructions
    "lw",
    "sw",
    "lb",
    "lbu",
    "lh",
    "lhu",
    "sb",
    "sh",

    // Branch Instructions
    "beq",
    "bne",
    "blt",
    "bltu",
    "bge",
    "bgeu",

    // Jump Instructions
    "jal",
    "jalr",

    // Upper Immediate Instructions
    "lui",
    "auipc",

    // System Instructions
    "ecall",
    "ebreak",

    // Pseudo Instructions
    "mv",
    "li",
    "la",
    "ret",
    "call",
    "j",
  ]);

  // Comprehensive register set including ABI names
  const validRegisters = new Set([
    // Integer Registers
    "x0",
    "x1",
    "x2",
    "x3",
    "x4",
    "x5",
    "x6",
    "x7",
    "x8",
    "x9",
    "x10",
    "x11",
    "x12",
    "x13",
    "x14",
    "x15",
    "x16",
    "x17",
    "x18",
    "x19",
    "x20",
    "x21",
    "x22",
    "x23",
    "x24",
    "x25",
    "x26",
    "x27",
    "x28",
    "x29",
    "x30",
    "x31",

    // ABI Register Names
    "zero",
    "ra",
    "sp",
    "gp",
    "tp",
    "a0",
    "a1",
    "a2",
    "a3",
    "a4",
    "a5",
    "a6",
    "a7",
    "t0",
    "t1",
    "t2",
    "t3",
    "t4",
    "t5",
    "t6",
    "s0",
    "s1",
    "s2",
    "s3",
    "s4",
    "s5",
    "s6",
    "s7",
    "s8",
    "s9",
    "s10",
    "s11",
  ]);

  // Directives
  const validDirectives = new Set([
    ".text",
    ".data",
    ".rodata",
    ".bss",
    ".section",
    ".global",
    ".globl",
    ".align",
    ".space",
    ".byte",
    ".half",
    ".word",
    ".dword",
    ".string",
    ".ascii",
    ".asciz",
  ]);

  // Track section state
  let hasTextSection = false;
  let hasDataSection = false;

  lines.forEach((line, index) => {
    const trimmedLine = line.trim();

    // Skip empty lines and comments
    if (trimmedLine === "" || trimmedLine.startsWith("#")) return;

    const parts = trimmedLine.split(/\s+/);
    const instruction = parts[0].toLowerCase();

    // Check for valid instructions or directives
    if (
      !validInstructions.has(instruction) &&
      !validDirectives.has(instruction) &&
      !instruction.endsWith(":") // Allow labels
    ) {
      issues.push({
        line: index + 1,
        severity: "error",
        message: `Invalid instruction or directive: ${instruction}`,
      });
    }

    // Track section directives
    if (instruction === ".text") hasTextSection = true;
    if (instruction === ".data") hasDataSection = true;

    // Register validation
    const registerPattern =
      /\b([xatsg][0-9]+|[asr][0-9]+|fp|ra|sp|gp|tp|zero)\b/g;
    const registers = trimmedLine.match(registerPattern) || [];

    registers.forEach((reg) => {
      if (!validRegisters.has(reg)) {
        issues.push({
          line: index + 1,
          severity: "warning",
          message: `Potentially invalid register: ${reg}`,
        });
      }
    });

    // Instruction-specific checks
    switch (instruction) {
      case "lui":
        if (parts.length !== 3) {
          issues.push({
            line: index + 1,
            severity: "error",
            message:
              "LUI instruction requires a register and an immediate value",
          });
        }
        break;

      case "beq":
      case "bne":
      case "blt":
      case "bge":
      case "bltu":
      case "bgeu":
        if (parts.length !== 4) {
          issues.push({
            line: index + 1,
            severity: "error",
            message: `Branch instruction ${instruction} requires two source registers and a label`,
          });
        }
        break;

      case "sw":
      case "lw":
        if (parts.length !== 3) {
          issues.push({
            line: index + 1,
            severity: "error",
            message: `Store/Load word instruction requires a register and a memory address`,
          });
        }
        break;
    }
  });

  // Check if no sections were defined
  if (!hasTextSection && !hasDataSection) {
    issues.push({
      line: 1,
      severity: "warning",
      message: "No .text or .data section defined",
    });
  }

  return issues;
};

// Optional: Type for better type checking
export type RISCVLinterFunction = typeof lintRISCVAssembly;
