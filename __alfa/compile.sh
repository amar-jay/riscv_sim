#!/bin/bash

em++ -O3 -s WASM=1 -s EXPORTED_RUNTIME_METHODS='["cwrap", "allocate", "intArrayFromString", "ALLOC_NORMAL", "UTF8ToString", "setValue"]' -s ALLOW_MEMORY_GROWTH=1 -s MODULARIZE=1 -s 'EXPORT_NAME="alfa"' -s 'EXPORTED_FUNCTIONS=["_run_alfa_once", "_free",  "_malloc", "_get_exception_message"]' -s "ENVIRONMENT='web'" -o ./alfa_wasm.mjs src/*.cc

