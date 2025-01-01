import { readdir, readFile, writeFile } from "fs/promises";
import { join } from "path";

// Recursive generator function to read all files in a directory and its subdirectories
export async function* readAllFiles(dir) {
  const files = await readdir(dir, { withFileTypes: true });
  for (const file of files) {
    if (file.isDirectory()) {
      yield* readAllFiles(join(dir, file.name));
    } else if (file.isFile() && file.name.endsWith(".s")) {
      yield join(dir, file.name);
    }
  }
}

// Main function to generate the JSON file
async function main() {
  const directory = "../examples"; // Directory containing .s files
  const files = readAllFiles(directory);

  const parsedFiles = [];
  for await (const file of files) {
    const content = await readFile(file, "utf-8");
    parsedFiles.push({
      file: file.slice(directory.length + 1),
      content: content,
    });
  }

  const jsonData = JSON.stringify(parsedFiles, null, 2);
  await writeFile("src/assets/code.json", jsonData);
  console.log("JSON file generated successfully.");
}

main().catch(console.error);
