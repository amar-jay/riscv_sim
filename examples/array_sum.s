addi x1, x0, 10      # x1 = 10 (loop limit)
addi x2, x0, 0       # x2 = 0 (loop counter)
addi x3, x0, 100     # x3 = 100 (accumulator)
addi x5, x2, 100     # x3 = 100 (accumulator)
addi x4, x0, 40        # x4 = address of array
sub x8, x0, x1 # not x8, x1
and x2, x3, x5
addi x9, x0, -100
#lb x2, x0, -100
#ori x8, x7, 0x100
