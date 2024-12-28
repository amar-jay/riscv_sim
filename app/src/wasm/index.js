import alfa from "./alfa_wasm";
import alfaModule from "./alfa_wasm.wasm?url";
// Since webpack will change the name and potentially the path of the
// `.wasm` file, we have to provide a `locateFile()` hook to redirect
// to the appropriate URL.
// More details: https://kripken.github.io/emscripten-site/docs/api_reference/module.html

export const AlfaWasmPromise = alfa({
  locateFile(path) {
    console.log(path)
    if (path.endsWith(`.wasm`)) {
      return alfaModule;
    }
    console.log("returning path only")
    return path;
  },
});

/*
 *
export const AlfaWasmPromise = async () => {
  const instance = await alfaModule();
  console.log("webassemply instance", instance);
  return instance;
};

*/
