`define OP_R_TYPE 7'h33;
`define OP_R_TYPE_64 7'h3B;
`define OP_I_TYPE_LOAD 7'h03;
`define OP_I_TYPE_OTHER 7'h13;
`define OP_I_TYPE_64 7'h1B;
`define OP_I_TYPE_JUMP 7'h6F;
`define OP_S_TYPE 7'h23;
`define OP_B_TYPE 7'h63;
`define OP_U_TYPE_LOAD 7'h37;
`define OP_U_TYPE_JUMP 7'h67;
`define OP_U_TYPE_AUIPC 7'h17;
// -- PIPELINE HAZARD INSTRUCTION TYPE DEFINES:
`define TYPE_REGISTER 0;
`define TYPE_LOAD 1;
`define TYPE_STORE 2;
`define TYPE_IMMEDIATE 3;
`define TYPE_UPPERIMMEDIATE 4;
`define TYPE_BRANCH 5;
// -- PIPELINE STAGES
`define DECODE 0;
`define EXECUTE 1;
`define MEMORY 2;
`define WRITEBACK 3;


