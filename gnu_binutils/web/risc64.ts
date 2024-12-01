type ElfFile = BufferSource;
interface IModule {
  FS: {
    writeFile: (name: string, content: string | BufferSource) => Promise<void>;
    readFile: (name: string) => Promise<Buffer>;
  };
}
export interface Env {
  arguments?: string[];
  preRun?: ((m: IModule) => any)[];
  print?: (data: string) => void;

  printErr?: (data: string) => void;
  quit?: ((code: string | 0, m: IModule) => void) | null;
  postRun?: ((m: IModule) => any)[];
}
async function callAS(env?: {}) {
  const Module = await import("./riscv64-linux-gnu-as");
  return Module.default(env);
}

async function callObjdump(env?: Env) {
  const Module = await import("./riscv64-linux-gnu-objdump");
  return Module.default(env);
}

async function callObjcopy(env?: Env) {
  const Module = await import("./riscv64-linux-gnu-objcopy");
  return Module.default(env);
}

async function callLd(env?: Env) {
  const Module = await import("./riscv64-linux-gnu-ld");
  return Module.default(env);
}

async function assemble(code: string): Promise<Buffer> {
  // console.log(`Assembling:\n${code}`);
  return new Promise((resolve, reject) => {
    const env: Env = {};
    env.preRun = [(m) => m.FS.writeFile("file.s", code)];
    let out = "";
    env.print = (data) => {
      out += data + "\n";
    };
    env.printErr = (data) => {
      out += data + "\n";
    };
    let error = false;
    env.quit = (code, _) => {
      if (env.quit && code !== 0) {
        error = true;
      }
      env.quit = null;
    };
    env.postRun = [
      async (m) => {
        //      console.log(`Assembled:\n${out}`);
        if (!error) {
          const data = await m.FS.readFile("file.o");
          resolve(data);
        } else {
          reject(out);
        }
      },
    ];
    env.arguments = ["file.s", "-o", "file.o"];
    callAS(env);
  });
}

async function link(object: Buffer, ldscript: string): Promise<ElfFile> {
  /*
  console.log(
    `Linking:\n${bufferToHex(object).replace("\n", "")} with ${ldscript}`,
  );
*/
  return new Promise((resolve, reject) => {
    const env: Env = {};
    env.preRun = [
      (m) => {
        m.FS.writeFile("file.ld", ldscript);
      },
      (m) => {
        m.FS.writeFile("data.o", object);
      },
    ];
    let error = false;
    env.quit = (code, _) => {
      if (env.quit && code !== 0) {
        error = true;
      }
      env.quit = null;
    };
    let out = "";
    env.print = (data) => {
      out += data + "\n";
    };
    env.printErr = (data) => {
      out += data + "\n";
    };
    env.postRun = [
      async (m) => {
        if (!error) {
          const data = await m.FS.readFile("file.elf");
          resolve(data);
        } else {
          reject(`LD: ${out}`);
        }
      },
    ];
    env.arguments = ["-T", "file.ld", "data.o", "-o", "file.elf"];
    callLd(env);
  });
}

const dump = (elf: ElfFile) => {
  return new Promise((resolve) => {
    const env: Env = {};
    env.preRun = [
      (m) => {
        m.FS.writeFile("file.elf", elf);
      },
    ];
    let stdout = "";
    env.print = (data) => {
      stdout += data + "\n";
    };
    env.postRun = [
      async (_) => {
        resolve(stdout);
      },
    ];
    env.arguments = ["-D", "file.elf"];
    callObjdump(env);
  });
};

const dump_as_hex = (elf: ElfFile) => {
  return new Promise((resolve) => {
    const env: Env = {};
    env.preRun = [
      (m) => {
        m.FS.writeFile("file.elf", elf);
      },
    ];
    let stdout = "";
    env.print = (data) => {
      stdout += data + "\n";
    };
    env.postRun = [
      async (_) => {
        resolve(stdout);
      },
    ];
    env.arguments = ["-s", "file.elf"];
    callObjdump(env);
  });
};

async function getBinaryText(elf: ElfFile): Promise<Buffer> {
  return new Promise((resolve) => {
    const env: Env = {};
    env.preRun = [
      (m) => {
        m.FS.writeFile("file.elf", elf);
      },
    ];
    env.postRun = [
      async (m) => {
        const data = await m.FS.readFile("file.bin");
        resolve(data);
      },
    ];
    env.arguments = [
      "-O",
      "binary",
      "file.elf",
      "file.bin",
      "--only-section",
      ".text*",
    ];
    callObjcopy(env);
  });
}

async function getBinaryData(elf: ElfFile): Promise<Buffer> {
  return new Promise((resolve) => {
    const env: Env = {};
    env.preRun = [
      (m) => {
        m.FS.writeFile("file.elf", elf);
      },
    ];
    env.postRun = [
      async (m) => {
        const data = await m.FS.readFile("file.bin");
        resolve(data);
      },
    ];
    env.arguments = [
      "-O",
      "binary",
      "file.elf",
      "file.bin",
      "--only-section",
      ".data*",
    ];
    callObjcopy(env);
  });
}

function bufferToHex(buff: Buffer) {
  const dataview = new DataView(buff.buffer);
  let hexString = "";
  const hexOcts = (buff.byteLength / 4) >>> 0;
  for (let i = 0; i < hexOcts; i++) {
    const v = dataview.getInt32(i * 4, true) >>> 0;
    hexString += v.toString(16).padStart(8, "0") + "\n";
  }
  return hexString;
}

function _arrayBufferToBase64(buffer: Buffer) {
  var binary = "";
  var bytes = new Uint8Array(buffer);
  var len = bytes.byteLength;
  for (var i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function compile(code: string, ldscript: string) {
  const object = await assemble(code);
  const elf: ElfFile = await link(object, ldscript);
  const elf_str = await dump(elf);
  const full_hex = await dump_as_hex(elf);
  const bin = await getBinaryText(elf);
  const bindata = await getBinaryData(elf);

  return {
    elf,
    elf_str,
    bin: _arrayBufferToBase64(bin),
    hex: bufferToHex(bin),
    full_hex,
    bindata: bufferToHex(bindata),
  };
}
