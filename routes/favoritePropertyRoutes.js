import express from 'express';
import {createFavoriteProperty,getFavoriteProperties  } from '../controller/favoritePropertyController.js';

const favoritePropertyRoute = express.Router();

favoritePropertyRoute.post('/addfavoriteproperty', createFavoriteProperty);
favoritePropertyRoute.get('/getfavoriteproperties', getFavoriteProperties );


export default favoritePropertyRoute;