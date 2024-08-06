import mongoose from "mongoose";
import { Schema } from "mongoose";

const recentSearchesSchema = new Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
  searchText: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const recentSearches = mongoose.model('recentSearches', recentSearchesSchema);

export default  recentSearches;
