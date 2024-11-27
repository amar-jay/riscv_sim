#ifndef __KITE_INST_H__
#define __KITE_INST_H__

#include "defs.h"
#include <cstdint>
#include <iostream>

// Kite instruction
class inst_t {
public:
  inst_t();
  inst_t(const inst_t &m_inst);
  ~inst_t();

  int type;                         // inst_type 0-UNK 1-R 2-I 3-S 4-B 5-U 6-J
  uint64_t pc;                      // Program counter
  kite_opcode op;                   // Instruction operation
  int rd_num, rs1_num, rs2_num;     // Register operand indices
  int64_t rd_val, rs1_val, rs2_val; // Register operand values
  int64_t imm;                      // Immediate
  std::string label;                // Label
  uint64_t memory_addr;             // Data memory address
  unsigned alu_latency;             // ALU latency
  bool rd_ready;                    // Is the rd value ready?
  uint64_t branch_target;           // Actual branch target
  uint64_t pred_target;             // Predicted branch target
  bool branch_taken;                // Is a branch actually taken?
  bool pred_taken;                  // Is a branch predicted to be taken?
};

uint32_t decode_hex(const inst_t &inst);

// Convert Kite instruction to string format.
std::string get_inst_str(inst_t *inst, bool details = false);

#endif
