import express from "express";
import { registerUser, loginUser } from "../controller/userController.js";
import User from "../model/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import nodemailer from "nodemailer"
import dotenv from "dotenv";

import path from 'path';
import fs from 'fs';
dotenv.config();

import cloudinary from "cloudinary";
import multer from "multer";

const route = express.Router();

export  const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  auth: {
      user: 'chanel.nolan41@ethereal.email',
      pass: '6crGVE8GS5ycV8jqNE'
  }
});
transporter.verify(function(error, success) {
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

const uploadDir = 'uploads/profiles';
const BASE_URL = 'http://localhost:5500/uploads/profiles';
// Configure multer storage

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `profiles_${Date.now()}-${file.originalname.replace(/\s+/g, '_')}`);
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

route.patch("/update/:id", upload.single('image'), async (req, res) => {
  const { id } = req.params;
  const updatableData = { ...req.body };

  try {
    const userData = await User.findOne({ _id: id });
    if (!userData) return res.status(403).send({ message: "No user exists" });

    // Handle image upload
    if (req.file) {
      const imageFileName = `profiles_${Date.now()}-${req.file.originalname.replace(/\s+/g, '_')}`;
      const imagePath = path.join(uploadDir, imageFileName);

      // Move the file to the upload directory
      fs.renameSync(req.file.path, imagePath);

      // Update the image URL in the user data
      updatableData.imageurl = `${BASE_URL}${imageFileName}`;
    }

    const updatedData = await User.findOneAndUpdate(
      { _id: id },
      { $set: updatableData },
      { new: true }
    );

    const { password, ...userDetails } = updatedData._doc;
    return res.status(200).json({ message: "User updated successfully", user: userDetails });
  } catch (error) {
    console.log(error);
    return res.status(500).send({ message: "Something went wrong" });
  }
});
route.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const storedUser = await User.findOne({ email: email });
    if (!storedUser) return res.status(403).send({ message: "No admin exist" });
    const OTP = Math.floor(108309 + Math.random() * 900000);
    const mailOptions = {
      from: "thakuraksingh1@gmail.com",
      to: email,
      subject: "One-Time Password (OTP) for Verification",
      text: `Your OTP is: ${OTP}`,
    };
    const result = await transporter.sendMail(mailOptions);
    return res.status(200).json({
      otp: OTP,
      message: "Email Sent Successfully!",
      id: storedUser._id,
    });
  } catch (error) {
    if (error.message === "Not Found") {
      return res.status(409).json({ message: "user does not exists" });
    } else {
      return res.status(501).json({ message: "something went wrong" });
    }
  }
});
route.put("/reset-password/:id", async (req, res) => {
  const { id } = req.params;
  const { currentPassword, password } = req.body;
  const newPassword = password;
  try {
    const salt = await bcrypt.genSalt(10);
    const encryptedPassword = await bcrypt.hash(newPassword, salt);
    if (currentPassword) {
      const UserData = await User.findOne({ _id: id });
      if (!UserData) return res.status(403).send({ message: "No user exist" });

      const comparePassword = await bcrypt.compare(
        newPassword,
        UserData.password
      );
      if (!comparePassword)
        return res.status(401).send({ message: "invalid credentials" });
    }
    const updatableData = { password: encryptedPassword };
    const storedUser = await  User.findOneAndUpdate(
      { _id: id },
      { $set: updatableData },
      { new: true }
    );
    const { password, ...userDetails } = storedUser._doc;
    return res
      .status(200)
      .json({ user: userDetails, message: "password updated successfully" });
  } catch (error) {
    if (error.message === "Not Found") {
      return res.status(409).json({ message: "user does not exists" });
    } else {
      return res.status(501).json({ message: "something went wrong" });
    }
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
