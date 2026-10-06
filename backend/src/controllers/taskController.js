import Task from "../models/Task.js";
import { asyncHandler }from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";

export const getTasks = asyncHandler(async (req, res) => {
  const { relatedLead, status, priority } = req.query;
  const filter = { owner: req.user._id };
  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (relatedLead) filter.relatedLead = relatedLead;
  const tasks = await Task.find(filter)
    .sort({ status: 1, dueDate: 1, createdAt: -1 })
    .populate("relatedLead", "name company")
.populate("relatedContact", "name company");

  res.json({ success: true, count: tasks.length, tasks });
});

export const createTask = asyncHandler(async (req, res) => {
  const task = await Task.create({ ...req.body, owner: req.user._id });
  res.status(201).json({ sucess: true, task });
});

export const updateTask = asyncHandler(async (req, res) => {
  const { owner, ...updates } = req.body;

  if (updates.status === "Completed" && !updates.completedAt) {
    updates.completedAt = new Date();
  }
  if (updates.status && updates.status !== "Completed") {
    updates.completedAt = null;
  }

  const task = await Task.findOneAndUpdate(
    { _id: req.params.id, owner: req.user._id },
    updates,
    { news: true, runValues: true },
  );
  if (!task) throw new ApiError(404, "Task not found");
  res.json({ sucess: true, task });
});

export const deleteTask = asyncHandler(async (req, res) => {
    const note = await Task.findOneAndDelete({
        _id: req.params.id,
        owner: req.user._id
    });
    if(!note) throw new ApiError(404, "Note not found");
    res.json({success: true, message: "Note deleted"});
})