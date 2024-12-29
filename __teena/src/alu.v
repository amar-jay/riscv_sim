module alu (
    input [63:0] X,
    input [63:0] Y,
    input [ 3:0] OP,

    output [63:0] OUTPUT,
    output isEqual
);
  reg [127:0] RESULT;

  wire signed [63:0] X_signed = X;
  wire signed [63:0] Y_signed = Y;

  assign isEqual = X == Y;

  always @(*) begin
    case (OP)
      0: RESULT = {64'b0, X} + {64'b0, Y};  // add
      1: RESULT = {64'b0, X} - {64'b0, Y};  // sub
      2: RESULT = {64'b0, X} & {64'b0, Y};  // and
      3: RESULT = {64'b0, X} | {64'b0, Y};  // or
      4: RESULT = {64'b0, X} ^ {64'b0, Y};  // xor
      5: RESULT = {64'b0, X} << Y[5:0];  // shift left logical
      6: RESULT = {64'b0, X} >> Y[5:0];  // shift right logical
      7: RESULT = $signed({64'b0, X_signed}) >>> Y[5:0];  // shift right arithmetic
      8: RESULT = {64'b0, X} * {64'b0, Y};  // mul
      9: RESULT = {64'b0, X} * {64'b0, Y};  // mulh
      10: RESULT = {64'b0, X} / {64'b0, Y};  // div
      11: RESULT = {64'b0, X} % {64'b0, Y};  // rem
      12: RESULT = {127'b0, (X_signed < Y_signed ? 1'b1 : 1'b0)};  // set less than (slt)
      13: RESULT = {127'b0, (X < Y ? 1'b1 : 1'b0)};  // set less than (sltu)
      default: RESULT = 128'b0;  // Default case to avoid latches
    endcase
  end

  assign OUTPUT = OP == 9 ? RESULT[127:64] : RESULT[63:0];

endmodule

