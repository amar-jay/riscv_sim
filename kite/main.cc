#include "proc.h"
#include <iostream>

using namespace std;

static string banner = "\
************************************************************\n\
* Kite: Architecture Simulator for RISC-V Instruction Set  *\n\
* A fork from William J. Song by Amar Jay                  *\n\
* Version: 1.0                                             *\n\
************************************************************\n\
";

int main(int argc, char **argv) {
  cout << banner << endl;

  if (argc != 3) {
    cerr << "Usage: " << argv[0] << " [program_code] [m/a]" << endl;
    exit(1);
  }
  cout << argv[1] << " " << argv[2] << endl;

  if (*argv[2] != 'm' && *argv[2] != 'a') {
    cerr << "Setting to default (Assembly): " << argv[0] << " a" << endl;
    argv[2][0] = 'a';
  }

  proc_t proc;                    // Kite processor
  proc.init(argv[1], argv[2][0]); // Processor initialization
  proc.run();                     // Processor runs.
  return 0;
}
