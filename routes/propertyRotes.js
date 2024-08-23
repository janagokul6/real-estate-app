import express from 'express';
import { createProperty, getProperties, getPropertiesNear,updateProperty, deleteProperty ,getPropertiesByAgent,getTotalProperties,getAllProperties,updatePropertystatus,getAgentPropertiesCount } from '../controller/propertyController.js';

const router = express.Router();

// Route to create a new property
router.post('/properties',  createProperty);

// Route to get all properties
router.get('/properties', getProperties);

// Route to update a property by ID
router.put('/properties/:id', updateProperty);
router.patch('/properties/status/:propertyId', updatePropertystatus);

// Route to get properties near a location
router.get('/properties/search', getPropertiesNear);
router.get('/properties/:agentId', getPropertiesByAgent );


// Route to delete a property by ID
router.delete('/properties/:id', deleteProperty);


// admin
router.get('/property/totalproperties', getTotalProperties);
router.get('/property/getAllProperties', getAllProperties);
router.get('/property/count/:agentId',getAgentPropertiesCount);

export default router;
