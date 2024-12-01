CXX=g++
OPT=
CFLAG:=-g -Wall -O3 $(OPT)
LDFLAG=-s WASM=1 -s EXPORTED_RUNTIME_METHODS='["cwrap"]' -s ALLOW_MEMORY_GROWTH=1 -s MODULARIZE=1

SRC=$(wildcard *.cc)
HDR=$(wildcard *.h)
OBJ=$(SRC:.cc=.o)
EXE=../bin/alfa
OUT_JS=../bin/js/alfa.js

.PHONY: default clean

default: $(EXE)

wasm:
	em++ $(CFLAG) $(LDFLAG) -s 'EXPORT_NAME="main"' -s 'EXPORTED_FUNCTIONS=["_main"]' -s "ENVIRONMENT='web'" -o ${OUT_JS} ./*.cc

$(EXE): $(OBJ)
	$(CXX) $(CFLAG) -o $@ $(OBJ)

%.o: %.cc $(HDR)
	$(CXX) $(CFLAG) -o $@ -c $<

clean:
	rm -f $(OBJ) $(EXE)
