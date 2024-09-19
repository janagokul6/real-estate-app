import express  from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import path from 'path';
import { fileURLToPath } from 'url';
import cors from "cors"
import {connectToDB} from "./db.js"
import userRoutes
 from "./routes/userRoutes.js";
 import agentRoutes from './routes/agentRoutes.js';
 import propertyRoutes from './routes/propertyRotes.js';
 import recentSearchesRoute from './routes/recentSearchesRoutes.js'
 import viewedPropertyRoute from './routes/viewedPropertyRoutes.js'
 import suggestedPropertiesRoute from './routes/suggestedPropertiesRoutes.js'
 import featuredPropertiesRoute from './routes/featuredPropertiesRoutes.js'
 import  favoritePropertyRoute from './routes/favoritePropertyRoutes.js'
 import notificationRoutes from './routes/notificationRoutes.js';
const app= express();
const corsOptions = {
  origin: 'http://95.216.209.46:3000',  // Your frontend URL
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],

  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
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
app.use("/api", recentSearchesRoute );
app.use("/api", viewedPropertyRoute );
app.use("/api", suggestedPropertiesRoute  );
app.use("/api", featuredPropertiesRoute );
app.use("/api",favoritePropertyRoute);
app.use('/api/notifications', notificationRoutes);
  
 connectToDB().then(()=>{
    app.listen(PORT, ()=>{
      console.log(`server started at: http://localhost:${PORT}`)
    })
  }).catch((err)=>{
    console.log(err)
  })
