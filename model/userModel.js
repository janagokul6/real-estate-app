import mongoose from "mongoose";
import { Schema } from "mongoose";

const userSchema = new Schema({
 name: { type: String },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String,  },
  role: { type: String, enum: ['user', 'agent'], },
  licenseNumber: {type:String},
  isRegistered: { type: Boolean, default: false },
  registrationDate: { type: Date },
  lastLoginDate: { type: Date },
  imageurl: { type: String }, 
},{timestamp:true});

const User = mongoose.model('RealEstateUser', userSchema);
export default User