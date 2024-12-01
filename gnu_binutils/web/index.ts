const Module = require("./alfa.js"); // Load the Emscripten-generated module

Module.onRuntimeInitialized = () => {
  // Call the main function
  const argc = 3;
  const argv = Module._malloc(3 * 4); // Allocate memory for argv (3 pointers)

  const arg0 = Module.allocateUTF8("./program"); // Simulating `argv[0]`
  const arg1 = Module.allocateUTF8("program_code"); // Simulating `argv[1]`
  const arg2 = Module.allocateUTF8("m"); // Simulating `argv[2]`

  // Write pointers into argv array
  Module.setValue(argv, arg0, "i32");
  Module.setValue(argv + 4, arg1, "i32");
  Module.setValue(argv + 8, arg2, "i32");

  // Call main
  const exitCode = Module._main(argc, argv);
  console.log("Program exited with code:", exitCode);

  // Free allocated memory
  Module._free(arg0);
  Module._free(arg1);
  Module._free(arg2);
  Module._free(argv);
};

async function callAS(env?: {}) {
  const Module = await import("./alfa");
  return Module.default(env);
}

async function assemble(code: string): Promise<string> {
  // console.log(`Assembling:\n${code}`);
  return new Promise((resolve, reject) => {
    let out = "";
    let error = false;
    const env: any = {
      preRun: [(m) => console.log("file.s")],
      print: (data) => {
        out += data + "\n";
      },
      printErr: (data) => {
        out += data + "\n";
      },
      quit: (code, _) => {
        if (env.quit && code !== 0) {
          error = true;
        }
        env.quit = null;
      },

      postRun: [
        async (m) => {
          //      console.log(`Assembled:\n${out}`);
          if (!error) {
            resolve("wassup");
          } else {
            reject(out);
          }
        },
      ],
    };
    env.arguments = ["alfa", "./file.s", "a"];
    callAS(env);
  });
}

await assemble("");
/*
import { compile, type Env } from "./risc64";
const path = "/home/manan/code/riscv_sim/examples/array_sum.s";
const file = Bun.file(path);
const code = await file.text();

const linker_script = `// Thanks https://github.com/darklife/darkriscv 
  __heap_size    = 0x200;  // required amount of heap
  __stack_size  = 0x800;  // required amount of stack 

  MEMORY
  {
    ROM (rwx) : ORIGIN = 0x00000000, LENGTH = 0x10000
    RAM (rwx) : ORIGIN = 0x00010000, LENGTH = 0x08000
  }
  SECTIONS
  {
    .text :
    {
      *(.boot)
      *(.text)
      *(.text)
      *(.rodata*)
    } > ROM
    .data :
    {
      *(.sbss)
      *(.data)
      *(.bss)
      *(.rela*)
      *(COMMON)
    } > RAM

    .heap :
    {
      . = ALIGN(4);
      PROVIDE ( end = . );
      _sheap = .;
      . = . + __heap_size;
      . = ALIGN(4);
      _eheap = .;
    } >RAM

    .stack :
    {
      . = ALIGN(4);
      _estack = .;
      . = . + __stack_size;
      . = ALIGN(4);
      _sstack = .;
    } >RAM
  }
        `;

const result = await compile(code, linker_script);
console.log("Elf file:");
console.log(result.full_hex);
console.log("---------");
console.log(result.elf_str);
console.log("---------");
console.log("HEX:");
console.log(result.hex);


async function callEmulator(env?: Env) {
  const Module = await import("./alfa");
  return Module.default(env);
}

async function runEmulator(elf: string) {
  console.log(Emulator);
}
//*/
//

//export { compile };
