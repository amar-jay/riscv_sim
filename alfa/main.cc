#include "proc.h"
#include <cstdio>
#include <fstream>
#include <iostream>
#include <regex>
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

void analyzeContent(const std::string &content, const std::string &codeType);
void analyzeFile(const std::string &filePath, const std::string &codeType);
void print_help(char *program_name) {
  cerr << "Usage: " << program_name << help_str << endl;
}

void analyzeFile(const std::string &filePath, const std::string &codeType) {
  std::ifstream file(filePath);
  if (!file.is_open()) {
    std::cerr << "Error: Could not open file: " << filePath << std::endl;
    return;
  }

  std::string content = std::string((std::istreambuf_iterator<char>(file)),
                                    std::istreambuf_iterator<char>());
  /*
  bool isAssembly = false;
  bool isMachineCode = false;

  std::regex assemblyPattern(
      "^[a-zA-Z]+\\s+.*$"); // Match assembly-like instructions
  std::regex machineCodePattern("^([0-9a-fA-F]{2}\\s?)+$"); // Match hex bytes

  while (std::getline(file, line)) {
    if (std::regex_match(line, assemblyPattern)) {
      isAssembly = true;
    } else if (std::regex_match(line, machineCodePattern)) {
      isMachineCode = true;
    }
  }
  */

  // file.close();

  return analyzeContent(content, codeType);
}

void analyzeContent(const std::string &content, const std::string &codeType) {
  // std::regex assemblyPattern("^[a-zA-Z]+\\s+.*$");
  // std::regex machineCodePattern("^([0-9a-fA-F]{2}\\s?)+$");

  // bool isAssembly = std::regex_match(content, assemblyPattern);
  // bool isMachineCode = std::regex_match(content, machineCodePattern);

  proc_t proc;                  // Kite processor
  if (codeType == "assembly") { //&& isAssembly) {
    std::cout << "The content contains assembly code." << std::endl;
  } else if (codeType == "machine") { //&& isMachineCode) {
    std::cout << "The content contains machine code (hex)." << std::endl;
  } else {
    std::cout << "The content does not match the specified code type."
              << std::endl;
  }

  proc.init(content.c_str(), codeType.c_str()); // Processor initialization
  proc.run();                                   // Processor runs.

  return;
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
    analyzeFile(inputValue, codeType);
  } else if (inputType == "--content") {
    analyzeContent(inputValue, codeType);
  }

  return 0;
  /*
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
  */
}
