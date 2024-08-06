import express from 'express';
import {createViewedProperty,getViewedProperties   } from '../controller/viewedPropertyController.js';

const viewedPropertyRoute = express.Router();

viewedPropertyRoute.post('/addviewedproperty', createViewedProperty);
viewedPropertyRoute.get('/getviewedproperties', getViewedProperties );


export default viewedPropertyRoute;