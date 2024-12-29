OUTPUT=./output

# Create output directory if it doesn't exist
create_output_dir:
	mkdir -p vcd
	mkdir -p ${OUTPUT}

# Run all tests for individual modules
test_all: create_output_dir
	cd testbench
	@echo "== Encoders ========================"
	iverilog -g2005-sv -I src/ -o ${OUTPUT}/tb_encoders ./testbench/tb_Encoders.v && vvp ${OUTPUT}/tb_encoders
	@echo "== ALU ============================"
	iverilog -g2005-sv -I src/ -o ${OUTPUT}/tb_alu ./testbench/tb_ALU.v && vvp ${OUTPUT}/tb_alu
	@echo "== RegFile ========================="
	iverilog -g2005-sv -I src/ -o ${OUTPUT}/tb_regfile ./testbench/tb_RegFile.v && vvp ${OUTPUT}/tb_regfile
	@echo "== Instruction Decoder ============="
	iverilog -g2005-sv -I src/ -o ${OUTPUT}/tb_immediateextractor ./testbench/tb_ImmediateExtractor.v && vvp ${OUTPUT}/tb_immediateextractor
	@echo "== RAM ============================"
	iverilog -g2005-sv -I src/ -o ${OUTPUT}/tb_ram ./testbench/tb_RAM.v && vvp ${OUTPUT}/tb_ram
	@echo "== ROM ============================"
	iverilog -g2005-sv -I src/ -o ${OUTPUT}/tb_rom ./testbench/tb_ROM.v && vvp ${OUTPUT}/tb_rom
	@echo "========================================"
	@echo "Test finished." || @echo "ERROR: One of the modules failed to compile!"

# Run the main test
test_main: create_output_dir
	@echo "== Main Test ============="
	iverilog -g2005-sv -I src/ -o ${OUTPUT}/tb_main ./testbench/tb_Main.v && vvp ${OUTPUT}/tb_main
	@echo "DONE!" || @echo "An error occurred!"

test: test_all test_main

clean: 
	rm vcd -rf
	rm ${OUTPUT} -rf

wave:
	 gtkwave vcd/*.vcd gtkwave/*.gtkw
