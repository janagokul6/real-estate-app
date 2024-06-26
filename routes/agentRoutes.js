import express from 'express';
import { createAgent, getAgents,updateAgent } from '../controller/agentController.js';

const agentroute = express.Router();

agentroute.post('/addagent', createAgent);
agentroute.get('/getagents', getAgents);
agentroute.put('/updateagent/:id', updateAgent);

export default agentroute;