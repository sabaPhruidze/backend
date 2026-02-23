import { Router, type Request, type Response } from "express";
import { promises as fs } from "fs";
import path from "path";

const router = Router();
router.get("/test", async (req: Request, res: Response) => {
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
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ message });
  }
});
export default router;
