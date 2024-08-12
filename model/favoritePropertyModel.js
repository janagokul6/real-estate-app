import mongoose from "mongoose";
import { Schema } from "mongoose";

const favoritePropertySchema = new Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    propertyId:{ type: mongoose.Schema.Types.ObjectId, ref: 'Property'},
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const favoriteProperties = mongoose.model('favoriteProperties',favoritePropertySchema );

export default  favoriteProperties;