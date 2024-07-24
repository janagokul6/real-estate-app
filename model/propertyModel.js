import mongoose from 'mongoose';

const { Schema } = mongoose;

const propertySchema = new Schema({
    title: { type: String, required: true, trim: true },
    type: { type: String, required: true,  },
    bedrooms: { type: Number, required: true, min: 0 },
    bathrooms: { type: Number, required: true, min: 0 },
    squareFeet: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, required: true },
    features: [{ type: String }],
    status: { type: String},
    location: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true,
            validate: {
                validator: (value) => value.length === 2 && typeof value[0] === 'number' && typeof value[1] === 'number',
                message: 'Invalid coordinates format. Must be an array of two numbers: [longitude, latitude]'
            }
        },
        address: { type: String, required: true },
        city: { type: String, required: true },
        state: { type: String, required: true },
        zip: { type: String, required: true },
        country: { type: String, required: true }
    },
    images: [{ type: String }], 
    mainImage: { type: String }, // URL of the main image
   
    agentId: { type: mongoose.Schema.Types.ObjectId, required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

propertySchema.index({ location: '2dsphere' });
propertySchema.index({ title: 'text', description: 'text' });

const Property = mongoose.model('Property', propertySchema);

export default Property;