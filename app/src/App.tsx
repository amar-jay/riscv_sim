import { useRef, useEffect, useState } from "react";
import { AlfaWasmPromise, AlfaWasm } from "@riscv_sim/alfa";
//import RISCVCodeEditor from "@/components/ui/codeeditor";
import { Button } from "@/components/ui/button";
import "./App.css";
import { useAlfa } from "./hooks/use-alfa";
import { codeSample, memorySample, registerSample } from "./lib/sample";

enum WasmRequestStatus {
  ERROR = "error",
  SUCCESS = "success",
  LOADING = "loading",
}
function App() {
  const [code, setCode] = useState(codeSample);
  const [register, setRegiter] = useState(registerSample);
  const [memory, setMemory] = useState(memorySample);
  const [execOutput, setExecOutput] = useState("");
  const wasmInstance = useRef<AlfaWasm>();
  const [wasmRequestStatus, setWasmRequestStatus] = useState(
    WasmRequestStatus.LOADING,
  );
  useEffect(() => {
    async function loadAlfaWasm() {
      try {
        const wasm = await AlfaWasmPromise;

        if (wasm) {
          wasmInstance.current = wasm;
          setWasmRequestStatus(WasmRequestStatus.SUCCESS);
        }
      } catch (error) {
        console.error(error);
        setWasmRequestStatus(WasmRequestStatus.ERROR);
      }
    }

    loadAlfaWasm();
  }, []);

  const { onRunKiteWasm } = useAlfa({
    codeState: code,
    registerState: register,
    memoryState: register,
    alfaInstance: wasmInstance,
    setExecOutput,
    RVSettings: {
      is_debug_on: true,
      is_data_fwd_on: false,
      is_br_pred_on: false,
    },
  });

  /*
  const handleRunAlfa = () => {
    if (wasmInstance) {
      // Prepare arguments for _run_alfa_once
      const programCode: Pointer = {}; // Replace with actual pointer
      const memoryState: Pointer = {}; // Replace with actual pointer
      const regState: Pointer = {}; // Replace with actual pointer
      const isDebugOn: Pointer = {}; // Replace with actual pointer
      const isDataFwdOn: Pointer = {}; // Replace with actual pointer
      const isBrPredOn: Pointer = {}; // Replace with actual pointer

      const result = wasmInstance?.current?._run_alfa_once(
        programCode,
        memoryState,
        regState,
        isDebugOn,
        isDataFwdOn,
        isBrPredOn,
      );
      console.log("Result from _run_alfa_once:", result);
    }
  };

  */
  //return <RISCVCodeEditor />;
  //return <p>Hello</p>;
  // {WasmRequestStatus != WasmRequestStatus.LOADING && <RISCVCodeEditor />}
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
}

export default App;
