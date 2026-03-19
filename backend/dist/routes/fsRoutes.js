"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const fs_1 = require("fs");
const path_1 = __importDefault(require("path"));
const router = (0, express_1.Router)();
router.get("/test", async (req, res) => {
    try {
        const cwd = process.cwd(); //ამით ვეუბნები რომ დაიმახსოვროს ეს ფაილი სადაც ახლა ტერმინალია გახსნილი.
        const filePath = path_1.default.join(cwd, "FileSystemTraining", "demo.txt");
        await fs_1.promises.writeFile(filePath, "Hello! file created ✅\n", "utf8");
        await fs_1.promises.appendFile(filePath, "Second line", "utf8");
        const content = await fs_1.promises.readFile(filePath, "utf8");
        return res.json({
            cwd,
            filePath,
            content,
        });
    }
    catch (error) {
        const message = error instanceof Error ? error.message : String(error);
        return res.status(500).json({ message });
    }
});
exports.default = router;
