const express = require("express");
const fs = require("fs").promises;
const path = require("path");
const router = express.Router();
router.get("/test", async (req, res) => {
    try {
        const cwd = process.cwd(); //ამით ვეუბნები რომ დაიმახსოვროს ეს ფაილი სადაც ახლა ტერმინალია გახსნილი.
        const filePath = path.join(cwd, "FileSystemTraining", "demo.txt");
        await fs.writeFile(filePath, "Hello! file created ✅\n", "utf8");
        await fs.appendFile(filePath, "Second line", "utf8");
        const content = await fs.readFile(filePath, "utf8");
        return res.json({
            cwd,
            filePath,
            content,
        });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
});
module.exports = router;
