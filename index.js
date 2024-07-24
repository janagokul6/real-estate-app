import express  from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import path from 'path';
import { fileURLToPath } from 'url';

import {connectToDB} from "./db.js"
import userRoutes
 from "./routes/userRoutes.js";
 import agentRoutes from './routes/agentRoutes.js';
 import propertyRoutes from './routes/propertyRotes.js';
const app= express();


app.use(express.json());
app.use(express.urlencoded({ extended: true }));
// app.use(bodyParser.json());

dotenv.config() ;
const PORT =process.env.PORT ||5500

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/uploads/profiles', express.static(path.join(__dirname, 'uploads/profiles')));
app.use("/api", userRoutes);
app.use("/api", propertyRoutes);
app.use("/api", agentRoutes);
  
 connectToDB().then(()=>{
    app.listen(PORT, ()=>{
      console.log(`server started at: http://localhost:${PORT}`)
    })
  }).catch((err)=>{
    console.log(err)
  })
