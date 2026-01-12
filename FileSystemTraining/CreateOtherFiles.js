//@ts-check
const fs = require("fs").promises;
const path = require("path");

const createFile = async () => {
  try {
    const direction = path.join(__dirname, "server.js");
    await fs.writeFile(direction, "//Hi file is created");
    await fs.appendFile(direction, "//This text is added in the created file");
    const readFile = await fs.readFile(direction, "utf-8");
    console.log(readFile);
    // await fs.unlink("folder/Remove.js");
  } catch (error) {
    console.error(error);
  }
};
createFile();
