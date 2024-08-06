import Property from '../model/propertyModel.js';
import path from 'path';
const BASE_URL = 'http://95.216.209.46:5500/uploads/';
// export const createSuggestedProperty = async (req, res) => {
//   try {
//     const suggestedProperty = new SuggestedProperties(req.body);
//     await suggestedProperty.save();
//     res.status(201).send(suggestedProperty);
//   } catch (err) {
//     res.status(400).send(err);
//   }
// };

export const getSuggestedProperties = async (req, res) => {
    try {
    
  
      const suggestedProperties = await Property.find()
        .sort({ createdAt: -1 }) // Sort by creation date, newest first
        .limit(5); // Limit to 10 most recent searches, adjust as needed
        const propertiesWithFullImagePaths = suggestedProperties.map(property => {
          const propertyObject = property.toObject();
          return {
            ...propertyObject,
            images: propertyObject?.images.map(image => `${BASE_URL}${path.basename(image)}`),
            mainImage: propertyObject?.mainImage ? `${BASE_URL}${path.basename(propertyObject.mainImage)}` : null,
          };
        });
    
        res.send(propertiesWithFullImagePaths);
    } catch (err) {
      console.log(err)
      res.status(500).send(err);
    }
  };