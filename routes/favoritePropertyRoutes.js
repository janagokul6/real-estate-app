import express from 'express';
import {createFavoriteProperty,getFavoriteProperties ,deleteProperty,getFavPropertiesID } from '../controller/favoritePropertyController.js';

const favoritePropertyRoute = express.Router();

favoritePropertyRoute.post('/addfavoriteproperty', createFavoriteProperty);
favoritePropertyRoute.get('/getfavoriteproperties', getFavoriteProperties );
favoritePropertyRoute.get('/getfavpropertiesId', getFavPropertiesID );
favoritePropertyRoute.delete('/deletefavproperty/:propertyId', deleteProperty);


export default favoritePropertyRoute;