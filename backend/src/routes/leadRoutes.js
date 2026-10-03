import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  createLead,
  deleteLead,
  getLead,
  getLeads,
  reorderLeads,
  updateLead,
} from "../controllers/leadControllers.js";

const router = Router();

router.use(protect);

router.get("/", getLeads);
router.get("/:id", getLead);
router.put("/:id", updateLead);
router.post("/", createLead);
router.delete("/:id", deleteLead);
router.patch("/reorder", reorderLeads);

export default router;