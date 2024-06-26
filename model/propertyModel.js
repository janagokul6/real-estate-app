import mongoose from 'mongoose';

const { Schema } = mongoose;

const propertySchema = new Schema({
    title: { type: String, required: true },
    type: { type: String, required: true },
    bedrooms: { type: Number, required: true },
    bathrooms: { type: Number, required: true },
    squareFeet: { type: Number, required: true },
    price: { type: Number, required: true },
    description: { type: String, required: true },
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
    agentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Agent', required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
  });
  
  propertySchema.index({ location: '2dsphere' });
  
  const Property = mongoose.model('Property', propertySchema);
  
  export default Property;