import express from 'express';
import { createRecentSearch,getRecentSearches } from '../controller/recentSearchesController.js';

const recentSearchesRoute = express.Router();

recentSearchesRoute.post('/addrecentsearch', createRecentSearch);
recentSearchesRoute.get('/getrecentsearches', getRecentSearches);


export default recentSearchesRoute;