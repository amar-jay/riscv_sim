run:
	verilator --cc simple_module.v --exe main.cpp --trace
	make -C obj_dir -f Vsimple_module.mk Vsimple_module
	mv obj_dir/Vsimple_module Vsimple_module
