import mongoose from 'mongoose';

const { Schema } = mongoose;

const propertySchema = new Schema({
    title: { type: String, required: true, trim: true },
    type: { type: String, required: true },
    category: { type: String }, // Added category
    bedrooms: { type: Number, required: true, min: 0 },
    bathrooms: { type: Number, required: true, min: 0 },
    squareFeet: { type: Number, required: true, min: 0 },
    price: { type: Number, required: true, min: 0 },
    description: { type: String, required: true },
    features: [{ type: String }],
    status: { type:  Boolean, required: true },
    rentNegotiable: { type: Boolean, default: false }, // Added rentNegotiable
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
        country: { type: String, required: true, default: "India" }
    },
    images: [{ type: String }],
    mainImage: { type: String }, // URL of the main image
    agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    furnishedType: { type: String,required: true}, // Added furnishedType
    floorNumber: { type: String ,required: true}, // Added floorNumber
    parking: { type: Number,required: true }, // Added parking
    preferredTenant: { type: String,required: true }, // Added preferredTenant
    nextAvailableDate: { type: Date,required: true }, // Added nextAvailableDate
    petFriendly: { type: Boolean,required: true},// Added petFriendly
    gatedSociety: { type: Boolean,required: true},// Added gatedSociety
    brokerage: { type: String,required: true }, // Added brokerage
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
}, { timestamps: true });

propertySchema.index({ location: '2dsphere' });
propertySchema.index({ title: 'text', description: 'text' });

const Property = mongoose.model('Property', propertySchema);

export default Property;