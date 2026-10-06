    import User from "../models/User.js";
    import { generateToken } from "../utils/generateToken.js";
    import { asyncHandler } from "../utils/asyncHandler.js";
    import { ApiError } from "../utils/apiError.js";

    const toClientUser = (user) => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        company: user.company,
        avatar: user.avatar,
    });

    export const register= asyncHandler(async (req, res) => {
        const { name, email, password, company, role } = req.body;
        if (!name || !email || !password) {
            throw new ApiError(400, "Please provide name, email and password");
        }
        const exists = await User.findOne({ email });
        if (exists) {
            throw new ApiError(400, "User already exists");
        }
        const user = await User.create({ name, email, password, company,
            role: role=== "owner" ? "owner" : "member"
         });
        res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: toClientUser(user),
            token: generateToken(user._id),
        });
    });

    export const login = asyncHandler(async (req, res) => {
        const { email, password } = req.body;
        if (!email || !password) {
            throw new ApiError(400, "Please provide email and password");
        }
        const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
        console.log("user found:", !!user);
  if (user) {
    console.log("stored password:", user.password);
    console.log("password match:", await user.matchPassword(password));
  }
        if (!user || !(await user.matchPassword(password))) {
            throw new ApiError(401, "Invalid email or password");
        }
        res.json({
            success: true,
            message: "User logged in successfully",
            user: toClientUser(user),
            token: generateToken(user._id),
        });
    })


    export const getMe = asyncHandler(async (req, res) => {
        res.json({
            success: true,
            user: toClientUser(req.user),
        });
    })

    export const updateProfile = asyncHandler(async (req, res) => {
        const { name, company, avatar, password } = req.body;
        const user = req.user;

        if(name !== undefined) user.name = name;
        if(company !== undefined) user.company = company;
        if(avatar !== undefined) user.avatar = avatar;
        if(password !== undefined) user.password = password;

        await user.save();
        res.json({
            success: true,
            message: "Profile updated successfully",
            user: toClientUser(user),
        });
    })