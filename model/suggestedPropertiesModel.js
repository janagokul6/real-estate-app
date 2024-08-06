import mongoose from "mongoose";
import { Schema } from "mongoose";

const suggestedPropertiesSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  searchText: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const suggestedProperties = mongoose.model('suggestedProperties', suggestedPropertiesSchema);

export default  suggestedProperties;
