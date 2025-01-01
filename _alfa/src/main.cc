#include "proc.h"
#include <cstdio>
#include <cstring>
#include <fstream>
#include <iostream>
#include <string>

using namespace std;

static string banner = "\
************************************************************\n\
* Kite: Architecture Simulator for RISC-V Instruction Set  *\n\
* A fork from William J. Song by Amar Jay                  *\n\
* Version: 1.0                                             *\n\
************************************************************\n\
";

static string help_str = "\
[--file <path>] [--content <code>] [--type <type>]\n\
Options:\n\
\n\
\t--file <path>       Analyze the file content to determine if it is assembly or machine code.\n\
\t--content <code>    Analyze the provided code string.\n\
\t--type <type>       Specify the type explicitly (assembly or machine).\n\
\t--help              Show this help message.\n\
  ";

void print_help(char *program_name) {
  cerr << "Usage: " << program_name << help_str << endl;
}

void analyzeContent(const char *m_program_code, const char *m_program_mem,
                    const char *m_program_reg, const char *codeType) {

  proc_t proc;                                  // Kite processor
  if (std::strcmp(codeType, "assembly") == 0) { //&& isAssembly) {
    std::cout << "The content contains assembly code." << std::endl;
  } else if (std::strcmp(codeType, "machine") == 0) { //&& isMachineCode) {
    std::cout << "The content contains machine code (hex)." << std::endl;
  } else {
    std::cout << "The content does not match the specified code type."
              << std::endl;
  }

  std::cout << m_program_code << std::endl;
  std::cout << m_program_mem << std::endl;
  std::cout << m_program_reg << std::endl;

  proc.init(m_program_code, m_program_mem, m_program_reg,
            codeType); // Processor initialization
  proc.run();          // Processor runs.

  return;
}
void parse_file(const char *mem_path, const char *code_path,
                const char *reg_path, const char *codeType) {
  std::ifstream code_file(code_path);
  if (!code_file.is_open()) {
    std::cerr << "Error: Could not open file: " << code_path << std::endl;
    return;
  }

  std::string program_code =
      std::string((std::istreambuf_iterator<char>(code_file)),
                  std::istreambuf_iterator<char>());
  ///////
  std::ifstream mem_file(mem_path);
  if (!mem_file.is_open()) {
    std::cerr << "Error: Could not open file: " << mem_path << std::endl;
    return;
  }

  std::string program_mem =
      std::string((std::istreambuf_iterator<char>(mem_file)),
                  std::istreambuf_iterator<char>());

  std::ifstream reg_file(reg_path);
  if (!mem_file.is_open()) {
    std::cerr << "Error: Could not open file: " << mem_path << std::endl;
    return;
  }

  std::string program_reg =
      std::string((std::istreambuf_iterator<char>(reg_file)),
                  std::istreambuf_iterator<char>());
  return analyzeContent(program_code.c_str(), program_mem.c_str(),
                        program_reg.c_str(), codeType);
}

extern "C" {
inline const char *cstr(const std::string &message) {
  auto buffer = (char *)malloc(message.length() + 1);
  buffer[message.length()] = '\0';
  memcpy(buffer, message.data(), message.length());
  return buffer;
}
const char *get_exception_message(int exception_ptr) {
  return cstr(
      std::string(reinterpret_cast<std::exception *>(exception_ptr)->what()));
}
const char *run_alfa_once(const char *program_code, const char *memory_state,
                          const char *reg_state, const char *code_type) {
  analyzeContent(program_code, memory_state, reg_state, code_type);
  return "DONE";
}
}

int main(int argc, char **argv) {
  // cout << banner << endl;
  // flags:
  // --type hex/assembly
  // --path
  // --stirng
  if (argc < 5) {
    cerr << argc << endl;
    print_help(argv[0]);
    return 1;
  }

  std::string codeType, inputType, inputValue;

  for (int i = 1; i < argc; ++i) {
    std::string arg = argv[i];
    if (arg == "--type" && i + 1 < argc) {
      codeType = argv[++i];
    } else if ((arg == "--file" || arg == "--content") && i + 1 < argc) {
      inputType = arg;
      inputValue = argv[++i];
    }
  }

  if (codeType.empty() || (inputType != "--file" && inputType != "--content") ||
      inputValue.empty()) {
    std::cerr << "Invalid arguments. Please check the usage." << std::endl;
    return 1;
  }

  if (inputType == "--file") {
    parse_file("mem_state", inputValue.c_str(), "reg_state", codeType.c_str());
  } else {
    std::cerr << "error wrong flag must be --file";
  }

  return 0;
}
