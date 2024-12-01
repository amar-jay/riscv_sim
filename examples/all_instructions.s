    # Integer Computational Instructions
    
start:
    # ADD - Addition
    add x1, x2, x3           # x1 = x2 + x3
    addi x4, x5, 100          # x4 = x5 + 100 (immediate addition)

    # SUB - Subtraction
    sub x6, x7, x8            # x6 = x7 - x8

    # Logical Instructions
    and x9, x10, x11          # Bitwise AND
    andi x12, x13, 10         # Bitwise AND with immediate

    or x14, x15, x16          # Bitwise OR
    ori x17, x18, 5           # Bitwise OR with immediate

    xor x19, x20, x21         # Bitwise XOR
    xori x22, x23, 12         # Bitwise XOR with immediate

    # Shift Instructions
    sll x24, x25, x26         # Logical Left Shift
    slli x27, x28, 3          # Logical Left Shift with immediate

    srl x29, x30, x31         # Logical Right Shift
    srli x1, x2, 4            # Logical Right Shift with immediate

    sra x3, x4, x5            # Arithmetic Right Shift
    srai x6, x7, 2            # Arithmetic Right Shift with immediate

    # Comparison Instructions
    #slt x8, x9, x10           # Set Less Than (signed)
    #slti x11, x12, 50         # Set Less Than Immediate (signed)

    #sltu x13, x14, x15        # Set Less Than (unsigned)
    #sltiu x16, x17, 100       # Set Less Than Immediate (unsigned)

    # Memory Instructions
    #lb x18, 0(x19)            # Load Byte (signed)
    #lh x20, 4(x21)            # Load Halfword (signed)
    #lw x22, 8(x23)            # Load Word
    #lbu x24, 12(x25)          # Load Byte Unsigned
    #lhu x26, 16(x27)          # Load Halfword Unsigned

    #sb x28, 20(x29)           # Store Byte
    #sh x30, 24(x31)           # Store Halfword
    #sw x1, 28(x2)             # Store Word

    addi x24, x0, 5
    sd   x10, 1000(x0)
    sd   x19, 1008(x0)
    add x10, x0, x0

    beq x0, x0, lo
    ld   x10, 1016(x0) # why not working
    # Branch Instructions
    beq x3, x4, branch_equal  # Branch if Equal
    bne x5, x6, branch_not_equal  # Branch if Not Equal
    blt x7, x8, branch_less_than  # Branch if Less Than (signed)
    bge x9, x10, branch_greater_equal  # Branch if Greater or Equal (signed)
    #bltu x11, x12, branch_less_unsigned  # Branch if Less Than (unsigned)
    #bgeu x13, x14, branch_greater_unsigned  # Branch if Greater or Equal (unsigned)

loop:   beq  x24, x0,  exit
        addi x5, x5, 1
        remu x17,  x2, x10
        add  x25, x24, x0
        add  x24, x17,  x0
        beq  x0,  x0,  loop
lo:
    add x10, x10, x24
    addi x24, x24, -1
    beq  x24, x0,  exit # if x24 < x0
    bne  x24,  x0,  lo


exit:   sd   x2, 1024(x0)
branch_equal:
    nop  # Placeholder for branch targets
    addi x12, x12, 1
branch_not_equal:
    nop  # Placeholder for branch targets
    addi x12, x12, 1
branch_less_than:
    nop  # Placeholder for branch targets
    addi x12, x12, 1
branch_greater_equal:
    nop  # Placeholder for branch targets
    addi x12, x12, 1
branch_less_unsigned:
    nop  # Placeholder for branch targets
    addi x12, x12, 1
branch_greater_unsigned:
    nop  # Placeholder for branch targets
    addi x12, x12, 1
    # Jump and Link Instructions
    jal x15, jump_link        # Jump and Link (stores return address)
    jalr x16, 8(x17)
    #jalr x16, x17, 8          # Jump and Link Register
    
jump_link:
    jalr x0, 0(x1) #(ret)
    #ret  # Return from subroutine (jalr x0, x1, 0)
    
    # Environment and System Instructions
    #ecall                     # Environment Call (system call)
    #ebreak                    # Environment Breakpoint

# Note: This code demonstrates instruction usage but does not represent a functional program.
# It serves as a comprehensive showcase of RISC-V instructions across base and extension sets.
