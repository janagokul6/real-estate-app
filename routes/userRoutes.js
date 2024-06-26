import express from "express";
import { registerUser, loginUser } from '../controller/userController.js';
import User from "../model/userModel.js";

const route= express.Router() ;


route.post('/register', async (req, res) => {
  const { password } = req.body;
  const enteredPassword = password;
  try {
    const salt = await bcrypt.genSalt(10);
    const encryptedPassword = await bcrypt.hash(enteredPassword, salt);
    const creatableData = { ...req.body, password: encryptedPassword };
  
      const existingData = await User.findOne({ email: req.body.email });
      if (existingData) {
        return res.status(409).json({ message: "user already exists" });
      }
   
    const newData = new User(creatableData);
    const savedData = await newData.save();
   
    return res.status(201).json({ message: "user created successfully",user:savedData});
  } catch (error) {
    
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
    return res.status(509).send({ message: "something went wrong" });
  }
  });


export default route