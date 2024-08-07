import express from "express";
import { registerUser, loginUser } from "../controller/userController.js";
import User from "../model/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer";
import dotenv from "dotenv";

import path from "path";
import fs from "fs";
dotenv.config();

import cloudinary from "cloudinary";
import multer from "multer";

const route = express.Router();

export const transporter = nodemailer.createTransport({
  host: "smtp.ethereal.email",
  port: 587,
  auth: {
    user: "chanel.nolan41@ethereal.email",
    pass: "6crGVE8GS5ycV8jqNE",
  },
});
transporter.verify(function (error, success) {
  if (error) {
    console.log(error);
  } else {
    console.log("Server is ready to take our messages");
  }
});

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

// Define the upload route
// route.post(
//   "/uploadImage",
//   uploadedFile.single("uploadedfile"),
//   async (req, res) => {
//     try {
//       console.log(req.body);
//       if (!req.file) {
//         res.send("Please upload your image first");
//       } else {
//         const savedFile = await cloudinary.v2.uploader.upload(req.file.path, {
//           public_id: "testing",
//         });

//         console.log(savedFile);
//         console.log(savedFile.secure_url);

//         // Generate Cloudinary URL
//         const url = cloudinary.v2.url("testing", {
//           width: 100,
//           height: 150,
//           crop: "fill",
//         });

//         console.log(url);
//         res.send("Image uploaded successfully");
//       }
//     } catch (err) {
//       console.log(err);
//       res.status(500).send("An error occurred while uploading the image");
//     }
//   }
// );
export default route;
