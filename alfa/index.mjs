import alfa from "./alfa_wasm";
import alfaModule from "./alfa_wasm.wasm?url";

export const AlfaWasmPromise = alfa({
  locateFile(path) {
    console.log(path);
    if (path.endsWith(`.wasm`)) {
      return alfaModule;
    }
    console.log("returning path only");
    return path;
  },
});
/*
 *
export const AlfaWasmPromise = (async () => {
  const instance = await alfaModule();
  console.log("webassemply instance", instance);
  return instance;
})();

export const AlfaWasmPromise = alfa({
  locateFile(path) {
    if (path.endsWith(`.wasm`)) {
      return alfaModule;
    }
    return path;
  },
});
*/
