import express from "express";
import { registerUser, loginUser ,getTotalUsers,getTotalAgents,getAllAgents,getAllUsers,deleteUser} from "../controller/userController.js";
import User from "../model/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sgMail from "@sendgrid/mail";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

import path from "path";
import fs from "fs";
dotenv.config();

import cloudinary from "cloudinary";
import multer from "multer";

const route = express.Router();
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const senderEmail = process.env.SG_EMAIL;

// Function to generate a 6-digit OTP
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000); // Generates a 6-digit number
};

// Function to send OTP via email with error handling
const sendOTPEmail = async (email, OTP) => {
  const msg = {
    to: email,
    from:senderEmail , // Your verified email in SendGrid
    subject: "One-Time Password (OTP) for Verification",
    text: `Your OTP is: ${OTP}`,
  };

  try {
    // Send email using SendGrid
    await sgMail.send(msg);
    console.log(`OTP email sent to ${email}`);
  } catch (error) {
    // Handle specific SendGrid errors
    if (error.response) {
      console.error("SendGrid error response:", error.response.body);
      // throw new Error(`SendGrid Error: ${error.response.body.errors.map(err => err.message).join(", ")}`);
    } else {
      // Handle any other unexpected errors
      console.error("Error sending email:", error.message);
      throw new Error("Failed to send email. Please try again later.");
    }
  }
};
// Function to send OTP via email
// const sendOTPEmail = async (email, OTP) => {
//   const msg = {
//     to: email,
//     from: "your-verified-email@example.com", // Your verified email in SendGrid
//     subject: "One-Time Password (OTP) for Verification",
//     text: `Your OTP is: ${OTP}`,
//   };

//   await sgMail.send(msg);
// };

// Configure Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadDir = "uploads/";
const BASE_URL = "http://95.216.209.46:5500/uploads/";
// Configure multer storage

// Ensure upload directory exists
// Ensure upload directory exists
(async () => {
  if (!(await fs.existsSync(uploadDir))) {
    await fs.mkdir(uploadDir, { recursive: true });
  }
})();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(
      null,
      `profiles_${Date.now()}-${file.originalname.replace(/\s+/g, "_")}`
    );
  },
});

const upload = multer({ storage });

route.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingData = await User.findOne({ email: email });
    if (existingData) {
      return res.status(409).json({ message: "User already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const encryptedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: encryptedPassword,
      // isRegistered: true,
      registrationDate: new Date(),
    });

    const savedUser = await newUser.save();

    return res
      .status(201)
      .json({ message: "User created successfully", user: savedUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});
route.post("/login", async (req, res) => {
  const { email, password } = req.body;
  const newPassword = password;
  console.log(email)
  try {
    const AdminData = await User.findOne({ email: email });
    if (!AdminData) return res.status(403).send({ message: "No user exist" });
    const comparePassword = await bcrypt.compare(
      newPassword,
      AdminData.password
    );
    if (!comparePassword)
      return res.status(401).send({ message: "invalid credentials" });
    const token = jwt.sign(
      { email: AdminData.email, id: AdminData.id },
      process.env.JWT_SECRET,
      { expiresIn: "30d" }
    );
    const { password, ...adminDetails } = AdminData._doc;
    return res.status(200).json({ admin: adminDetails, token: token });
  } catch (error) {
    console.log(error);
    return res.status(509).send({ message: "something went wrong" });
  }
});
route.post("/forgot-password", async (req, res) => {
  const { email } = req.body;

  try {
    // Check if user exists
    const storedUser = await User.findOne({ email: email });
    if (!storedUser) {
      return res.status(404).send({ message: "No user found with this email" });
    }

    // Generate OTP
    const OTP = generateOTP();

    // Hash the OTP and save it in the user object (or store it temporarily elsewhere)
    const hashedOTP = await bcrypt.hash(OTP.toString(), 10);

    // Save the hashed OTP and its expiration in the database (valid for 10 minutes)
    storedUser.resetOTP = hashedOTP;
    storedUser.otpExpiry = Date.now() + 10 * 60 * 1000; // OTP valid for 10 minutes
    await storedUser.save();

    // Send OTP via email
    await sendOTPEmail(email, OTP);

    return res.status(200).json({
      message: "OTP sent successfully!",
      id: storedUser._id, // Optionally send the user ID to verify OTP later
      Otp:OTP
    });
  } catch (error) {
    console.error("Error in /forgot-password:", error);

    // Handle unexpected errors
    return res.status(500).json({ message: "Something went wrong. Please try again later." });
  }
});

route.patch("/updateuser/:id", async (req, res) => {
  const { id } = req.params;
  const { imageurl, password, ...updatableData } = req.body;

  try {
    const userData = await User.findById(id);
    if (!userData) return res.status(404).json({ message: "User not found" });

    let newImagePath = userData.image; // Default to existing image path
    let imageUpdated = false;

    // Handle base64 image
    if (imageurl) {
      const matches = imageurl.match(
        /^data:image\/([A-Za-z-+\/]+);base64,(.+)$/
      );

      if (matches.length !== 3) {
        return res.status(400).json({ message: "Invalid base64 string" });
      }

      const imageType = matches[1];
      const imageBase64 = matches[2];
      const imageFileName = `profiles_${Date.now()}.${imageType}`;
      const imagePath = path.join(uploadDir, imageFileName);

      // Save the base64 image to a file
      fs.writeFileSync(imagePath, imageBase64, "base64");

      // Delete previous image if it exists
      if (userData.image && userData.image.startsWith(BASE_URL)) {
        const oldImagePath = path.join(uploadDir, userData.image.split('/').pop());
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      // Update the image path
      newImagePath = `${BASE_URL}${imageFileName}`;
      imageUpdated = true;
    }

    // Handle password update if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updatableData.password = hashedPassword;
    }

    // Prepare update object with only provided fields
    const updateObject = Object.keys(updatableData).length > 0 ? updatableData : {};
    if (imageUpdated) {
      updateObject.imageurl = newImagePath;
    }

    // Update user data
    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateObject,
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // Prepare response without password field
    const { password: _, ...userDetails } = updatedUser.toObject();

    return res.status(200).json({
      message: "User updated successfully",
      user: userDetails,
      // newImageUrl: imageUpdated ? newImagePath : undefined
    });
  } catch (error) {
    console.error("Error in updateuser route:", error);
    return res
      .status(500)
      .json({ message: "Something went wrong", error: error.message });
  }
});

route.get("/user/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Fetch a single user by ID
    const user = await User.findById(id);

    // Check if the user exists
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Return the user data
    return res.status(200).json({ user });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});

route.get('/admin/totalusers', getTotalUsers);
route.get('/admin/totalagents', getTotalAgents);
route.get('/admin/allagents', getAllAgents);
route.get('/admin/allusers', getAllUsers);
route.delete('/deleteusers/:id', deleteUser);

export default route;
