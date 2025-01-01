CXX=g++
OPT=
CFLAG:=-g -Wall -O3 $(OPT)
LDFLAG=-s WASM=1 -s EXPORTED_RUNTIME_METHODS='["ccall", "cwrap", "allocate", "intArrayFromString", "ALLOC_NORMAL", "UTF8ToString", "setValue"]' -s ALLOW_MEMORY_GROWTH=1 -s MODULARIZE=1

SRC=$(wildcard *.cc)
HDR=$(wildcard *.h)
OBJ=$(SRC:.cc=.o)
EXE=../bin/alfa
OUT_JS=../bin/js/alfa.mjs

.PHONY: default clean

default: $(EXE)

wasm:
	em++ $(CFLAG) $(LDFLAG) -s 'EXPORT_NAME="main"' -s 'EXPORTED_FUNCTIONS=["_run_alfa_once", "_free",  "_malloc", "_get_exception_message"]' -s "ENVIRONMENT='web'" -o ${OUT_JS} ./*.cc

$(EXE): $(OBJ)
	$(CXX) $(CFLAG) -o $@ $(OBJ)

%.o: %.cc $(HDR)
	$(CXX) $(CFLAG) -o $@ -c $<

clean:
	rm -f $(OBJ) $(EXE)
	rm ./alfa_wasm.mjs
	rm ./alfa_wasm.wasm
