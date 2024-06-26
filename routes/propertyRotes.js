import express from 'express';
import { createProperty, getProperties, getPropertiesNear } from '../controller/propertyController.js';

const router = express.Router();

// Route to create a new property
router.post('/properties', createProperty);

// Route to get all properties
router.get('/properties', getProperties);

// Route to get properties near a location
router.get('/properties/near', getPropertiesNear);

export default router;
