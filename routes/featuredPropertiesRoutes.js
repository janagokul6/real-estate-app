import express from 'express';
import { getFeaturedProperties } from '../controller/featuredPropertiesController.js';

const featuredPropertiesRoute = express.Router();

// featuredPropertiesRoute.post('/addfeaturedproperty', createFeaturedProperty);
featuredPropertiesRoute.get('/getfeaturedproperties', getFeaturedProperties);


export default featuredPropertiesRoute;