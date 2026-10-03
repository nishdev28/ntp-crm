import { Router } from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  createContact,
  deleteContact,
  getContact,
  getContacts,
  updateContact,
} from "../controllers/contactControllers.js";

const router = Router();

router.get("/", protect, getContacts);
router.get("/:id", protect, getContact);
router.post("/", protect, createContact);
router.put("/:id", protect, updateContact);
router.delete("/:id", protect, deleteContact);

export default router;
