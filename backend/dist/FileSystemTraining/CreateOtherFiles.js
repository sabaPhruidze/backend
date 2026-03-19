"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//@ts-check
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const createFile = async () => {
    try {
        const direction = path_1.default.join(__dirname, "createdFile.txt");
        await fs_1.promises.writeFile(direction, "//Hi file is created");
        await fs_1.promises.appendFile(direction, "//This text is added in the created file");
        const readFile = await fs_1.promises.readFile(direction, "utf-8");
        console.log(readFile);
        // await fs.unlink("folder/Remove.js");
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        console.error(message);
    }
};
createFile();
