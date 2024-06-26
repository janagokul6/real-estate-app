import express  from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";


import {connectToDB} from "./db.js"
import userRoutes
 from "./routes/userRoutes.js";
 import agentRoutes from './routes/agentRoutes.js';
 import propertyRoutes from './routes/propertyRotes.js';
const app= express();
app.use(express.json());
// app.use(bodyParser.json());
dotenv.config() ;
const PORT =process.env.PORT ||5500

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
