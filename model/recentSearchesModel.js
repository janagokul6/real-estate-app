import mongoose from "mongoose";
import { Schema } from "mongoose";

const recentSearchesSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  searchText: { type: String, required: true },
  latitude: { type: Number, required: true },
  longitude: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});
recentSearchesSchema.index({ userId: 1, searchText: 1 }, { unique: true });
const recentSearches = mongoose.model('recentSearches', recentSearchesSchema);

export default  recentSearches;
