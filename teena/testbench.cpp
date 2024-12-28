#include "Vsimple_module.h" // Generated header for Verilog module
#include <verilated.h>
#include <verilated_vcd_c.h>

int main(int argc, char **argv, char **env) {
  // Verilated::commandArgs(0, nullptr);

  Verilated::commandArgs(argc, argv);
  auto *top = new Vsimple_module;

  // Simulation inputs
  top->clk = 0;
  top->reset = 1;
  top->a = 0;
  top->b = 0;

  // Simple reset sequence
  for (int i = 0; i < 2; i++) {
    top->clk = !top->clk;
    top->eval();
  }
  top->reset = 0;

  // Provide inputs and simulate
  top->a = 10;
  top->b = 20;
  for (int i = 0; i < 10; i++) {
    top->clk = !top->clk;
    top->eval();
    printf("At time %d: a = %d, b = %d, sum = %d\n", i, top->a, top->b,
           top->sum);
  }

  delete top;
  return 0;
}
