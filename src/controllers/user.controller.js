import ErrorHandler from "../middleware/error.js";
import { catchAsyncErrors } from "../middleware/catchAsyncErrors.js";
import cloudinary from "../config/cloudinary.js";
import { User } from "../models/user.model.js";
import { generateAuthToken } from "../utils/jwtToken.js";

// REGISTER USER CONTROLLER
export const handleUserRegister = catchAsyncErrors(async (req, res, next) => {
  if (!req.files || Object.keys(req.files).length === 0)
    return next(new ErrorHandler("User profile & resume are required!", 400));

  const { avatar, resume } = req.files;

  // UPLOAD AVATAR TO CLOUDINARY
  const uploadResponseForAvatar = await cloudinary.uploader.upload(
    avatar.tempFilePath,
    { folder: "Portfolio Avatar" }
  );

  if (!uploadResponseForAvatar || uploadResponseForAvatar.error) {
    console.error(
      "Cloudinary Error:",
      uploadResponseForAvatar.error || "Unknown cloudinary error"
    );

    return next(new ErrorHandler("Failed to upload avatar to cloudinary", 500));
  }

  // UPLOAD RESUME TO CLOUDINARY
  const uploadResponseForResume = await cloudinary.uploader.upload(
    resume.tempFilePath,
    { folder: "Portfolio resume" }
  );

  if (!uploadResponseForResume || uploadResponseForResume.error) {
    console.error(
      "Cloudinary Error:",
      uploadResponseForResume.error || "Unknown cloudinary error"
    );

    return next(new ErrorHandler("Failed to upload resume to cloudinary", 500));
  }

  // ACCESS THE REQ BODY
  const {
    fullName,
    email,
    phone,
    aboutMe,
    password,
    githubUrl,
    linkedinUrl,
    instagramUrl,
    twitterUrl,
    facebookUrl,
  } = req.body;

  const user = await User.create({
    fullName,
    email,
    phone,
    aboutMe,
    password,
    githubUrl,
    linkedinUrl,
    instagramUrl,
    twitterUrl,
    facebookUrl,
    avatar: {
      public_id: uploadResponseForAvatar.public_id,
      url: uploadResponseForAvatar.secure_url,
    },
    resume: {
      public_id: uploadResponseForResume.public_id,
      url: uploadResponseForResume.secure_url,
    },
  });

  // GENERATE JWT TOKEN
  generateAuthToken(user, "User Registered!", 201, res);
});

// LOGIN USER CONTROLLER
export const handleUserLogin = catchAsyncErrors(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password)
    return next(new ErrorHandler("Email and Password must be required!", 400));

  const user = await User.findOne({ email }).select("+password");

  if (!user) return next(new ErrorHandler("Invalid email or password!", 401));

  const isPasswordMatch = await user.comparePassword(password);

  if (!isPasswordMatch)
    return next(new ErrorHandler("Invalid email or password!", 401));

  // GENEREATE JWT TOKEN
  generateAuthToken(user, "Login Successfully!", 200, res);
});

// LOGOUT USER CONTROLLER
export const handleUserLogout = catchAsyncErrors(async (req, res, next) => {
  res
    .status(200)
    .cookie("authToken", "", {
      expires: new Date(Date.now()),
    })
    .json({
      success: true,
      message: "Logged out!",
    });
});

// GET USER PROFILE
export const handleGetProfile = catchAsyncErrors(async (req, res, next) => {
  const user = await User.findById(req.user.id);
  res.status(200).json({
    success: true,
    user,
  });
});

// UPDATE PROFILE CONTROLLER
export const handleUpdateProfile = catchAsyncErrors(async (req, res, next) => {
  const updatedData = {
    fullName: req.body.fullName,
    email: req.body.email,
    phone: req.body.phone,
    aboutMe: req.body.aboutMe,
    githubUrl: req.body.githubUrl,
    linkedinUrl: req.body.linkedinUrl,
    instagramUrl: req.body.instagramUrl,
    twitterUrl: req.body.twitterUrl,
    facebookUrl: req.body.facebookUrl,
  };

  if (req.files && req.files.avatar) {
    const avatar = req.files.avatar;
    const user = await User.findById(req.user.id);

    // GET EXISTING AVATAR PUBLIC ID AND DELETE FROM CLOUDINARY
    const avatarPublicId = user.avatar.public_id;
    await cloudinary.uploader.destroy(avatarPublicId);

    // UPLOAD NEW AVATAR TO CLOUDINARY
    const uploadResponseForAvatar = await cloudinary.uploader.upload(
      avatar.tempFilePath,
      { folder: "Portfolio Avatar" }
    );

    updatedData.avatar = {
      public_id: uploadResponseForAvatar.public_id,
      url: uploadResponseForAvatar.secure_url,
    };
  }

  if (req.files && req.files.resume) {
    const resume = req.files.resume;
    const user = await User.findById(req.user.id);

    // GET EXISTING RESUME PUBLIC ID AND DELETE FROM CLOUDINARY
    const resumePublicId = user.resume.public_id;
    await cloudinary.uploader.destroy(resumePublicId);

    // UPLOAD NEW RESUME TO CLOUDINARY
    const uploadResponseForResume = await cloudinary.uploader.upload(
      resume.tempFilePath,
      { folder: "Portfolio resume" }
    );

    updatedData.resume = {
      public_id: uploadResponseForResume.public_id,
      url: uploadResponseForResume.secure_url,
    };
  }

  const user = await User.findByIdAndUpdate(req.user.id, updatedData, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    message: "Profile Updated!",
    user,
  });
});
