#ifndef __KITE_REG_FILE_H__
#define __KITE_REG_FILE_H__

#include "inst.h"
#include <cstdint>

// Register file
class reg_file_t {
public:
  reg_file_t(const char *m_reg_state);
  ~reg_file_t();

  void write(inst_t *m_inst, unsigned m_regnum,
             int64_t m_value);    // Write register file.
  bool dep_check(inst_t *m_inst); // Data dependency check
  void flush();                   // Clear the dependency check state.
  void load_reg_state(const char *m_reg_state); // initial register file state.
  void print_state() const;                     // Print register state.

private:
  int64_t regs[num_kite_regs]; // Array of registers
  inst_t *dep[num_kite_regs];  // Dependency check table
};

#endif
