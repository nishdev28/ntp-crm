import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  createNote,
  deleteNote,
  getNotes,
  updateNote,
} from "../controllers/noteController.js";

const router = Router();

router.use(protect);

router.get("/", getNotes);
router.post("/", createNote);
router.put("/:id", updateNote);
router.delete("/:id", deleteNote);

export default router;
