
module cpu (
    input [63:0] RAM_READ_DATA,
    input [31:0] INSTRUCTION,
    input CLK,

    output     [ 9:0] RAM_ADDR,          // 10-bit Size RAM
    output reg [63:0] RAM_WRITE_DATA,
    output            RAM_WRITE_ENABLE,
    output     [ 9:0] INSTRUCTION_ADDR   // 10-bit Size ROM
);

  // WIRE DEFINITIONS:
  wire [6:0] OPCODE = INSTRUCTION_EXECUTE_3[6:0];
  wire [4:0] RD = INSTRUCTION_WRITEBACK_5[11:7];
  wire [2:0] FUNCT3 = INSTRUCTION_EXECUTE_3[14:12];
  wire [4:0] R1 = INSTRUCTION_EXECUTE_3[19:15];
  wire [4:0] R2 = INSTRUCTION_EXECUTE_3[24:20];
  wire [6:0] FUNCT7 = INSTRUCTION_EXECUTE_3[31:25];

  wire R_TYPE = OPCODE == OP_R_TYPE;
  wire R_TYPE_64 = OPCODE == OP_R_TYPE_64;
  wire I_TYPE_LOAD = OPCODE == OP_I_TYPE_LOAD;
  wire I_TYPE_OTHER = OPCODE == OP_I_TYPE_OTHER;
  wire I_TYPE_64 = OPCODE == OP_I_TYPE_64;
  wire I_TYPE_JUMP = OPCODE == OP_I_TYPE_JUMP;
  wire I_TYPE = I_TYPE_JUMP || I_TYPE_LOAD || I_TYPE_OTHER || I_TYPE_64;
  wire S_TYPE = OPCODE == OP_S_TYPE;
  wire B_TYPE = OPCODE == OP_B_TYPE;
  wire U_TYPE_LOAD = OPCODE == OP_U_TYPE_LOAD;
  wire U_TYPE_JUMP = OPCODE == OP_U_TYPE_JUMP;
  wire U_TYPE_AUIPC = OPCODE == OP_U_TYPE_AUIPC;
  wire U_TYPE = U_TYPE_JUMP || U_TYPE_LOAD || U_TYPE_AUIPC;


  // -- Register-Register Types (R-Type)
  // ---- RV32I:
  wire R_add = R_TYPE && FUNCT3 == 3'h0 && FUNCT7 == 7'h00;
  wire R_sub = R_TYPE && FUNCT3 == 3'h0 && FUNCT7 == 7'h20;
  wire R_sll = R_TYPE && FUNCT3 == 3'h1 && FUNCT7 == 7'h00;
  wire R_slt = R_TYPE && FUNCT3 == 3'h2 && FUNCT7 == 7'h00;
  wire R_sltu = R_TYPE && FUNCT3 == 3'h3 && FUNCT7 == 7'h00;
  wire R_xor = R_TYPE && FUNCT3 == 3'h4 && FUNCT7 == 7'h00;
  wire R_srl = R_TYPE && FUNCT3 == 3'h5 && FUNCT7 == 7'h00;
  wire R_sra = R_TYPE && FUNCT3 == 3'h5 && FUNCT7 == 7'h20;
  wire R_or = R_TYPE && FUNCT3 == 3'h6 && FUNCT7 == 7'h00;
  wire R_and = R_TYPE && FUNCT3 == 3'h7 && FUNCT7 == 7'h00;
  // ---- RV32M:
  wire R_mul = R_TYPE && FUNCT3 == 3'h0 && FUNCT7 == 7'h01;
  wire R_mulh = R_TYPE && FUNCT3 == 3'h1 && FUNCT7 == 7'h01;
  wire R_rem = R_TYPE && FUNCT3 == 3'h6 && FUNCT7 == 7'h01;
  wire R_div = R_TYPE && FUNCT3 == 3'h4 && FUNCT7 == 7'h01;
  // ---- RV64I:
  wire R_addw = R_TYPE_64 && FUNCT3 == 3'h0 && FUNCT7 == 7'h00;
  wire R_subw = R_TYPE_64 && FUNCT3 == 3'h0 && FUNCT7 == 7'h20;
  wire R_sllw = R_TYPE_64 && FUNCT3 == 3'h1 && FUNCT7 == 7'h00;
  wire R_srlw = R_TYPE_64 && FUNCT3 == 3'h5 && FUNCT7 == 7'h00;
  wire R_sraw = R_TYPE_64 && FUNCT3 == 3'h5 && FUNCT7 == 7'h20;
  // ---- RV64M:
  wire R_mulw = R_TYPE_64 && FUNCT3 == 3'h0 && FUNCT7 == 7'h01;
  wire R_divw = R_TYPE_64 && FUNCT3 == 3'h4 && FUNCT7 == 7'h01;
  wire R_remw = R_TYPE_64 && FUNCT3 == 3'h6 && FUNCT7 == 7'h01;


  // -- Immediate Types (I-Type)
  // ---- RV32I:
  wire I_addi = I_TYPE_OTHER && FUNCT3 == 3'h0;
  wire I_slli = I_TYPE_OTHER && FUNCT3 == 3'h1 && FUNCT7 == 7'h00;
  wire I_slti = I_TYPE_OTHER && FUNCT3 == 3'h2;
  wire I_sltiu = I_TYPE_OTHER && FUNCT3 == 3'h3;
  wire I_xori = I_TYPE_OTHER && FUNCT3 == 3'h4;
  wire I_srli = I_TYPE_OTHER && FUNCT3 == 3'h5 && FUNCT7 == 7'h00;
  wire I_srai = I_TYPE_OTHER && FUNCT3 == 3'h5 && FUNCT7 == 7'h10;
  wire I_ori = I_TYPE_OTHER && FUNCT3 == 3'h6;
  wire I_andi = I_TYPE_OTHER && FUNCT3 == 3'h7;
  // ---- RV64I:
  wire I_addiw = I_TYPE_64 && FUNCT3 == 3'h0;
  wire I_slliw = I_TYPE_64 && FUNCT3 == 3'h1 && FUNCT7 == 7'h00;
  wire I_srliw = I_TYPE_64 && FUNCT3 == 3'h5 && FUNCT7 == 7'h00;
  wire I_sraiw = I_TYPE_64 && FUNCT3 == 3'h5 && FUNCT7 == 7'h20;
  // ---- Load
  wire I_lb = INSTRUCTION_MEMORY_4[6:0] == OP_I_TYPE_LOAD && INSTRUCTION_MEMORY_4[14:12] == 3'h0;
  wire I_lh = INSTRUCTION_MEMORY_4[6:0] == OP_I_TYPE_LOAD && INSTRUCTION_MEMORY_4[14:12] == 3'h1;
  wire I_lw = INSTRUCTION_MEMORY_4[6:0] == OP_I_TYPE_LOAD && INSTRUCTION_MEMORY_4[14:12] == 3'h2;
  wire I_ld = INSTRUCTION_MEMORY_4[6:0] == OP_I_TYPE_LOAD && INSTRUCTION_MEMORY_4[14:12] == 3'h3;
  // ---- Jump
  wire I_jalr = I_TYPE_JUMP;


  // -- Upper Immediate Types (U-Type)
  wire U_lui = U_TYPE_LOAD;
  wire U_auipc = U_TYPE_AUIPC;
  wire U_jal = U_TYPE_JUMP;
  // -- Store Types (S-Type)
  wire S_sb = INSTRUCTION_MEMORY_4[6:0] == OP_S_TYPE && INSTRUCTION_MEMORY_4[14:12] == 3'h0;
  wire S_sh = INSTRUCTION_MEMORY_4[6:0] == OP_S_TYPE && INSTRUCTION_MEMORY_4[14:12] == 3'h1;
  wire S_sw = INSTRUCTION_MEMORY_4[6:0] == OP_S_TYPE && INSTRUCTION_MEMORY_4[14:12] == 3'h2;
  wire S_sd = INSTRUCTION_MEMORY_4[6:0] == OP_S_TYPE && INSTRUCTION_MEMORY_4[14:12] == 3'h3;


  // -- Branch Types (B-Type)
  wire B_beq = B_TYPE && FUNCT3 == 0;
  wire B_bne = B_TYPE && FUNCT3 == 1;
  wire B_blt = B_TYPE && FUNCT3 == 4;
  wire B_bge = B_TYPE && FUNCT3 == 5;
  wire B_bltu = B_TYPE && FUNCT3 == 6;
  wire B_bgeu = B_TYPE && FUNCT3 == 7;

  // -- PC Get Data From ALU Switch
  wire signed [63:0] R1_DATA =    DATA_DEPENDENCY_HAZARD_R1 ? ALU_OUT_MEMORY_4 :
                                    DATA_DEPENDENCY_HAZARD_R1_WRITEBACK ?
                                        (REG_WRITEBACK_SELECTION == 3 ? RAM_READ_DATA_WRITEBACK_5 : REG_WRITE_DATA_WRITEBACK_5)
                                        : R1_DATA_EXECUTE_3;
  wire signed [63:0] R2_DATA =    DATA_DEPENDENCY_HAZARD_R2 ? ALU_OUT_MEMORY_4 :
                                    DATA_DEPENDENCY_HAZARD_R2_WRITEBACK ?
                                        (REG_WRITEBACK_SELECTION == 3 ? RAM_READ_DATA_WRITEBACK_5 : REG_WRITE_DATA_WRITEBACK_5)
                                        : R2_DATA_EXECUTE_3;

  wire [63:0] R1_DATA_UNSIGNED = R1_DATA;
  wire [63:0] R2_DATA_UNSIGNED = R2_DATA;

  wire PC_ALU_SEL =   (B_beq && R1_DATA == R2_DATA)
                        || (B_bne && R1_DATA != R2_DATA)
                        || (B_blt && R1_DATA <  R2_DATA)
                        || (B_bge && R1_DATA >= R2_DATA)
                        || (B_bltu && R1_DATA_UNSIGNED <  R2_DATA_UNSIGNED)
                        || (B_bgeu && R1_DATA_UNSIGNED >= R2_DATA_UNSIGNED)
                        || I_jalr
                        || U_jal
                        ;

  // -- RAM Read & Write Enable Pins
  assign RAM_WRITE_ENABLE = INSTRUCTION_MEMORY_4[6:0] == OP_S_TYPE;
  assign RAM_ADDR         = ALU_OUT_MEMORY_4[9:0];


  // -- PIPELINING HAZARDS
  // ---- DATA HAZARD CONTROL REGISTERS
  reg [4:0] R1_PIPELINE[3:0];  // R1 Register of the current stage.
  reg [4:0] R2_PIPELINE[3:0];  // R2 Register of the current stage.
  reg [4:0] RD_PIPELINE[3:0];  // RD Register of the current stage.
  reg [2:0] TYPE_PIPELINE[3:0];      // Instruction Types of the current stage. [R-Type=0, Load=1, Store=2, Immediate or UpperImmediate=3, Branch=4]

  // If R1 depends on the previous RD (or R2 if STORE)
  wire DATA_DEPENDENCY_HAZARD_R1 =
                        R1_PIPELINE[EXECUTE] != 0
                    &&  TYPE_PIPELINE[EXECUTE] != TYPE_UPPERIMMEDIATE
                    &&  R1_PIPELINE[EXECUTE] == RD_PIPELINE[MEMORY];
  // If R2 depends on the previous RD (or R2 if STORE)
  wire DATA_DEPENDENCY_HAZARD_R2 =
                        R2_PIPELINE[EXECUTE] != 0
                    &&  TYPE_PIPELINE[EXECUTE] != TYPE_UPPERIMMEDIATE
                    &&  TYPE_PIPELINE[EXECUTE] != TYPE_IMMEDIATE
                    &&  R2_PIPELINE[EXECUTE] == RD_PIPELINE[MEMORY];

  // If R1 depends on the 5th stage RD
  wire DATA_DEPENDENCY_HAZARD_R1_WRITEBACK =
                        R1_PIPELINE[EXECUTE] != 0
                    &&  TYPE_PIPELINE[EXECUTE] != TYPE_UPPERIMMEDIATE
                    &&  R1_PIPELINE[EXECUTE] == RD_PIPELINE[WRITEBACK];
  // If R2 depends on the 5th stage RD
  wire DATA_DEPENDENCY_HAZARD_R2_WRITEBACK =
                        R2_PIPELINE[EXECUTE] != 0
                    &&  TYPE_PIPELINE[EXECUTE] != TYPE_UPPERIMMEDIATE
                    &&  TYPE_PIPELINE[EXECUTE] != TYPE_IMMEDIATE
                    &&  R2_PIPELINE[EXECUTE] == RD_PIPELINE[WRITEBACK];


  // If the next instruction depends on a Load instruction before, stall one clock.
  wire LOAD_STALL =
                        TYPE_PIPELINE[EXECUTE] == TYPE_LOAD
                    &&  (
                            (
                                TYPE_PIPELINE[DECODE] != TYPE_UPPERIMMEDIATE
                            &&  TYPE_PIPELINE[DECODE] != TYPE_IMMEDIATE
                            &&  (
                                    (R1_PIPELINE[DECODE] != 0 && R1_PIPELINE[DECODE] == RD_PIPELINE[EXECUTE])
                                ||  (R2_PIPELINE[DECODE] != 0 && R2_PIPELINE[DECODE] == RD_PIPELINE[EXECUTE])
                                )
                            )
                        ||  (
                                TYPE_PIPELINE[DECODE] == TYPE_IMMEDIATE
                            &&  R1_PIPELINE[DECODE] != 0
                            &&  R1_PIPELINE[DECODE] == RD_PIPELINE[EXECUTE]
                            )
                        );

  // If there is a branch instruction, stall for 2 clocks.
  wire CONTROL_HAZARD_STALL = INSTRUCTION_DECODE_2[6:0] == OP_B_TYPE || INSTRUCTION_EXECUTE_3[6:0] == OP_B_TYPE;





  // COMPONENT DEFINITIONS (IMMEDIATE EXTRACTOR, ALU, REGFILE):
  // -- Immediate Extractor
  wire [63:0] IMMEDIATE_VALUE;
  wire [2:0] IMMEDIATE_SELECTION;
  wire [7:0] immediateSelectionInputs;

  assign immediateSelectionInputs[0] = 0;
  assign immediateSelectionInputs[1] = I_TYPE;
  assign immediateSelectionInputs[2] = U_TYPE_LOAD || U_TYPE_AUIPC;
  assign immediateSelectionInputs[3] = S_TYPE;
  assign immediateSelectionInputs[4] = B_TYPE;
  assign immediateSelectionInputs[5] = U_TYPE_JUMP;
  assign immediateSelectionInputs[6] = 0;
  assign immediateSelectionInputs[7] = 0;
  _8_bit_encoder immediateSelectionEncoder (
      immediateSelectionInputs,
      IMMEDIATE_SELECTION
  );

  instruction_decoder immediateExtractor (
      INSTRUCTION_EXECUTE_3,
      IMMEDIATE_SELECTION,
      IMMEDIATE_VALUE
  );
endmodule
