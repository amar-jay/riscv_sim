#include "inst_memory.h"
#include "defs.h"
#include "inst.h"
#include <bitset>
#include <cstdint>
#include <cstdio>
#include <cstdlib>
#include <cstring>
#include <fstream>
#include <iostream>
#include <sstream>

using namespace std;

inst_memory_t::inst_memory_t(const char *m_program_code, const char *_mode) {
  memory.reserve(100); // Reserve space for instructions.
  mode = _mode;
  load_program_code(m_program_code); // Load a program code.
}

inst_memory_t::~inst_memory_t() {}

// Read an instruction from memory.
inst_t *inst_memory_t::read(uint64_t m_pc) {
  inst_t *inst = 0;
  // PC should be in units of 4 bytes.
  m_pc = m_pc >> 2;
  // PC = 0 is reserved as invalid.
  if (m_pc && (m_pc < memory.size())) {
    inst = new inst_t(memory[m_pc]);
  }
  return inst;
}

// Get the total number of instructions in memory.
size_t inst_memory_t::num_insts() const { return memory.size(); }

// Load a program code.
void inst_memory_t::load_program_code(const char *m_program_code) {
  std::istringstream file_stream(m_program_code);

  // Insert a nop instruction at PC = 0 to make it as invalid.
  memory.insert(memory.begin(), inst_t());

  // Read and parse a program code.
  string line;
  size_t line_num = 0;
  while (getline(file_stream, line)) {
    line_num++;
    // Erase leading spaces.
    line.erase(0, line.find_first_not_of(" \t"));
    // Crop everything after a comment symbol.
    if (line.find_first_of("#") != string::npos) {
      line.erase(line.find_first_of("#"));
    }
    // Skip blank lines.
    if (!line.size()) {
      continue;
    }

    // Parse an instruction string.
    transform(line.begin(), line.end(), line.begin(), ::tolower);
    if (strcmp(mode, "assembly") == 0) {
      parse_inst_str(line, line_num);
    } else if (strcmp(mode, "machine") == 0) {
      uint32_t raw_inst =
          std::stoul(line, nullptr, 16); // convert to 32 bit integer
      parse_inst_hex(raw_inst, line_num);
    }
  }

  // Revisit instructions, and replace labels with immediate values.
  for (size_t i = 0; i < memory.size(); i++) {
    inst_t &inst = memory[i];
    if ((get_op_type(inst.op) == op_sb_type) ||
        (get_op_type(inst.op) == op_uj_type)) {
      map<string, int64_t>::iterator it = labels.find(inst.label);
      if (it == labels.end()) {
        cerr << "Error: unknown label : " << get_inst_str(&inst) << endl;
        exit(1);
      }
      // PC-relative distance
      inst.imm = ((it->second) - int64_t(inst.pc)) >> 1;
      // Check if the PC-relative distance fits into the immediate field of
      // instruction.
      unsigned imm_width = (get_op_type(inst.op) == op_sb_type ? 12 : 20) - 1;
      if (inst.imm >= 0 ? inst.imm >> imm_width
                        : (inst.imm >> imm_width) != -1) {
        cerr << "Error: branch target is too far away for "
             << get_inst_str(&inst) << endl;
        exit(1);
      }
    }
  }

  // Labels are no longer needed.
  labels.clear();
}

// Parse an instruction string, and convert it to a Kite instruction.
void inst_memory_t::parse_inst_str(std::string m_inst_str, size_t m_line_num) {
  string inst_str = m_inst_str;

  // Parse an instruction string.
  vector<string> args;
  while (inst_str.size()) {
    // Get the next argument in the instruction string.
    size_t l = inst_str.find_first_of(" \t,():");
    // Append a colon symbol to the label.
    l += (inst_str[l] == ':' ? 1 : 0);
    args.push_back(inst_str.substr(0, l));

    // Trim the string.
    inst_str.erase(0, l);
    inst_str.erase(0, inst_str.find_first_not_of(" \t,()"));
  }

  // Check if args have a label.
  string lbl = args[0];
  if (lbl[lbl.size() - 1] == ':') {
    // Remove the label from args.
    args.erase(args.begin());
    // Record a pair of label and PC in the map.
    labels.insert(pair<string, int64_t>(lbl.substr(0, lbl.size() - 1),
                                        memory.size() << 2));
  }
  // Line has no instruction but only a label.
  if (!args.size()) {
    return;
  }

  inst_t inst;
  // Set the PC of instruction.
  inst.pc = memory.size() << 2;

  // Get the opcode of instruction.
  inst.op = get_opcode(args[0]);
  if (inst.op >= num_kite_opcodes) {
    cerr << "Error: unknown opcode " << args[0] << " at line #" << m_line_num
         << endl;
    exit(1);
  }

  // Set an ALU execution latency.
  inst.alu_latency = get_op_latency(inst.op);

  // Decode the instruction based on its type.
  switch (get_op_type(inst.op)) {
  case op_r_type: {
    // R-type format: op rd, rs1, rs2
    inst.type = 1;
    if (args.size() != 4) {
      cerr << "Error: incomplete instruction: " << m_inst_str << " at line #"
           << m_line_num << endl;
      exit(1);
    }
    if (!is_reg_str(args[1]) || !is_reg_str(args[2]) || !is_reg_str(args[3])) {
      cerr << "Error: invalid instruction format: " << m_inst_str
           << " at line #" << m_line_num << endl;
      exit(1);
    }
    inst.rd_num = get_regnum(args[1]);
    inst.rs1_num = get_regnum(args[2]);
    inst.rs2_num = get_regnum(args[3]);
    break;
  }
  case op_i_type: {
    inst.type = 2;
    if (args.size() != 4) {
      cerr << "Error: incomplete instruction: " << m_inst_str << " at line #"
           << m_line_num << endl;
      exit(1);
    }
    if ((inst.op == op_jalr) || (inst.op == op_ld)) {
      // jalr and ld format: op rd, imm(rs1)
      if (!is_reg_str(args[1]) || !is_num_str(args[2]) ||
          !is_reg_str(args[3])) {
        cerr << "Error: invalid instruction format: " << m_inst_str
             << " at line #" << m_line_num << endl;
        exit(1);
      }
      inst.rd_num = get_regnum(args[1]);
      inst.imm = get_imm(args[2]);
      inst.rs1_num = get_regnum(args[3]);
    } else {
      // I-type format: op rd, rs1, imm
      if (!is_reg_str(args[1]) || !is_reg_str(args[2]) ||
          !is_num_str(args[3])) {
        cerr << "Error: invalid instruction format: " << m_inst_str
             << " at line #" << m_line_num << endl;
        exit(1);
      }
      inst.rd_num = get_regnum(args[1]);
      inst.rs1_num = get_regnum(args[2]);
      inst.imm = get_imm(args[3]);
    }
    // Check if the immediate value fits into 12 bits.
    if (inst.imm >= 0 ? inst.imm >> 11 : (inst.imm >> 11) != -1) {
      cerr << "Error: invalid immediate value: " << m_inst_str << " at line #"
           << m_line_num << endl;
      exit(1);
    }
    break;
  }
  case op_s_type: {
    inst.type = 3;
    // S-type format: op rs2, imm(rs1)
    if (args.size() != 4) {
      cerr << "Error: incomplete instruction: " << m_inst_str << " at line #"
           << m_line_num << endl;
      exit(1);
    }
    if (!is_reg_str(args[1]) || !is_num_str(args[2]) || !is_reg_str(args[3])) {
      cerr << "Error: invalid instruction format: " << m_inst_str
           << " at line #" << m_line_num << endl;
      exit(1);
    }
    inst.rs2_num = get_regnum(args[1]);
    inst.imm = get_imm(args[2]);
    // Check if the immediate value fits into 12 bits.
    if (inst.imm >= 0 ? inst.imm >> 11 : (inst.imm >> 11) != -1) {
      cerr << "Error: invalid immediate value: " << m_inst_str << " at line #"
           << m_line_num << endl;
      exit(1);
    }
    inst.rs1_num = get_regnum(args[3]);
    break;
  }
  case op_sb_type: {
    inst.type = 4;
    // SB-type format: op rs1, rs2, label
    if (args.size() != 4) {
      cerr << "Error: incomplete instruction: " << m_inst_str << " at line #"
           << m_line_num << endl;
      exit(1);
    }
    if (!is_reg_str(args[1]) || !is_reg_str(args[2])) {
      cerr << "Error: invalid instruction format: " << m_inst_str
           << " at line #" << m_line_num << endl;
      exit(1);
    }
    inst.rs1_num = get_regnum(args[1]);
    inst.rs2_num = get_regnum(args[2]);
    inst.label = args[3];
    break;
  }
  case op_u_type: {
    inst.type = 5;
    // U-type format: op rd, imm
    if (args.size() != 3) {
      cerr << "Error: incomplete instruction: " << m_inst_str << " at line #"
           << m_line_num << endl;
      exit(1);
    }
    if (!is_reg_str(args[1]) || !is_num_str(args[2])) {
      cerr << "Error: invalid instruction format: " << m_inst_str
           << " at line #" << m_line_num << endl;
      exit(1);
    }
    inst.rd_num = get_regnum(args[1]);
    inst.imm = get_imm(args[2]);
    // Check if the immediate value fits into 20 bits.
    if (inst.imm >= 0 ? inst.imm >> 19 : (inst.imm >> 19) != -1) {
      cerr << "Error: invalid immediate value: " << m_inst_str << " at line #"
           << m_line_num << endl;
      exit(1);
    }
    break;
  }
  case op_uj_type: {
    inst.type = 6;
    // UL-type format: op rd, label
    if (args.size() != 3) {
      cerr << "Error: incomplete instruction: " << m_inst_str << " at line #"
           << m_line_num << endl;
      exit(1);
    }
    if (!is_reg_str(args[1])) {
      cerr << "Error: invalid instruction format: " << m_inst_str
           << " at line #" << m_line_num << endl;
      exit(1);
    }
    inst.rd_num = get_regnum(args[1]);
    inst.label = args[2];
    break;
  }
  default: {
    inst.type = 0;
    break;
  } // Nothing to do
  }

  // Store instruction in memory.
  memory.push_back(inst);
}

void inst_memory_t::parse_inst_hex(uint32_t inst_int, size_t m_line_num) {
  inst_t inst;

  // Convert hex string to uint32_t (assuming 32-bit instructions)
  // uint32_t inst_hex = std::stoul(m_inst_hex, nullptr, 16);
  int64_t rd_num, rs1_num, rs2_num; // Register operand values

  // Extract opcode (last 7 bits)
  // Extract fields
  uint32_t opcode = inst_int & 0x7F;         // bits 0-6
  uint32_t rd = (inst_int >> 7) & 0x1F;      // bits 7-11
  uint32_t funct3 = (inst_int >> 12) & 0x07; // bits 12-14
  uint32_t rs1 = (inst_int >> 15) & 0x1F;    // bits 15-19
  uint32_t rs2 = (inst_int >> 20) & 0x1F;    // bits 20-24
  uint32_t funct7 = (inst_int >> 25) & 0x7F; // bits 25-31
  int32_t imm = 0;                           // Immediate value (sign-extended)

  switch (opcode) {
  case 0x00: // NOP instructions
    cout << "Does nothing";
    inst.op = op_nop;
    break;

  case 0x33: { // R-type instructions
    switch (funct3) {
    case 0x00:
      if (funct7 == 0x20)
        inst.op = op_sub;
      else if (funct7 == 0x00)
        inst.op = op_add;
      else
        throw std::invalid_argument("Invalid R-type instruction");
      break;
    case 0x01:
      inst.op = op_sll;
      break;
    /*case 0x02:
      inst.op = op_slt;
      break; // Note: Not listed in your enum but common in RISC-V.
    case 0x03:
      inst.op = op_sltu;
      break; // Note: Not listed in your enum but common in RISC-V.
    */
    case 0x04:
      inst.op = op_xor;
      break;
    case 0x05:
      if (funct7 == 0x20)
        inst.op = op_sra;
      else if (funct7 == 0x00)
        inst.op = op_srl;
      else
        throw std::invalid_argument("Invalid R-type instruction");
      break;
    case 0x06:
      inst.op = op_or;
      break;
    case 0x07:
      if (funct7 == 0x20)
        throw std::invalid_argument("Invalid R-type instruction");
      else if (funct7 == 0x00)
        inst.op = op_and;
      // throw std::invalid_argument("Invalid R-type instruction");
      break; // Not used.
    default:
      throw std::invalid_argument("Invalid funct3 for R-type");
    }
    inst.type = op_r_type;
    break;
  }

  case 0x13: { // I-type instructions
    switch (funct3) {
    case 0x00:
      inst.op = op_addi;
      break;
    case 0x01:
      inst.op = op_slli;
      break;
    case 0x02:
      if (funct7 == 0x20)
        throw std::invalid_argument("Invalid I-type instruction");
      else if (funct7 == 0x00)
        throw std::invalid_argument("Invalid I-type instruction");
      break; // Not used.
    case 0x03:
      if (funct7 == 0x20)
        throw std::invalid_argument("Invalid I-type instruction");
      else if (funct7 == 0x00)
        throw std::invalid_argument("Invalid I-type instruction");
      break; // Not used.
    case 0x04:
      inst.op = op_xori;
      break;
    case 0x05:
      if (funct7 == 0x20)
        inst.op = op_srai;
      else if (funct7 == 0x00)
        inst.op = op_srli;
      break; // Not used.
    case 0x06:
      inst.op = op_ori;
      break;
    case 0x07:
      inst.op = op_addi;
      break;
    default:
      throw std::invalid_argument("Invalid funct3 for I-type");
    }
    inst.type = op_i_type;
    break;
  }

  case 0x17: { // U-type instructions (LUI)
    inst.op = op_lui;
    inst.type = op_u_type;
    break;
  }

  case 0x6F:
  case 0x67:
  case 0x37: { // UJ-type instructions (JAL)
    inst.op = op_jal;
    inst.type = op_uj_type;
    break;
  }

  case 0x63:
  case 0x3B: { // SB-type instructions (Branches)
    switch (funct3) {
    case 0x00:
      inst.op = op_beq;
      break;
    case 0x01:
      inst.op = op_bne;
      break;
    case 0x04:
      inst.op = op_blt;
      break;
    case 0x05:
      inst.op = op_bge;
      break;
    default:
      throw std::invalid_argument("Invalid funct3 for SB-type");
    }
    inst.type = op_sb_type;
    break;
  }

  default:
    std::bitset<8> binaryOpcode(opcode); // 32-bit representation of the opcode
    std::string message = "Unknown opcode: " + std::to_string(opcode) + " -> " +
                          binaryOpcode.to_string();
    throw std::invalid_argument(message);
  }

  // Extract register fields and immediate values based on instruction type
  switch (inst.type) {
  case op_r_type:
    rd_num = (inst_int >> 7) & 0x1F;
    rs1_num = (inst_int >> 15) & 0x1F;
    rs2_num = (inst_int >> 20) & 0x1F;
    imm = 0; // No immediate value for R-type instructions.
    break;

  case op_i_type:
    rd_num = (inst_int >> 7) & 0x1F;
    rs1_num = (inst_int >> 15) & 0x1F;

    // Extract immediate value from I-type format.
    imm = ((inst_int >> 20) & 0xFFF);
    if ((imm & 0x800)) {
      imm |= ~((uint32_t)-1 >> (32 - 12)); // Sign extend.
    }

    rs2_num = -1; // No rs2 register for I-type.
    break;

  case op_u_type:
    rd_num = (inst_int >> 12) & 0x1F;

    // Extract immediate value from U-type format.
    imm = ((inst_int >> 12));

    rs1_num = -1;
    rs2_num = -1;

    break;

  case op_uj_type: {
    rd_num = (inst_int >> 7) & 0x1F;

    // Extract immediate value from UJ-type format.
    int j_imm_20_1 = ((inst_int >> 21));
    int j_imm_10_8 = ((inst_int >> 25));
    int j_imm_11 = ((inst_int >> 8));
    int j_imm_19_12 = ((inst_int >> 9));

    imm = ((j_imm_20_1 << 20) | (j_imm_10_8 << 10) | (j_imm_11 << 11) |
           (j_imm_19_12 << 12));

    if ((imm & (1 << (20)))) {
      imm |= ~((uint32_t)-1 >> (32 - (20))); // Sign extend.
    }

    rs1_num = -1;
    rs2_num = -1;

    break;
  }
  case op_sb_type: {
    rs1_num = (inst_int >> 15) & 31;
    rs2_num = (inst_int >> 20) & 31;

    int sb_imm_4_1 = ((inst_int >> 8));
    int sb_imm_10_5 = ((inst_int >> 25));
    int sb_imm_11 = ((inst_int >> 7));
    int sb_imm_12 = ((inst_int >> 31));

    imm = ((sb_imm_12 << 12) | (sb_imm_10_5 << 5) | (sb_imm_11 << 1) |
           (sb_imm_4_1));

    if ((imm & (1 << 11))) {
      imm |= (~((uint32_t)-1 >> (32 - (11)))); // Sign extend.
    }

    rd_num = -1;

    break;
  }
  default:
    throw std::invalid_argument("Unknown instruction type, line #" +
                                std::to_string(m_line_num));
  }

  inst.imm = imm;
  inst.rs1_num = rs1_num;
  inst.rs1_val = rs1;
  inst.rs2_num = rs2_num;
  inst.rs2_val = rs2;
  inst.rd_num = rd_num;
  inst.rd_val = rd;

  cout << "opcode: " << std::bitset<8>(opcode) << " | ";
  cout << "funt3: " << std::hex << funct3 << "| funt7: " << std::hex << funct7
       << std::dec << "| rd: " << rd << "| rs1: " << rs1 << "| rs2: " << rs2
       << "| imm: " << imm << "\t line no: " << m_line_num << endl;

  // Set the program counter and memory address
  inst.pc = m_line_num * 4; // Assuming 4 bytes per instruction
  inst.memory_addr = inst.pc;

  // Push the decoded instruction to memory
  memory.push_back(inst);
  return;
}
