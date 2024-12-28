import ace from "ace-builds";

ace.define(
  "ace/mode/riscv_highlight_rules",
  [
    "require",
    "exports",
    "module",
    "ace/lib/oop",
    "ace/mode/text_highlight_rules",
  ],
  function (require, exports, module) {
    const oop = require("../lib/oop");
    const TextHighlightRules =
      require("./text_highlight_rules").TextHighlightRules;

    const RiscvHighlightRules = function () {
      this.$rules = {
        start: [
          {
            token: "keyword.control.assembly",
            regex:
              "\\b(?:add|addi|sub|lui|auipc|jal|jalr|beq|bne|blt|bge|bltu|bgeu|lb|lh|lw|lbu|lhu|sb|sh|sw|slli|srli|srai|sll|srl|sra|and|or|xor|andi|ori|xori|slti|sltiu|slt|sltu)\\b",
          },
          {
            token: "variable.parameter.register.assembly",
            regex:
              "\\b(?:x[0-9]|x[1-2][0-9]|x3[0-1]|zero|ra|sp|gp|tp|t[0-6]|s[0-9]|s1[0-1]|a[0-7])\\b",
          },
          {
            token: "constant.numeric.integer.hexadecimal.assembly",
            regex: "\\b0x[A-Fa-f0-9]+\\b",
          },
          {
            token: "constant.numeric.integer.decimal.assembly",
            regex: "\\b[0-9]+\\b",
          },
          {
            token: "punctuation.definition.comment.assembly",
            regex: "#.*$",
          },
          {
            token: "string.quoted.double.assembly",
            regex: '"',
            push: [
              {
                token: "string.quoted.double.assembly",
                regex: '"',
                next: "pop",
              },
              {
                defaultToken: "string.quoted.double.assembly",
              },
            ],
          },
        ],
      };
    };

    oop.inherits(RiscvHighlightRules, TextHighlightRules);

    exports.RiscvHighlightRules = RiscvHighlightRules;
  },
);

ace.define(
  "ace/mode/riscv",
  [
    "require",
    "exports",
    "module",
    "ace/lib/oop",
    "ace/mode/text",
    "ace/mode/riscv_highlight_rules",
  ],
  function (require, exports, module) {
    const oop = require("../lib/oop");
    const TextMode = require("./text").Mode;
    const RiscvHighlightRules =
      require("./riscv_highlight_rules").RiscvHighlightRules;

    const Mode = function () {
      this.HighlightRules = RiscvHighlightRules;
    };
    oop.inherits(Mode, TextMode);

    (function () {
      this.$id = "ace/mode/riscv";
    }).call(Mode.prototype);

    exports.Mode = Mode;
  },
);
