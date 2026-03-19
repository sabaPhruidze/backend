//@ts-check
import { promises as fs } from "fs";
import path from "path";

const createFile = async (): Promise<void> => {
  try {
    const direction = path.join(__dirname, "createdFile.txt");
    await fs.writeFile(direction, "//Hi file is created");
    await fs.appendFile(direction, "//This text is added in the created file");
    const readFile = await fs.readFile(direction, "utf-8");
    console.log(readFile);
    // await fs.unlink("folder/Remove.js");
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(message);
  }
};
createFile();
