import express from 'express';
import { getSuggestedProperties } from '../controller/suggestedPropertiesController.js';

const suggestedPropertiesRoute = express.Router();

// suggestedPropertiesRoute.post('/addsuggestedproperty', createSuggestedProperty);
suggestedPropertiesRoute.get('/getsuggestedproperties', getSuggestedProperties);


export default suggestedPropertiesRoute;