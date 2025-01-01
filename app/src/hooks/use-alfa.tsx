import { useState, useCallback, useEffect, useRef } from "react";
import { AlfaWasmPromise, AlfaWasm } from "@riscv_sim/kite";
interface AlfaProps {
  codeState: string;
  memoryState: string;
  registerState: string;
  setExecOutput: (s: string) => void;
}

export enum WasmRequestStatus {
  ERROR = "error",
  SUCCESS = "success",
  LOADING = "loading",
}
export function useAlfa({
  codeState,
  registerState,
  memoryState,
  setExecOutput,
}: AlfaProps) {
  const [wasmRequestStatus, setWasmRequestStatus] = useState(
    WasmRequestStatus.LOADING,
  );
  const alfaInstance = useRef<AlfaWasm>();

  useEffect(() => {
    async function loadAlfaWasm() {
      try {
        const wasm = await AlfaWasmPromise;

        if (wasm) {
          alfaInstance.current = wasm;
          setWasmRequestStatus(WasmRequestStatus.SUCCESS);
        }
      } catch (error) {
        console.error(error);
        setWasmRequestStatus(WasmRequestStatus.ERROR);
      }
    }

    loadAlfaWasm();
  }, [alfaInstance]);
  const onRunKiteWasm = useCallback(() => {
    if (!alfaInstance.current) return;
    if (alfaInstance.current instanceof Error) return;

    const {
      _run_alfa_once,
      allocate,
      ALLOC_NORMAL,
      intArrayFromString,
      _free,
      UTF8ToString,
      _get_exception_message,
      //_malloc,
      //setValue,
    } = alfaInstance.current;

    const codeCharPtr = allocate(
      intArrayFromString(codeState),
      `i8`,
      ALLOC_NORMAL,
    );
    const memoryCharPtr = allocate(
      intArrayFromString(memoryState),
      `i8`,
      ALLOC_NORMAL,
    );
    const registerCharPtr = allocate(
      intArrayFromString(registerState),
      `i8`,
      ALLOC_NORMAL,
    );

    const assemblyCharPtr = allocate(
      intArrayFromString("assembly"),
      `i8`,
      ALLOC_NORMAL,
    );

    const latestRunTime = `Latest execution time: ${new Date().toLocaleString()}`;
    let executionOutputCharPtr: ReturnType<typeof _run_alfa_once> | null = null;
    let errorPtr: number | null = null;
    try {
      executionOutputCharPtr = _run_alfa_once(
        codeCharPtr,
        memoryCharPtr,
        registerCharPtr,
        assemblyCharPtr,
      );

      const executionOutputInJSString = UTF8ToString(executionOutputCharPtr);
      setExecOutput(`${latestRunTime}\n${executionOutputInJSString}`);
    } catch (e) {
      errorPtr = e as number;
      console.error(e);
      executionOutputCharPtr = _get_exception_message(errorPtr);
      setExecOutput(
        `ERROR: ${latestRunTime}\n${UTF8ToString(executionOutputCharPtr)}`,
      );
    } finally {
      [codeCharPtr, memoryCharPtr, registerCharPtr, assemblyCharPtr].forEach(
        _free,
      );
      [executionOutputCharPtr, errorPtr].forEach((ptr) => {
        if (ptr) _free(ptr);
      });
    }
  }, [codeState, registerState, memoryState, alfaInstance, setExecOutput]);

  useEffect(() => {
    function runKiteWasmOnCtrlAltRPress(e: KeyboardEvent) {
      if (e.code !== `KeyR` || !e.altKey || !e.ctrlKey) return;
      onRunKiteWasm();
    }
    document.addEventListener(`keypress`, runKiteWasmOnCtrlAltRPress);

    return () =>
      document.removeEventListener(`keypress`, runKiteWasmOnCtrlAltRPress);
  }, [onRunKiteWasm]);

  return {
    onRunKiteWasm,
    wasmRequestStatus,
  };
}
