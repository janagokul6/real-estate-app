import express from "express";
import { registerUser, loginUser } from '../controller/userController.js';
import User from "../model/userModel.js";
import bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken"


const route= express.Router() ;


route.post('/register', async (req, res) => {
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
      registrationDate: new Date()
    });

    const savedUser = await newUser.save();

    return res.status(201).json({ message: "User created successfully", user: savedUser });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
});
  route.post('/login', async (req, res) => {
    const { email, password } = req.body;
  const newPassword = password;
  try {
    const AdminData = await User.findOne({ email: email });
    if (!AdminData) return res.status(403).send({ message: "No admin exist" });
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

  route.patch('/update', async (req, res) => {
    const { id } = req.params;
    const updatableData = { ...req.body };
  try {
    const AdminData = await Model.findOne({_id:id});
    if (!AdminData) return res.status(403).send({ message: "No admin exist" });
  const updatedData = await User.findOneAndUpdate(
    {_id:id},
    { $set: updatableData },
    { new: true }
  );
    const { password, ...adminDetails } = updatedData._doc;
    return res.status(200).json({ admin: adminDetails, token: token });
  } catch (error) {
    console.log(error);
    return res.status(509).send({ message: "something went wrong" });
  }
  });


export default route