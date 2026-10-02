import Lead from "../models/leadModel.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/apiError.js";

export const getLeads = asyncHandler(async (req, res) => {
    const {status, priority, source, search} = req.query;
    const filter = { owner: req.user._id };
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (source) filter.source = source;
    if (search) {
        const rx= new RegExp(search, "i");
        filter.$or = [{ name: rx }, { email: rx },{company: rx}]
    }
    const leads = await Lead.find(filter).sort({ order:1, createdAt: -1 });
    res.json({
        success: true,
        leads
    });
})